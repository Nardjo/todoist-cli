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
  projectId?: string;
  name?: string;
  order?: string;
}

export const sectionsResource = new Command("sections").description("Manage Todoist sections");

sectionsResource
  .command("list")
  .description("List sections (optionally filtered by project)")
  .option("--project-id <id>", "Filter by project ID")
  .option("--limit <n>", "Max results")
  .option("--cursor <c>", "Pagination cursor")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.projectId) params.project_id = opts.projectId;
      if (opts.limit) params.limit = opts.limit;
      if (opts.cursor) params.cursor = opts.cursor;
      const data = await client.get("/sections", params);
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

sectionsResource
  .command("get")
  .description("Get a section by ID")
  .argument("<id>", "Section ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.get(`/sections/${id}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

sectionsResource
  .command("create")
  .description("Create a section in a project")
  .requiredOption("--name <name>", "Section name")
  .requiredOption("--project-id <id>", "Parent project ID")
  .option("--order <n>", "Order within the project")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const body: Record<string, unknown> = { name: opts.name, project_id: opts.projectId };
      if (opts.order) body.order = Number(opts.order);
      const data = await client.post("/sections", body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

sectionsResource
  .command("update")
  .description("Rename a section")
  .argument("<id>", "Section ID")
  .requiredOption("--name <name>", "New name")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/sections/${id}`, { name: opts.name });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

sectionsResource
  .command("delete")
  .description("Delete a section")
  .argument("<id>", "Section ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      await client.delete(`/sections/${id}`);
      output({ deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
