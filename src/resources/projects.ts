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
  name?: string;
  parentId?: string;
  color?: string;
  isFavorite?: boolean;
  viewStyle?: string;
  description?: string;
}

export const projectsResource = new Command("projects").description("Manage Todoist projects");

projectsResource
  .command("list")
  .description("List all projects")
  .option("--limit <n>", "Max results (default 50)")
  .option("--cursor <c>", "Pagination cursor")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.limit) params.limit = opts.limit;
      if (opts.cursor) params.cursor = opts.cursor;
      const data = await client.get("/projects", params);
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

projectsResource
  .command("get")
  .description("Get a project by ID")
  .argument("<id>", "Project ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.get(`/projects/${id}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

projectsResource
  .command("create")
  .description("Create a new project")
  .requiredOption("--name <name>", "Project name")
  .option("--description <text>", "Description")
  .option("--parent-id <id>", "Parent project ID")
  .option("--color <name>", "Color name (e.g. 'berry_red', 'blue')")
  .option("--is-favorite", "Mark as favorite")
  .option("--view-style <style>", "'list' or 'board'")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const body: Record<string, unknown> = { name: opts.name };
      if (opts.description) body.description = opts.description;
      if (opts.parentId) body.parent_id = opts.parentId;
      if (opts.color) body.color = opts.color;
      if (opts.isFavorite) body.is_favorite = true;
      if (opts.viewStyle) body.view_style = opts.viewStyle;
      const data = await client.post("/projects", body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

projectsResource
  .command("update")
  .description("Update a project")
  .argument("<id>", "Project ID")
  .option("--name <name>", "New name")
  .option("--description <text>", "Description")
  .option("--color <name>", "Color name")
  .option("--is-favorite", "Mark as favorite")
  .option("--view-style <style>", "'list' or 'board'")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.name) body.name = opts.name;
      if (opts.description !== undefined) body.description = opts.description;
      if (opts.color) body.color = opts.color;
      if (opts.isFavorite) body.is_favorite = true;
      if (opts.viewStyle) body.view_style = opts.viewStyle;
      const data = await client.post(`/projects/${id}`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

projectsResource
  .command("archive")
  .description("Archive a project")
  .argument("<id>", "Project ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/projects/${id}/archive`);
      output(data ?? { archived: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

projectsResource
  .command("unarchive")
  .description("Unarchive a project")
  .argument("<id>", "Project ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/projects/${id}/unarchive`);
      output(data ?? { unarchived: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

projectsResource
  .command("delete")
  .description("Delete a project")
  .argument("<id>", "Project ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      await client.delete(`/projects/${id}`);
      output({ deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

projectsResource
  .command("collaborators")
  .description("List collaborators of a project")
  .argument("<id>", "Project ID")
  .option("--limit <n>", "Max results")
  .option("--cursor <c>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (id: string, opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.limit) params.limit = opts.limit;
      if (opts.cursor) params.cursor = opts.cursor;
      const data = await client.get(`/projects/${id}/collaborators`, params);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
