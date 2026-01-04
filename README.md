# MCP Server: Notes Manager (TypeScript Starter)

A simple MCP (Model Context Protocol) server that manages notes. This is the companion repository for the **Gheware DevOps AI** YouTube tutorial: **"Build Your Own MCP Server (TypeScript)"**.

## What You'll Learn

- How to create an MCP server from scratch
- Implementing **TOOLs** (operations AI can perform)
- Implementing **RESOURCEs** (data AI can read)
- Testing with Claude Desktop and MCP Inspector

## Features

### Tools (AI Operations)

| Tool | Description |
|------|-------------|
| `add_note` | Create a new note with title, content, and tags |
| `list_notes` | List all notes with IDs and titles |
| `search_notes` | Search notes by title, content, or tags |
| `delete_note` | Delete a note by ID |

### Resources (AI Data Access)

| URI | Description |
|-----|-------------|
| `notes://list` | JSON list of all notes |
| `notes://note/{id}` | Individual note by ID |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Claude Desktop (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/brainupgrade-in/mcp-server-typescript-starter.git
cd mcp-server-typescript-starter

# Install dependencies
npm install

# Build the project
npm run build
```

### Test with MCP Inspector

```bash
npm run inspector
```

This opens a browser-based inspector to test your tools and resources.

### Configure Claude Desktop

Add this to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-typescript-starter/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop after saving.

## Usage Examples

Once connected to Claude Desktop, try these prompts:

```
"Add a note about Docker networking with tags devops and docker"

"List all my notes"

"Search for notes about devops"

"Delete the welcome note"
```

## Project Structure

```
mcp-server-typescript-starter/
├── src/
│   └── index.ts        # Main MCP server code
├── dist/               # Compiled JavaScript (after build)
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## Code Walkthrough

### 1. Server Setup

```typescript
const server = new Server(
  { name: "notes-manager", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);
```

### 2. Defining a Tool

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "add_note",
    description: "Create a new note",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Note title" },
        content: { type: "string", description: "Note content" }
      },
      required: ["title", "content"]
    }
  }]
}));
```

### 3. Handling Tool Calls

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "add_note") {
    // Create the note...
    return { content: [{ type: "text", text: "Note created!" }] };
  }
});
```

### 4. Exposing Resources

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [{
    uri: "notes://list",
    name: "All Notes",
    mimeType: "application/json"
  }]
}));
```

## Next Steps

- Add persistence (save notes to a file or database)
- Implement **Prompts** (pre-defined instruction templates)
- Add authentication for multi-user support
- Deploy as a standalone service

## Resources

- [MCP Official Docs](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Anthropic MCP Course](https://anthropic.skilljar.com/introduction-to-model-context-protocol)

## Video Tutorial

Watch the full tutorial on **Gheware DevOps AI**:

- [What is MCP?](https://www.youtube.com/watch?v=sMzEGEv-6-4)
- [MCP Architecture](https://www.youtube.com/watch?v=t7O9T6UxK5k)
- [Install Your First MCP Server](https://www.youtube.com/watch?v=lbLNb2eNmf8)
- **Build Your Own MCP Server** ← This tutorial

## License

MIT License - Feel free to use this as a starting point for your own MCP servers!

---

Made with ❤️ by [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai)
