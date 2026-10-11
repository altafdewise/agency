// Uptime check for zev.world, run every 10 minutes by .github/workflows/uptime.yml
// (and by hand: `node scripts/uptime-check.mjs [base-url]`).
//
// Each check retries before it counts as down, so a single blip never alerts.
// The estimate check sends answers the site rejects on purpose: it proves the
// API is up without creating a lead, calling the AI or sending any email.
import { appendFileSync } from "node:fs";

const BASE = (process.argv[2] || "https://www.zev.world").replace(/\/$/, "");
const ATTEMPTS = 3;
const RETRY_MS = 15_000;
const TIMEOUT_MS = 20_000;

const CHECKS = [
  { name: "Home page", path: "/", expect: 200, contains: "no fluff" },
  { name: "Portfolio", path: "/portfolio", expect: 200 },
  { name: "Blog", path: "/blog", expect: 200 },
  { name: "About", path: "/about", expect: 200 },
  { name: "Sitemap", path: "/sitemap.xml", expect: 200, contains: "<urlset" },
  {
    name: "Estimate API",
    path: "/api/estimate",
    method: "POST",
    body: { needs: ["website"], persona: "uptime-check", stage: "", description: "uptime check", contact: null },
    expect: 400,
    contains: "error",
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function once(check) {
  const started = Date.now();
  const res = await fetch(BASE + check.path, {
    method: check.method || "GET",
    headers: {
      "user-agent": "zev-uptime-check",
      ...(check.body ? { "content-type": "application/json" } : {}),
    },
    body: check.body ? JSON.stringify(check.body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "follow",
  });
  const text = await res.text();
  const ms = Date.now() - started;
  if (res.status !== check.expect) return `HTTP ${res.status} (expected ${check.expect}) after ${ms}ms`;
  if (check.contains && !text.includes(check.contains)) return `responded ${res.status} but the page looks wrong (missing "${check.contains}")`;
  return null;
}

async function run(check) {
  let problem = "";
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      problem = await once(check);
    } catch (error) {
      problem = error?.name === "TimeoutError" ? `no response within ${TIMEOUT_MS / 1000}s` : `request failed (${error?.message || error})`;
    }
    if (!problem) return null;
    if (attempt < ATTEMPTS) await sleep(RETRY_MS);
  }
  return `${check.name} (${check.path}): ${problem}`;
}

const failures = (await Promise.all(CHECKS.map(run))).filter(Boolean);

if (failures.length) {
  console.log(`DOWN - ${failures.length} of ${CHECKS.length} checks failing:`);
  failures.forEach((f) => console.log(`  - ${f}`));
} else {
  console.log(`UP - all ${CHECKS.length} checks passed for ${BASE}`);
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `failed=${failures.length ? "true" : "false"}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `failures<<EOF\n${failures.join("\n")}\nEOF\n`);
}
