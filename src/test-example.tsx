/**
 * Example test file showing how to test the Bowtie Diagram components
 * 
 * This demonstrates how you can test the components in your test framework.
 * You'll need to set up your own test environment (Jest, Vitest, etc.)
 */

import { BowtieDiagramComponent } from './components/BowtieDiagram';
import { carAccidentBowtie } from './lib/carAccidentData';
import { layoutBowtieDiagram } from './lib/elkLayout';

// Example: Test the layout calculation
export async function testLayoutCalculation() {
  try {
    const layoutNodes = await layoutBowtieDiagram(carAccidentBowtie, {
      viewLevel: 0,
      spacing: {
        horizontal: 250,
        vertical: 120,
      },
    });
    
    console.log('Layout calculation successful!');
    console.log(`Generated ${layoutNodes.length} nodes`);
    return layoutNodes;
  } catch (error) {
    console.error('Layout calculation failed:', error);
    throw error;
  }
}

// Example: Test data structure
export function testDataStructure() {
  const diagram = carAccidentBowtie;
  
  console.log('Top Event:', diagram.topEvent.label);
  console.log('Threats:', diagram.threats.length);
  console.log('Consequences:', diagram.consequences.length);
  console.log('Barriers:', diagram.barriers.length);
  
  // Test hierarchical structure
  const threatWithSubThreats = diagram.threats.find(t => t.subThreats && t.subThreats.length > 0);
  if (threatWithSubThreats) {
    console.log(`Example threat "${threatWithSubThreats.label}" has ${threatWithSubThreats.subThreats?.length} sub-threats`);
  }
  
  return {
    topEvent: diagram.topEvent,
    threatCount: diagram.threats.length,
    consequenceCount: diagram.consequences.length,
    barrierCount: diagram.barriers.length,
  };
}

// Example: Test filtering by level
export function testLevelFiltering() {
  const diagram = carAccidentBowtie;
  
  // Get all threats at level 0
  const level0Threats = diagram.threats.filter(t => t.level === 0);
  console.log(`Level 0 threats: ${level0Threats.length}`);
  
  // Get all threats at level 1
  const level1Threats = diagram.threats.flatMap(t => 
    t.subThreats?.filter(st => st.level === 1) || []
  );
  console.log(`Level 1 threats: ${level1Threats.length}`);
  
  return {
    level0: level0Threats.length,
    level1: level1Threats.length,
  };
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running bowtie diagram tests...\n');
  
  testDataStructure();
  console.log('\n');
  testLevelFiltering();
  console.log('\n');
  testLayoutCalculation().then(() => {
    console.log('\nAll tests completed!');
  });
}

