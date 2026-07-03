# CLI Reference

The `nimbus-cli` tool wraps the same API the web console uses, so anything you
can do in the console can be scripted.

## Installation

```
curl -fsSL https://get.nimbus.app | sh
nimbus login
```

The CLI stores an access token in `~/.nimbus/credentials` with `0600`
permissions. Running `nimbus login` in a CI environment supports a
non-interactive mode via `nimbus login --token $NIMBUS_TOKEN`.

## Common commands

- `nimbus projects list` — list projects in the current organization.
- `nimbus deploy --project <name>` — deploy the current directory or a
  specified image.
- `nimbus logs --project <name> --env production --follow` — stream logs.
- `nimbus secrets set KEY=value --project <name> --env production` — set an
  encrypted environment variable.
- `nimbus rollback --project <name> --revision <id>` — roll back to a prior
  revision.
- `nimbus domains add <domain> --project <name>` — attach a custom domain.

## Configuration file

Each project can include a `nimbus.yaml` at its root describing build
settings, resource size, health check path, and scaling policy. Values in
`nimbus.yaml` are the defaults for new deployments; flags passed to
`nimbus deploy` override them for a single deployment without modifying the
file.

## Exit codes

The CLI returns `0` on success, `1` for a user error such as a missing
project, and `2` for a transient platform error, which is safe to retry with
backoff in automation.
