# Security

## Authentication and access control

Nimbus accounts support sign-in via email/password, GitHub OAuth, or SSO
(SAML) on the Enterprise plan. Within an organization, members are assigned
one of three roles: **owner**, **admin**, or **member**. Owners can manage
billing and delete the organization; admins can manage projects and
members but not billing; members can deploy and view logs for projects
they've been added to.

## Secrets management

Environment variables marked as secrets are encrypted at rest with a
per-project key and are never displayed again in the console or CLI after
creation, only their name and last-modified date. Secrets are injected into
the container environment at startup and are not written to disk or logs.
Rotating a secret triggers a rolling redeploy of any service that references
it.

## Audit logging

Every state-changing action, deploys, secret changes, role changes, and
domain changes, is recorded in the organization's audit log with the actor,
timestamp, and a diff where applicable. Audit logs are retained for 90 days
on the Team plan and 2 years on the Enterprise plan, and can be streamed to
an external SIEM via webhook.

## Compliance

Nimbus maintains SOC 2 Type II certification and completes an annual
penetration test with results available under NDA. Object storage supports
customer-managed encryption keys (CMEK) for organizations that require
control over key rotation independent of Nimbus's own key management.

## Vulnerability disclosure

Security researchers can report vulnerabilities to security@nimbus.example
and can expect an acknowledgment within 48 hours. Nimbus does not pursue
legal action against good-faith researchers who follow responsible
disclosure and avoid data destruction or service disruption.
