# Agentic Folder Documentation System

This document describes the agentic folder documentation approach used in this project.

## Overview

Each significant code folder contains an `AGENT.md` file that provides context for AI agents working on the codebase. This creates a hierarchical knowledge base that helps agents understand:

- What the folder contains and its purpose
- How to navigate and read the code
- Development workflows and patterns
- Testing strategies and locations
- Dependencies and connections to other parts of the codebase

## How It Works

1. **Check AGENT.md first**: When exploring a folder, read its `AGENT.md` before diving into code
2. **Source of truth**: Treat `AGENT.md` as authoritative for folder context
3. **Keep it fresh**: Update `AGENT.md` when structure or patterns change significantly

## Creating New AGENT.md Files

Use the template at [.agent/rules/agent-template.md](file:///Users/boopster/Projects/empwru-app/.agent/rules/agent-template.md).

## Which Folders Get AGENT.md?

- **Code folders**: `src/`, `components/`, `lib/`, `app/`, etc.
- **Not needed**: Pure documentation folders, config-only folders, or folders with trivial content

## Related Files

- [Root AGENT.md](file:///Users/boopster/Projects/empwru-app/AGENT.md) — Project-level context
- [Template](file:///Users/boopster/Projects/empwru-app/.agent/rules/agent-template.md) — Structure for new files
- [System Rule](file:///Users/boopster/Projects/empwru-app/.agent/rules/agentic-folder-system.md) — Enforcement rule
