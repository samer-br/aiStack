# API Reference

The Nimbus HTTP API is available at `https://api.nimbus.app/v1` and is used by
both the CLI and the web console.

## Authentication

All requests require a bearer token in the `Authorization` header. Personal
access tokens are created in the console under Account Settings and can be
scoped to read-only or read-write access. Tokens do not expire unless a
lifetime is set explicitly at creation time; there is no automatic rotation.

## Rate limits

The API allows 300 requests per minute per token for read endpoints and 60
requests per minute per token for write endpoints such as deploys and secret
updates. Exceeding the limit returns `429 Too Many Requests` with a
`Retry-After` header. Rate limits are enforced per token, not per
organization, so separate CI and human tokens do not share a limit.

## Pagination

List endpoints return up to 100 items per page and accept a `cursor` query
parameter from the `next_cursor` field of the previous response. There is no
offset-based pagination; cursors must be used in order and are not stable
across more than 24 hours.

## Webhooks

Projects can register a webhook URL that receives events for deploys,
rollbacks, and domain verification. Webhook payloads are signed with an
HMAC-SHA256 signature in the `X-Nimbus-Signature` header, computed over the
raw request body using the webhook's signing secret, and consumers should
reject any request whose signature does not match.

## Errors

Errors are returned as JSON with a `code`, `message`, and optional `details`
object. Client errors use 4xx status codes and are safe to display to end
users; 5xx errors indicate a platform issue and should be retried with
exponential backoff.
