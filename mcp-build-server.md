# Build Your Own MCP Server (TypeScript)

This guide accompanies **Video 4: Build Your Own MCP Server** from the [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai) MCP Masterclass.

📺 **Watch the full playlist:** [MCP Masterclass](https://www.youtube.com/playlist?list=PLqGvN2U9LT-ukrMpG3SsyjtwK72qjIc54)

---

## Video Timeline

| Time | Section | Jump To |
|------|---------|---------|
| 0:00 | From consumer to creator | [Introduction](#introduction) |
| 1:00 | Project setup | [Step 1: Project Setup](#step-1-project-setup-100) |
| 2:30 | MCP SDK basics | [Step 2: Server Skeleton](#step-2-server-skeleton-230) |
| 4:00 | Define your first TOOL | [Step 3: Adding Tools](#step-3-adding-tools-400) |
| 6:00 | Add a RESOURCE | [Step 4: Adding Resources](#step-4-adding-resources-600) |
| 8:00 | Test with Claude Desktop | [Step 5: Testing](#step-5-testing-800) |
| 9:30 | Your server is live! | [Next Steps](#next-steps) |

---

## Introduction

You've installed MCP servers. Now it's time to **build your own**.

In this tutorial, we'll create a **Notes Manager** MCP server that:
- Stores notes in memory
- Exposes 4 tools for CRUD operations
- Exposes 2 resources for data access

By the end, you'll understand exactly how MCP servers work.

---

## Step 1: Project Setup (1:00)

### Create Project Directory

```bash
mkdir mcp-server-notes
cd mcp-server-notes
```

### Initialize npm Project

```bash
npm init -y
```

### Install Dependencies

```bash
# MCP SDK - the core library
npm install @modelcontextprotocol/sdk

# TypeScript development
npm install -D typescript @types/node
```

### Configure package.json

Update your `package.json`:

```json
{
  "name": "mcp-server-notes",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc --watch",
    "inspector": "npx @modelcontextprotocol/inspector node dist/index.js"
  }
}
```

> **Key:** `"type": "module"` enables ES modules (required for MCP SDK)

### Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### Create Source Directory

```bash
mkdir src
touch src/index.ts
```

---

## Step 2: Server Skeleton (2:30)

Open `src/index.ts` and add the basic server structure:

### Import MCP SDK

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
```

**What each import does:**

| Import | Purpose |
|--------|---------|
| `Server` | Main MCP server class |
| `StdioServerTransport` | Communication via stdin/stdout |
| `ListToolsRequestSchema` | Handler for listing available tools |
| `CallToolRequestSchema` | Handler for executing tools |
| `ListResourcesRequestSchema` | Handler for listing resources |
| `ReadResourceRequestSchema` | Handler for reading resource content |
| `ErrorCode`, `McpError` | Error handling |

### Create Server Instance

```typescript
const server = new Server(
  {
    name: "notes-manager",      // Server identifier
    version: "1.0.0",           // Server version
  },
  {
    capabilities: {
      tools: {},                // We'll provide tools
      resources: {},            // We'll provide resources
    },
  }
);
```

### Start the Server

```typescript
async function main() {
  // Create stdio transport (communicates via stdin/stdout)
  const transport = new StdioServerTransport();
  
  // Connect server to transport
  await server.connect(transport);
  
  // Log to stderr (stdout is for MCP protocol)
  console.error("MCP Notes Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

> **Important:** Use `console.error()` for logging. `console.log()` would interfere with the MCP protocol on stdout.

### Build and Test

```bash
npm run build
```

At this point, the server starts but has no tools or resources.

---

## Step 3: Adding Tools (4:00)

Tools are **operations the AI can perform**. Let's add note management tools.

### Define Data Structure

First, add a data store above the server creation:

```typescript
// Data types
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
}

// In-memory storage
const notes: Map<string, Note> = new Map();

// Helper to generate IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add sample data
notes.set("1", {
  id: "1",
  title: "Welcome to MCP",
  content: "This is your first note!",
  createdAt: new Date().toISOString(),
  tags: ["welcome", "mcp"],
});
```

### Register Tool List Handler

Tell MCP what tools are available:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "add_note",
        description: "Create a new note with title, content, and optional tags",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the note",
            },
            content: {
              type: "string",
              description: "The content/body of the note",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional tags to categorize the note",
            },
          },
          required: ["title", "content"],
        },
      },
      {
        name: "list_notes",
        description: "List all notes with their IDs and titles",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_notes",
        description: "Search notes by title, content, or tags",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "delete_note",
        description: "Delete a note by its ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The ID of the note to delete",
            },
          },
          required: ["id"],
        },
      },
    ],
  };
});
```

**Tool Definition Structure:**

```typescript
{
  name: "tool_name",           // Unique identifier
  description: "What it does", // AI uses this to decide when to call
  inputSchema: {               // JSON Schema for parameters
    type: "object",
    properties: { ... },
    required: ["param1"]
  }
}
```

### Handle Tool Calls

Now implement what happens when each tool is called:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    // ========== ADD NOTE ==========
    case "add_note": {
      const { title, content, tags = [] } = args as {
        title: string;
        content: string;
        tags?: string[];
      };

      const id = generateId();
      const note: Note = {
        id,
        title,
        content,
        createdAt: new Date().toISOString(),
        tags,
      };

      notes.set(id, note);

      return {
        content: [
          {
            type: "text",
            text: `✅ Note created!\nID: ${id}\nTitle: ${title}`,
          },
        ],
      };
    }

    // ========== LIST NOTES ==========
    case "list_notes": {
      const noteList = Array.from(notes.values()).map(
        (n) => `• [${n.id}] ${n.title}`
      );

      return {
        content: [
          {
            type: "text",
            text: noteList.length > 0
              ? `Found ${noteList.length} notes:\n${noteList.join("\n")}`
              : "No notes found.",
          },
        ],
      };
    }

    // ========== SEARCH NOTES ==========
    case "search_notes": {
      const { query } = args as { query: string };
      const lowerQuery = query.toLowerCase();

      const matches = Array.from(notes.values()).filter(
        (n) =>
          n.title.toLowerCase().includes(lowerQuery) ||
          n.content.toLowerCase().includes(lowerQuery) ||
          n.tags.some((t) => t.toLowerCase().includes(lowerQuery))
      );

      return {
        content: [
          {
            type: "text",
            text: matches.length > 0
              ? `Found ${matches.length} matches:\n${matches.map(n => `• ${n.title}`).join("\n")}`
              : `No notes matching "${query}"`,
          },
        ],
      };
    }

    // ========== DELETE NOTE ==========
    case "delete_note": {
      const { id } = args as { id: string };

      if (!notes.has(id)) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Note "${id}" not found`
        );
      }

      const note = notes.get(id)!;
      notes.delete(id);

      return {
        content: [
          {
            type: "text",
            text: `🗑️ Deleted: "${note.title}"`,
          },
        ],
      };
    }

    // ========== UNKNOWN TOOL ==========
    default:
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${name}`
      );
  }
});
```

**Tool Response Structure:**

```typescript
return {
  content: [
    {
      type: "text",    // or "image", "resource"
      text: "Result message",
    },
  ],
};
```

---

## Step 4: Adding Resources (6:00)

Resources are **read-only data** the AI can access. Unlike tools, resources are pulled by the application, not invoked by the AI.

### Register Resource List Handler

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  // Create a resource for each note
  const noteResources = Array.from(notes.values()).map((note) => ({
    uri: `notes://note/${note.id}`,
    name: note.title,
    description: `Note: ${note.title}`,
    mimeType: "application/json",
  }));

  return {
    resources: [
      // List of all notes
      {
        uri: "notes://list",
        name: "All Notes",
        description: "Complete list of all notes",
        mimeType: "application/json",
      },
      // Individual note resources
      ...noteResources,
    ],
  };
});
```

**Resource Definition Structure:**

```typescript
{
  uri: "protocol://path",      // Unique identifier
  name: "Display Name",        // Human-readable name
  description: "What it is",   // Explains the resource
  mimeType: "application/json" // Content type
}
```

### Handle Resource Reads

```typescript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  // Handle notes://list
  if (uri === "notes://list") {
    const allNotes = Array.from(notes.values());
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(allNotes, null, 2),
        },
      ],
    };
  }

  // Handle notes://note/{id}
  const match = uri.match(/^notes:\/\/note\/(.+)$/);
  if (match) {
    const noteId = match[1];
    const note = notes.get(noteId);

    if (!note) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Note not found: ${noteId}`
      );
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(note, null, 2),
        },
      ],
    };
  }

  throw new McpError(
    ErrorCode.InvalidRequest,
    `Unknown resource: ${uri}`
  );
});
```

---

## Step 5: Testing (8:00)

### Build the Project

```bash
npm run build
```

### Test with MCP Inspector

The MCP Inspector is a browser-based tool for testing:

```bash
npm run inspector
```

This opens a UI where you can:
1. See all registered tools
2. Call tools with test parameters
3. Browse available resources
4. Read resource contents

### Test in Claude Desktop

1. Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["/full/path/to/mcp-server-notes/dist/index.js"]
    }
  }
}
```

2. Restart Claude Desktop

3. Test with prompts:

```
"List all my notes"

"Add a note titled 'Docker Tips' with content about container best practices"

"Search for notes about MCP"

"Delete the welcome note"
```

---

## Complete Code

Here's the full `src/index.ts`:

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

// ============ DATA TYPES ============
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
}

// ============ DATA STORE ============
const notes: Map<string, Note> = new Map();

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Sample data
notes.set("1", {
  id: "1",
  title: "Welcome to MCP",
  content: "This is your first note!",
  createdAt: new Date().toISOString(),
  tags: ["welcome", "mcp"],
});

// ============ SERVER SETUP ============
const server = new Server(
  { name: "notes-manager", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// ============ TOOLS ============
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "add_note",
      description: "Create a new note",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Note title" },
          content: { type: "string", description: "Note content" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["title", "content"],
      },
    },
    {
      name: "list_notes",
      description: "List all notes",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "search_notes",
      description: "Search notes",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
    {
      name: "delete_note",
      description: "Delete a note",
      inputSchema: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // ... implement tool handlers (see Step 3)
});

// ============ RESOURCES ============
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    { uri: "notes://list", name: "All Notes", mimeType: "application/json" },
    ...Array.from(notes.values()).map((n) => ({
      uri: `notes://note/${n.id}`,
      name: n.title,
      mimeType: "application/json",
    })),
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  // ... implement resource readers (see Step 4)
});

// ============ START SERVER ============
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Notes Server running");
}

main().catch(console.error);
```

---

## Next Steps

### Add More Features

1. **Update Tool** - Modify existing notes
2. **Prompts** - Pre-defined instruction templates
3. **Persistence** - Save notes to a file
4. **Authentication** - Multi-user support

### Challenge: Add update_note Tool

Try adding this yourself:

```typescript
{
  name: "update_note",
  description: "Update an existing note",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Note ID" },
      title: { type: "string", description: "New title (optional)" },
      content: { type: "string", description: "New content (optional)" },
    },
    required: ["id"],
  },
}
```

### Explore Other Servers

- [Filesystem Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [GitHub Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [Postgres Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)

---

## Key Concepts Recap

| Concept | What It Is | Who Controls |
|---------|------------|--------------|
| **Tool** | Operation AI can invoke | AI (Model) |
| **Resource** | Read-only data | Application |
| **Prompt** | Instruction template | User |

| Handler | Purpose |
|---------|---------|
| `ListToolsRequestSchema` | Tell MCP what tools exist |
| `CallToolRequestSchema` | Execute a tool |
| `ListResourcesRequestSchema` | Tell MCP what resources exist |
| `ReadResourceRequestSchema` | Return resource content |

---

## Resources

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Building MCP Servers](https://modelcontextprotocol.io/docs/concepts/servers)
- [Anthropic MCP Course](https://anthropic.skilljar.com/introduction-to-model-context-protocol)

---

Made with ❤️ by [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai)
