# Spec: DNC App — CNC Program Transfer and Management

A new standalone product (own repository) built on the Bivrost gateway HTTP protocol, primarily the file management interfaces (protocol doc §2.6) and the machine configuration interfaces (§2.9.3).

## Problem Statement

Machine shops running mixed fleets of CNCs (Fanuc, Siemens, Heidenhain, Okuma, Mitsubishi, Brother, and others) have no single source of truth for their NC part programs. Programs live scattered across machine memories, USB sticks, engineers' PCs, and shared folders. Nobody can say with confidence which version of a program a given machine is running, whether an operator's at-the-machine edits ever made it back to the master copy, or whether the file that just got pushed to the control actually arrived intact. Replacing a program on a control is risky by nature — controls don't support overwriting, so an update is a delete followed by a send, and a failure in between loses the machine's copy. Shops with more than one Bivrost gateway additionally have no unified view across gateways.

The result: wrong-version parts get cut, proven-out edits get lost, and program distribution is a manual, error-prone chore.

## Solution

A web-based DNC application: a program library that is the source of truth, with controlled deployment to machines across any number of Bivrost gateways.

Engineers upload NC programs into a folder-organized library where every re-upload creates a new version and versions carry a simple Draft/Released flag. Programs are assigned to target machines or machine groups, with per-target deployed-name overrides so one library program can satisfy each control's naming rules. Operators see the released programs relevant to their machine, push them with one action, and optionally select them as the main program on the control.

Every push is safe by construction: name collisions trigger a guarded replace (confirm → snapshot the machine's current copy → delete → send), the currently-running program is never replaced, and every transfer is verified by reading the file back and comparing with control-aware normalization. Pulls of mapped machine files check in as new Draft versions with full provenance. Scheduled drift scans compare machine copies against released library versions and flag divergence on a dashboard, next to what each machine is currently running. Scheduled and on-demand machine backups (ZIP) with retention round out disaster recovery. Everything is captured in an audit/transfer log attributing every action to a user.

## User Stories

### Authentication and roles

1. As a shop user, I want to log in with a username and password, so that all actions are attributed to me.
2. As an engineer, I want to create, disable, and reset accounts for engineers and operators, so that the team's access is managed in one place.
3. As an engineer, I want operators to be restricted from editing the library, deleting files on machines, and pushing non-released versions, so that only proven programs reach production machines.
4. As an operator, I want my UI to show only the actions I'm allowed to take, so that I'm not confronted with buttons that will fail.

### Gateway connections and machine registry

5. As an engineer, I want to register multiple Bivrost gateways (name, base URL, credentials), so that one app covers the whole shop even when machines are split across gateways.
6. As an engineer, I want the app to sync the machine list (and machine groups) from each gateway read-only on a schedule and on demand, so that the registry stays current without duplicating machine administration.
7. As an engineer, I want every machine to be identified as (gateway, machineID) throughout the app — UI, logs, backups — so that identically numbered machines on different gateways are never confused.
8. As an engineer, I want to see each gateway's connection health and last successful sync, so that I can tell an offline gateway from an offline machine.
9. As an engineer, I want each machine to carry a capability profile derived from its system/model (per the protocol doc's support matrices), so that unsupported actions are greyed out with an explanation instead of failing at the control.
10. As an engineer, I want to decorate machines with app-side metadata (display name, grouping, backup schedule) without touching gateway config, so that machine administration stays in Bivrost.

### Program library

11. As an engineer, I want to organize programs in a free-form folder tree, so that the library mirrors how our shop thinks (customer/part/operation).
12. As an engineer, I want to upload NC program files (text or binary) into the library, so that there is one master copy of each program.
13. As an engineer, I want re-uploading a program to create a new version rather than overwrite, so that history is never lost.
14. As an engineer, I want to view a program's full version history (who, when, source), so that I can trace how a program evolved.
15. As an engineer, I want to view and diff any two versions of a program, so that I can see exactly what changed between them.
16. As an engineer, I want to mark a version Released or revert it to Draft with one click, so that controlling what operators may push is frictionless.
17. As an engineer, I want to roll back by re-releasing an earlier version, so that a bad release is recoverable in seconds.
18. As an engineer, I want to move, rename, and delete programs and folders in the library, so that the library stays tidy (deletion archives rather than destroys history).
19. As an engineer, I want to search the library by program name, folder, and assigned machine, so that I can find any program quickly.

### Assignment and naming

20. As an engineer, I want to assign a program to one or more machines or machine groups, so that operators see exactly the programs meant for their machine.
21. As an engineer, I want to set a per-target deployed name for a program (e.g. library `bracket-op10.nc` deploys as `O1234` on the Fanuc and `BRACKET10.MPF` on the Siemens), so that one master copy satisfies each control's naming rules.
22. As an engineer, I want the app to warn me when a deployed name violates the target's naming rules (extension required on Gsk/Siemens; Fanuc name derived from the O-number in the content, not the fileName), so that pushes don't fail or land under a surprising name.
23. As an engineer, I want to set a per-target directory (dirAtCNC/subDir) for an assignment, so that programs land where that machine expects them.

### Browsing machine storage

24. As a user, I want to browse a machine's file list and folder tree (within what its capability profile supports), so that I can see what is on the control right now.
25. As a user, I want to search a machine's storage for a file name and browse all programs recursively, so that I can locate a program without walking folders by hand.
26. As an engineer, I want to create and delete directories on machines that support it, so that machine storage stays organized.
27. As an engineer, I want to delete files from a machine (with confirmation), so that stale programs don't linger on controls.
28. As a user, I want to download any machine file to my computer, so that I can inspect it outside the app.

### Pushing programs to machines

29. As an operator, I want to push a Released version of a program assigned to my machine with one action, so that loading the right program is fast and mistake-proof.
30. As an engineer, I want to push any version (including Drafts) to any machine, so that I can prove out a draft at the control.
31. As a user, I want a name collision on push to trigger a guarded replace — confirmation, safety snapshot of the machine's copy into the app, then delete-then-send as one tracked operation — so that an update can never silently destroy the machine's only copy.
32. As a user, I want the app to refuse to replace the machine's currently-running program, so that a push can never yank a program mid-cycle.
33. As a user, I want every push verified by default — the file is read back and compared with normalization (line endings, encoding, Fanuc O-number renaming) — so that I know the program on the control matches the library, with a per-machine off-switch for slow links.
34. As an engineer, I want to fleet-push one released version to many machines/groups in a single operation with per-target success/failure results, so that distributing a revision to a cell of identical machines is one action, not twenty.
35. As a user, I want transfers to a given machine to queue and run serially, so that concurrent operations can't interleave on one control.
36. As a user, I want clear progress and terminal status (success / failed / verified / mismatch) for every transfer, so that I never have to wonder whether a push worked.

### Pulling programs and check-in

37. As an engineer, I want pulling a machine file that maps to a library program (via assignment/deployed name) to check it in as a new Draft version with provenance (machine, time, user), so that at-the-machine edits flow back into the library instead of getting lost.
38. As an engineer, I want to pull an unmapped machine file into the library as a new program, so that legacy programs living only on controls can be captured.
39. As a user, I want an on-demand "compare with library" action for any machine file, so that I can see drift immediately as a diff.

### Drift monitoring and active-program awareness

40. As an engineer, I want the backend to run scheduled drift scans that pull assigned programs from machines and compare them against the released version, so that unauthorized or unsynced edits surface without anyone remembering to check.
41. As an engineer, I want a dashboard listing every machine's drift status (in sync / drifted / unreachable / not scanned), so that program integrity across the shop is visible at a glance.
42. As a user, I want to see what program each machine is currently running (readCurrentProgram), so that the shop's live state is visible from my desk.
43. As an operator, I want to select a pushed program as the machine's main program (selectProgram, honoring per-model support and Okuma's mode parameter), so that setup is complete from the app when the control allows it.

### Backups

44. As an engineer, I want on-demand backup of any machine's storage (or a chosen directory) as a ZIP via the gateway's backupFiles, so that I can snapshot a control before risky work.
45. As an engineer, I want per-machine scheduled backups with a retention policy, so that disaster recovery doesn't rely on anyone remembering.
46. As an engineer, I want to browse, download, and delete stored backups, so that recovery and housekeeping are self-service.

### Audit and transfer log

47. As an engineer, I want an append-only log of every operation (push, pull, delete, replace, verify result, backup, release, login) with user, machine, gateway, program, version, and timestamp, so that any part quality question can be answered from the record.
48. As an engineer, I want to filter the log by machine, program, user, operation, and date range, so that investigations take minutes.

### Failure handling

49. As a user, I want gateway errors surfaced with the gateway's errorCode/errorMsg plus a plain-language explanation, so that I can tell "machine offline" from "file already exists" without reading a protocol doc.
50. As a user, I want a failed guarded replace to offer one-click restore of the safety snapshot, so that the pre-push state of the machine is always recoverable.
51. As an engineer, I want the app to remain usable when one gateway is unreachable, so that a single gateway outage doesn't take down shop-wide DNC.

## Implementation Decisions

### Architecture

- New standalone repository, separate from this protocol-docs repo.
- Three parts: a React SPA, a Node/TypeScript backend (Fastify or NestJS), and SQLite for metadata with program file content and snapshots stored on disk (content-addressed). Shipped as a single Docker image / docker-compose for a shop-floor server.
- The backend is a thin proxy and system of record: the browser never talks to a gateway directly. Gateway credentials live only in the backend.
- Multi-gateway from day one. A GatewayConnection entity (name, base URL, credentials, enabled). Machine identity everywhere is the pair (gatewayID, machineID).
- Machine registry is synced read-only from each gateway's machine-config API (protocol §2.9.3.2) plus groups; app-side machine metadata (display grouping, backup schedule, verify toggle) is stored locally and keyed by (gatewayID, machineID). Machine creation/configuration remains in Bivrost's own UI — explicitly not replicated.

### Domain model

- Program: belongs to a library folder; has many ProgramVersions; soft-deleted (history preserved).
- ProgramVersion: immutable content reference, monotonically increasing version number, state Draft | Released, provenance (uploaded by user / checked in from machine X at time T). Releasing is a one-click state change by an Engineer; releasing a version does not auto-unrelease others, but operators are always offered the latest Released version.
- Assignment: Program ↔ (machine | machine group), with optional deployed-name override and target directory (dirAtCNC or subDir). Assignment drives the operator's "programs for my machine" view and remembers naming per target.
- Users have role Engineer or Operator. Engineers manage users and gateway connections (no separate Admin role).

### Gateway client

- One gateway-client module encapsulates the entire Bivrost HTTP contract; nothing else in the backend touches gateway HTTP. Its interface is expressed in domain terms (listDir, pullFile, pushFile, deleteFile, currentProgram, selectProgram, backupZip, machineConfigs).
- Transfers always use the stream endpoints (receiveFileStream / sendFileStream); the non-stream variants and cached-read endpoints are not used.
- The client encodes the protocol's semantics: dirAtCNC takes precedence over subDir; no-overwrite (errorCode 142) on send; Fanuc name derivation from the O-number between the first and second newline of content, including leading-zero stripping on listings; extension-required systems (Gsk, Siemens); batchSendFile returning per-target results positionally.
- Capability profiles: the per-model support matrices from protocol §2.6 (subdirectory listing support, create/delete dir support, selectProgram support and its preconditions, default root paths) are encoded as static data keyed by system/model. The UI greys out unsupported actions with an explanation; the backend rejects unsupported operations before calling the gateway.
- Text encoding follows the machine's gateway configuration by default, with per-push override.

### Transfer engine

- Per-machine serial queue; operations against different machines run concurrently.
- Push pipeline: capability check → collision check (list target dir) → if collision: require confirmed guarded replace → refuse if target file is the machine's current program (readCurrentProgram) → snapshot machine copy to backend storage → deleteFile → sendFileStream → read-back verify → write transfer log entry. Every step's outcome is recorded; a failure after delete leaves a restorable snapshot and flags the transfer as recoverable.
- Verification is on by default with a per-machine off switch. Compare with normalization: ignore line-ending differences, trailing whitespace, and encoding representation; resolve expected file name via the Fanuc naming rules where applicable. Result recorded as Verified / Unverified (off or unsupported) / Mismatch.
- Fleet push fans out through batchSendFile where the guarded-replace path is not needed, and falls back to per-machine pipelines when replacement or verification demands it; results are always per-target.

### Schedulers

- Drift scan: per-machine schedule; pulls each assigned program's machine copy and compares against the latest Released version using the same normalization as verification; publishes per-machine drift status (in sync / drifted / unreachable / not scanned) to the dashboard. Scan failures do not alert-storm — an unreachable machine is a status, not an error flood.
- Backups: per-machine schedule invoking backupFiles for the machine root (includeSubDir true), stored on disk with a retention policy (count- or age-based); on-demand backups for any machine/directory.
- Machine-registry sync: periodic and on-demand per gateway.

### Security and audit

- Session-based login against the backend; passwords hashed at rest; role checks enforced server-side on every route (the UI's greying-out is a courtesy, not the control).
- Append-only audit/transfer log; unlimited retention by default.
- Gateway credentials are write-only through the API (never returned to the browser).

## Testing Decisions

- Good tests exercise external behavior only: drive the backend's public HTTP API exactly as the SPA would (login → upload → release → assign → push → verify → inspect log) and assert on API responses and observable gateway effects — never on internal module structure.
- **Single seam: the backend HTTP API, with a contract-faithful fake Bivrost gateway underneath.** The fake is an in-process HTTP stub implementing the documented `/api/cnc/*` and `/api/config` contract, fixture-configurable per test: system/model (driving capability behavior), pre-existing files/dirs, current running program, and failure injection (machine offline, mid-transfer failure, errorCode 142 on collision, errorCode 158 on missing path). It faithfully reproduces the protocol quirks the app must handle: no-overwrite, Fanuc O-number renaming and leading-zero stripping, dirAtCNC/subDir precedence, models that cannot list subdirectories or create directories, batch endpoints' positional results.
- All business logic — versioning, release gating by role, assignment/deployed-name resolution, the guarded-replace pipeline including snapshot-restore, verification normalization, drift scanning, backup retention — is tested at this seam.
- The SPA keeps logic thin (rendering and calls to the backend API); a small number of component tests cover role-dependent UI gating. No browser E2E in CI.
- A manual smoke procedure against a real Bivrost gateway using its built-in Mock machine type (which always reports success for selectProgram without changing state — noted in the procedure) validates the fake's fidelity per release.
- Prior art: none in this repo (docs only); the fake gateway's behavior is specified directly by protocol doc §2.6 and §2.9.3, which serve as its contract reference.

## Out of Scope

- Edit locking via lockFileByRange (Fanuc/Mitsubishi 8000–9999 program-number ranges).
- Multi-step approval workflow (Draft → In review → Approved → Obsolete); v1 has only the Draft/Released flag.
- Machine configuration administration (creating/editing gateway machine configs, transfer settings) — stays in Bivrost's own UI.
- Part-number-centric data model (Parts with OP10/OP20 operations); the folder tree + assignment model stands in for it.
- In-browser NC program editing; the app views and diffs but never edits content.
- Browser E2E tests in CI, and CI against a real licensed gateway.
- A separate Admin role; Engineers hold gateway-connection and user management.
- MQTT/WebSocket live telemetry beyond polled current-program display.

## Further Notes

- The Bivrost protocol doc sections this app builds on: §2.6 file management (readProgramList, receiveFileStream, sendFileStream, batchSendFile, deleteFile, batchDeleteFile, createDir, deleteDir, backupFiles, selectProgram, readCurrentProgram, readAllPrograms, searchFile) and §2.9.3 machine configs. The support matrices in §2.6 (default root paths, subdirectory-listing support, dir create/delete support, selectProgram device list) are the source data for capability profiles and should be re-checked against the docs at implementation time.
- Fleet push via batchSendFile shares one content body across targets — per-target deployed names come from the targets array; for Fanuc targets the deployed name is governed by the content's O-number, so a fleet push to mixed Fanuc targets that need *different* program numbers must fan out as individual pushes. The transfer engine decides this automatically.
- The safety-snapshot store doubles as an "inbox" of machine-side program states and may later grow into the scheduled-drift history view.
- Haas and shared-folder file servers report no default root path ("无") — the capability profile must require an explicit configured directory for these rather than assuming a root.
