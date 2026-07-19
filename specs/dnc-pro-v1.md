# Spec: DNC Pro v1

```
status: ready-for-agent
date: 2026-07-18
source: /grilling session (all decisions user-confirmed)
```

## Problem Statement

Machine shops running CNC fleets have no trustworthy answer to the questions that decide whether good parts come off the machines: *Which program is on machine 12 right now? Is it the version we proved out? Who changed it, when, and why?*

Today programs live scattered across office file shares, USB sticks, and the controls' own memories. Operators legitimately tune programs at the control (feeds, offsets, proven-out fixes), and those improvements silently diverge from the office copy — or get lost entirely when a control's memory is wiped. Transfers happen over ad-hoc tools with no verification, so a truncated or wrong-version program is discovered by scrapping a part. There is no approval gate between "a programmer edited a file" and "metal gets cut with it", no record of who sent what where, and no way to know who has copied the shop's program library — which is its core intellectual property — out the door.

The Bivrost gateway solves machine connectivity (file transfer, program listing, current-program telemetry across Fanuc, Siemens, Heidenhain, Brother, Mitsubishi, Okuma, and others), but it deliberately stops at the protocol layer: it has no program library, no versioning, no roles beyond an admin flag and API-prefix allowlists, no audit trail, and no change detection.

## Solution

DNC Pro is an independent, on-prem, single-site application that sits on top of one or more Bivrost gateways and becomes the shop's single source of truth for CNC programs.

Programs live in a versioned **vault** with a lifecycle (Draft → Pending Approval → Released → Obsolete). Machines hold *deployments* of specific versions, sent through a fully transactional transfer pipeline that verifies every byte by reading the file back. A **continuous rolling mirror** pulls the content of every file on every machine around the clock, so the entire fleet is continuously backed up, and any edit made at a control is detected, diffed, and automatically captured into the vault as a pending version for an engineer to accept or reject — nothing an operator proves out on the floor is ever lost, and no running machine is ever silently reverted.

Access is governed by fixed roles (Admin, Programmer, Approver, Operator, Viewer) scoped to machine groups and program libraries. Every state change and every content egress (view, download, send) lands in an append-only, hash-chained audit log. Operators get a deliberately minimal, machine-scoped shop-floor web UI whose sanctioned path is faster than a USB stick. Everything the product can do is exposed as a documented REST API with outbound webhooks, so an MES or scheduling system can command sends and react to releases — authenticating with scoped service tokens that can attribute actions to the human on whose behalf they act.

## User Stories

### Vault & program management

1. As a Programmer, I want to create a program in the vault with metadata (part number, operation, description, compatible machines), so that programs are findable by what they make, not just by file name.
2. As a Programmer, I want to upload a new version of an existing program, so that its history stays in one linear timeline instead of `PART_FINAL_v2_REAL.nc` copies.
3. As a Programmer, I want to browse and search the vault by name, part number, operation, and machine, so that I can find the right program in seconds.
4. As a Programmer, I want to view a side-by-side diff between any two versions of a program, so that I can see exactly what changed before I trust it.
5. As a Programmer, I want to link machine-specific variants of the same part/operation, so that the mill-cell and lathe-cell flavors of one job are grouped but never merged.
6. As a Programmer, I want to assign a program to specific machines with a per-machine file name, so that vault naming and control naming (e.g. Fanuc O-numbers) can differ without confusion.
7. As a Programmer, I want to organize programs into libraries, so that permissions and approval policies can differ between, say, production and prototype work.
8. As a Viewer, I want read-only access to program metadata and history, so that I can answer questions without being able to break anything.

### Versioning & approvals

9. As a Programmer, I want every saved change to create a new immutable version, so that any prior state can be inspected or restored.
10. As a Programmer, I want to submit a Draft version for approval, so that releasing is a deliberate act, not a side effect of saving.
11. As an Approver, I want a queue of versions pending my approval with their diffs, so that I can review efficiently.
12. As an Approver, I want to approve or reject with a required comment, so that the reasoning is on the record.
13. As an Admin, I want to configure the approval policy per library (approver count, author-cannot-approve-own, auto-release), so that a one-person shop and an AS9100 supplier can both use the product honestly.
14. As a Quality Manager, I want the Released state to be the only state deployable to production machines, so that "on the machine" implies "approved".
15. As a Programmer, I want to mark obsolete versions and programs, so that retired work can't be deployed by accident but remains auditable.

### Prove-out & trial deployments

16. As a Programmer with prove-out permission, I want to send a Draft or Pending version to a machine as an explicitly flagged trial deployment, so that I can prove a program out on real metal before releasing it.
17. As a Programmer, I want trial deployments to be time-boxed and require disposition (promote to release or pull back), so that trials can't quietly become production.
18. As a Supervisor, I want machines running trials to be clearly badged in every view, so that nobody mistakes a trial for a released program.
19. As an Admin, I want to disable trial deployments per machine group, so that regulated cells run Released versions only.
20. As a Programmer, I want edits made at the control during a trial to be treated as expected iteration rather than drift alarms, so that prove-out isn't noisy.

### Transfer

21. As an Operator, I want one-tap send of a Released program to my machine, so that getting work is faster than fetching a USB stick.
22. As a Programmer, I want every deployment to snapshot the machine's existing copy, delete, send, read back, and hash-verify before being recorded as deployed, so that a truncated transfer can never masquerade as success.
23. As a Programmer, I want failed deployments to automatically attempt restoring the snapshot and to flag the machine/program pair until healthy, so that a machine is never silently left with no program.
24. As a Programmer, I want to deploy one version to many machines in a single action with per-target results, so that fleet rollouts don't require twenty manual sends.
25. As a Programmer, I want deploy-time transforms (O-number rewrite, encoding, end-of-block normalization) declared per machine assignment and previewable before sending, so that one vault version can serve machines with different naming rules without hand-edited copies.
26. As an Auditor, I want the transformed bytes actually sent (and their hash) recorded with each deployment, so that "what exactly ran on the machine" has a provable answer.
27. As an Operator, I want to see transfer progress and a clear success/failure state, so that I know when it's safe to walk to the control.

### Change detection, mirror & backup

28. As a Shop Owner, I want continuous rolling full-content mirroring of every file on every machine, so that the whole fleet is always backed up without anyone remembering to do it.
29. As a Supervisor, I want a per-machine "last verified" timestamp surfaced in the UI, so that mirror latency is visible instead of assumed.
30. As a Programmer, I want machine-side edits to vault-managed programs auto-captured as pending "machine edit" versions with attached diffs, so that a proven-out tweak survives even if the control's memory dies an hour later.
31. As a Programmer, I want to disposition captured machine edits — accept as new version or reject (optionally pushing the Released version back) — so that the vault and the floor reconverge deliberately.
32. As an Operator, I want DNC Pro to never automatically revert the program on my machine, so that a mid-job overwrite can never scrap my part.
33. As a Supervisor, I want out-of-sync machine/program pairs visible on a fleet dashboard, so that drift is a morning-coffee glance, not a surprise.
34. As a Programmer, I want mirror reads to always yield to real transfers and to skip the currently executing program, so that background sync never interferes with production.
35. As a Shop Owner, I want to restore any historical snapshot of any machine file, so that recovery from a wiped control is minutes, not days of re-posting.

### Unmanaged files

36. As a Supervisor, I want files on machines that the vault doesn't manage to be mirrored with snapshot history but generate no alarms, so that operator warmup macros are protected without being policed.
37. As a Programmer, I want one-click (and bulk) adoption of unmanaged machine files into the vault, so that onboarding a fleet is "adopt what's already there", not manual re-entry.
38. As an Admin, I want a per-machine strict mode that flags unmanaged files, so that regulated cells can require everything to be under management.

### Roles, identity & permissions

39. As an Admin, I want fixed roles (Admin, Programmer, Approver, Operator, Viewer) assigned per machine group and per library, so that Maria can approve for the mill cell without touching the Swiss lathes.
40. As an Admin, I want local user accounts that work with zero external dependencies, so that an air-gapped shop can run the product fully.
41. As an IT Admin, I want OIDC single sign-on against our IdP with optional group-claim-to-role mapping, so that joiners/leavers are handled where identities already live.
42. As an Operator, I want my shop-floor view scoped to my machines and to Released programs only, so that the right action is the only action available.
43. As an Admin, I want to manage the gateway service credentials DNC Pro uses, so that gateways can stay locked down while DNC Pro acts as the single privileged client.

### Integrations & API

44. As an Integration Developer, I want every UI capability available through a documented REST API, so that the MES can do anything a human can — no scraping, no gaps.
45. As an Admin, I want to issue service tokens to integrations, scoped through the same RBAC as humans, so that the MES can send programs to line 3 but cannot delete the vault.
46. As a Quality Manager, I want integration calls to optionally carry an acting user ("service=mes-prod, actor=maria") and to be able to require an actor for risky verbs, so that automation never anonymizes accountability.
47. As an Integration Developer, I want outbound webhooks for domain events (version released, deployment completed/failed, drift captured, approval requested), so that other systems react in seconds without polling.
48. As an Integration Developer, I want webhook deliveries signed and retried with visible delivery status, so that integrations are debuggable and trustworthy.

### Audit

49. As an Auditor, I want an append-only, hash-chained audit log of every state change with before/after values and both principals, so that tampering is detectable and history is complete.
50. As a Shop Owner, I want every content egress — view, download, send — logged with who/what/when/where, so that "who has copied our programs" has an answer.
51. As an Auditor, I want to filter and export the audit log (CSV/JSON) by user, machine, program, and time range, so that an external audit is an afternoon, not a week.
52. As an Admin, I want audit retention configurable with an indefinite default, so that compliance horizons are met without pruning surprises.

### Fleet & infrastructure

53. As an Admin, I want to register multiple gateways and sync their machine lists, so that a 60-machine site with several gateway boxes is one coherent fleet (machine identity = gateway + machineID).
54. As an Admin, I want gateway health (reachable, authenticated, queue depth) on a status page, so that "the gateway is down" is diagnosed before operators phone the office.
55. As an IT Admin, I want the product delivered as a docker-compose stack (app + Postgres + worker) for a Linux host, with a built-in scheduled backup of database and blob store, so that installation and disaster recovery follow patterns my team already runs.

## Implementation Decisions

- **Architecture**: Independent on-prem, single-site application. Talks to CNCs *exclusively* through Bivrost gateway HTTP APIs using service credentials; all product-level authorization lives in DNC Pro (the gateway's auth model — admin flag + API-prefix allowlists — is treated as a backend credential boundary, not a user-permission system).
- **Deployment/packaging**: docker-compose stack — application, Postgres, background worker — officially supported on Linux hosts only ("you provide a Linux VM" is stated up front). Program content stored in a content-addressed blob store; metadata and audit in Postgres. Built-in scheduled backup job exporting both.
- **Source of truth**: the vault is canonical; machine copies are deployments of specific versions. Machine-side divergence is drift, handled by capture-and-disposition, never by silent revert.
- **Versioning model**: linear per-program version history with lifecycle states Draft → Pending Approval → Released → Obsolete. No branching or merging. Content-hash dedup underneath. Version records are immutable.
- **Program identity**: a program is a file artifact + metadata (part number, operation, description, compatible machine models, library membership). Machine assignments carry the per-machine file name and the deploy transform set. Machine-specific variants are separate programs linked via shared part/operation metadata and grouped in the UI.
- **Approval engine**: one workflow engine with per-library policy knobs — number of approvers (default 1), author-cannot-approve-own toggle, auto-release mode. Approvals record approver identity and required comment.
- **Trial deployments**: unreleased versions may be sent only as explicitly flagged trials by holders of a prove-out permission; trials are time-boxed/must-be-dispositioned (promote or pull back); per-machine-group disable switch; drift detection suppresses alarms for the trialing pair.
- **Transfer pipeline** (per deployment, per target): snapshot existing machine copy → delete (gateway cannot overwrite) → send (stream variant of the send API) → read back → hash-compare with normalization for known control rewrites → record deployment with the transformed bytes' hash. On failure: automatic snapshot-restore attempt; machine/program pair flagged unhealthy until verified. Batch deployments report per-target results.
- **Deploy-time transforms**: a fixed declarative menu only — program-number/name rewrite (Fanuc name-in-content), encoding conversion, EOL/end-of-block normalization, %-wrapper fixes. Previewable before send; applied bytes are what get hashed and audited. Vault content is never modified. No templating language.
- **Change detection**: continuous rolling full-content mirror of all files on all machines, per-gateway and per-machine serial queues with throttling; mirror reads are preempted by user/integration transfers; currently executing program is skipped (via current-program telemetry); per-machine "last verified" is a first-class UI datum. Mirror snapshots double as fleet backup with restore.
- **Drift handling**: content mismatch on a vault-managed file → auto-capture into the vault as a pending "machine edit" version with diff and machine/time attribution → notify program owner → engineer dispositions (accept as new version, or reject with optional push-back of Released version). Unmanaged files: mirrored with history, no alarms, one-click/bulk adopt; per-machine strict mode flags them.
- **RBAC**: fixed roles — Admin, Programmer, Approver, Operator, Viewer — assigned per scope (machine group, program library). No custom role builder in v1.
- **Identity**: local account store (air-gap capable) plus OIDC SSO; role/scope assignment always lives in DNC Pro; optional IdP group-claim → role mapping.
- **App-to-app auth**: per-integration service accounts with API tokens scoped through the same RBAC; optional on-behalf-of actor — via IdP token exchange or a declared actor field the service account is explicitly trusted to assert; risky verbs (send, delete) configurable to require an actor. Audit records both principals.
- **Audit log**: append-only, per-record hash chaining for tamper evidence. Scope: all state changes (with before→after) and all content egress (view, download, send). Metadata browsing not logged. System-generated mirror reads are not user-facing audit events. Filterable UI + CSV/JSON export; retention configurable, default indefinite.
- **API surface**: API-first — the web UI is a client of the same documented REST API offered to integrators. Outbound webhooks (signed, retried, delivery-visible) for: version released, deployment completed/failed, drift captured, approval requested. No message broker in v1.
- **Operator surface**: minimal machine-scoped shop-floor web UI (tablet/kiosk): Released programs for my machines, one-tap send, request check-in of my edit, sync status. No file trees or version graphs.
- **Multi-gateway**: supported from v1; machine identity is (gateway, machineID); machine registry syncs from each gateway's config APIs; basic gateway health monitoring. No gateway HA/failover.
- **Gateway protocol constraints honored**: no overwrite on send (delete-first is mandatory), no push events (all detection is poll-based), Fanuc program name normalization on listing (O-number zero-stripping) must be handled in name mapping, edit-locking via the gateway is available only for Fanuc/Mitsubishi O8000–9999 ranges and is treated as an optional hardening extra, not a relied-upon control.

## Testing Decisions

- **What makes a good test here**: drive the system exclusively through its public REST API and assert on externally observable outcomes — API reads, webhook deliveries, audit-log entries, and the state of the (fake) gateway's file stores. Never assert on internal service calls, queue contents, or database rows; the product's own definition of done (deployment recorded only after readback-verify) is the assertion surface.
- **Seams** (user-confirmed): exactly one new seam — a **Fake Gateway**, an in-test HTTP server implementing the documented Bivrost protocol surface DNC Pro consumes (auth/login, program list, receive/send/delete file, current program, machine config). It exposes scriptable per-machine virtual file stores, fault injection (mid-send failure, error codes for file-exists/in-use/write-protected/not-found, offline machines), latency shaping, and vendor-quirk profiles (Fanuc name-in-content and list normalization, models without subdirectory listing). The protocol docs in this repository are the contract the fake is built from.
- **The driver seam is not new**: DNC Pro's REST API + webhooks exist by definition (API-first decision). Postgres runs real (containerized) in tests — the database is not a seam.
- **Key scenarios that must be covered at this seam**: transactional deploy happy path and every failure leg (fail after delete → restore attempted; readback mismatch → deployment not recorded, pair flagged); drift capture from a scripted machine-side edit including diff and disposition both ways; trial deployment lifecycle including the regulated-cell disable; RBAC scope denials; on-behalf-of attribution appearing in audit; egress logging on download/send; hash-chain verification detecting a tampered audit record; multi-gateway machineID disambiguation; mirror preemption (a user send interrupting a sweep) expressed as observable ordering on the fake gateway.
- **Real-gateway confidence**: a manual/staging acceptance pass against an actual Bivrost gateway using its built-in mock machine facility (127.0.0.X mock CNCs) — explicitly outside CI.
- **Prior art**: none in this repository (docs only); the Fake Gateway is the founding test asset of the new codebase and should be treated as a maintained deliverable, versioned against the protocol docs' changelog.

## Out of Scope

- Drip-feed and any direct serial (RS-232) machine support — DNC Pro is gateway-only; legacy coverage rides the gateway's own options (wireless transfer box, gateway file server, FTP/shared-folder modes).
- Cloud/multi-site layer, SaaS hosting, cross-site replication.
- Custom RBAC role builder (fixed roles only in v1).
- Templating/parameterized program generation (deploy transforms are a fixed declarative menu).
- Gateway HA/failover and machine reassignment between gateways.
- MQTT/event-bus integration surface (webhooks only in v1).
- Windows/WSL2/Docker Desktop host support and turnkey appliance images (Linux hosts only).
- Auto-revert as a default drift response (at most a future opt-in per-cell policy; not in v1).
- CAM system integration, tool data management, and MES features themselves (DNC Pro exposes the API/webhooks; the integrations are others' work).

## Further Notes

- Two decisions were made **against the recommendation, knowingly**, and should not be re-litigated without new evidence: (1) continuous rolling full-content mirror instead of tiered polling — accepted costs: fleet-size-dependent detection latency and daytime link contention, mitigated by preemption and "last verified" visibility; (2) docker-compose on Linux-only hosts instead of a Windows-first native install — accepted cost: friction with Windows-centric factory IT, mitigated by stating the Linux-VM prerequisite up front.
- The word "Released" must stay meaningful: no feature may send unreleased content to a machine except the flagged trial-deployment path.
- The audit log's value depends on individual accounts; anything that pushes shops toward shared logins (e.g. over-strict approval defaults) undermines the product's core promise — this is why approval rigor is a policy knob, not a constant.
- Positioning note: the name "DNC" invites drip-feed expectations; marketing/onboarding material must be explicit that v1 is gateway-connected file management, not serial streaming.
- The gateway protocol changelog in this docs site should be watched: if the gateway ever adds push events for file changes or an overwrite-capable send, the mirror cadence and transfer pipeline should be revisited — both were shaped by those two absences.
