import { Plugin, TFile, Notice } from "obsidian";
import {
  OnMyDiskSettings,
  OnMyDiskSettingTab,
  DEFAULT_SETTINGS,
} from "./settings";
import { WebDAVClient } from "./webdav";

export default class OnMyDiskPlugin extends Plugin {
  settings!: OnMyDiskSettings;
  private client: WebDAVClient | null = null;

  async onload() {
    await this.loadSettings();
    this.client = this.createClient();

    this.addRibbonIcon("cloud", "Sync all notes to OnMyDisk", () => {
      this.syncAllNotes();
    });

    this.addCommand({
      id: "sync-current-note",
      name: "Sync current note to OnMyDisk",
      callback: () => this.syncCurrentNote(),
    });

    this.addCommand({
      id: "sync-all-notes",
      name: "Sync all notes to OnMyDisk",
      callback: () => this.syncAllNotes(),
    });

    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (this.settings.syncOnSave && file instanceof TFile) {
          this.syncFile(file);
        }
      })
    );

    this.addSettingTab(new OnMyDiskSettingTab(this.app, this));
  }

  getClient(): WebDAVClient | null {
    return this.client;
  }

  private createClient(): WebDAVClient | null {
    if (!this.settings.webdavUrl) return null;
    return new WebDAVClient(
      this.settings.webdavUrl,
      this.settings.username,
      this.settings.password,
    );
  }

  async syncCurrentNote() {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice("No active note");
      return;
    }
    await this.syncFile(file);
  }

  async syncAllNotes() {
    if (!this.client) {
      new Notice("Configure WebDAV in settings first");
      return;
    }
    const files = this.app.vault.getMarkdownFiles();
    new Notice(`Syncing ${files.length} notes…`);
    for (const file of files) {
      await this.syncFile(file);
    }
    new Notice(`✅ Synced ${files.length} notes`);
  }

  async syncFile(file: TFile) {
    if (!this.client) return;
    try {
      const content = await this.app.vault.read(file);
      const remotePath = `${this.settings.vaultRoot}/${file.path}`;
      await this.client.put(remotePath, content);
    } catch (err) {
      console.error(`Failed to sync "${file.path}":`, err);
    }
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData(),
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.client = this.createClient();
  }
}
