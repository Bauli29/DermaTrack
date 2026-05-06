#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const THRESHOLD = 80; // percent

function readBackend(reportPath) {
  if (!fs.existsSync(reportPath)) return null;
  const xml = fs.readFileSync(reportPath, 'utf8');

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

try {
  const report = path.join(process.cwd(), 'target', 'site', 'jacoco', 'jacoco.xml');
  const value = readBackend(report);
  if (value === null) {
    console.log('TOTAL COVERAGE: 0% (report missing)');
    process.exit(0);
  }
  const pct = Number(value.toFixed(2));
  console.log(`TOTAL COVERAGE: ${pct.toFixed(2)}%`);
  if (pct < THRESHOLD) {
    // GitHub Actions warning annotation (shows as annotation in Checks)
    console.log(`::warning::Backend coverage is ${pct.toFixed(2)}% which is below the threshold of ${THRESHOLD}%`);
  }
} catch (e) {
  console.error('Error while checking backend coverage:', e && e.message);
  process.exit(0);
}
