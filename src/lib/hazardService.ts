import { supabase } from './supabase';
import { HazardDetail, Hazard, ThreatBarrierChain } from './types';

export async function getTopLevelHazards(): Promise<Hazard[]> {
  const { data, error } = await supabase
    .from('hazards')
    .select('*')
    .eq('drill_down_level', 0)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getHazardById(hazardId: string): Promise<Hazard | null> {
  const { data, error } = await supabase
    .from('hazards')
    .select('*')
    .eq('id', hazardId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getHazardDetail(hazardId: string): Promise<HazardDetail | null> {
  try {
    const { data: hazard, error: hazardError } = await supabase
      .from('hazards')
      .select('*')
      .eq('id', hazardId)
      .maybeSingle();

    if (hazardError) throw hazardError;
    if (!hazard) return null;

    const { data: bowtie, error: bowTieError } = await supabase
      .from('bowtie_diagrams')
      .select('*')
      .eq('hazard_id', hazardId)
      .maybeSingle();

    if (bowTieError) throw bowTieError;
    if (!bowtie) return null;

    const [
      { data: topEvent },
      { data: threats },
      { data: consequences },
      { data: barriers },
      { data: barrierConnections },
      { data: connections },
    ] = await Promise.all([
      supabase
        .from('top_events')
        .select('*')
        .eq('bowtie_id', bowtie.id)
        .maybeSingle(),
      supabase
        .from('threats')
        .select('*')
        .eq('bowtie_id', bowtie.id)
        .order('threat_order', { ascending: true }),
      supabase
        .from('consequences')
        .select('*')
        .eq('bowtie_id', bowtie.id)
        .order('consequence_order', { ascending: true }),
      supabase
        .from('prevention_barriers')
        .select('*')
        .eq('bowtie_id', bowtie.id)
        .order('barrier_order', { ascending: true }),
      supabase
        .from('barrier_connections')
        .select('*')
        .eq('bowtie_id', bowtie.id)
        .order('sequence_order', { ascending: true }),
      supabase
        .from('connections')
        .select('*')
        .eq('bowtie_id', bowtie.id),
    ]);

    if (!topEvent) return null;

    return {
      hazard,
      bowtie,
      top_event: topEvent,
      threats: threats || [],
      consequences: consequences || [],
      barriers: barriers || [],
      barrier_connections: barrierConnections || [],
      connections: connections || [],
    };
  } catch (error) {
    console.error('Error fetching hazard detail:', error);
    throw error;
  }
}

export async function getThreatBarriers(
  bowtieId: string,
  threatId: string
): Promise<ThreatBarrierChain | null> {
  try {
    const { data: threat } = await supabase
      .from('threats')
      .select('*')
      .eq('id', threatId)
      .maybeSingle();

    if (!threat) return null;

    const { data: barrierConnections } = await supabase
      .from('barrier_connections')
      .select('*')
      .eq('bowtie_id', bowtieId)
      .eq('threat_id', threatId)
      .order('sequence_order', { ascending: true });

    if (!barrierConnections || barrierConnections.length === 0) {
      return { threat, barriers: [] };
    }

    const barrierIds = barrierConnections.map((bc) => bc.barrier_id);

    const { data: barriers } = await supabase
      .from('prevention_barriers')
      .select('*, barrier_type:barrier_type_id(*)')
      .in('id', barrierIds)
      .order('barrier_order', { ascending: true });

    const sortedBarriers = barrierIds
      .map((id) => barriers?.find((b) => b.id === id))
      .filter((b) => b !== undefined) as any[];

    return { threat, barriers: sortedBarriers };
  } catch (error) {
    console.error('Error fetching threat barriers:', error);
    throw error;
  }
}

export async function getChildHazards(parentHazardId: string): Promise<Hazard[]> {
  const { data: relationships } = await supabase
    .from('hazard_relationships')
    .select('child_hazard_id')
    .eq('parent_hazard_id', parentHazardId);

  if (!relationships || relationships.length === 0) return [];

  const childIds = relationships.map((r) => r.child_hazard_id);

  const { data, error } = await supabase
    .from('hazards')
    .select('*')
    .in('id', childIds);

  if (error) throw error;
  return data || [];
}
