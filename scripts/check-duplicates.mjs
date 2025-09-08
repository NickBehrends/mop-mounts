#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkDuplicates() {
  try {
    // Read the mounts data
    const mountsPath = join(__dirname, '../data/mounts.json');
    const mountsData = JSON.parse(readFileSync(mountsPath, 'utf8'));
    
    if (!Array.isArray(mountsData)) {
      console.error('❌ Error: mounts.json should contain an array of mounts');
      process.exit(1);
    }

    const errors = [];
    const ids = new Map();
    const names = new Map();

    // Check for duplicate IDs and names
    mountsData.forEach((mount, index) => {
      const lineNumber = index + 1; // Approximate line number for error reporting
      
      // Check duplicate IDs
      if (ids.has(mount.id)) {
        errors.push({
          type: 'DUPLICATE_ID',
          message: `Duplicate ID "${mount.id}" found`,
          file: 'data/mounts.json',
          line: lineNumber,
          originalLine: ids.get(mount.id),
          id: mount.id
        });
      } else {
        ids.set(mount.id, lineNumber);
      }

      // Check duplicate names
      if (names.has(mount.name)) {
        errors.push({
          type: 'DUPLICATE_NAME', 
          message: `Duplicate name "${mount.name}" found`,
          file: 'data/mounts.json',
          line: lineNumber,
          originalLine: names.get(mount.name),
          name: mount.name
        });
      } else {
        names.set(mount.name, lineNumber);
      }

      // Validate ID format
      if (!/^[a-z0-9-]+$/.test(mount.id)) {
        errors.push({
          type: 'INVALID_ID_FORMAT',
          message: `Invalid ID format "${mount.id}" - must contain only lowercase letters, numbers, and hyphens`,
          file: 'data/mounts.json',
          line: lineNumber,
          id: mount.id
        });
      }
    });

    if (errors.length > 0) {
      console.error('❌ Data validation failed with the following errors:\n');
      
      errors.forEach(error => {
        console.error(`${error.type}: ${error.message}`);
        console.error(`  File: ${error.file}:${error.line}`);
        if (error.originalLine) {
          console.error(`  Originally defined at line: ${error.originalLine}`);
        }
        console.error('');
      });
      
      console.error(`Total errors: ${errors.length}`);
      process.exit(1);
    }

    console.log('✅ No duplicate IDs or names found');
    console.log(`✅ Validated ${mountsData.length} mounts successfully`);
    
  } catch (error) {
    console.error('❌ Failed to check duplicates:', error.message);
    process.exit(1);
  }
}

checkDuplicates();