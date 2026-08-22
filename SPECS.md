# Learnspace platform administration specification

## 1. Purpose

Learnspace is a multi-tenant learning management system. The platform administration area controls global users and organization tenants. Organization administration controls only resources inside one tenant. This specification defines the security model, lifecycle rules, management experience, and implementation sequence for both areas.

## 2. Product assumptions

- An organization is a tenant such as a school, company, or institution.
- A user may belong to multiple organizations.
- A user identity exists independently of organization membership.
- Platform roles and organization roles are separate sources of authority.
- Courses, teaching assignments, and enrollments will be organization-owned LMS resources.
- Better Auth remains the authentication and workspace infrastructure.

## 3. Roles

### Platform roles

| Role | Meaning |
| --- | --- |
| `admin` | Platform administrator with global user and organization capabilities |
| `user` | Normal authenticated user with no platform administration authority |

The stored value `admin` is retained for Better Auth compatibility. The product label is **Platform administrator**.

### Organization roles

| Role | Meaning |
| --- | --- |
| `owner` | Full tenant authority and ownership transfer responsibility |
| `admin` | Tenant settings, member, team, and invitation management |
| `member` | Ordinary tenant access |

Instructor and learner are LMS responsibilities, not tenant administration roles. They should be represented later by course teaching assignments and enrollments.

## 4. Capability model

Callers authorize named capabilities rather than comparing role strings. Initial platform capabilities are:

- `platform.dashboard.read`
- `platform.users.read`
- `platform.users.manage`
- `platform.users.impersonate`
- `platform.organizations.read`
- `platform.organizations.manage`
- `platform.audit.read`

Initial organization capabilities are:

- `organization.read`
- `organization.settings.manage`
- `organization.members.manage`
- `organization.teams.manage`
- `organization.invitations.manage`

Every Server Action is treated as a directly reachable mutation endpoint. It must authenticate, authorize the capability against the target resource, validate untrusted input, perform the mutation, and return only a minimal UI result.

## 5. Core invariants

1. A user cannot ban, delete, demote, or impersonate themselves.
2. The final platform administrator cannot be banned, deleted, or demoted.
3. An organization cannot lose its final owner.
4. A team member must first be a member of the same organization.
5. Ordinary users may access only active organizations in which they hold a membership.
6. Suspended organizations preserve their data but reject ordinary access and new invitations.
7. Archived organizations are read-only and cannot receive new activity.
8. Organization deletion requires prior archival and explicit slug confirmation.
9. Sensitive mutations create an append-only audit event.
10. Authorization is checked in the server-side module executing the operation, never only in UI rendering.

## 6. User management

### Directory

The user directory supports search, pagination, platform-role filters, account-status filters, and clear verification/MFA state. Rows should eventually include organization count, active session count, last activity, and registration date.

### User detail

The detail view contains Overview, Organizations, Sessions, Security, and Activity. Supported operations include platform-role changes, temporary or permanent bans, unban, session revocation, membership inspection, impersonation with a reason, and safe account removal.

Destructive user operations require confirmation. Impersonation and future MFA reset operations should require recent re-authentication before production use.

## 7. Organization management

### Directory

The organization directory supports search, pagination, lifecycle-status filters, and counts for members, teams, and pending invitations.

### Organization detail

The detail view contains Overview, Members, Teams, Invitations, Activity, and Danger zone. It supports editing identity, lifecycle changes, ownership-safe role changes, member removal, team management, invitation resend/cancel, and deletion after archival.

### Lifecycle

```text
active <-> suspended
   |
   v
archived -> deleted
```

- `active`: normal tenant operation.
- `suspended`: reversible access block with a required reason.
- `archived`: read-only state with a required reason.
- `deleted`: irreversible removal after explicit confirmation and retention checks.

## 8. Audit requirements

Audit events contain actor, action, target type, target ID, timestamp, and safe metadata. Future hardening adds request/correlation ID, organization ID, reason, severity, IP address, user agent, and safe before/after summaries.

Audit metadata must never contain passwords, password hashes, access or refresh tokens, session tokens, MFA secrets, backup codes, or complete exported datasets.

## 9. Module design

Authorization is a deep module with a small interface:

```ts
platformRoleAllows(role, capability)
organizationRoleAllows({ platformRole, organizationRole, status }, capability)
requirePlatformCapability(capability)
```

Server Actions remain adapters from `FormData` to typed operations. Database access modules authenticate and authorize reads, then return minimal serializable DTOs.

As behavior grows, split platform administration by capability under `src/modules/platform-admin/{users,organizations,memberships,audit}` instead of continuing to enlarge one action file.

## 10. Delivery phases

### Phase 1 — authorization foundation

- Typed platform roles, organization roles, statuses, and capabilities
- Central platform and organization authorization policies
- Capability enforcement in existing admin reads and mutations
- Active-only organization switching and invitation acceptance
- Policy unit tests

### Phase 2 — operational safety

- Recent re-authentication for destructive actions
- Mandatory reason for impersonation and sensitive changes
- Structured audit context and correlation IDs
- Organization-wide session invalidation on suspension
- Expired invitation normalization

### Phase 3 — management experience

- User and organization summary metrics
- Audit directory with filters
- Bulk selection with preview and confirmation
- Ownership-transfer workflow
- Member and invitation lifecycle improvements

### Phase 4 — LMS administration

- Organization-owned courses
- Instructor assignments
- Learner enrollments and cohorts
- Completion and activity reporting
- LMS-specific capabilities layered on the same authorization seam

## 11. Acceptance criteria

- All platform routes and mutations reject non-platform administrators server-side.
- Ordinary users cannot activate suspended or archived organizations.
- Invitations cannot be accepted into non-active organizations.
- The final platform administrator and final organization owner are protected.
- Cross-organization member and team mutations are rejected.
- Every successful sensitive mutation writes an audit event.
- Policy behavior has deterministic unit tests.
- Type checking, tests, linting for changed files, and the production build pass.
