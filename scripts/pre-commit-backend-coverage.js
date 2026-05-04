#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const THRESHOLD = 80; // percent (branch coverage threshold)
const report = path.join(process.cwd(), 'backend', 'target', 'site', 'jacoco', 'jacoco.xml');

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
    return { type: 'BRANCH', percent: (totalCovered / total) * 100 };
  }

  // Fallback: sum LINE counters if no BRANCH counters present
  const lineRe = /counter type="LINE" missed="(\d+)" covered="(\d+)"/g;
  totalMissed = 0;
  totalCovered = 0;
  while ((match = lineRe.exec(xml)) !== null) {
    totalMissed += Number(match[1]);
    totalCovered += Number(match[2]);
  }
  if (totalMissed + totalCovered === 0) return { type: 'NONE', percent: 100 };
  return { type: 'LINE', percent: (totalCovered / (totalMissed + totalCovered)) * 100 };
}

const res = readBackend(report);
if (res === null) {
  console.log(`Pre-commit check: backend coverage report not found at ${report}. Run backend tests locally to generate JaCoCo report.`);
  process.exit(0);
}

const cov = res.percent;
const type = res.type;

if (cov < THRESHOLD) {
  console.warn(`WARNUNG: Backend ${type === 'BRANCH' ? 'Branch-Coverage' : 'Line-Coverage'} ist ${cov.toFixed(2)}%, unter dem Schwellwert von ${THRESHOLD}%.`);
} else {
  console.log(`Backend ${type === 'BRANCH' ? 'Branch-Coverage' : 'Line-Coverage'} ist ${cov.toFixed(2)}% (Schwellwert ${THRESHOLD}%).`);
}

process.exit(0);
