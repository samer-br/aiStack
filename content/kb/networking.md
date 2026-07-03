# Networking

Every Nimbus project gets a private network that connects its services and
databases without traversing the public internet.

## Private networks

Services in the same project can reach each other over their internal
hostname, `<service>.internal`, on any port the service exposes. Traffic
between services in the same private network is not encrypted at the
platform layer because it never leaves Nimbus's internal fabric, but services
handling regulated data should still terminate TLS themselves.

## Public ingress

Public traffic reaches services through Nimbus's edge load balancer, which
terminates TLS using a managed certificate for `*.nimbus.app` or a custom
domain. Custom domains require a `CNAME` record pointing at
`edge.nimbus.app` and are verified automatically within a few minutes of the
DNS record propagating.

## Custom domains

Attach a custom domain with `nimbus domains add example.com --project my-app`.
Nimbus provisions and renews the TLS certificate automatically via ACME and
renews it 30 days before expiry. Domains can be scoped to a specific
environment, so `staging.example.com` can point at the staging environment
while `example.com` points at production.

## Firewall rules

Inbound traffic to a service's public endpoint can be restricted by IP
allowlist or by requiring a shared-secret header, which is useful for
webhooks. Outbound traffic is unrestricted by default; egress firewall rules
are available on the Business plan and above for compliance-sensitive
workloads.
