# DNC App — CNC Program Transfer and Management

A web-based DNC application built on the Bivrost gateway HTTP protocol: a
program library that is the source of truth, with controlled deployment to CNC
machines across any number of Bivrost gateways.

Spec: [`../specs/dnc-app-cnc-program-transfer-and-management.md`](../specs/dnc-app-cnc-program-transfer-and-management.md).
Protocol reference: §2.6 (file management) and §2.9.3/§2.9.4 (machine/group
configuration) of the Bivrost gateway protocol docs in this repository.

> This directory is intentionally self-contained (own npm workspace, no
> dependency on the surrounding docs site) so it can be extracted into an
> independent repository later.

## What it does

- **Program library** — folder-organized; every re-upload creates a new
  immutable version; versions carry a Draft/Released flag; full history, diffs,
  one-click rollback by re-releasing; deletion archives instead of destroying.
- **Multi-gateway machine registry** — read-only sync of machines and groups
  from each gateway (§2.9.3.2, §2.9.4.2); machine identity is always
  (gateway, machineID); per-machine capability profiles derived from the
  protocol doc's support matrices grey out unsupported actions with an
  explanation, and the backend rejects them before calling the gateway.
- **Safe pushes** — name collisions trigger a guarded replace (confirm →
  safety snapshot of the machine's copy → delete → send as one tracked
  operation); the currently-running program is never replaced; every push is
  verified by reading the file back with control-aware normalization (line
  endings, trailing whitespace, FANUC O-number renaming and leading-zero
  stripping), with a per-machine off-switch. A failure after the delete leaves
  a one-click restorable snapshot.
- **Fleet push** — one released version to many machines/groups with
  per-target results; targets that need no guarded replace and no verification
  ride a single `batchSendFile` per gateway, everything else fans out through
  the per-machine pipeline automatically.
- **Serial per-machine queue** — transfers to one machine never interleave;
  different machines run concurrently.
- **Pull & check-in** — pulling a machine file that maps to a library program
  (via assignment/deployed name) checks it in as a new Draft version with full
  provenance; unmapped files can be captured as new programs.
- **Drift monitoring** — scheduled and on-demand scans compare machine copies
  against the latest released versions; dashboard rolls up
  in-sync / drifted / missing / unreachable / not-scanned per machine, next to
  what each machine is currently running (`readCurrentProgram`).
- **Backups** — on-demand and scheduled machine backups (ZIP via
  `backupFiles`) with count-based retention for scheduled backups.
- **Roles & audit** — Engineer and Operator roles enforced server-side
  (operators push only Released versions of assigned programs and cannot edit
  the library or delete machine files); an append-only audit log records every
  operation with user attribution, filterable by machine/program/user/action/date.

## Layout

```
dnc-app/
  server/   Fastify + TypeScript backend, SQLite (node:sqlite), content-addressed blob store
    src/gateway/    the ONE module that speaks the Bivrost HTTP protocol
    src/domain/     capability matrices, FANUC naming, verify normalization
    src/services/   library, assignments, transfer engine, drift, backups, schedulers
    src/http/       session auth + REST routes
    test/           contract-faithful fake Bivrost gateway + seam tests
  web/      React + Vite SPA (thin: rendering + calls to the backend API)
```

## Development

Requires Node 22+ (uses the built-in `node:sqlite`).

```sh
npm install
npm run dev:server    # backend on :8340
npm run dev:web       # Vite dev server on :5173, proxying /api to :8340
npm test              # backend seam tests + SPA role-gating tests
```

First run creates a bootstrap engineer account `admin`/`admin` (override with
`DNC_BOOTSTRAP_USER` / `DNC_BOOTSTRAP_PASSWORD`). Then, in the UI: Gateways →
add your Bivrost gateway (base URL + API key) → Sync. Machine configuration
itself stays in Bivrost; the app only decorates machines with app-side
metadata (display name, verify toggle, configured root dir, schedules).

## Production

```sh
docker compose up --build     # serves UI + API on :8340, data in the dnc-data volume
```

Configuration (env): `DNC_PORT`, `DNC_DATA_DIR`, `DNC_SESSION_TTL_HOURS`,
`DNC_GATEWAY_TIMEOUT_MS`, `DNC_REGISTRY_SYNC_MINUTES`, `DNC_SCHEDULER_TICK_MS`,
`DNC_BOOTSTRAP_USER`, `DNC_BOOTSTRAP_PASSWORD`, `DNC_WEB_DIST`.

## Testing

One seam: the backend HTTP API, driven exactly as the SPA drives it, over an
in-process **fake Bivrost gateway** (`server/test/fakeGateway.ts`) that
faithfully reproduces the documented contract — no-overwrite (errorCode 142),
FANUC content naming and zero-stripped listings, `dirAtCNC`/`subDir`
precedence, errorCode 158 semantics, positional batch results, backup abort
behavior — plus failure injection (offline machines/gateways, mid-transfer
failures, corrupted sends). All business logic is tested at this seam
(67 tests); the SPA carries a handful of role-gating component tests.

For a release smoke against a real gateway, use its built-in **Mock** machine
type — note `selectProgram` on Mock always reports success without changing
the current program.
