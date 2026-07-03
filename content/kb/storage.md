# Storage

Nimbus Storage provides S3-compatible object storage buckets that can be
attached to any project.

## Buckets

Create a bucket with `nimbus storage create-bucket <name> --region us-east`.
Bucket names are globally unique within a Nimbus region. Buckets are private by
default; public read access must be enabled explicitly per bucket or per
object prefix.

## Lifecycle rules

Lifecycle rules automatically transition or delete objects based on age. A
common pattern is to move objects older than 30 days to the Infrequent Access
tier, and delete objects older than 365 days. Rules are defined in JSON and
applied with `nimbus storage set-lifecycle <bucket> --rules rules.json`.
Lifecycle transitions run once per day, not in real time.

## Storage classes and pricing

- **Standard**: for actively accessed data, $0.020 per GB per month.
- **Infrequent Access**: for data accessed less than once a month,
  $0.012 per GB per month, with a retrieval fee of $0.01 per GB.
- **Archive**: for compliance retention, $0.004 per GB per month, with
  retrieval taking up to 12 hours.

## Access control

Buckets support both IAM-style policies and pre-signed URLs. Pre-signed URLs
are the recommended way to grant temporary upload or download access to a
client application without exposing long-lived credentials; a signed URL
defaults to a 15-minute expiry and can be extended to a maximum of 7 days.

## Backups

Object storage is replicated synchronously across three availability zones
within a region. Cross-region replication is opt-in and configured per bucket;
replication lag is typically under 60 seconds.
