# MCP Server Installation Guide

This guide accompanies **Video 3: Install Your First MCP Server** from the [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai) MCP Masterclass.

📺 **Watch:** [Install MCP in 5 Minutes. (Yes, Really.)](https://www.youtube.com/watch?v=lbLNb2eNmf8)

---

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

### MCP Host Application

You need an application that supports MCP:

| Platform | Options |
|----------|---------|
| **macOS** | Claude Desktop, Cursor, VS Code + Copilot |
| **Windows** | Claude Desktop, Cursor, VS Code + Copilot |
| **Linux** | Cursor, VS Code + Copilot, Claude Code CLI |

> ⚠️ **Note:** Claude Desktop is **NOT available for Linux**. See [Linux Alternatives](#linux-alternatives) below.

---

## Ubuntu Linux Setup

### Install Node.js 20 LTS

```bash
# Update package list
sudo apt update

# Install prerequisites
sudo apt install -y curl

# Add NodeSource repository (Node.js 20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x
```

**Alternative: Using nvm (recommended for developers)**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

### Linux Alternatives

Since Claude Desktop is not available for Linux, use one of these options:

#### Option 1: Cursor IDE (Recommended)

Cursor is an AI-powered IDE with built-in MCP support.

```bash
# Download from cursor.com
# Install the AppImage or .deb package
chmod +x cursor-*.AppImage
./cursor-*.AppImage
```

**Cursor MCP Config:** `~/.config/Cursor/User/globalStorage/cursor.mcp/config.json`

#### Option 2: VS Code with Continue Extension

```bash
# Install VS Code
sudo apt install code

# Install Continue extension from marketplace
# Configure MCP in Continue settings
```

#### Option 3: Claude Code CLI

Use MCP servers directly with Claude Code (terminal-based):

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Configure MCP in Claude Code settings
claude config
```

**Claude Code MCP Config:** `~/.claude/settings.json`

#### Option 4: MCP Inspector (Testing Only)

Test your MCP servers without a host application:

```bash
npm run inspector
```

This opens a browser-based tool to test tools and resources.

---

## Quick Start (5 Minutes)

### Step 1: Install a Pre-built MCP Server (2 min)

```bash
# No installation needed - npx runs it directly
npx -y @modelcontextprotocol/server-filesystem ~/Documents
```

This server lets AI read files from your `~/Documents` folder.

### Step 2: Configure Your MCP Host (2 min)

Choose your platform:

#### macOS / Windows (Claude Desktop)

Config file locations:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

#### Linux (Cursor IDE)

Config file: `~/.config/Cursor/User/globalStorage/cursor.mcp/config.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/home/YOUR_USERNAME/Documents"
      ]
    }
  }
}
```

> ⚠️ **Replace `YOUR_USERNAME`** with your actual username!
> 
> Find your username: `whoami`

### Step 3: Restart Your Application (30 sec)

**macOS/Windows (Claude Desktop):** Quit completely and reopen.

**Linux (Cursor):** Close and reopen Cursor IDE.

Look for MCP tools indicator (usually a 🔨 hammer icon or tools menu).

### Step 4: Test It! (30 sec)

Try these prompts:

```
"List files in my Documents folder"

"Read the contents of README.md"

"What text files do I have?"
```

---

## Installing This Notes Server

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

```bash
npm run inspector
```

This opens a browser-based inspector to test your server without any host application.

### Step 3: Add to Your MCP Host

**Claude Desktop (macOS/Windows):**

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
    }
  }
}
```

**Cursor IDE (Linux/macOS/Windows):**

```json
{
  "mcpServers": {
    "notes": {
      "command": "/usr/bin/node",
      "args": ["/home/YOUR_USERNAME/mcp-server-typescript-starter/dist/index.js"]
    }
  }
}
```

**If using nvm on Linux:**

```bash
# Find your node path
which node
# Example: /home/rajesh/.nvm/versions/node/v20.10.0/bin/node
```

```json
{
  "mcpServers": {
    "notes": {
      "command": "/home/rajesh/.nvm/versions/node/v20.10.0/bin/node",
      "args": ["/home/rajesh/mcp-server-typescript-starter/dist/index.js"]
    }
  }
}
```

### Step 4: Restart and Test

Restart your application, then try:

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

---

## Troubleshooting

### Server Not Appearing

| Symptom | Solution |
|---------|----------|
| No tools visible | Restart application completely |
| "spawn ENOENT" | Use absolute paths in config |
| Server crashes | Run `npm run build` again |

### Verify Node.js Path

```bash
# Find node path
which node

# Common paths:
# System install: /usr/bin/node
# nvm: ~/.nvm/versions/node/v20.x.x/bin/node
```

Use the full path in your config for reliability.

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ENOENT` | Path not found | Use absolute paths |
| `EACCES` | Permission denied | `chmod +x` or check ownership |
| `MODULE_NOT_FOUND` | Missing dependencies | Run `npm install` |
| `SyntaxError` | Build not run | Run `npm run build` |

### Linux-Specific Issues

| Issue | Solution |
|-------|----------|
| `npx: command not found` | Reinstall Node.js or add to PATH |
| nvm node not found | Use full nvm node path in config |
| Permission denied | `sudo chown -R $USER:$USER ~/.npm` |

---

## Verification Checklist

- [ ] `node --version` shows 18+
- [ ] `npm --version` shows 9+
- [ ] `npm run build` completes without errors
- [ ] `npm run inspector` opens browser tool
- [ ] MCP host shows tools available
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

| Application | Platform | Config Path |
|-------------|----------|-------------|
| Claude Desktop | macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop | Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Cursor | All | `~/.config/Cursor/User/globalStorage/cursor.mcp/config.json` |
| Claude Code | All | `~/.claude/settings.json` |

### Useful Commands

```bash
# Build this server
npm run build

# Test with inspector
npm run inspector

# Watch mode (auto-rebuild)
npm run dev

# Find node path
which node
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
- [Claude Desktop Download](https://claude.ai/download) (macOS/Windows only)
- [Cursor IDE](https://cursor.com) (All platforms)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
- [NodeSource (Node.js for Ubuntu)](https://github.com/nodesource/distributions)

---

Made with ❤️ by [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai)
