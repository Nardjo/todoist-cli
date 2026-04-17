import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  syncToken?: string;
  resourceTypes?: string;
  commands?: string;
  limit?: string;
  cursor?: string;
  objectType?: string;
  objectId?: string;
  eventType?: string;
  parentProjectId?: string;
  parentItemId?: string;
  initiatorId?: string;
}

export const syncResource = new Command("sync").description("Sync API + activity log");

syncResource
  .command("sync")
  .description("Incremental sync (returns diff since sync_token)")
  .option("--sync-token <t>", "Sync token ('*' for full sync)", "*")
  .option("--resource-types <csv>", "Resource types to fetch (e.g. 'projects,items,labels')")
  .option("--commands <json>", "JSON array of write commands to apply")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const body: Record<string, unknown> = { sync_token: opts.syncToken ?? "*" };
      if (opts.resourceTypes) {
        body.resource_types = opts.resourceTypes.split(",").map((s) => s.trim());
      } else {
        body.resource_types = ["all"];
      }
      if (opts.commands) {
        try {
          body.commands = JSON.parse(opts.commands);
        } catch {
          throw new Error("--commands must be valid JSON array");
        }
      }
      const data = await client.post("/sync", body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

syncResource
  .command("activity")
  .description("Fetch the account activity log")
  .option("--object-type <t>", "Filter by object type (item, project, note, ...)")
  .option("--object-id <id>", "Filter by object ID")
  .option("--event-type <t>", "Filter by event type (added, updated, deleted, completed, ...)")
  .option("--parent-project-id <id>", "Filter by parent project")
  .option("--parent-item-id <id>", "Filter by parent item (task)")
  .option("--initiator-id <id>", "Filter by initiator user ID")
  .option("--limit <n>", "Max results (default 30, max 100)")
  .option("--cursor <c>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.objectType) params.object_type = opts.objectType;
      if (opts.objectId) params.object_id = opts.objectId;
      if (opts.eventType) params.event_type = opts.eventType;
      if (opts.parentProjectId) params.parent_project_id = opts.parentProjectId;
      if (opts.parentItemId) params.parent_item_id = opts.parentItemId;
      if (opts.initiatorId) params.initiator_id = opts.initiatorId;
      if (opts.limit) params.limit = opts.limit;
      if (opts.cursor) params.cursor = opts.cursor;
      const data = await client.get("/activities", params);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

syncResource
  .command("completed")
  .description("Get completed tasks")
  .option("--project-id <id>", "Filter by project")
  .option("--limit <n>", "Max results (default 30)")
  .option("--cursor <c>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts & { projectId?: string }) => {
    try {
      const params: Record<string, string> = {};
      if (opts.projectId) params.project_id = opts.projectId;
      if (opts.limit) params.limit = opts.limit;
      if (opts.cursor) params.cursor = opts.cursor;
      const data = await client.get("/tasks/completed/by_completion_date", params);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
