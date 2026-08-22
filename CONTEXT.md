# Domain glossary

## User

An individual identity that can authenticate to Learnspace. A user exists independently of any organization and may belong to multiple organizations.

## Platform administrator

A user trusted to operate Learnspace globally, including managing users and organizations. Platform authority is not inherited from an organization role.

## Organization

A tenant representing a school, company, institution, or other customer workspace. Organization-owned LMS data must never be visible to another organization.

## Membership

The relationship granting a user access to one organization. A membership has exactly one organization role. Removing a membership does not delete the user.

## Organization owner

A member accountable for an organization. Every active organization must retain at least one owner.

## Organization administrator

A member allowed to manage an organization's settings, members, teams, and invitations, but not platform-wide resources.

## Organization member

A member with ordinary workspace access. Instructor and learner responsibilities belong to LMS enrollment and teaching assignments, not tenant administration roles.

## Team

A grouping of organization members. A team never grants access to users who are not already members of its organization.

## Invitation

A time-limited offer to create a membership in one organization. Invitations may be pending, accepted, expired, rejected, or canceled.

## Suspension

A reversible organization state that prevents ordinary organization access while preserving data and allowing platform administrators to investigate or reactivate it.

## Archival

A terminal, read-only organization state preceding retention-based deletion. Archived organizations cannot receive new activity.

## Audit event

An append-only record of a security-relevant action, its actor, target, time, and safe summary. Audit events never contain credentials, tokens, MFA secrets, or full sensitive records.
