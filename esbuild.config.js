import esbuild from 'esbuild';
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Plugin to replace Supabase code
const supabasePlugin = {
  name: 'supabase-replacer',
  setup(build) {
    // Replace Supabase imports with our shim
    build.onResolve({ filter: /@supabase\/supabase-js/ }, (args) => {
      return { path: join(__dirname, 'src/supabase-shim.ts'), namespace: 'file' };
    });
    
    // Replace any Supabase createClient calls
    build.onLoad({ filter: /.*/ }, async (args) => {
      if (args.path.includes('supabase') && !args.path.includes('supabase-shim')) {
        const contents = readFileSync(args.path, 'utf8');
        // Replace createClient calls
        const modified = contents
          .replace(/createClient\s*\([^)]*\)/g, '(() => { console.warn("Supabase disabled"); return {}; })()')
          .replace(/new\s+.*SupabaseClient/g, '(() => { console.warn("Supabase disabled"); return {}; })()');
        return { contents: modified, loader: 'ts' };
      }
    });
  },
};

// Build the app
const result = await esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: 'es2020',
  jsx: 'automatic',
  loader: {
    '.css': 'text',
  },
  publicPath: '/',
  entryNames: 'src/[name]', // Output to dist/src/main.js to match HTML
  assetNames: '[name]',
  minify: true,
  sourcemap: false,
  platform: 'browser',
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.css'],
  plugins: [supabasePlugin],
  // Exclude Supabase if it's accidentally bundled
  external: ['@supabase/supabase-js', '@supabase/*'],
  // Define environment variables to prevent Supabase initialization
  define: {
    'process.env.SUPABASE_URL': '""',
    'process.env.SUPABASE_ANON_KEY': '""',
    'import.meta.env.SUPABASE_URL': '""',
    'import.meta.env.SUPABASE_ANON_KEY': '""',
  },
  // Alias Supabase imports to our shim
  alias: {
    '@supabase/supabase-js': './src/supabase-shim.ts',
  },
  // Inject code at the top to prevent Supabase errors
  banner: {
    js: `
      // Prevent Supabase initialization errors - runs before any module code
      (function() {
        'use strict';
        if (typeof window !== 'undefined') {
          window.__SUPABASE_DISABLED__ = true;
        }
        // Store original Error for React compatibility
        const OriginalError = Error;
        // Only patch if Supabase error is detected, don't interfere with React
        if (typeof window !== 'undefined') {
          window.addEventListener('error', function(e) {
            if (e.message && e.message.includes('supabaseUrl is required')) {
              e.preventDefault();
              console.warn('[Supabase] Initialization prevented - Supabase is disabled');
              return false;
            }
          }, true);
        }
      })();
    `,
  },
});

// Copy CSS file - create directory first if needed
try {
  mkdirSync('dist/src', { recursive: true });
  copyFileSync('src/index.css', 'dist/src/index.css');
} catch (e) {
  console.warn('Could not copy CSS file:', e.message);
}

// Copy and update HTML - preserve the Supabase prevention script
const html = readFileSync('index.html', 'utf-8');
// Only replace the script src, keep everything else including the prevention script
const distHtml = html.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  '<script type="module" src="/src/main.js"></script><link rel="stylesheet" href="/src/index.css">'
);
writeFileSync(join('dist', 'index.html'), distHtml);

console.log('Build complete!');

