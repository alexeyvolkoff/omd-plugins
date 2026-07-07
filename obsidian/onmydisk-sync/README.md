# OnMyDisk Sync for Obsidian

An [Obsidian](https://obsidian.md) plugin that syncs your notes to [OnMyDisk](https://onmydisk.ru) via WebDAV.

## Features

- **Sync all notes** — upload all markdown files to your OnMyDisk WebDAV endpoint
- **Sync current note** — upload only the active note
- **Auto-sync on save** — automatically upload notes whenever they are modified
- **Ribbon icon** — one-click sync from the sidebar
- **Test connection** — check if your WebDAV server is reachable

## Installation

### From the Obsidian Community Plugin Store (once published)

1. Open **Settings** → **Community plugins**
2. Disable **Safe mode**
3. Click **Browse** and search for **"OnMyDisk Sync"**
4. Install and enable the plugin

### Manual installation (BRAT or local)

1. Download `main.js`, `manifest.json`, and `styles.css` (if present) from the latest release
2. Copy them to your vault: `.obsidian/plugins/onmydisk-sync/`
3. Enable the plugin in **Settings** → **Community plugins**

## Configuration

Open **Settings** → **OnMyDisk Sync** and fill in:

| Setting | Description |
|---------|-------------|
| **WebDAV URL** | Your OnMyDisk WebDAV endpoint (e.g. `https://webdav.onmydisk.ru/`) |
| **Username** | WebDAV authentication username |
| **Password** | WebDAV authentication password |
| **Vault root folder** | Remote folder name where notes will be stored (default: `obsidian`) |
| **Auto-sync on save** | Toggle automatic upload on note modification |

## Commands

- `OnMyDisk Sync: Sync current note to OnMyDisk`
- `OnMyDisk Sync: Sync all notes to OnMyDisk`

## Development

```bash
# Install dependencies
npm install

# Build for development (watch mode)
npm run dev

# Build for production
npm run build
```

The compiled output is written to `main.js`.

## License

MIT
