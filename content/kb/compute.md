# Compute

Nimbus compute runs containerized services on a shared scheduler. You describe
what you need declaratively and the platform handles placement, restarts, and
scaling.

## Instance sizes

| Size    | vCPU | Memory | Typical use               |
|---------|------|--------|---------------------------|
| micro   | 0.25 | 256 MB | cron jobs, low-traffic APIs |
| small   | 0.5  | 512 MB | small web apps             |
| medium  | 1    | 2 GB   | most production services   |
| large   | 2    | 4 GB   | background workers          |
| xlarge  | 4    | 8 GB   | batch processing, ML inference |

Instance size is set per service in `nimbus.yaml` under `resources.size` and can
be changed without downtime; Nimbus performs a rolling replacement.

## Autoscaling

Services scale horizontally based on CPU utilization, request concurrency, or a
custom metric pushed via the metrics API. A typical policy scales between 1 and
10 replicas, targeting 70% CPU utilization, with a 60-second cooldown between
scale-up events to avoid thrashing. Scale-to-zero is available for preview and
staging environments to reduce idle cost; production services always keep at
least one warm replica.

## Deployments and rollbacks

Deployments are immutable: each deploy produces a new revision, and traffic is
shifted to the new revision only after its health check passes. If a health
check fails within the first five minutes, Nimbus automatically rolls back to
the previous healthy revision and raises an alert. Manual rollbacks are
available via `nimbus rollback --project my-app --revision <id>`.

## Health checks

By default Nimbus probes `GET /healthz` every 10 seconds with a 5-second
timeout. A service is considered unhealthy after three consecutive failures.
The path, interval, and failure threshold are all configurable per service.
