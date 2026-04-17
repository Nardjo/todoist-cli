# todoist-cli

Agent-ready CLI for the [Todoist API v1](https://developer.todoist.com/api/v1/). Generated with [api2cli.dev](https://api2cli.dev).

Covers tasks, projects, sections, labels, comments, user info, incremental sync, activity log, and completed tasks — with a JSON envelope (`{ ok, data, meta }`), cursor pagination, retries, and an AgentSkill ready to drop into Claude Code / Cursor / Codex.

## Install

```bash
npx api2cli install Nardjo/todoist-cli
```

Clones the repo, builds the CLI, links it to your PATH, and installs the AgentSkill.

### AgentSkill only

```bash
npx skills add Nardjo/todoist-cli
```

## Quickstart

```bash
todoist-cli auth set "<API_TOKEN>"        # from https://todoist.com/app/settings/integrations/developer
todoist-cli user get --json
todoist-cli projects list --json
todoist-cli tasks quick-add --text "Buy milk tomorrow #Groceries p1 @errand" --json
```

## Resources

| Resource | Actions |
|---|---|
| `tasks` | list, get, create, quick-add, update, close, reopen, move, delete |
| `projects` | list, get, create, update, archive, unarchive, delete, collaborators |
| `sections` | list, get, create, update, delete |
| `labels` | list, get, create, update, delete, shared-list, shared-rename, shared-remove |
| `comments` | list, get, create, update, delete |
| `user` | get, plan |
| `sync` | sync (incremental), activity (log), completed (by date) |
| `auth` | set, show, remove, test |

Run `todoist-cli --help`, `todoist-cli <resource> --help`, or `todoist-cli <resource> <action> --help` for full flags.

## Global flags

`--json`, `--format <text|json|csv|yaml>`, `--verbose`, `--no-color`, `--no-header`

Exit codes: `0` success, `1` API error, `2` usage error.

## Notes

- Todoist API **inverts priority**: API `4` = urgent (red), API `1` = normal.
- List endpoints are cursor-paginated: pass `--cursor <next_cursor>` to continue.
- `tasks quick-add` uses the native Todoist parser (`#Project`, `@label`, `p1`–`p4`, inline dates).

## License

MIT
