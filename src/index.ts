#!/usr/bin/env node
/**
 * MCP Server: Notes Manager
 * 
 * A simple MCP server demonstrating TOOLs and RESOURCEs.
 * Tutorial companion for: "Build Your Own MCP Server (TypeScript)"
 * Channel: Gheware DevOps AI
 * 
 * Features:
 * - TOOLS: add_note, list_notes, search_notes, delete_note
 * - RESOURCES: notes://list, notes://note/{id}
 */

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

// ============================================
// DATA STORE (In-memory for simplicity)
// ============================================

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
}

const notes: Map<string, Note> = new Map();

// Add some sample notes
notes.set("1", {
  id: "1",
  title: "Welcome to MCP",
  content: "This is your first note created with the MCP Notes Server!",
  createdAt: new Date().toISOString(),
  tags: ["welcome", "mcp"],
});

notes.set("2", {
  id: "2",
  title: "Docker Basics",
  content: "Docker containers are lightweight, portable units of software.",
  createdAt: new Date().toISOString(),
  tags: ["docker", "devops"],
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// MCP SERVER SETUP
// ============================================

const server = new Server(
  {
    name: "notes-manager",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ============================================
// TOOLS: Define operations the AI can perform
// ============================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "add_note",
        description: "Create a new note with a title, content, and optional tags",
        inputSchema: {
          type: "object" as const,
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
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "search_notes",
        description: "Search notes by title, content, or tags",
        inputSchema: {
          type: "object" as const,
          properties: {
            query: {
              type: "string",
              description: "Search query to find in notes",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "delete_note",
        description: "Delete a note by its ID",
        inputSchema: {
          type: "object" as const,
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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
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
            type: "text" as const,
            text: `Note created successfully!\nID: ${id}\nTitle: ${title}\nTags: ${tags.join(", ") || "none"}`,
          },
        ],
      };
    }

    case "list_notes": {
      const noteList = Array.from(notes.values()).map(
        (n) => `- [${n.id}] ${n.title} (${n.tags.join(", ") || "no tags"})`
      );

      return {
        content: [
          {
            type: "text" as const,
            text:
              noteList.length > 0
                ? `Found ${noteList.length} notes:\n${noteList.join("\n")}`
                : "No notes found. Use add_note to create one!",
          },
        ],
      };
    }

    case "search_notes": {
      const { query } = args as { query: string };
      const lowerQuery = query.toLowerCase();

      const matches = Array.from(notes.values()).filter(
        (n) =>
          n.title.toLowerCase().includes(lowerQuery) ||
          n.content.toLowerCase().includes(lowerQuery) ||
          n.tags.some((t) => t.toLowerCase().includes(lowerQuery))
      );

      const results = matches.map(
        (n) => `- [${n.id}] ${n.title}\n  ${n.content.substring(0, 100)}...`
      );

      return {
        content: [
          {
            type: "text" as const,
            text:
              results.length > 0
                ? `Found ${results.length} matching notes:\n${results.join("\n\n")}`
                : `No notes found matching "${query}"`,
          },
        ],
      };
    }

    case "delete_note": {
      const { id } = args as { id: string };

      if (!notes.has(id)) {
        throw new McpError(ErrorCode.InvalidRequest, `Note with ID "${id}" not found`);
      }

      const note = notes.get(id)!;
      notes.delete(id);

      return {
        content: [
          {
            type: "text" as const,
            text: `Deleted note: "${note.title}" (ID: ${id})`,
          },
        ],
      };
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
});

// ============================================
// RESOURCES: Expose data for the AI to read
// ============================================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const noteResources = Array.from(notes.values()).map((note) => ({
    uri: `notes://note/${note.id}`,
    name: note.title,
    description: `Note: ${note.title} (${note.tags.join(", ") || "no tags"})`,
    mimeType: "application/json",
  }));

  return {
    resources: [
      {
        uri: "notes://list",
        name: "All Notes",
        description: "List of all notes in the system",
        mimeType: "application/json",
      },
      ...noteResources,
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

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

  const match = uri.match(/^notes:\/\/note\/(.+)$/);
  if (match) {
    const noteId = match[1];
    const note = notes.get(noteId);

    if (!note) {
      throw new McpError(ErrorCode.InvalidRequest, `Note not found: ${noteId}`);
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

  throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
});

// ============================================
// START THE SERVER
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Notes Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
