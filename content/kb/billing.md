# Billing

## Plans

- **Free**: 750 compute hours/month, 5 GB storage, community support.
- **Team**: usage-based compute and storage billed per second, plus $20/month
  per seat for collaboration features and 90-day audit log retention.
- **Business**: adds egress firewall rules, priority support, and a 99.95%
  uptime SLA.
- **Enterprise**: adds SSO, customer-managed encryption keys, and a dedicated
  support channel with a custom SLA.

## Usage-based pricing

Compute is billed per second at each instance size's hourly rate divided by
3600, so a `medium` service running for exactly one hour costs the same as
the listed hourly rate regardless of when during the month it ran. Storage is
billed on average daily usage, not peak usage, which means short-lived spikes
in stored data do not disproportionately affect the bill.

## Invoicing

Invoices are generated on the first day of each month for the prior month's
usage and are due within 15 days. Organizations can set a spending alert that
sends an email and a webhook notification when projected monthly spend
crosses a configured threshold. Nimbus does not suspend services for
exceeding a spending alert threshold; alerts are informational only.

## Refunds and credits

Promotional credits are applied automatically to the oldest outstanding
invoice and expire 12 months after being granted unless stated otherwise.
Nimbus does not offer cash refunds for unused credits but will prorate
mid-cycle downgrades from Team or Business plans.
