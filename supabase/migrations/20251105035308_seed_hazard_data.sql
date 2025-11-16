/*
  # Seed Bow-Tie Hazard Analysis Data
  
  1. Main hazard: Commercial vehicle driving
  2. Barrier types with proper categorization
  3. Complete bow-tie diagram with threats, consequences, and barriers
  4. Sample nested hazards for drill-down capability
*/

-- Insert barrier types
INSERT INTO barrier_types (type_name, color_code, display_color, icon, description) VALUES
  ('Active Human', '#FFD700', '#F59E0B', 'user', 'Prevention barriers requiring active human intervention'),
  ('Active Hardware', '#00AA00', '#10B981', 'cpu', 'Technical/hardware solutions requiring activation'),
  ('Engineering Manager', '#0066CC', '#3B82F6', 'settings', 'Design and engineering controls'),
  ('Supervisor', '#FF9900', '#F97316', 'shield', 'Supervisory and management controls'),
  ('Operations Manager', '#663300', '#92400E', 'briefcase', 'Operational procedures and management');

-- Insert main hazard
INSERT INTO hazards (name, description, category, severity_level, icon, drill_down_level)
VALUES (
  'Commercial Vehicle Highway Driving',
  'Operating a commercial vehicle on highway conditions with potential loss of vehicle control',
  'transportation',
  'high',
  'truck',
  0
);

-- Store the hazard ID for use in subsequent inserts
DO $$
DECLARE
  v_hazard_id uuid;
  v_bowtie_id uuid;
  v_top_event_id uuid;
  v_threat_intoxicated_id uuid;
  v_threat_distraction_id uuid;
  v_threat_slippery_id uuid;
  v_threat_visibility_id uuid;
  v_consequence_crash_id uuid;
  v_consequence_impact_id uuid;
  v_consequence_rollover_id uuid;
  v_barrier_type_active_human uuid;
  v_barrier_type_active_hardware uuid;
  v_barrier_type_eng_mgr uuid;
  v_barrier_type_supervisor uuid;
BEGIN
  -- Get the hazard ID
  SELECT id INTO v_hazard_id FROM hazards 
  WHERE name = 'Commercial Vehicle Highway Driving' LIMIT 1;

  -- Insert bow-tie diagram
  INSERT INTO bowtie_diagrams (hazard_id, name, description)
  VALUES (v_hazard_id, 'Commercial Vehicle Loss of Control', 'Bow-tie analysis for loss of vehicle control at 70 mph')
  RETURNING id INTO v_bowtie_id;

  -- Insert top event
  INSERT INTO top_events (bowtie_id, name, description, severity_level, speed_impact)
  VALUES (v_bowtie_id, 'Loss of control over the vehicle at 70 mph', 'Vehicle becomes uncontrollable during highway operation', 'critical', 70)
  RETURNING id INTO v_top_event_id;

  -- Insert threats
  INSERT INTO threats (bowtie_id, name, description, threat_type, threat_order)
  VALUES 
    (v_bowtie_id, 'Intoxicated driving', 'Driver impaired by alcohol or drugs', 'human_factor', 1)
  RETURNING id INTO v_threat_intoxicated_id;

  INSERT INTO threats (bowtie_id, name, description, threat_type, threat_order)
  VALUES 
    (v_bowtie_id, 'Distractive driving', 'Driver attention diverted from road', 'human_factor', 2)
  RETURNING id INTO v_threat_distraction_id;

  INSERT INTO threats (bowtie_id, name, description, threat_type, threat_order)
  VALUES 
    (v_bowtie_id, 'Driving on slippery road', 'Reduced tire grip due to weather or surface', 'environmental', 3)
  RETURNING id INTO v_threat_slippery_id;

  INSERT INTO threats (bowtie_id, name, description, threat_type, threat_order)
  VALUES 
    (v_bowtie_id, 'Driving with poor visibility', 'Limited sight distance due to weather or lighting', 'environmental', 4)
  RETURNING id INTO v_threat_visibility_id;

  -- Insert consequences
  INSERT INTO consequences (bowtie_id, name, description, severity_level, consequence_order)
  VALUES 
    (v_bowtie_id, 'Crash into a fixed object', 'Vehicle collides with stationary object', 'critical', 1)
  RETURNING id INTO v_consequence_crash_id;

  INSERT INTO consequences (bowtie_id, name, description, severity_level, consequence_order)
  VALUES 
    (v_bowtie_id, 'Driver impacts internals of the vehicle', 'Driver struck by vehicle interior', 'critical', 2)
  RETURNING id INTO v_consequence_impact_id;

  INSERT INTO consequences (bowtie_id, name, description, severity_level, consequence_order)
  VALUES 
    (v_bowtie_id, 'Vehicle roll-over', 'Vehicle becomes unstable and overturns', 'critical', 3)
  RETURNING id INTO v_consequence_rollover_id;

  -- Create connections: threats to top event
  INSERT INTO connections (bowtie_id, threat_id, top_event_id, connection_type)
  VALUES 
    (v_bowtie_id, v_threat_intoxicated_id, v_top_event_id, 'threat_to_event'),
    (v_bowtie_id, v_threat_distraction_id, v_top_event_id, 'threat_to_event'),
    (v_bowtie_id, v_threat_slippery_id, v_top_event_id, 'threat_to_event'),
    (v_bowtie_id, v_threat_visibility_id, v_top_event_id, 'threat_to_event');

  -- Create connections: top event to consequences
  INSERT INTO connections (bowtie_id, top_event_id, consequence_id, connection_type)
  VALUES 
    (v_bowtie_id, v_top_event_id, v_consequence_crash_id, 'event_to_consequence'),
    (v_bowtie_id, v_top_event_id, v_consequence_impact_id, 'event_to_consequence'),
    (v_bowtie_id, v_top_event_id, v_consequence_rollover_id, 'event_to_consequence');

  -- Get barrier type IDs
  SELECT id INTO v_barrier_type_active_human FROM barrier_types WHERE type_name = 'Active Human';
  SELECT id INTO v_barrier_type_active_hardware FROM barrier_types WHERE type_name = 'Active Hardware';
  SELECT id INTO v_barrier_type_eng_mgr FROM barrier_types WHERE type_name = 'Engineering Manager';
  SELECT id INTO v_barrier_type_supervisor FROM barrier_types WHERE type_name = 'Supervisor';

  -- Insert prevention barriers for Intoxicated Driving threat
  INSERT INTO prevention_barriers (bowtie_id, name, description, barrier_type_id, responsibility_role, effectiveness_level, barrier_order)
  VALUES 
    (v_bowtie_id, 'Driver reports impairment or supervisor assigns replacement driver', 'Human decision to report or reassign', v_barrier_type_active_human, 'Driver/Supervisor', 'medium', 1),
    (v_bowtie_id, 'Dispatcher or supervisor detects unwell or impaired driver', 'Observational control', v_barrier_type_supervisor, 'Supervisor', 'low', 2);

  INSERT INTO barrier_connections (bowtie_id, barrier_id, threat_id, chain_position, sequence_order)
  SELECT v_bowtie_id, id, v_threat_intoxicated_id, 1, 1
  FROM prevention_barriers 
  WHERE bowtie_id = v_bowtie_id AND name = 'Driver reports impairment or supervisor assigns replacement driver';

  INSERT INTO barrier_connections (bowtie_id, barrier_id, threat_id, chain_position, sequence_order)
  SELECT v_bowtie_id, id, v_threat_intoxicated_id, 1, 2
  FROM prevention_barriers 
  WHERE bowtie_id = v_bowtie_id AND name = 'Dispatcher or supervisor detects unwell or impaired driver';

  -- Insert prevention barriers for Distractive Driving
  INSERT INTO prevention_barriers (bowtie_id, name, description, barrier_type_id, responsibility_role, effectiveness_level, barrier_order)
  VALUES 
    (v_bowtie_id, 'Voice-activated Dispatch System reduces manual input and screen driving', 'Active hardware prevention', v_barrier_type_active_hardware, 'Engineering Manager', 'high', 1),
    (v_bowtie_id, 'Driver detects alerts triggered from lane departure warning prevents lane drift', 'Active hardware + Human', v_barrier_type_active_hardware, 'Supervisor', 'high', 2);

  INSERT INTO barrier_connections (bowtie_id, barrier_id, threat_id, chain_position, sequence_order)
  SELECT v_bowtie_id, id, v_threat_distraction_id, 1, 1
  FROM prevention_barriers 
  WHERE bowtie_id = v_bowtie_id AND name = 'Voice-activated Dispatch System reduces manual input and screen driving';

  INSERT INTO barrier_connections (bowtie_id, barrier_id, threat_id, chain_position, sequence_order)
  SELECT v_bowtie_id, id, v_threat_distraction_id, 1, 2
  FROM prevention_barriers 
  WHERE bowtie_id = v_bowtie_id AND name = 'Driver detects alerts triggered from lane departure warning prevents lane drift';

  -- Insert prevention barriers for Slippery Road
  INSERT INTO prevention_barriers (bowtie_id, name, description, barrier_type_id, responsibility_role, effectiveness_level, barrier_order)
  VALUES 
    (v_bowtie_id, 'Driver checks weather report and adjusts driving schedule to avoid rain', 'Operational planning', v_barrier_type_supervisor, 'HSE Manager', 'medium', 1),
    (v_bowtie_id, 'Defensive driving training', 'Driver skill development', v_barrier_type_active_human, 'HSE Manager', 'high', 2),
    (v_bowtie_id, 'Anti-lock Braking System (ABS) maintains steering control', 'Engineering control', v_barrier_type_active_hardware, 'Engineering Manager', 'high', 3);

  INSERT INTO barrier_connections (bowtie_id, barrier_id, threat_id, chain_position, sequence_order)
  SELECT v_bowtie_id, id, v_threat_slippery_id, 1, 1
  FROM prevention_barriers 
  WHERE bowtie_id = v_bowtie_id AND name = 'Driver checks weather report and adjusts driving schedule to avoid rain';

  INSERT INTO barrier_connections (bowtie_id, barrier_id, threat_id, chain_position, sequence_order)
  SELECT v_bowtie_id, id, v_threat_slippery_id, 1, 2
  FROM prevention_barriers 
  WHERE bowtie_id = v_bowtie_id AND name = 'Defensive driving training';

  INSERT INTO barrier_connections (bowtie_id, barrier_id, threat_id, chain_position, sequence_order)
  SELECT v_bowtie_id, id, v_threat_slippery_id, 1, 3
  FROM prevention_barriers 
  WHERE bowtie_id = v_bowtie_id AND name = 'Anti-lock Braking System (ABS) maintains steering control';

  -- Insert prevention barriers for Poor Visibility
  INSERT INTO prevention_barriers (bowtie_id, name, description, barrier_type_id, responsibility_role, effectiveness_level, barrier_order)
  VALUES 
    (v_bowtie_id, 'Voice-activated Dispatch System reduces manual input and screen activation while driving', 'Hands-free dispatch interface keeps the driver focused when sight distance is limited.', v_barrier_type_active_hardware, 'Engineering Manager', 'high', 1),
    (v_bowtie_id, 'Driver detects alerts triggered from the lane departure warning system and prevents lane drift', 'Driver follows lane-departure alerts to correct course through fog or heavy rain.', v_barrier_type_active_hardware, 'Supervisor', 'high', 2);

  INSERT INTO barrier_connections (bowtie_id, barrier_id, threat_id, chain_position, sequence_order)
  SELECT v_bowtie_id, id, v_threat_visibility_id, 1, 1
  FROM prevention_barriers 
  WHERE bowtie_id = v_bowtie_id AND name = 'Voice-activated Dispatch System reduces manual input and screen activation while driving';

  INSERT INTO barrier_connections (bowtie_id, barrier_id, threat_id, chain_position, sequence_order)
  SELECT v_bowtie_id, id, v_threat_visibility_id, 1, 2
  FROM prevention_barriers 
  WHERE bowtie_id = v_bowtie_id AND name = 'Driver detects alerts triggered from the lane departure warning system and prevents lane drift';

END $$;
