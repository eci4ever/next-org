# Institutional Directory MVP — Technical Specification

## 1. Product goal

Build a private administrative directory for one educational institution with approximately 10,000 people across 32 campuses.

The application is the source of truth for the institution's formal organizational structure and for current and historical assignments of students, lecturers, and staff. Version one is operated only by individually authenticated HQ administrators.

## 2. Version-one boundary

### Included

- Formal hierarchy: HQ → campus → department → program → class
- Academic years and terms
- Student, lecturer, and staff directory records
- Multiple simultaneous, time-bounded memberships
- Search, filtering, hierarchy browsing, rosters, and membership history
- Incremental spreadsheet imports
- Validation, duplicate detection, preview, two-person approval, and atomic application
- Approval-based reversal batches
- Personal-email notifications after separate approval
- Audited exports
- Administrator management, local authentication, email verification, password reset, and MFA
- Dashboard and standard operational reports

### Excluded

- Student, lecturer, or staff login
- Google Workspace or other institutional-system synchronization
- Admissions, grading, attendance, scheduling, billing, and learning management
- Clubs, committees, project teams, and other informal groups
- Government identity numbers
- Full-snapshot imports that deactivate omitted records
- AI-generated or AI-guessed institutional data

## 3. Existing project fit

The repository already provides:

- Next.js 16.3 App Router and React Server Components
- PostgreSQL through Neon and Drizzle ORM
- Better Auth email/password authentication
- Email verification, password recovery, two-factor authentication, sessions, and admin support
- Resend-based transactional email
- Platform audit logging
- Protected layouts and reusable administrative UI components

### Required separation of concepts

The Better Auth `user` table represents people who can sign in. In this MVP, those are HQ administrators only.

Directory people must use a separate `person` table. A student, lecturer, or staff record must not require an authentication account.

The existing Better Auth `organization`, `team`, `member`, and `team_member` tables should remain authentication/workspace infrastructure. They must not be overloaded to model campuses, departments, programs, classes, or academic memberships. The academic hierarchy has different history, integrity, privacy, and import requirements.

## 4. Roles and authorization

Store a single platform role on each administrator account:

| Role | Capabilities |
| --- | --- |
| `super_admin` | Manage administrators and settings; perform operator and approver work for documented emergencies |
| `hq_operator` | Create drafts; upload, correct, validate, and submit import batches; prepare exports and notifications |
| `hq_approver` | Approve or reject batches created by another administrator; approve reversals, exports, and notification sends |

Rules:

- No public registration.
- Every administrator has an individual account; shared accounts are prohibited.
- Email verification and MFA are mandatory before administrative access.
- An operator cannot approve their own batch.
- Normal approval requires a different active administrator.
- Emergency self-approval by a super administrator requires a reason and produces a high-severity audit event.
- Every Server Action and Route Handler performs its own authentication and authorization check.
- Authorization is enforced in a server-only data access layer, not only in layouts or UI visibility.

## 5. Domain model

Use UUID primary keys for internal identity and explicit text codes for human-facing references. Prefer PostgreSQL enums or checked text values for finite states.

### `person`

- `id` UUID/text primary key, immutable
- `reference_number` unique, immutable, institution-issued (for example `STU-000123` or `EMP-000456`)
- `full_name`
- `person_type`: `student | lecturer | staff`
- `personal_email`, nullable and private
- `status`: `active | inactive | archived`
- `created_at`, `updated_at`
- `created_by`, `updated_by`, nullable administrator references

Do not store a government identity number. Do not use name or email as identity.

### `organization_unit`

- `id` primary key
- `code` unique and immutable
- `name`
- `unit_type`: `hq | campus | department | program | class`
- `parent_id`, nullable self-reference
- `status`: `active | inactive | archived`
- `valid_from`, `valid_to`
- timestamps and actor references

Hierarchy constraints:

- Exactly one active HQ root exists.
- HQ has no parent.
- Campus parent is HQ.
- Department parent is campus.
- Program parent is department.
- Class parent is program.
- Cycles are rejected.
- A unit with active children or memberships cannot be archived until they are transferred or closed.

### `academic_period`

- `id` primary key
- `code` unique (for example `2026-T1`)
- `name`
- `academic_year`
- `term`
- `starts_on`, `ends_on`
- `status`: `planned | active | closed`

### `class_period`

Associates a class unit with an academic period.

- `id` primary key
- `class_unit_id`
- `academic_period_id`
- unique pair of class and period

### `person_membership`

- `id` primary key
- `person_id`
- `unit_id`
- `academic_period_id`, nullable except for class membership
- `is_primary` boolean
- `starts_on`, `ends_on`, where a null end means current
- `status`: `active | ended | cancelled`
- source import references
- timestamps and actor references

Multiple simultaneous memberships are allowed. Transfers end an existing membership and create another; they never rewrite history.

Integrity rules:

- A class membership requires an academic period.
- Membership dates must fit a referenced academic period when one exists.
- Duplicate overlapping memberships for the same person, unit, and period are rejected.
- At most one primary class membership per student per academic period.
- Ending or transferring a membership must not delete the original row.

### Import tables

#### `import_batch`

- `id`
- original file name, checksum, size, and storage key
- `status`: `uploaded | validating | needs_correction | ready_for_approval | approved | applying | applied | rejected | failed | reversed`
- uploader, submitter, approver, and rejection metadata
- row counts and validation summary
- created, submitted, approved, applied timestamps

#### `import_row`

- `id`, `batch_id`, sheet, and source row number
- action: `CREATE | UPDATE | TRANSFER | DEACTIVATE | REACTIVATE`
- normalized input as JSON
- resolved target references
- validation state and structured errors
- proposed before/after values

#### `import_change`

- `id`, `batch_id`, `import_row_id`
- entity type and entity ID
- operation
- immutable before/after JSON
- application timestamp

The original uploaded file and normalized rows are immutable after submission. A correction creates a new draft or a new batch revision.

### Notification tables

#### `notification_batch`

- references an applied import batch
- state: `draft | ready_for_approval | approved | sending | completed | partially_failed | cancelled`
- creator and different approver
- recipient and delivery counts

#### `notification_delivery`

- person, private destination email, template, status, provider ID, and timestamps
- error classification without copying private message contents into logs

### Export and audit tables

Extend the current audit approach with structured, append-only events. Add `export_request` containing filters, stated purpose, requester, approver when required, result location, expiry, and download events.

Audit records must capture actor, action, target, timestamp, correlation/batch ID, and a safe metadata summary. They must never include passwords, MFA secrets, session tokens, full spreadsheet contents, or personal email addresses.

## 6. Spreadsheet contract

Accept `.xlsx` only in version one. Publish a downloadable template with these sheets:

- `People`
- `Memberships`
- `Campuses`
- `Departments`
- `Programs`
- `Classes`
- `AcademicPeriods`

Every mutable row contains an explicit `Action` column. Existing records require their immutable reference/code. New records omit the generated identifier and use a within-workbook temporary key so membership rows can reference them.

Validation is deterministic. AI may later suggest column mappings for nonstandard files, but it must never invent, silently correct, or directly commit values.

Validation stages:

1. File type, size, checksum, malware scan, and workbook structure
2. Required sheets, columns, types, and allowed values
3. Duplicate rows and duplicate identifiers within the workbook
4. References to existing records or valid temporary keys
5. Hierarchy and academic-period constraints
6. Conflicts with current database state
7. Permission and separation-of-duty checks
8. Exact before/after preview generation

An invalid row blocks the entire batch. Applying a batch occurs in one database transaction with the database state rechecked after approval. If the state changed since preview, the batch returns to validation instead of applying stale decisions.

## 7. Reversal design

A reversal is a new batch generated from an applied batch's immutable `import_change` records.

- It shows the proposed inverse changes before approval.
- It requires approval by a different administrator.
- It revalidates against current state.
- It may be blocked when later changes depend on the target batch.
- It never deletes the original batch or audit trail.

## 8. Application routes

Suggested protected route structure:

```text
/dashboard
/directory/people
/directory/people/[personId]
/structure
/structure/[unitId]
/academic-periods
/imports
/imports/new
/imports/[batchId]
/imports/[batchId]/approval
/notifications
/notifications/[batchId]
/reports
/exports
/admin/administrators
/admin/audit
/admin/settings
```

Use Server Components for initial reads and minimal DTOs. Use small client components only for interactive tables, filters, dialogs, and upload progress.

Spreadsheet upload and parsing should use a Route Handler or direct object-storage upload rather than a Server Action because Server Actions are sequential on the client and have a 1 MB request-body limit by default. Mutations such as submit, approve, reject, and reverse can use Server Actions with authorization and fresh database reads inside each action.

## 9. Server architecture

Organize new server-only code by domain:

```text
src/
  features/
    directory/
    structure/
    academic-periods/
    imports/
    notifications/
    reports/
    audit/
  data/
    authz.ts
    people.ts
    structure.ts
    imports.ts
```

The data access layer must:

- import `server-only`
- authenticate and authorize every operation
- select only fields required by the caller
- return DTOs rather than raw Drizzle rows
- keep personal email out of list DTOs unless specifically authorized
- validate all untrusted values with Zod
- use database constraints in addition to application validation

Long-running parsing, validation, email sending, and large export generation should run as idempotent background jobs. Database state transitions and unique job keys must prevent double application or duplicate delivery.

## 10. Security and privacy requirements

- HTTPS only in production
- Secure, HTTP-only, SameSite cookies
- MFA required for all HQ administrators
- Rate limiting for login, password reset, upload, approval, and export endpoints
- Re-authentication for administrator management, emergency self-approval, reversal, and sensitive export
- Uploaded files private at rest, accessed through short-lived signed URLs
- Encryption at rest through the database and object-storage providers
- Personal email masked in normal views
- No government ID collection
- No secrets or private data in client props, URLs, analytics, or logs
- Content Security Policy and standard security headers
- Dependency and file-upload scanning in CI/processing
- Daily encrypted backups with periodic restore tests
- Configurable retention for uploads, generated exports, audit records, and archived people

## 11. Standard reports

- Active people by campus, department, program, class, and person type
- Current class roster by academic period
- Lecturer assignments by campus/department/program
- Inactive and archived people
- Membership changes during a date range
- Imports awaiting approval, rejected imports, and import failure rates
- Notifications sent, delivered, and failed

All filtered exports require a stated purpose and an audit event. Export files expire automatically.

## 12. Delivery plan

### Phase 0 — foundation hardening

- Disable public signup and organization self-service UI
- Normalize administrator roles to `super_admin`, `hq_operator`, and `hq_approver`
- Enforce verified email and MFA for protected administrative routes
- Add server-only authorization helpers and safe DTO conventions
- Preserve the existing authentication schema and migrate role values safely

Exit criterion: administrators can be invited, verified, enrolled in MFA, authorized, deactivated, and audited without public registration.

### Phase 1 — hierarchy and academic periods

- Add organization-unit, academic-period, and class-period schema
- Seed the single HQ root
- Build hierarchy management and browsing
- Enforce parent-type, cycle, status, and history constraints

Exit criterion: HQ can model all 32 campuses and their formal descendants without directory people.

### Phase 2 — people and memberships

- Add person and membership schema
- Generate immutable institutional reference numbers
- Build person search, detail, history, transfer, deactivate, and reactivate flows
- Add rosters and hierarchy counts

Exit criterion: HQ can manage representative student, lecturer, and staff histories manually and all changes are audited.

### Phase 3 — spreadsheet imports

- Define and publish the workbook template
- Add private object storage, upload route, parser, and validation pipeline
- Build row-level errors and exact change previews
- Implement submission, different-admin approval, atomic application, and stale-preview detection
- Add reversal generation and approval

Exit criterion: a realistic large workbook can be validated, approved, applied exactly once, and reversed safely.

### Phase 4 — notifications

- Add notification batches and delivery records
- Generate recipients only from applied changes
- Build separate preview and approval
- Send idempotently through the configured email provider
- Add retry rules and delivery reporting

Exit criterion: no import automatically sends email, and an approved notification batch cannot deliver twice.

### Phase 5 — reports, exports, and operations

- Add standard reports and filtered, expiring exports
- Complete audit viewer and operational dashboard
- Add rate limits, security headers, monitoring, backup/restore procedure, retention jobs, and runbooks
- Perform accessibility, authorization, import-volume, and recovery testing

Exit criterion: the service meets agreed security, restore, performance, and operational acceptance checks.

## 13. Test strategy

- Unit tests for role policies, hierarchy transitions, date overlap, import normalization, and reference generation
- Database integration tests for constraints, atomic import application, concurrency, stale previews, and reversals
- Authorization tests for every Server Action and Route Handler
- Property/fuzz tests for spreadsheet parsing and malformed cell values
- End-to-end tests for operator upload → approver approval → application → notification approval
- Negative tests proving self-approval, duplicate delivery, unauthorized export, and government-ID columns are rejected
- Load tests using at least 10,000 people and a conservatively larger membership set
- Backup restore drill before production launch

## 14. Acceptance criteria

The MVP is complete when:

1. Only invited, verified, MFA-enrolled HQ administrators can access it.
2. The full hierarchy for 32 campuses can be represented and changed without losing history.
3. A person can have multiple current and historical assignments.
4. Government identity numbers are neither requested nor stored.
5. Spreadsheet changes cannot reach live data without deterministic validation and approval by another administrator.
6. An approved batch is atomic, idempotent, auditable, and reversable through another approved batch.
7. Notifications require their own approval and cannot be sent twice.
8. Private fields are absent from ordinary list DTOs, logs, URLs, and unauthorized exports.
9. HQ can search, browse, report, and export the agreed directory information at the expected scale.
10. Backup restoration and administrator recovery procedures have been tested.

