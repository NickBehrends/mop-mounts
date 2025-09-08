#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function normalizeMounts(mounts) {
  // Sort by expansion, then by name
  const sorted = [...mounts].sort((a, b) => {
    const expCompare = a.expansion.localeCompare(b.expansion);
    return expCompare !== 0 ? expCompare : a.name.localeCompare(b.name);
  });

  // Normalize each mount object by ordering properties consistently
  return sorted.map(mount => {
    const normalized = {};
    
    // Required fields first, in a consistent order
    normalized.id = mount.id;
    normalized.name = mount.name;
    normalized.expansion = mount.expansion;
    normalized.category = mount.category;
    normalized.faction = mount.faction;
    normalized.sourceType = mount.sourceType;
    normalized.sourceDetail = mount.sourceDetail;
    
    // Optional fields in alphabetical order
    if (mount.cost !== undefined) normalized.cost = mount.cost;
    if (mount.isLimitedTime !== undefined) normalized.isLimitedTime = mount.isLimitedTime;
    if (mount.notes !== undefined) normalized.notes = mount.notes;
    if (mount.professionReq !== undefined) normalized.professionReq = mount.professionReq;
    if (mount.reputationReq !== undefined) normalized.reputationReq = mount.reputationReq;
    if (mount.requiresRiding !== undefined) normalized.requiresRiding = mount.requiresRiding;
    if (mount.tags !== undefined) normalized.tags = mount.tags;
    if (mount.wowheadId !== undefined) normalized.wowheadId = mount.wowheadId;
    if (mount.zone !== undefined) normalized.zone = mount.zone;
    
    // Versioning fields last
    normalized.dataVersion = mount.dataVersion;
    normalized.lastUpdatedUtc = mount.lastUpdatedUtc;
    
    return normalized;
  });
}

function sortAndNormalize(dryRun = false) {
  try {
    const mountsPath = join(__dirname, '../data/mounts.json');
    const originalData = readFileSync(mountsPath, 'utf8');
    const mounts = JSON.parse(originalData);
    
    if (!Array.isArray(mounts)) {
      console.error('❌ Error: mounts.json should contain an array of mounts');
      process.exit(1);
    }

    const normalized = normalizeMounts(mounts);
    const normalizedJson = JSON.stringify(normalized, null, 2) + '\n';
    
    if (dryRun) {
      // Check if the file is already normalized
      if (originalData.trim() === normalizedJson.trim()) {
        console.log('✅ Data is already properly sorted and normalized');
        return true;
      } else {
        console.error('❌ Data is not properly sorted and normalized');
        console.error('Please run the sort-and-normalize script to fix formatting');
        
        // Show a sample of what would change
        const originalLines = originalData.split('\n');
        const normalizedLines = normalizedJson.split('\n');
        
        console.error('\nFirst few differences:');
        for (let i = 0; i < Math.min(originalLines.length, normalizedLines.length, 10); i++) {
          if (originalLines[i] !== normalizedLines[i]) {
            console.error(`Line ${i + 1}:`);
            console.error(`- ${originalLines[i]}`);
            console.error(`+ ${normalizedLines[i]}`);
          }
        }
        
        return false;
      }
    } else {
      // Write the normalized data
      writeFileSync(mountsPath, normalizedJson, 'utf8');
      console.log('✅ Successfully sorted and normalized mounts.json');
      console.log(`✅ Processed ${normalized.length} mounts`);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Failed to sort and normalize:', error.message);
    process.exit(1);
  }
}

// Check if this is a dry run
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('--check');

const success = sortAndNormalize(isDryRun);
if (isDryRun && !success) {
  process.exit(1);
}