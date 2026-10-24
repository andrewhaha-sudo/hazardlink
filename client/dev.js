#!/usr/bin/env node
const { spawn } = require('child_process');

const port = process.env.PORT || '5000';
const next = spawn('next', ['dev', '-p', port], {
  stdio: 'inherit',
  cwd: __dirname
});

next.on('exit', (code) => process.exit(code));
