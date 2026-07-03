# Getting Started with Nimbus

Nimbus is a managed platform for deploying compute workloads, object storage, and
private networking without operating your own infrastructure. This guide covers
account setup, your first deployment, and where to go next.

## Creating an account

Sign up at the Nimbus console with an email address or a linked GitHub account.
New accounts start on the Free tier, which includes 750 hours of shared-CPU
compute per month, 5 GB of object storage, and one private network. No credit
card is required until you upgrade to a paid plan.

## Your first deployment

1. Install the CLI (`nimbus-cli`) or use the web console.
2. Create a project: `nimbus projects create my-app`.
3. Deploy a service from a Git repository or a container image:
   `nimbus deploy --project my-app --image ghcr.io/acme/my-app:latest`.
4. Nimbus builds a deployment plan, provisions compute, and assigns a public
   URL under `*.nimbus.app` within about 30 seconds for small images.

## Environments

Every project has three environments by default: `production`, `staging`, and
`preview`. Preview environments are created automatically for each pull request
when the GitHub integration is enabled, and are destroyed when the PR closes.
Environment variables and secrets are scoped per environment, so a staging
database URL never leaks into production.

## Where to go next

- Read the Compute guide for instance sizing and autoscaling.
- Read the Storage guide for buckets, retention, and lifecycle rules.
- Read the Security guide for access control and audit logging.
- Read the CLI reference for the full command list.
