#!/usr/bin/env bun
import { Command } from "commander";
import { globalFlags } from "./lib/config.js";
import { authCommand } from "./commands/auth.js";
import { tasksResource } from "./resources/tasks.js";
import { projectsResource } from "./resources/projects.js";
import { sectionsResource } from "./resources/sections.js";
import { labelsResource } from "./resources/labels.js";
import { commentsResource } from "./resources/comments.js";
import { userResource } from "./resources/user.js";
import { syncResource } from "./resources/sync.js";

const program = new Command();

program
  .name("todoist-cli")
  .description("CLI for the Todoist API v1")
  .version("0.1.0")
  .option("--json", "Output as JSON", false)
  .option("--format <fmt>", "Output format: text, json, csv, yaml", "text")
  .option("--verbose", "Enable debug logging", false)
  .option("--no-color", "Disable colored output")
  .option("--no-header", "Omit table/csv headers (for piping)")
  .hook("preAction", (_thisCmd, actionCmd) => {
    const root = actionCmd.optsWithGlobals();
    globalFlags.json = root.json ?? false;
    globalFlags.format = root.format ?? "text";
    globalFlags.verbose = root.verbose ?? false;
    globalFlags.noColor = root.color === false;
    globalFlags.noHeader = root.header === false;
  });

program.addCommand(authCommand);
program.addCommand(tasksResource);
program.addCommand(projectsResource);
program.addCommand(sectionsResource);
program.addCommand(labelsResource);
program.addCommand(commentsResource);
program.addCommand(userResource);
program.addCommand(syncResource);

program.parse();
