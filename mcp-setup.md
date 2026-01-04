# MCP Architecture & Setup Guide

This guide accompanies **Video 2: MCP Architecture** from the [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai) MCP Masterclass.

📺 **Watch:** [MCP? It's JUST 3 Parts. (Here's How It Works)](https://www.youtube.com/watch?v=t7O9T6UxK5k)

---

## The 3 Components of MCP

MCP (Model Context Protocol) has exactly **3 components**. That's it.

```
┌─────────────────────────────────────────────────────────────────┐
│                           HOST                                   │
│                    (Claude Desktop, Cursor, VS Code)             │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   CLIENT    │  │   CLIENT    │  │   CLIENT    │              │
│  │  (built-in) │  │  (built-in) │  │  (built-in) │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          │ JSON-RPC       │ JSON-RPC       │ JSON-RPC
          │ (stdio)        │ (stdio)        │ (SSE)
          ▼                ▼                ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │    SERVER    │ │    SERVER    │ │    SERVER    │
   │  (Filesystem)│ │   (Notes)    │ │  (Database)  │
   │              │ │  ◄── THIS    │ │              │
   │              │ │      REPO    │ │              │
   └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Component 1: HOST

**What it is:** The AI application you're using.

**Examples:**
- Claude Desktop
- Cursor IDE
- VS Code with Copilot
- Windsurf
- Your own AI app

**Responsibilities:**
- Manages multiple MCP clients
- Provides the user interface
- Routes requests to appropriate clients

---

## Component 2: CLIENT

**What it is:** The messenger that lives inside the Host.

**Key facts:**
- Built into the Host (you don't build this)
- One client per server connection
- Speaks the MCP protocol (JSON-RPC)

**Responsibilities:**
- Discovers server capabilities
- Sends tool calls to servers
- Receives results and forwards to Host

---

## Component 3: SERVER

**What it is:** The tool provider (like this repository!).

**Examples:**
- Filesystem server (read/write files)
- Database server (query SQL)
- **Notes server (this repo)**
- GitHub server (manage repos)
- Slack server (send messages)

**Responsibilities:**
- Expose **Tools** (operations AI can perform)
- Expose **Resources** (data AI can read)
- Expose **Prompts** (pre-defined instructions)

---

## How They Communicate

### Protocol: JSON-RPC 2.0

All MCP communication uses JSON-RPC over one of two transports:

| Transport | Use Case | How It Works |
|-----------|----------|--------------|
| **stdio** | Local servers | Server runs as subprocess, communicates via stdin/stdout |
| **SSE** | Remote servers | Server exposes HTTP endpoint with Server-Sent Events |

### Message Flow

```
User: "Add a note about Docker"
         │
         ▼
┌─────────────────┐
│      HOST       │  1. User sends message
│  (Claude)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     CLIENT      │  2. Client translates to MCP tool call
│                 │
└────────┬────────┘
         │
         │  JSON-RPC Request:
         │  {
         │    "method": "tools/call",
         │    "params": {
         │      "name": "add_note",
         │      "arguments": {
         │        "title": "Docker",
         │        "content": "..."
         │      }
         │    }
         │  }
         ▼
┌─────────────────┐
│     SERVER      │  3. Server executes tool
│   (Notes)       │
└────────┬────────┘
         │
         │  JSON-RPC Response:
         │  {
         │    "result": {
         │      "content": [{
         │        "type": "text",
         │        "text": "Note created!"
         │      }]
         │    }
         │  }
         ▼
┌─────────────────┐
│     CLIENT      │  4. Client receives result
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      HOST       │  5. Host displays to user
│  (Claude)       │
└─────────────────┘

User sees: "Note created!"
```

---

## Where This Repo Fits

This repository (`mcp-server-typescript-starter`) is a **SERVER**.

```
You are building THIS
         │
         ▼
┌─────────────────────────────────────────────┐
│              MCP SERVER                      │
│         "Notes Manager"                      │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │            TOOLS                     │    │
│  │  • add_note                          │    │
│  │  • list_notes                        │    │
│  │  • search_notes                      │    │
│  │  • delete_note                       │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │          RESOURCES                   │    │
│  │  • notes://list                      │    │
│  │  • notes://note/{id}                 │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  Transport: stdio (stdin/stdout)             │
│  Protocol: JSON-RPC 2.0                      │
└─────────────────────────────────────────────┘
```

---

## The 3 Primitives

Every MCP server can expose three types of capabilities:

| Primitive | Controller | Description | Example |
|-----------|------------|-------------|---------|
| **Tools** | Model (AI) | Operations the AI can invoke | `add_note`, `search_notes` |
| **Resources** | Application | Read-only data the AI can access | `notes://list` |
| **Prompts** | User | Pre-defined instruction templates | "Format as markdown" |

### This Repo Implements:

✅ **Tools** - 4 operations for note management  
✅ **Resources** - 2 data endpoints  
⬜ **Prompts** - Not implemented (exercise for viewer)

---

## Setup Verification

After following [Video 3: Install Your First MCP Server](https://www.youtube.com/watch?v=lbLNb2eNmf8), verify your setup:

### 1. Build the Server

```bash
cd /home/rajesh/mcp-server-typescript-starter
npm install
npm run build
```

### 2. Test with MCP Inspector

```bash
npm run inspector
```

This opens a browser-based tool to test your server without Claude Desktop.

### 3. Configure Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["/home/rajesh/mcp-server-typescript-starter/dist/index.js"]
    }
  }
}
```

**Config file locations:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

### 4. Restart Claude Desktop

After saving the config, restart Claude Desktop completely.

### 5. Verify Connection

In Claude Desktop, you should see a hammer 🔨 icon indicating tools are available.

Try: *"List all my notes"*

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Server not appearing | Check the path in config is absolute |
| "spawn ENOENT" error | Ensure Node.js is in PATH |
| Tools not working | Check `npm run build` completed without errors |
| No hammer icon | Restart Claude Desktop completely |

---

## Next Steps

1. **Video 4:** [Build Your Own MCP Server](https://www.youtube.com/playlist?list=PLqGvN2U9LT-ukrMpG3SsyjtwK72qjIc54) - Walk through this code
2. **Video 5:** Real-World MCP - Connect AI to a database
3. **Challenge:** Add a `update_note` tool to this server

---

## Resources

- [MCP Official Docs](https://modelcontextprotocol.io)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [MCP Architecture](https://modelcontextprotocol.io/docs/concepts/architecture)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Anthropic MCP Course](https://anthropic.skilljar.com/introduction-to-model-context-protocol)

---

Made with ❤️ by [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai)
