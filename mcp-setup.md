# MCP Server Installation Guide

This guide accompanies **Video 3: Install Your First MCP Server** from the [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai) MCP Masterclass.

📺 **Watch:** [Install MCP in 5 Minutes. (Yes, Really.)](https://www.youtube.com/watch?v=lbLNb2eNmf8)

---

## Prerequisites

Before you start, ensure you have:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Claude Desktop | Latest | Download from [claude.ai/download](https://claude.ai/download) |

---

## Quick Start (5 Minutes)

### Step 1: Install a Pre-built MCP Server (2 min)

The fastest way to get started is with the official **Filesystem MCP Server**:

```bash
# No installation needed - npx runs it directly
npx -y @modelcontextprotocol/server-filesystem ~/Documents
```

This server lets Claude read files from your `~/Documents` folder.

### Step 2: Configure Claude Desktop (2 min)

Find your Claude Desktop config file:

| OS | Config Path |
|----|-------------|
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Linux** | `~/.config/Claude/claude_desktop_config.json` |

Create or edit the file with this content:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/YOUR_USERNAME/Documents"
      ]
    }
  }
}
```

> ⚠️ **Replace `/Users/YOUR_USERNAME/Documents`** with your actual path!

### Step 3: Restart Claude Desktop (30 sec)

1. Quit Claude Desktop completely (not just close the window)
2. Reopen Claude Desktop
3. Look for the 🔨 hammer icon - this means MCP tools are available

### Step 4: Test It! (30 sec)

Try these prompts in Claude Desktop:

```
"List files in my Documents folder"

"Read the contents of README.md"

"What text files do I have?"
```

---

## Installing This Notes Server

Once you've verified the filesystem server works, try this custom server:

### Step 1: Clone and Build

```bash
# Clone the repository
git clone https://github.com/brainupgrade-in/mcp-server-typescript-starter.git
cd mcp-server-typescript-starter

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Step 2: Test with MCP Inspector

Before connecting to Claude, test your server:

```bash
npm run inspector
```

This opens a browser-based inspector where you can:
- See available tools
- Test tool calls
- View resources
- Debug issues

### Step 3: Add to Claude Desktop

Update your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "~/Documents"]
    },
    "notes": {
      "command": "node",
      "args": ["/home/rajesh/mcp-server-typescript-starter/dist/index.js"]
    }
  }
}
```

### Step 4: Restart and Test

Restart Claude Desktop, then try:

```
"List all my notes"

"Add a note about Docker with tags devops and containers"

"Search for notes about devops"
```

---

## Multiple MCP Servers

You can run multiple servers simultaneously:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "~/Documents"]
    },
    "notes": {
      "command": "node",
      "args": ["/path/to/mcp-server-typescript-starter/dist/index.js"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-github-token"
      }
    }
  }
}
```

Each server appears as a separate set of tools in Claude.

---

## Troubleshooting

### Server Not Appearing

| Symptom | Solution |
|---------|----------|
| No 🔨 icon | Restart Claude Desktop completely |
| "spawn ENOENT" | Use absolute paths in config |
| Server crashes | Run `npm run build` again |

### Check Server Logs

**macOS/Linux:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows:**
```powershell
Get-Content $env:APPDATA\Claude\logs\mcp*.log -Wait
```

### Verify Node.js Path

If Claude can't find Node.js:

```json
{
  "mcpServers": {
    "notes": {
      "command": "/usr/local/bin/node",
      "args": ["/full/path/to/dist/index.js"]
    }
  }
}
```

Find your Node.js path: `which node` (macOS/Linux) or `where node` (Windows)

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ENOENT` | Path not found | Use absolute paths |
| `EACCES` | Permission denied | Check file permissions |
| `MODULE_NOT_FOUND` | Missing dependencies | Run `npm install` |
| `SyntaxError` | Build not run | Run `npm run build` |

---

## Verification Checklist

After setup, verify everything works:

- [ ] `node --version` shows 18+
- [ ] `npm run build` completes without errors
- [ ] `npm run inspector` opens browser tool
- [ ] Claude Desktop shows 🔨 icon
- [ ] "List all notes" returns sample notes
- [ ] "Add a note about X" creates new note

---

## What's Next?

| Video | Topic | Link |
|-------|-------|------|
| ✅ Video 1 | What is MCP? | [Watch](https://www.youtube.com/watch?v=sMzEGEv-6-4) |
| ✅ Video 2 | MCP Architecture | [Watch](https://www.youtube.com/watch?v=t7O9T6UxK5k) |
| ✅ Video 3 | Install MCP Server | [Watch](https://www.youtube.com/watch?v=lbLNb2eNmf8) |
| 📍 Video 4 | Build Your Own Server | Coming soon |
| 📍 Video 5 | AI + Database | Coming soon |

---

## Quick Reference

### Config File Locations

```bash
# macOS
~/Library/Application Support/Claude/claude_desktop_config.json

# Windows
%APPDATA%\Claude\claude_desktop_config.json

# Linux
~/.config/Claude/claude_desktop_config.json
```

### Useful Commands

```bash
# Build this server
npm run build

# Test with inspector
npm run inspector

# Watch mode (auto-rebuild)
npm run dev

# Check Node version
node --version
```

### Popular MCP Servers

| Server | Install | Purpose |
|--------|---------|---------|
| Filesystem | `npx -y @modelcontextprotocol/server-filesystem ~/path` | Read local files |
| GitHub | `npx -y @modelcontextprotocol/server-github` | Manage repos |
| Postgres | `npx -y @modelcontextprotocol/server-postgres` | Query databases |
| Memory | `npx -y @modelcontextprotocol/server-memory` | Persistent memory |

---

## Resources

- [MCP Quickstart](https://modelcontextprotocol.io/quickstart)
- [Claude Desktop Download](https://claude.ai/download)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

---

Made with ❤️ by [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai)
