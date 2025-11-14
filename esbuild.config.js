import esbuild from 'esbuild';
import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

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
  entryNames: '[dir]/[name]',
  assetNames: '[name]',
  minify: true,
  sourcemap: false,
  platform: 'browser',
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.css'],
});

// Copy CSS file
try {
  copyFileSync('src/index.css', 'dist/src/index.css');
} catch (e) {
  console.warn('Could not copy CSS file:', e.message);
}

// Copy and update HTML
const html = readFileSync('index.html', 'utf-8');
const distHtml = html.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  '<script type="module" src="/src/main.js"></script><link rel="stylesheet" href="/src/index.css">'
);
writeFileSync(join('dist', 'index.html'), distHtml);

console.log('Build complete!');

