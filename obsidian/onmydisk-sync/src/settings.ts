import { App, PluginSettingTab, Setting } from "obsidian";
import type OnMyDiskPlugin from "./main";

export interface OnMyDiskSettings {
  webdavUrl: string;
  username: string;
  password: string;
  syncOnSave: boolean;
  vaultRoot: string;
}

export const DEFAULT_SETTINGS: OnMyDiskSettings = {
  webdavUrl: "",
  username: "",
  password: "",
  syncOnSave: false,
  vaultRoot: "obsidian",
};

export class OnMyDiskSettingTab extends PluginSettingTab {
  plugin: OnMyDiskPlugin;

  constructor(app: App, plugin: OnMyDiskPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "OnMyDisk Sync" });

    new Setting(containerEl)
      .setName("WebDAV URL")
      .setDesc("OnMyDisk WebDAV endpoint (e.g. https://webdav.onmydisk.com/)")
      .addText((text) =>
        text
          .setPlaceholder("https://...")
          .setValue(this.plugin.settings.webdavUrl)
          .onChange(async (val) => {
            this.plugin.settings.webdavUrl = val;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Username")
      .setDesc("WebDAV username")
      .addText((text) =>
        text
          .setPlaceholder("username")
          .setValue(this.plugin.settings.username)
          .onChange(async (val) => {
            this.plugin.settings.username = val;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Password")
      .setDesc("WebDAV password")
      .addText((text) =>
        text
          .setPlaceholder("••••••••")
          .setInputType("password")
          .setValue(this.plugin.settings.password)
          .onChange(async (val) => {
            this.plugin.settings.password = val;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Vault root folder")
      .setDesc("Remote folder name where notes will be stored")
      .addText((text) =>
        text
          .setPlaceholder("obsidian")
          .setValue(this.plugin.settings.vaultRoot)
          .onChange(async (val) => {
            this.plugin.settings.vaultRoot = val;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Auto-sync on save")
      .setDesc("Automatically upload notes to OnMyDisk when saved")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.syncOnSave)
          .onChange(async (val) => {
            this.plugin.settings.syncOnSave = val;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Test connection")
      .setDesc("Check if the WebDAV server is reachable")
      .addButton((btn) =>
        btn.setButtonText("Test").onClick(async () => {
          btn.setDisabled(true);
          btn.setButtonText("⏳ Testing…");
          const client = this.plugin.getClient();
          if (!client) {
            btn.setButtonText("❗ Configure URL first");
            setTimeout(() => {
              btn.setButtonText("Test");
              btn.setDisabled(false);
            }, 2500);
            return;
          }
          const ok = await client.testConnection();
          btn.setButtonText(ok ? "✅ Connected" : "❌ Failed");
          setTimeout(() => {
            btn.setButtonText("Test");
            btn.setDisabled(false);
          }, 2500);
        })
      );
  }
}
