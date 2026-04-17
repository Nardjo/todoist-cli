import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  limit?: string;
  cursor?: string;
  taskId?: string;
  projectId?: string;
  content?: string;
  attachment?: string;
}

export const commentsResource = new Command("comments").description("Manage Todoist comments");

commentsResource
  .command("list")
  .description("List comments for a task or project")
  .option("--task-id <id>", "Filter by task ID")
  .option("--project-id <id>", "Filter by project ID")
  .option("--limit <n>", "Max results")
  .option("--cursor <c>", "Pagination cursor")
  .option("--fields <cols>", "Columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.taskId) params.task_id = opts.taskId;
      if (opts.projectId) params.project_id = opts.projectId;
      if (opts.limit) params.limit = opts.limit;
      if (opts.cursor) params.cursor = opts.cursor;
      const data = await client.get("/comments", params);
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

commentsResource
  .command("get")
  .description("Get a comment by ID")
  .argument("<id>", "Comment ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.get(`/comments/${id}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

commentsResource
  .command("create")
  .description("Add a comment to a task or project")
  .requiredOption("--content <text>", "Comment content")
  .option("--task-id <id>", "Target task ID (one of --task-id or --project-id required)")
  .option("--project-id <id>", "Target project ID")
  .option("--attachment <json>", "Raw JSON for the attachment object")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const body: Record<string, unknown> = { content: opts.content };
      if (opts.taskId) body.task_id = opts.taskId;
      if (opts.projectId) body.project_id = opts.projectId;
      if (opts.attachment) {
        try {
          body.attachment = JSON.parse(opts.attachment);
        } catch {
          throw new Error("--attachment must be valid JSON");
        }
      }
      const data = await client.post("/comments", body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

commentsResource
  .command("update")
  .description("Update a comment")
  .argument("<id>", "Comment ID")
  .requiredOption("--content <text>", "New content")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/comments/${id}`, { content: opts.content });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

commentsResource
  .command("delete")
  .description("Delete a comment")
  .argument("<id>", "Comment ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      await client.delete(`/comments/${id}`);
      output({ deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
