#!/usr/bin/env node

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkDataVersion() {
  try {
    // Read current dataset metadata
    const metaPath = join(__dirname, '../data/dataset.meta.json');
    let currentMeta = {};
    
    try {
      currentMeta = JSON.parse(readFileSync(metaPath, 'utf8'));
    } catch (error) {
      console.error('❌ Error: dataset.meta.json not found or invalid');
      process.exit(1);
    }

    const currentDataVersion = currentMeta.dataVersion || 0;

    // Check if we're in a git repository and can compare with main branch
    let hasDataChanges = false;
    let hasMountChanges = false;
    
    try {
      // Check if data/mounts.json has changes compared to main branch
      const mountsDiff = execSync('git diff main..HEAD -- data/mounts.json', { 
        encoding: 'utf8', 
        cwd: join(__dirname, '..'),
        stdio: 'pipe'
      });
      
      hasMountChanges = mountsDiff.trim().length > 0;

      // Check if dataset.meta.json has changes
      const metaDiff = execSync('git diff main..HEAD -- data/dataset.meta.json', {
        encoding: 'utf8',
        cwd: join(__dirname, '..'),
        stdio: 'pipe'
      });
      
      hasDataChanges = metaDiff.trim().length > 0;

      if (hasMountChanges) {
        console.log('📋 Changes detected in data/mounts.json');
        
        // Get the dataVersion from main branch for comparison
        let mainDataVersion = 0;
        try {
          const mainMeta = execSync('git show main:data/dataset.meta.json', {
            encoding: 'utf8',
            cwd: join(__dirname, '..'),
            stdio: 'pipe'
          });
          const mainMetaData = JSON.parse(mainMeta);
          mainDataVersion = mainMetaData.dataVersion || 0;
        } catch (error) {
          console.log('📋 No dataset.meta.json found in main branch, assuming version 0');
        }

        console.log(`📋 Main branch dataVersion: ${mainDataVersion}`);
        console.log(`📋 Current dataVersion: ${currentDataVersion}`);

        if (currentDataVersion <= mainDataVersion) {
          console.error('❌ ERROR: dataVersion must be incremented when mounts.json changes');
          console.error(`   Current dataVersion: ${currentDataVersion}`);
          console.error(`   Main branch dataVersion: ${mainDataVersion}`);
          console.error(`   Expected dataVersion: ${mainDataVersion + 1} or higher`);
          console.error('');
          console.error('💡 To fix this:');
          console.error('   1. Update data/dataset.meta.json');
          console.error(`   2. Set dataVersion to ${mainDataVersion + 1}`);
          console.error('   3. Set generatedAtUtc to current UTC timestamp');
          process.exit(1);
        } else {
          console.log(`✅ dataVersion properly incremented: ${mainDataVersion} → ${currentDataVersion}`);
        }
      } else {
        console.log('📋 No changes detected in data/mounts.json');
        console.log('✅ dataVersion check not required');
      }

    } catch (gitError) {
      console.log('⚠️  Not in a git repository or cannot compare with main branch');
      console.log('⚠️  Skipping dataVersion change validation');
      console.log(`📋 Current dataVersion: ${currentDataVersion}`);
    }

    // Validate that dataset.meta.json has required fields
    const requiredFields = ['dataVersion', 'generatedAtUtc'];
    const missingFields = requiredFields.filter(field => !currentMeta[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ ERROR: dataset.meta.json is missing required fields:');
      missingFields.forEach(field => {
        console.error(`   - ${field}`);
      });
      process.exit(1);
    }

    // Validate timestamp format
    try {
      const timestamp = new Date(currentMeta.generatedAtUtc);
      if (isNaN(timestamp.getTime())) {
        throw new Error('Invalid timestamp');
      }
    } catch (error) {
      console.error('❌ ERROR: generatedAtUtc is not a valid ISO8601 timestamp');
      console.error(`   Current value: ${currentMeta.generatedAtUtc}`);
      process.exit(1);
    }

    console.log('✅ dataset.meta.json validation passed');
    
  } catch (error) {
    console.error('❌ Failed to check dataVersion:', error.message);
    process.exit(1);
  }
}

checkDataVersion();