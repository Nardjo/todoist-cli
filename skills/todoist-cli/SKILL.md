---
name: todoist-cli
description: "Manage Todoist via CLI — tasks, projects, sections, labels, comments, user, sync. Use when the user mentions 'todoist', 'todo', 'task', 'add a task', 'close task', 'Todoist project', 'Todoist label', or wants to read/write Todoist data."
category: productivity
---

# todoist-cli

A CLI wrapper around the Todoist API v1. Exposes tasks, projects, sections, labels, comments, user info, incremental sync, activity log, and completed tasks.

## When To Use This Skill

- Add, update, close, reopen, move, or delete tasks
- Create or manage Todoist projects (list, create, archive, delete, collaborators)
- Organize tasks into sections or with labels
- Read or write comments on tasks and projects
- Quick-add a task using natural language (priority, due date, project, labels parsed inline)
- Query completed tasks or the activity log
- Inspect user info, plan limits, or run an incremental sync

## Capabilities

- **Tasks**: full CRUD plus `close`, `reopen`, `move`, `quick-add`, filter queries (`today & p1`), pagination
- **Projects**: CRUD, `archive`/`unarchive`, list collaborators
- **Sections**: CRUD scoped to a project
- **Labels**: personal labels CRUD plus shared-label rename/remove across tasks
- **Comments**: CRUD, attachable to a task or a project
- **User**: account info and plan/feature limits
- **Sync**: incremental `/sync`, `activity` log, `completed` tasks by completion date

## Common Use Cases

- "Add a task 'Ship the release' for tomorrow at 9am with priority 1"
- "List all tasks in project Inbox"
- "Close task 1234567890"
- "Move task 123 into section 456"
- "Create a Todoist project called 'Q2 roadmap'"
- "Show my completed tasks this week"
- "Rename the shared label `urgent` to `critical`"

## Setup

If `todoist-cli` is not found, build and link it:
```bash
bun --version || curl -fsSL https://bun.sh/install | bash
npx api2cli bundle todoist
npx api2cli link todoist
```

`api2cli link` adds `~/.local/bin` to PATH automatically.

Always use `--json` when calling commands programmatically.

## Authentication

```bash
todoist-cli auth set "<API_TOKEN>"   # token from https://todoist.com/app/settings/integrations/developer
todoist-cli auth test
todoist-cli auth show
todoist-cli auth remove
```

Token stored in `~/.config/tokens/todoist-cli.txt` (chmod 600).

## Working Rules

- Always pass `--json` for agent-driven calls so downstream steps can parse the envelope.
- When flags are unclear, call `todoist-cli <resource> <action> --help` rather than guessing.
- Prefer `tasks quick-add --text "..."` for freeform user input — it parses dates, priority (`p1`–`p4`), projects (`#Name`), labels (`@name`) inline.
- Todoist API priority is **inverted** vs user intuition: API `4` = urgent (red), API `1` = normal. When a user says "p1", translate to API priority `4`.
- Listing endpoints are cursor-paginated: `{ results, next_cursor }` — pass `--cursor` from the previous response to continue.

## Resources

### `tasks`
| Action | Purpose |
|---|---|
| `list` | List active tasks. Flags: `--limit`, `--cursor`, `--project-id`, `--section-id`, `--parent-id`, `--label`, `--filter`, `--lang`, `--ids`, `--fields`, `--json` |
| `get <id>` | Get one task |
| `create` | Create. Flags: `--content` (req), `--description`, `--project-id`, `--section-id`, `--parent-id`, `--order`, `--labels`, `--priority`, `--due-string`, `--due-date`, `--due-datetime`, `--due-lang`, `--assignee-id`, `--duration`, `--duration-unit`, `--deadline-date`, `--auto-reminder`, `--json` |
| `quick-add` | Natural-language create. Flags: `--text` (req), `--note`, `--reminder`, `--auto-reminder`, `--json` |
| `update <id>` | Same shape as create (minus `--project-id`/`--section-id`) |
| `close <id>` | Mark complete |
| `reopen <id>` | Reopen |
| `move <id>` | Flags: `--project-id`, `--section-id`, `--parent-id` |
| `delete <id>` | Delete |

### `projects`
| Action | Purpose |
|---|---|
| `list` | Flags: `--limit`, `--cursor`, `--fields`, `--json` |
| `get <id>` | Get one project |
| `create` | Flags: `--name` (req), `--description`, `--parent-id`, `--color`, `--is-favorite`, `--view-style` |
| `update <id>` | Same flags as create |
| `archive <id>` / `unarchive <id>` | Toggle archive |
| `delete <id>` | Delete |
| `collaborators <id>` | List collaborators; paginated |

### `sections`
| Action | Purpose |
|---|---|
| `list` | Flags: `--project-id`, `--limit`, `--cursor` |
| `get <id>` / `delete <id>` | Self-explanatory |
| `create` | Flags: `--name` (req), `--project-id` (req), `--order` |
| `update <id>` | Flag: `--name` (req) |

### `labels`
| Action | Purpose |
|---|---|
| `list` / `get <id>` / `delete <id>` | Personal labels |
| `create` | Flags: `--name` (req), `--order`, `--color`, `--is-favorite` |
| `update <id>` | Same as create |
| `shared-list` | Labels used on tasks but not in personal labels |
| `shared-rename` | Flags: `--name` (req), `--new-name` (req) |
| `shared-remove` | Flag: `--name` (req) |

### `comments`
| Action | Purpose |
|---|---|
| `list` | Flags: `--task-id` or `--project-id`, `--limit`, `--cursor` |
| `get <id>` / `delete <id>` | Self-explanatory |
| `create` | Flags: `--content` (req), `--task-id` or `--project-id`, `--attachment` (JSON) |
| `update <id>` | Flag: `--content` (req) |

### `user`
| Action | Purpose |
|---|---|
| `get` | Authenticated user info |
| `plan` | Plan + feature limits |

### `sync`
| Action | Purpose |
|---|---|
| `sync` | Incremental sync. Flags: `--sync-token` (default `*`), `--resource-types`, `--commands` (JSON array) |
| `activity` | Activity log. Flags: `--object-type`, `--object-id`, `--event-type`, `--parent-project-id`, `--parent-item-id`, `--initiator-id`, `--limit`, `--cursor` |
| `completed` | Completed tasks by completion date. Flags: `--project-id`, `--limit`, `--cursor` |

## Output Format

`--json` returns a standardized envelope:
```json
{ "ok": true, "data": { "results": [...], "next_cursor": "..." }, "meta": { "total": 42 } }
```

On error: `{ "ok": false, "error": { "message": "...", "status": 401 } }`

## Quick Reference

```bash
todoist-cli --help
todoist-cli <resource> --help
todoist-cli <resource> <action> --help
```

## Global Flags

`--json`, `--format <text|json|csv|yaml>`, `--verbose`, `--no-color`, `--no-header`

Exit codes: `0` success, `1` API error, `2` usage error.
