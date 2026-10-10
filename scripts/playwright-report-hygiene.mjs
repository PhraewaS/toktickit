import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// Use ZIP utilities bundled with the locked Playwright installation.
const require = createRequire(new URL('../e2e/package.json', import.meta.url));
const { yauzl, yazl } = require('playwright-core/lib/utilsBundle');

async function readArchive(buffer) {
  const archive = await new Promise((resolve, reject) => yauzl.fromBuffer(buffer, { lazyEntries: true }, (error, zip) => error ? reject(error) : resolve(zip)));
  return new Promise((resolve, reject) => {
    const entries = [];
    archive.on('error', reject);
    archive.on('entry', entry => {
      archive.openReadStream(entry, (error, stream) => {
        if (error) return reject(error);
        const chunks = [];
        stream.on('error', reject);
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => { entries.push({ name: entry.fileName, buffer: Buffer.concat(chunks) }); archive.readEntry(); });
      });
    });
    archive.on('end', () => resolve(entries));
    archive.readEntry();
  });
}

function redact(value, secrets) {
  if (typeof value === 'string') {
    let text = secrets.filter(Boolean).reduce((result, secret) => result.split(secret).join('[REDACTED]'), value);
    // Playwright stores values in generated input-step titles, including
    // disposable test credentials that are not the database password.
    if (/getByLabel\([^)]*password/i.test(text) && /^Fill "/.test(text)) text = text.replace(/^Fill "[\s\S]*?"(?= getByLabel)/, 'Fill "[REDACTED]"');
    return text;
  }
  if (Array.isArray(value)) return value.map(item => redact(item, secrets));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redact(item, secrets)]));
  return value;
}

export async function sanitizePlaywrightReport(sourceDirectory, destinationDirectory, secrets = [], requireMetrics = false) {
  const html = fs.readFileSync(path.join(sourceDirectory, 'index.html'), 'utf8');
  const pattern = /data:application\/zip;base64,([A-Za-z0-9+/=]+)/;
  const payload = html.match(pattern);
  if (!payload) throw new Error('Playwright HTML report archive is missing');
  const entries = await readArchive(Buffer.from(payload[1], 'base64'));
  const root = JSON.parse(entries.find(entry => entry.name === 'report.json').buffer.toString());
  if (!root.stats?.total || root.stats.unexpected || root.errors?.length || !root.stats.ok) throw new Error('Cannot publish an empty or failing Playwright report');
  const details = entries.filter(entry => entry.name.endsWith('.json') && entry.name !== 'report.json');
  const combined = details.map(entry => entry.buffer.toString()).join('\n');
  if (requireMetrics && (!combined.includes('DASHBOARD-METRICS') || !combined.includes('dashboard-metrics-requester') || !combined.includes('dashboard-metrics-staff'))) throw new Error('Dashboard metric report evidence is missing');
  const zip = new yazl.ZipFile();
  const completed = new Promise((resolve, reject) => {
    const chunks = [];
    zip.outputStream.on('data', chunk => chunks.push(chunk));
    zip.outputStream.on('error', reject);
    zip.outputStream.on('end', () => resolve(Buffer.concat(chunks)));
  });
  for (const entry of entries) {
    const buffer = entry.name.endsWith('.json') ? Buffer.from(JSON.stringify(redact(JSON.parse(entry.buffer.toString()), secrets))) : entry.buffer;
    zip.addBuffer(buffer, entry.name);
  }
  zip.end();
  const sanitized = await completed;
  // Reopen before publication: redaction must not change actual result totals.
  const checked = await readArchive(sanitized);
  const checkedRoot = JSON.parse(checked.find(entry => entry.name === 'report.json').buffer.toString());
  if (JSON.stringify(root.stats) !== JSON.stringify(checkedRoot.stats)) throw new Error('Report totals changed during credential redaction');
  for (const entry of checked.filter(entry => entry.name.endsWith('.json'))) {
    const text = entry.buffer.toString();
    if (secrets.filter(Boolean).some(secret => text.includes(secret))) throw new Error('Report still contains a configured secret');
  }
  if (path.resolve(sourceDirectory) !== path.resolve(destinationDirectory)) fs.cpSync(sourceDirectory, destinationDirectory, { recursive: true });
  fs.writeFileSync(path.join(destinationDirectory, 'index.html'), html.replace(pattern, 'data:application/zip;base64,' + sanitized.toString('base64')));
  return { stats: checkedRoot.stats, errors: checkedRoot.errors || [], metricsPresent: requireMetrics, credentialRedaction: true };
}
