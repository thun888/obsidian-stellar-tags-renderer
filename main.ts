import { Plugin } from "obsidian";
import { Extension } from "@codemirror/state";
import {
  EmojiPluginSettings,
  DEFAULT_SETTINGS,
  EmojiSettingTab,
} from "./src/settings";
import { emojiPreviewPlugin, TagRenderer } from "./src/rendering";

export default class EmojiInlinePlugin extends Plugin {
  settings: EmojiPluginSettings;
  editorExtensions: Extension[] = [];
  renderers: Map<string, TagRenderer> = new Map();

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new EmojiSettingTab(this.app, this));
    this.registerEditorExtension(this.editorExtensions);
    this.updateEditorExtensions();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.updateEditorExtensions();
  }

  updateEditorExtensions() {
    this.editorExtensions.length = 0;
    this.editorExtensions.push(emojiPreviewPlugin(this.settings));
    this.app.workspace.updateOptions();
  }
}
