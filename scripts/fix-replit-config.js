#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replitPath = path.join(__dirname, '..', '.replit');

const content = fs.readFileSync(replitPath, 'utf-8');

let lines = content.split('\n');
let result = [];
let inPortsSection = false;
let keepPorts = ['8080', '24140'];
let currentPort = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.match(/^\[\[ports\]\]/)) {
    inPortsSection = true;
    currentPort = {};
    continue;
  }

  if (inPortsSection) {
    if (line.match(/^localPort\s*=\s*(\d+)/)) {
      currentPort.localPort = RegExp.$1;
    } else if (line.match(/^externalPort\s*=\s*(\d+)/)) {
      currentPort.externalPort = RegExp.$1;
    }

    if (line === '' || (i === lines.length - 1) || lines[i + 1] === '' || lines[i + 1].match(/^\[/)) {
      if (currentPort.localPort && currentPort.externalPort) {
        if (keepPorts.includes(currentPort.localPort)) {
          result.push('[[ports]]');
          result.push(`localPort = ${currentPort.localPort}`);
          result.push(`externalPort = ${currentPort.externalPort}`);
          result.push('');
        }
      }
      inPortsSection = false;
      currentPort = null;

      if (line !== '' && !line.match(/^\[\[ports\]\]/)) {
        result.push(line);
      }
    }
    continue;
  }

  if (line.match(/^packages\s*=\s*\[/)) {
    result.push('packages = []');
    continue;
  }

  result.push(line);
}

let output = result.join('\n');

output = output.replace(/\n\n\n+/g, '\n\n');

fs.writeFileSync(replitPath, output);
console.log('✓ Fixed .replit configuration');
console.log('  - Removed stale ports (keeping only 8080 and 24140)');
console.log('  - Cleared nix packages list');
