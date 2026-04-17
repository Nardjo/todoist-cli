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
  sectionId?: string;
  parentId?: string;
  label?: string;
  filter?: string;
  lang?: string;
  ids?: string;
  content?: string;
  description?: string;
  priority?: string;
  dueString?: string;
  dueDate?: string;
  dueDatetime?: string;
  dueLang?: string;
  labels?: string;
  assigneeId?: string;
  order?: string;
  duration?: string;
  durationUnit?: string;
  deadlineDate?: string;
  deadlineLang?: string;
  text?: string;
  note?: string;
  reminder?: string;
  autoReminder?: boolean;
}

export const tasksResource = new Command("tasks").description("Manage Todoist tasks");

tasksResource
  .command("list")
  .description("List active tasks (filter by project, section, label, or query)")
  .option("--limit <n>", "Max results (default 50, max 200)")
  .option("--cursor <c>", "Pagination cursor from previous response")
  .option("--project-id <id>", "Filter by project ID")
  .option("--section-id <id>", "Filter by section ID")
  .option("--parent-id <id>", "Filter by parent task ID")
  .option("--label <name>", "Filter by label name")
  .option("--filter <query>", "Todoist filter query (e.g. 'today & p1')")
  .option("--lang <code>", "Language for --filter (e.g. 'en', 'fr')")
  .option("--ids <csv>", "Comma-separated list of task IDs")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.limit) params.limit = opts.limit;
      if (opts.cursor) params.cursor = opts.cursor;
      if (opts.projectId) params.project_id = opts.projectId;
      if (opts.sectionId) params.section_id = opts.sectionId;
      if (opts.parentId) params.parent_id = opts.parentId;
      if (opts.label) params.label = opts.label;
      if (opts.filter) params.filter = opts.filter;
      if (opts.lang) params.lang = opts.lang;
      if (opts.ids) params.ids = opts.ids;
      const data = await client.get("/tasks", params);
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

tasksResource
  .command("get")
  .description("Get a specific task by ID")
  .argument("<id>", "Task ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.get(`/tasks/${id}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

tasksResource
  .command("create")
  .description("Create a new task")
  .requiredOption("--content <text>", "Task content (title)")
  .option("--description <text>", "Extended description")
  .option("--project-id <id>", "Project ID (defaults to Inbox)")
  .option("--section-id <id>", "Section ID")
  .option("--parent-id <id>", "Parent task ID")
  .option("--order <n>", "Order within project/section")
  .option("--labels <csv>", "Comma-separated label names")
  .option("--priority <n>", "API priority 1 (normal) → 4 (urgent)")
  .option("--due-string <s>", "Natural-language due date (e.g. 'tomorrow at 9am')")
  .option("--due-date <YYYY-MM-DD>", "Due date")
  .option("--due-datetime <ISO>", "Due date-time in RFC3339")
  .option("--due-lang <code>", "Language for --due-string")
  .option("--assignee-id <id>", "Assignee user ID")
  .option("--duration <n>", "Duration amount")
  .option("--duration-unit <unit>", "'minute' or 'day'")
  .option("--deadline-date <YYYY-MM-DD>", "Deadline date")
  .option("--deadline-lang <code>", "Language for deadline")
  .option("--auto-reminder", "Add a default reminder for dated tasks")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const body: Record<string, unknown> = { content: opts.content };
      if (opts.description) body.description = opts.description;
      if (opts.projectId) body.project_id = opts.projectId;
      if (opts.sectionId) body.section_id = opts.sectionId;
      if (opts.parentId) body.parent_id = opts.parentId;
      if (opts.order) body.order = Number(opts.order);
      if (opts.labels) body.labels = opts.labels.split(",").map((s) => s.trim());
      if (opts.priority) body.priority = Number(opts.priority);
      if (opts.dueString) body.due_string = opts.dueString;
      if (opts.dueDate) body.due_date = opts.dueDate;
      if (opts.dueDatetime) body.due_datetime = opts.dueDatetime;
      if (opts.dueLang) body.due_lang = opts.dueLang;
      if (opts.assigneeId) body.assignee_id = opts.assigneeId;
      if (opts.duration) body.duration = Number(opts.duration);
      if (opts.durationUnit) body.duration_unit = opts.durationUnit;
      if (opts.deadlineDate) body.deadline_date = opts.deadlineDate;
      if (opts.deadlineLang) body.deadline_lang = opts.deadlineLang;
      if (opts.autoReminder) body.auto_reminder = true;
      const data = await client.post("/tasks", body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

tasksResource
  .command("quick-add")
  .description("Create a task from natural-language text (Todoist Quick Add parser)")
  .requiredOption("--text <text>", "Natural-language task (e.g. 'Buy milk tomorrow #Groceries p1 @errand')")
  .option("--note <text>", "Additional note")
  .option("--reminder <s>", "Reminder in natural language")
  .option("--auto-reminder", "Add default reminder")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const body: Record<string, unknown> = { text: opts.text };
      if (opts.note) body.note = opts.note;
      if (opts.reminder) body.reminder = opts.reminder;
      if (opts.autoReminder) body.auto_reminder = true;
      const data = await client.post("/tasks/quick", body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

tasksResource
  .command("update")
  .description("Update an existing task")
  .argument("<id>", "Task ID")
  .option("--content <text>", "New content")
  .option("--description <text>", "New description")
  .option("--labels <csv>", "Comma-separated labels (replaces)")
  .option("--priority <n>", "Priority 1-4")
  .option("--due-string <s>", "Natural-language due date")
  .option("--due-date <YYYY-MM-DD>", "Due date")
  .option("--due-datetime <ISO>", "Due date-time")
  .option("--due-lang <code>", "Language for due string")
  .option("--assignee-id <id>", "Assignee user ID")
  .option("--duration <n>", "Duration amount")
  .option("--duration-unit <unit>", "'minute' or 'day'")
  .option("--deadline-date <YYYY-MM-DD>", "Deadline date")
  .option("--deadline-lang <code>", "Language for deadline")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.content) body.content = opts.content;
      if (opts.description !== undefined) body.description = opts.description;
      if (opts.labels) body.labels = opts.labels.split(",").map((s) => s.trim());
      if (opts.priority) body.priority = Number(opts.priority);
      if (opts.dueString) body.due_string = opts.dueString;
      if (opts.dueDate) body.due_date = opts.dueDate;
      if (opts.dueDatetime) body.due_datetime = opts.dueDatetime;
      if (opts.dueLang) body.due_lang = opts.dueLang;
      if (opts.assigneeId) body.assignee_id = opts.assigneeId;
      if (opts.duration) body.duration = Number(opts.duration);
      if (opts.durationUnit) body.duration_unit = opts.durationUnit;
      if (opts.deadlineDate) body.deadline_date = opts.deadlineDate;
      if (opts.deadlineLang) body.deadline_lang = opts.deadlineLang;
      const data = await client.post(`/tasks/${id}`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

tasksResource
  .command("close")
  .description("Mark a task as completed")
  .argument("<id>", "Task ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      await client.post(`/tasks/${id}/close`);
      output({ closed: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

tasksResource
  .command("reopen")
  .description("Reopen a completed task")
  .argument("<id>", "Task ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      await client.post(`/tasks/${id}/reopen`);
      output({ reopened: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

tasksResource
  .command("move")
  .description("Move a task to another project, section, or parent")
  .argument("<id>", "Task ID")
  .option("--project-id <id>", "Target project ID")
  .option("--section-id <id>", "Target section ID")
  .option("--parent-id <id>", "Target parent task ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.projectId) body.project_id = opts.projectId;
      if (opts.sectionId) body.section_id = opts.sectionId;
      if (opts.parentId) body.parent_id = opts.parentId;
      const data = await client.post(`/tasks/${id}/move`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

tasksResource
  .command("delete")
  .description("Delete a task")
  .argument("<id>", "Task ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      await client.delete(`/tasks/${id}`);
      output({ deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
