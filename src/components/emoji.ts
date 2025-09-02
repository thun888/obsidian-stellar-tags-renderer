import {WidgetType} from "@codemirror/view";
import { EmojiPluginSettings } from "../settings";


export class EmojiWidget extends WidgetType {
  constructor(
    readonly type: string,
    readonly name: string,
    readonly settings: EmojiPluginSettings
  ) {
    super();
  }

  toDOM() {
    const img = document.createElement("img");
    const urlTemplate = this.settings.emojiSources[this.type];

    if (urlTemplate) {
      img.src = urlTemplate.replace("{name}", this.name);
    } else {
      img.src = "";
      img.title = `Unknown emoji type: ${this.type}`;
    }

    img.alt = this.name;
    img.style.width = "1.8rem";
    img.style.verticalAlign = "middle";
    img.style.margin = "0 2px";
    return img;
  }

  ignoreEvent() {
    return false;
  }
}

