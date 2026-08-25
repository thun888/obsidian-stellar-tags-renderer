import {WidgetType} from "@codemirror/view";
import { EmojiPluginSettings } from "../settings";


export class EmojiWidget extends WidgetType {
  constructor(
    readonly type: string,
    readonly name: string,
    readonly settings: EmojiPluginSettings,
    readonly directUrl?: string,
    readonly height?: string
  ) {
    super();
  }

  toDOM() {
    const img = document.createElement("img");

    if (this.directUrl) {
      img.src = this.directUrl;
      if (this.name) {
        img.alt = this.name;
      }
    } else {
      const urlTemplate = this.settings.emojiSources[this.type];
      if (urlTemplate && this.name) {
        img.src = urlTemplate.replace("{name}", this.name);
        img.alt = this.name;
      } else {
        img.src = "";
        img.title = `Unknown emoji type: ${this.type}`;
      }
    }

    if (this.height) {
      img.style.height = this.height;
    } else {
      img.style.width = "1.8rem";
    }
    img.style.verticalAlign = "middle";
    img.style.margin = "0 2px";
    return img;
  }

  ignoreEvent() {
    return false;
  }
}

