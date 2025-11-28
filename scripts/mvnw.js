#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console, no-process-exit */
/*
 * Cross-platform Maven Wrapper launcher for the backend
 * -----------------------------------------------------
 * Why:
 * - On Windows the wrapper is "mvnw.cmd"; on macOS/Linux it's "./mvnw".
 * - Calling the right one from package.json is error-prone across teams.
 *
 * Usage examples:
 *   node scripts/mvnw.js spring-boot:run -Dspring-boot.run.profiles=local-h2
 *   node scripts/mvnw.js clean package -DskipTests
 *   node scripts/mvnw.js test
 */
'use strict'

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const process = require('node:process')

const isWin = process.platform === 'win32'
const backendCwd = path.resolve(__dirname, '..', 'backend')
const wrapperCmd = isWin ? 'mvnw.cmd' : './mvnw'
const wrapperPath = isWin
  ? path.join(backendCwd, 'mvnw.cmd')
  : path.join(backendCwd, 'mvnw')
const args = process.argv.slice(2)

// If no args, print short help and exit gracefully
if (args.length === 0) {
  console.log('[mvnw.js] No arguments provided. Examples:')
  console.log('  node scripts/mvnw.js spring-boot:run -Dspring-boot.run.profiles=local-h2')
  console.log('  node scripts/mvnw.js clean package -DskipTests')
  console.log('  node scripts/mvnw.js test')
  process.exit(0)
}

// Basic existence check for the wrapper file to provide clearer error messages
if (!fs.existsSync(wrapperPath)) {
  console.error('[mvnw.js] Maven Wrapper not found at:', wrapperPath)
  console.error(
    '[mvnw.js] Please ensure the backend wrapper exists and is executable (on macOS/Linux run: chmod +x backend/mvnw).'
  )
  process.exit(1)
}

const child = spawn(wrapperCmd, args, {
  cwd: backendCwd,
  stdio: 'inherit',
  windowsHide: true,
  shell: isWin, // allow executing .cmd on Windows
})

// Forward common termination signals to child so Maven/Java can shutdown cleanly
const forwardSignal = signal => {
  try {
    if (child && typeof child.kill === 'function') child.kill(signal)
  } catch (_) {
    // ignore
  }
}
process.on('SIGINT', () => forwardSignal('SIGINT'))
process.on('SIGTERM', () => forwardSignal('SIGTERM'))

child.on('exit', code => process.exit(code ?? 0))
child.on('error', err => {
  console.error('[mvnw.js] Failed to start Maven Wrapper:', err)
  process.exit(1)
})
