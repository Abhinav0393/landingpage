import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';

/**
 * Exercises public/api/contact.php against a running PHP built-in server.
 *
 * Usage:
 *   npm run build (preview is fine)
 *   PHP_BIN=/path/to/php node scripts/test-contact-endpoint.mjs
 *
 * The test uses a temporary config directory with APP_ENV=local and
 * CONTACT_DRY_RUN=1, so no SMTP credentials or real .env are needed. Nothing
 * is sent and no message bodies are logged.
 */

const root = process.cwd();
const dist = path.join(root, 'dist');
const configDir = path.join(root, 'screenshots', 'contact-endpoint-test');
const rateDir = path.join(configDir, 'rate-limit');
const phpBin = process.env.PHP_BIN || (process.platform === 'win32' ? 'php.exe' : 'php');

if (!fs.existsSync(path.join(dist, 'api', 'contact.php'))) {
  console.error('dist/api/contact.php is missing. Run a preview build first.');
  process.exit(1);
}

if (spawnSync(phpBin, ['-v'], { stdio: 'ignore' }).status !== 0) {
  console.error(`PHP not found (${phpBin}). Set PHP_BIN to a PHP 8.1+ executable.`);
  process.exit(1);
}

fs.rmSync(configDir, { recursive: true, force: true });
fs.mkdirSync(rateDir, { recursive: true });
fs.writeFileSync(
  path.join(configDir, '.env'),
  ['APP_ENV=local', 'CONTACT_DRY_RUN=1', ''].join('\n'),
  'utf8'
);

const port = 8099;
const base = `http://127.0.0.1:${port}/api/contact.php`;
const logPath = path.join(configDir, 'php-server.log');
const serverLog = fs.createWriteStream(logPath);
const server = spawn(phpBin, ['-S', `127.0.0.1:${port}`, '-t', dist], {
  cwd: root,
  env: { ...process.env, RIVORA_CONFIG_DIR: configDir },
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.pipe(serverLog);
server.stderr.pipe(serverLog);

let failures = 0;
function check(name, condition, detail = '') {
  if (condition) {
    console.log(`PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(base);
      if (response.status > 0) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('PHP server did not start. See ' + logPath);
}

const good = {
  name: 'Test Enquirer',
  email: 'test@example.com',
  phone: '+91 80998 88851',
  location: 'Survey 123, Example District',
  enquiry: 'Title verification and due diligence',
  message: 'This is a dry-run integration test of the contact form endpoint.',
  website: '',
};

function formBody(values) {
  return new URLSearchParams(values);
}

try {
  await waitForServer();

  let response = await fetch(base, { headers: { Accept: 'application/json' } });
  check('GET is rejected', response.status === 405, `status ${response.status}`);

  response = await fetch(base, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formBody({ name: '', email: 'nope', phone: '12', enquiry: 'Bogus', message: 'x' }),
  });
  const invalid = await response.json();
  check('invalid fields return 422', response.status === 422, `status ${response.status}`);
  check(
    'validation names every bad field',
    ['name', 'email', 'phone', 'enquiry', 'message'].every((field) => invalid.errors?.[field])
  );

  fs.rmSync(rateDir, { recursive: true, force: true });
  fs.mkdirSync(rateDir, { recursive: true });
  response = await fetch(base, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formBody(good),
  });
  const success = await response.json();
  check('valid enquiry is accepted', response.status === 200 && success.ok === true);

  response = await fetch(base, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formBody({ ...good, website: 'https://spam.example' }),
  });
  check('honeypot is silently accepted', response.status === 200, `status ${response.status}`);

  let lastStatus = 0;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reply = await fetch(base, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formBody(good),
    });
    lastStatus = reply.status;
  }
  check('sixth accepted enquiry is rate-limited', lastStatus === 429, `status ${lastStatus}`);

  fs.rmSync(rateDir, { recursive: true, force: true });
  fs.mkdirSync(rateDir, { recursive: true });
  response = await fetch(base, { method: 'POST', body: formBody(good) });
  const html = await response.text();
  check(
    'JavaScript-off fallback returns a confirmation page',
    response.status === 200 && html.includes('Enquiry received')
  );

  fs.rmSync(rateDir, { recursive: true, force: true });
  fs.mkdirSync(rateDir, { recursive: true });
  fs.writeFileSync(
    path.join(configDir, '.env'),
    ['APP_ENV=production', 'CONTACT_DRY_RUN=0', ''].join('\n'),
    'utf8'
  );
  response = await fetch(base, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formBody(good),
  });
  const unavailable = await response.json();
  check(
    'missing SMTP configuration fails safely',
    response.status === 503 && unavailable.ok === false
  );

  fs.rmSync(rateDir, { recursive: true, force: true });
  fs.mkdirSync(rateDir, { recursive: true });
  response = await fetch(base, {
    method: 'POST',
    headers: { Accept: 'application/json', Origin: 'https://unrelated.example' },
    body: formBody(good),
  });
  check('cross-origin submission is rejected', response.status === 403, `status ${response.status}`);
} finally {
  server.kill();
  await new Promise((resolve) => setTimeout(resolve, 300));
  const log = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
  check(
    'logs do not contain message bodies',
    !log.includes('dry-run integration test') && !log.includes('Test Enquirer')
  );
  serverLog.end();
}

console.log(`\n${failures === 0 ? 'All contact endpoint checks passed.' : `${failures} check(s) failed.`}`);
if (failures > 0) {
  console.log(`Server log: ${logPath}`);
  process.exitCode = 1;
}
