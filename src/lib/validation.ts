import type { Barrier, BowtieDiagram, Consequence, Threat } from './types';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  id: string;
  message: string;
  severity: ValidationSeverity;
  relatedId?: string;
}

export function validateBowtieDiagram(diagram: BowtieDiagram): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!diagram) {
    return [
      {
        id: 'diagram.missing',
        message: 'Diagram payload is missing.',
        severity: 'error',
      },
    ];
  }

  const idRegistry = new Map<string, string>();

  const registerId = (id: string | undefined, kind: string, label?: string) => {
    if (!id) {
      issues.push({
        id: `${kind}.missingId`,
        message: `${kind} "${label ?? 'unnamed'}" is missing a stable id.`,
        severity: 'error',
      });
      return false;
    }
    if (idRegistry.has(id)) {
      issues.push({
        id: `${kind}.duplicateId`,
        message: `Id "${id}" is reused by ${idRegistry.get(id)} and ${kind}.`,
        severity: 'error',
      });
      return false;
    }
    idRegistry.set(id, kind);
    return true;
  };

  if (!diagram.hazard) {
    issues.push({
      id: 'hazard.absent',
      message: 'Each bowtie diagram must define a hazard node.',
      severity: 'error',
    });
  } else {
    registerId(diagram.hazard.id, 'Hazard', diagram.hazard.label);
    if (!hasLabel(diagram.hazard.label)) {
      issues.push({
        id: 'hazard.label',
        message: 'Hazard label cannot be empty.',
        severity: 'error',
      });
    }
  }

  if (!diagram.topEvent) {
    issues.push({
      id: 'topEvent.absent',
      message: 'Diagram must define a top event.',
      severity: 'error',
    });
  } else {
    registerId(diagram.topEvent.id, 'TopEvent', diagram.topEvent.label);
    if (!hasLabel(diagram.topEvent.label)) {
      issues.push({
        id: 'topEvent.label',
        message: 'Top event label cannot be empty.',
        severity: 'error',
      });
    }
  }

  const threats = flattenThreats(diagram.threats ?? []);
  const threatMap = new Map(threats.map((threat) => [threat.id, threat]));
  const consequences = flattenConsequences(diagram.consequences ?? []);
  const consequenceMap = new Map(consequences.map((consequence) => [consequence.id, consequence]));

  if (!threats.length && !consequences.length) {
    issues.push({
      id: 'diagram.empty',
      message: 'Diagram should define at least one threat or consequence.',
      severity: 'warning',
    });
  }

  threats.forEach((threat) => {
    registerId(threat.id, 'Threat', threat.label);
    if (!hasLabel(threat.label)) {
      issues.push({
        id: `threat.${threat.id}.label`,
        message: `Threat "${safeLabel(threat.label, threat.id)}" is missing a label.`,
        severity: 'error',
      });
    }

    if (threat.parentId) {
      if (!threatMap.has(threat.parentId)) {
        issues.push({
          id: `threat.${threat.id}.parent`,
          message: `Threat "${safeLabel(
            threat.label,
            threat.id,
          )}" references missing parent "${threat.parentId}".`,
          severity: 'error',
        });
      } else if (!isThreatConnectedToTopEvent(threat, threatMap)) {
        issues.push({
          id: `threat.${threat.id}.disconnected`,
          message: `Threat "${safeLabel(
            threat.label,
            threat.id,
          )}" is not connected to the top event due to a broken hierarchy.`,
          severity: 'error',
        });
      }
    }
  });

  consequences.forEach((consequence) => {
    registerId(consequence.id, 'Consequence', consequence.label);
    if (!hasLabel(consequence.label)) {
      issues.push({
        id: `consequence.${consequence.id}.label`,
        message: `Consequence "${safeLabel(
          consequence.label,
          consequence.id,
        )}" is missing a label.`,
        severity: 'error',
      });
    }

    if (consequence.parentId) {
      if (!consequenceMap.has(consequence.parentId)) {
        issues.push({
          id: `consequence.${consequence.id}.parent`,
          message: `Consequence "${safeLabel(
            consequence.label,
            consequence.id,
          )}" references missing parent "${consequence.parentId}".`,
          severity: 'error',
        });
      } else if (!isConsequenceConnectedToTopEvent(consequence, consequenceMap)) {
        issues.push({
          id: `consequence.${consequence.id}.disconnected`,
          message: `Consequence "${safeLabel(
            consequence.label,
            consequence.id,
          )}" is not connected to the top event due to a broken hierarchy.`,
          severity: 'error',
        });
      }
    }
  });

  diagram.barriers?.forEach((barrier) => {
    registerId(barrier.id, 'Barrier', barrier.label);

    if (!hasLabel(barrier.label)) {
      issues.push({
        id: `barrier.${barrier.id}.label`,
        message: `Barrier "${safeLabel(barrier.label, barrier.id)}" is missing a label.`,
        severity: 'error',
      });
    }

    if (barrier.type !== 'preventive' && barrier.type !== 'mitigative') {
      issues.push({
        id: `barrier.${barrier.id}.type`,
        message: `Barrier "${safeLabel(
          barrier.label,
          barrier.id,
        )}" must be preventive or mitigative.`,
        severity: 'error',
      });
      return;
    }

    const hasThreatLink = Boolean(barrier.threatId);
    const hasConsequenceLink = Boolean(barrier.consequenceId);

    if (barrier.type === 'preventive') {
      if (!hasThreatLink) {
        issues.push({
          id: `barrier.${barrier.id}.link`,
          message: `Preventive barrier "${safeLabel(
            barrier.label,
            barrier.id,
          )}" must reference a threatId.`,
          severity: 'error',
        });
      }
      if (hasConsequenceLink) {
        issues.push({
          id: `barrier.${barrier.id}.linkType`,
          message: `Preventive barrier "${safeLabel(
            barrier.label,
            barrier.id,
          )}" cannot reference consequenceId.`,
          severity: 'error',
        });
      }
      if (barrier.threatId && !threatMap.has(barrier.threatId)) {
        issues.push({
          id: `barrier.${barrier.id}.threatMissing`,
          message: `Barrier "${safeLabel(
            barrier.label,
            barrier.id,
          )}" references missing threat "${barrier.threatId}".`,
          severity: 'error',
        });
      } else if (barrier.threatId && !isThreatConnectedToTopEvent(threatMap.get(barrier.threatId)!, threatMap)) {
        issues.push({
          id: `barrier.${barrier.id}.threatDisconnected`,
          message: `Barrier "${safeLabel(
            barrier.label,
            barrier.id,
          )}" is attached to threat "${barrier.threatId}" that is not connected to the top event.`,
          severity: 'error',
        });
      }
    }

    if (barrier.type === 'mitigative') {
      if (!hasConsequenceLink) {
        issues.push({
          id: `barrier.${barrier.id}.link`,
          message: `Mitigative barrier "${safeLabel(
            barrier.label,
            barrier.id,
          )}" must reference a consequenceId.`,
          severity: 'error',
        });
      }
      if (hasThreatLink) {
        issues.push({
          id: `barrier.${barrier.id}.linkType`,
          message: `Mitigative barrier "${safeLabel(
            barrier.label,
            barrier.id,
          )}" cannot reference threatId.`,
          severity: 'error',
        });
      }
      if (barrier.consequenceId && !consequenceMap.has(barrier.consequenceId)) {
        issues.push({
          id: `barrier.${barrier.id}.consequenceMissing`,
          message: `Barrier "${safeLabel(
            barrier.label,
            barrier.id,
          )}" references missing consequence "${barrier.consequenceId}".`,
          severity: 'error',
        });
      } else if (
        barrier.consequenceId &&
        !isConsequenceConnectedToTopEvent(consequenceMap.get(barrier.consequenceId)!, consequenceMap)
      ) {
        issues.push({
          id: `barrier.${barrier.id}.consequenceDisconnected`,
          message: `Barrier "${safeLabel(
            barrier.label,
            barrier.id,
          )}" is attached to consequence "${barrier.consequenceId}" that is not connected to the top event.`,
          severity: 'error',
        });
      }
    }
  });

  return issues;
}

function flattenThreats(threats: Threat[], acc: Threat[] = []): Threat[] {
  threats.forEach((threat) => {
    acc.push(threat);
    if (threat.subThreats?.length) {
      flattenThreats(threat.subThreats, acc);
    }
  });
  return acc;
}

function flattenConsequences(consequences: Consequence[], acc: Consequence[] = []): Consequence[] {
  consequences.forEach((consequence) => {
    acc.push({ ...consequence });
    if (consequence.subConsequences?.length) {
      flattenConsequences(consequence.subConsequences, acc);
    }
  });
  return acc;
}

function hasLabel(value?: string | null): boolean {
  return Boolean(value && value.trim().length);
}

function safeLabel(label: string | undefined, fallback: string): string {
  return label?.trim() || fallback;
}

function isThreatConnectedToTopEvent(threat: Threat, threatMap: Map<string, Threat>): boolean {
  if (!threat) return false;
  const visited = new Set<string>();
  let current: Threat | undefined = threat;
  while (current) {
    if (visited.has(current.id)) {
      return false;
    }
    visited.add(current.id);
    if (!current.parentId) {
      return true;
    }
    current = threatMap.get(current.parentId);
  }
  return false;
}

function isConsequenceConnectedToTopEvent(
  consequence: Consequence,
  consequenceMap: Map<string, Consequence>,
): boolean {
  if (!consequence) return false;
  const visited = new Set<string>();
  let current: Consequence | undefined = consequence;
  while (current) {
    if (visited.has(current.id)) {
      return false;
    }
    visited.add(current.id);
    if (!current.parentId) {
      return true;
    }
    current = consequenceMap.get(current.parentId);
  }
  return false;
}

// Utility helpers can be exported for testing if needed
export type { Threat, Consequence, Barrier };

