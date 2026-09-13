#!/usr/bin/env node
// Runs prisma migrate deploy with automatic baselining for databases that were
// originally created with prisma db push (no migration history).
//
// On a fresh database with no _prisma_migrations table, migrate deploy fails
// with P3005. We resolve that by marking pre-existing migrations as already
// applied (without re-running them), then letting migrate deploy apply any
// truly new ones.

const { execSync } = require("child_process")

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit" })
    return true
  } catch {
    return false
  }
}

// Migrations that already exist in the DB (created via prisma db push).
// Marking them applied is idempotent — safe to run on every deploy.
const BASELINE = [
  "20260910000000_initial",
  "20260912000000_add_funnels",
]

for (const name of BASELINE) {
  run(`npx prisma migrate resolve --applied ${name}`)
}

// Apply any pending migrations (e.g. GA4 enums, future changes).
const ok = run("npx prisma migrate deploy")
if (!ok) process.exit(1)
