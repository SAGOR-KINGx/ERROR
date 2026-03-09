# Goat Bot V2 - Replit Setup

## Overview
A modular Facebook Messenger bot framework built with Node.js. It connects to Facebook Messenger using a personal account and a customized Facebook Chat API.

## Architecture
- **Entry Point**: `index.js` → spawns `Goat.js` as a child process (auto-restarts on exit code 2)
- **Bot Core**: `Goat.js` initializes global state, loads config, and starts the login flow
- **Commands**: `scripts/cmds/` — modular command files
- **Events**: `scripts/events/` — event listener files
- **Database**: SQLite (default), MongoDB, or JSON file storage via Sequelize/Mongoose
- **Facebook API**: `fb-chat-api/` — local, customized fork of the FB Chat API

## Configuration
- `config.json` — main bot settings (Facebook account, database type, prefix, admin list, etc.)
- `configCommands.json` — per-command configuration
- `account.txt` — Facebook appState/cookies (auto-generated)

## Key Notes
- **Node.js polyfill**: A `global.File` polyfill is added at the top of `Goat.js` to fix a compatibility issue with `undici` v7 on Node.js 18 (which doesn't expose `File` as a global)
- The bot needs a Facebook account configured in `config.json` to function
- Database defaults to SQLite, stored in `database/data/`
- The `serverUptime` feature uses Express on port 3001 (optional)

## Workflow
- **Start application**: `node index.js` (console output type)

## Deployment
- Target: `vm` (always-running, maintains long-lived connections to Facebook)
- Run: `node index.js`

## Dependencies
- Package manager: npm
- Runtime: Node.js 18.x
- Key packages: express, sequelize, sqlite3, mongoose, canvas, axios, socket.io
