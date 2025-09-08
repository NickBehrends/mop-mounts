#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function validateSchema() {
  try {
    // Initialize AJV with formats
    const ajv = new Ajv({ allErrors: true, verbose: true });
    addFormats(ajv);

    // Load schema
    const schemaPath = join(__dirname, '../schemas/mount.schema.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
    
    // Load data
    const dataPath = join(__dirname, '../data/mounts.json');
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));

    if (!Array.isArray(data)) {
      console.error('❌ Error: mounts.json should contain an array of mounts');
      process.exit(1);
    }

    // Compile schema
    const validate = ajv.compile(schema);
    
    const errors = [];
    
    // Validate each mount
    data.forEach((mount, index) => {
      const valid = validate(mount);
      if (!valid) {
        validate.errors.forEach(error => {
          errors.push({
            mountIndex: index,
            mountId: mount.id || 'unknown',
            mountName: mount.name || 'unknown',
            path: error.instancePath,
            message: error.message,
            value: error.data,
            schema: error.schema
          });
        });
      }
    });

    if (errors.length > 0) {
      console.error('❌ Schema validation failed with the following errors:\n');
      
      errors.forEach(error => {
        console.error(`SCHEMA_ERROR: Mount "${error.mountId}" (${error.mountName})`);
        console.error(`  File: data/mounts.json (mount index ${error.mountIndex})`);
        console.error(`  Path: ${error.path || 'root'}`);
        console.error(`  Message: ${error.message}`);
        if (error.value !== undefined) {
          console.error(`  Value: ${JSON.stringify(error.value)}`);
        }
        if (error.schema !== undefined) {
          console.error(`  Expected: ${JSON.stringify(error.schema)}`);
        }
        console.error('');
      });
      
      console.error(`Total errors: ${errors.length}`);
      process.exit(1);
    }

    console.log('✅ All mounts pass schema validation');
    console.log(`✅ Validated ${data.length} mounts against schema`);
    
  } catch (error) {
    console.error('❌ Failed to validate schema:', error.message);
    process.exit(1);
  }
}

validateSchema();