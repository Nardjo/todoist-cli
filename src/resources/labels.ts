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
  order?: string;
  color?: string;
  isFavorite?: boolean;
  newName?: string;
}

export const labelsResource = new Command("labels").description("Manage Todoist labels");

labelsResource
  .command("list")
  .description("List personal labels")
  .option("--limit <n>", "Max results")
  .option("--cursor <c>", "Pagination cursor")
  .option("--fields <cols>", "Columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.limit) params.limit = opts.limit;
      if (opts.cursor) params.cursor = opts.cursor;
      const data = await client.get("/labels", params);
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

labelsResource
  .command("get")
  .description("Get a label by ID")
  .argument("<id>", "Label ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.get(`/labels/${id}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

labelsResource
  .command("create")
  .description("Create a personal label")
  .requiredOption("--name <name>", "Label name")
  .option("--order <n>", "Order")
  .option("--color <name>", "Color name")
  .option("--is-favorite", "Mark as favorite")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const body: Record<string, unknown> = { name: opts.name };
      if (opts.order) body.order = Number(opts.order);
      if (opts.color) body.color = opts.color;
      if (opts.isFavorite) body.is_favorite = true;
      const data = await client.post("/labels", body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

labelsResource
  .command("update")
  .description("Update a personal label")
  .argument("<id>", "Label ID")
  .option("--name <name>", "New name")
  .option("--order <n>", "Order")
  .option("--color <name>", "Color")
  .option("--is-favorite", "Mark favorite")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.name) body.name = opts.name;
      if (opts.order) body.order = Number(opts.order);
      if (opts.color) body.color = opts.color;
      if (opts.isFavorite) body.is_favorite = true;
      const data = await client.post(`/labels/${id}`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

labelsResource
  .command("delete")
  .description("Delete a personal label")
  .argument("<id>", "Label ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      await client.delete(`/labels/${id}`);
      output({ deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

labelsResource
  .command("shared-list")
  .description("List shared labels (used on tasks but not in personal labels)")
  .option("--limit <n>", "Max results")
  .option("--cursor <c>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.limit) params.limit = opts.limit;
      if (opts.cursor) params.cursor = opts.cursor;
      const data = await client.get("/labels/shared", params);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

labelsResource
  .command("shared-rename")
  .description("Rename a shared label across all tasks")
  .requiredOption("--name <name>", "Current label name")
  .requiredOption("--new-name <name>", "New label name")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const data = await client.post("/labels/shared/rename", {
        name: opts.name,
        new_name: opts.newName,
      });
      output(data ?? { renamed: true }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

labelsResource
  .command("shared-remove")
  .description("Remove a shared label from all tasks")
  .requiredOption("--name <name>", "Label name to remove")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const data = await client.post("/labels/shared/remove", { name: opts.name });
      output(data ?? { removed: true }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
