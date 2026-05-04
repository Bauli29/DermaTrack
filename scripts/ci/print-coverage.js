#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const which = process.argv[2];
if (!which) {
  console.error('Usage: node scripts/ci/print-coverage.js <backend|frontend>');
  process.exit(0);
}

function readBackend(reportPath) {
  if (!fs.existsSync(reportPath)) return null;
  const xml = fs.readFileSync(reportPath, 'utf8');
  // Sum all BRANCH counters across the report
  const branchRe = /counter type="BRANCH" missed="(\d+)" covered="(\d+)"/g;
  let match;
  let totalMissed = 0;
  let totalCovered = 0;
  while ((match = branchRe.exec(xml)) !== null) {
    totalMissed += Number(match[1]);
    totalCovered += Number(match[2]);
  }
  if (totalMissed + totalCovered > 0) {
    const total = totalMissed + totalCovered;
    return (totalCovered / total) * 100;
  }
  // Fallback: sum LINE counters if no BRANCH counters present
  const lineRe = /counter type="LINE" missed="(\d+)" covered="(\d+)"/g;
  totalMissed = 0;
  totalCovered = 0;
  while ((match = lineRe.exec(xml)) !== null) {
    totalMissed += Number(match[1]);
    totalCovered += Number(match[2]);
  }
  if (totalMissed + totalCovered === 0) return 100;
  return (totalCovered / (totalMissed + totalCovered)) * 100;
}

function readFrontend(reportPath) {
  if (!fs.existsSync(reportPath)) return null;
  const json = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const pct = json?.total?.lines?.pct;
  return typeof pct === 'number' ? pct : null;
}

try {
  if (which === 'backend') {
    const report = path.join('backend', 'target', 'site', 'jacoco', 'jacoco.xml');
    const value = readBackend(report);
    if (value === null) {
      console.log('TOTAL COVERAGE: 0% (report missing)');
    } else {
      console.log(`TOTAL COVERAGE: ${value.toFixed(2)}%`);
    }
  } else if (which === 'frontend') {
    const report = path.join('frontend', 'coverage', 'coverage-summary.json');
    const value = readFrontend(report);
    if (value === null) {
      console.log('TOTAL COVERAGE: 0% (report missing)');
    } else {
      console.log(`TOTAL COVERAGE: ${value.toFixed(2)}%`);
    }
  } else {
    console.error('Unknown target:', which);
  }
} catch (e) {
  console.error('Error while reading coverage:', e && e.message);
  process.exit(0);
}
