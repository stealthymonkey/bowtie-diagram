/*
  # Bow-Tie Hazard Analysis Database Schema
  
  1. Core Tables
    - `hazards`: Root-level hazard scenarios
    - `bowtie_diagrams`: Individual bow-tie analyses linked to hazards
    - `top_events`: Central undesired events in bow-tie diagrams
    - `threats`: Causes/threats leading to top events
    - `consequences`: Potential outcomes from top events
    
  2. Barriers and Prevention
    - `barrier_types`: Predefined barrier types (Active Human, Active Hardware, etc.)
    - `prevention_barriers`: Individual prevention barriers
    - `barrier_connections`: Links barriers to threat-to-event chains
    
  3. Relationships
    - `connections`: Links between threats, top events, and consequences
    - `hazard_relationships`: Parent-child hierarchy for drill-down navigation
    
  4. Security
    - Enable RLS on all tables
    - Add public SELECT policies for view-only access
*/

-- Create hazards table
CREATE TABLE IF NOT EXISTS hazards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  severity_level text DEFAULT 'medium',
  icon text,
  parent_hazard_id uuid,
  drill_down_level int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (parent_hazard_id) REFERENCES hazards(id) ON DELETE CASCADE
);

-- Create bowtie_diagrams table
CREATE TABLE IF NOT EXISTS bowtie_diagrams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_id uuid NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (hazard_id) REFERENCES hazards(id) ON DELETE CASCADE
);

-- Create top_events table
CREATE TABLE IF NOT EXISTS top_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bowtie_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  severity_level text DEFAULT 'high',
  speed_impact int,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (bowtie_id) REFERENCES bowtie_diagrams(id) ON DELETE CASCADE
);

-- Create threats table
CREATE TABLE IF NOT EXISTS threats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bowtie_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  threat_type text,
  threat_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (bowtie_id) REFERENCES bowtie_diagrams(id) ON DELETE CASCADE
);

-- Create consequences table
CREATE TABLE IF NOT EXISTS consequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bowtie_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  severity_level text DEFAULT 'high',
  consequence_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (bowtie_id) REFERENCES bowtie_diagrams(id) ON DELETE CASCADE
);

-- Create barrier_types table
CREATE TABLE IF NOT EXISTS barrier_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_name text NOT NULL UNIQUE,
  color_code text,
  display_color text,
  icon text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create prevention_barriers table
CREATE TABLE IF NOT EXISTS prevention_barriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bowtie_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  barrier_type_id uuid NOT NULL,
  responsibility_role text,
  effectiveness_level text DEFAULT 'medium',
  barrier_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (bowtie_id) REFERENCES bowtie_diagrams(id) ON DELETE CASCADE,
  FOREIGN KEY (barrier_type_id) REFERENCES barrier_types(id) ON DELETE RESTRICT
);

-- Create connections table (threat -> top_event -> consequence)
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bowtie_id uuid NOT NULL,
  threat_id uuid,
  top_event_id uuid NOT NULL,
  consequence_id uuid,
  connection_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (bowtie_id) REFERENCES bowtie_diagrams(id) ON DELETE CASCADE,
  FOREIGN KEY (threat_id) REFERENCES threats(id) ON DELETE CASCADE,
  FOREIGN KEY (top_event_id) REFERENCES top_events(id) ON DELETE CASCADE,
  FOREIGN KEY (consequence_id) REFERENCES consequences(id) ON DELETE CASCADE
);

-- Create barrier_connections table (links barriers to threat chains)
CREATE TABLE IF NOT EXISTS barrier_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bowtie_id uuid NOT NULL,
  barrier_id uuid NOT NULL,
  threat_id uuid,
  consequence_id uuid,
  chain_position int DEFAULT 0,
  sequence_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (bowtie_id) REFERENCES bowtie_diagrams(id) ON DELETE CASCADE,
  FOREIGN KEY (barrier_id) REFERENCES prevention_barriers(id) ON DELETE CASCADE,
  FOREIGN KEY (threat_id) REFERENCES threats(id) ON DELETE SET NULL,
  FOREIGN KEY (consequence_id) REFERENCES consequences(id) ON DELETE SET NULL
);

-- Create hazard_relationships table for hierarchy
CREATE TABLE IF NOT EXISTS hazard_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_hazard_id uuid NOT NULL,
  child_hazard_id uuid NOT NULL,
  relationship_type text DEFAULT 'drill_down',
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (parent_hazard_id) REFERENCES hazards(id) ON DELETE CASCADE,
  FOREIGN KEY (child_hazard_id) REFERENCES hazards(id) ON DELETE CASCADE,
  UNIQUE(parent_hazard_id, child_hazard_id)
);

-- Enable RLS
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bowtie_diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE consequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE barrier_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE prevention_barriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE barrier_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_relationships ENABLE ROW LEVEL SECURITY;

-- Create public SELECT policies for view-only access
CREATE POLICY "Public can view hazards" ON hazards FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view bowtie_diagrams" ON bowtie_diagrams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view top_events" ON top_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view threats" ON threats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view consequences" ON consequences FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view barrier_types" ON barrier_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view prevention_barriers" ON prevention_barriers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view connections" ON connections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view barrier_connections" ON barrier_connections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view hazard_relationships" ON hazard_relationships FOR SELECT TO anon, authenticated USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hazards_parent ON hazards(parent_hazard_id);
CREATE INDEX IF NOT EXISTS idx_bowtie_diagrams_hazard ON bowtie_diagrams(hazard_id);
CREATE INDEX IF NOT EXISTS idx_top_events_bowtie ON top_events(bowtie_id);
CREATE INDEX IF NOT EXISTS idx_threats_bowtie ON threats(bowtie_id);
CREATE INDEX IF NOT EXISTS idx_consequences_bowtie ON consequences(bowtie_id);
CREATE INDEX IF NOT EXISTS idx_prevention_barriers_bowtie ON prevention_barriers(bowtie_id);
CREATE INDEX IF NOT EXISTS idx_prevention_barriers_type ON prevention_barriers(barrier_type_id);
CREATE INDEX IF NOT EXISTS idx_connections_bowtie ON connections(bowtie_id);
CREATE INDEX IF NOT EXISTS idx_barrier_connections_bowtie ON barrier_connections(bowtie_id);
CREATE INDEX IF NOT EXISTS idx_hazard_relationships_parent ON hazard_relationships(parent_hazard_id);
