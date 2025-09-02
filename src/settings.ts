import { App, PluginSettingTab, Setting, ButtonComponent } from "obsidian";
import EmojiInlinePlugin from "../main";

// --- 设置项的接口和默认值 ---
export interface EmojiPluginSettings {
  emojiSources: Record<string, string>;
  renderInLivePreview: boolean;
}

export const DEFAULT_SETTINGS: EmojiPluginSettings = {
  emojiSources: {},
  renderInLivePreview: true,
};

// --- 设置面板 (UI布局修正版) ---
export class EmojiSettingTab extends PluginSettingTab {
  plugin: EmojiInlinePlugin;

  constructor(app: App, plugin: EmojiInlinePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Emoji Inline Settings" });

    new Setting(containerEl)
      .setName("在实时预览中渲染")
      .setDesc("是否在实时预览模式下渲染标签。")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.renderInLivePreview)
          .onChange(async (value) => {
            this.plugin.settings.renderInLivePreview = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Emoji Sources" });
    containerEl.createEl("p", {
      text: "管理表情来源的URL模板。URL中的 {name} 会被替换为表情的具体名称。",
    });

    // 遍历并显示所有已存在的表情源
    Object.entries(this.plugin.settings.emojiSources).forEach(
      ([key, value]) => {
        const itemContainer = containerEl.createDiv({ cls: "setting-item" });
        const controlContainer = itemContainer.createDiv({
          cls: "setting-item-control",
        });

        // Key (Type) 输入框
        const keyText = document.createElement("input");
        keyText.type = "text";
        keyText.placeholder = "类型 (e.g. neko)";
        keyText.value = key;
        keyText.style.width = "150px";
        keyText.style.marginRight = "10px";
        keyText.onchange = async (e) => {
          const newKey = (e.target as HTMLInputElement).value.trim();
          if (newKey && newKey !== key) {
            const newSources = { ...this.plugin.settings.emojiSources };
            delete newSources[key];
            newSources[newKey] = value;
            this.plugin.settings.emojiSources = newSources;
            await this.plugin.saveSettings();
            this.display();
          }
        };
        controlContainer.appendChild(keyText);

        // Value (URL) 输入框
        const valueText = document.createElement("input");
        valueText.type = "text";
        valueText.placeholder = "URL 模板";
        valueText.value = value;
        valueText.style.flex = "1";
        valueText.style.marginRight = "10px";
        valueText.onchange = async (e) => {
          const newValue = (e.target as HTMLInputElement).value.trim();
          this.plugin.settings.emojiSources[key] = newValue;
          await this.plugin.saveSettings();
        };
        controlContainer.appendChild(valueText);

        // 删除按钮
        new ButtonComponent(controlContainer)
          .setIcon("trash")
          .setTooltip("删除此项")
          .onClick(async () => {
            delete this.plugin.settings.emojiSources[key];
            await this.plugin.saveSettings();
            this.display();
          });
      }
    );

    // 添加新表情源的按钮
    new Setting(containerEl).addButton((button) => {
      button
        .setButtonText("添加新的表情源")
        .setCta()
        .onClick(async () => {
          const newKey = "";
          this.plugin.settings.emojiSources[newKey] = "";
          await this.plugin.saveSettings();
          this.display();
        });
    });
  }
}
