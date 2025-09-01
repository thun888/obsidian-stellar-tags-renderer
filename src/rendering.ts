import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { editorLivePreviewField } from "obsidian";
import { EmojiPluginSettings } from "./settings";

// 渲染器接口
export interface TagRenderer {
  render(type: string, name: string): HTMLElement;
}

// 正则表达式
const EMOJI_REGEX = /\{\%\s*emoji\s+([^\s]+)\s+([^\s]+)\s*\%\}/g;
const INLINE_LABELS_REGEX = /\{\%\s*(u|emp|wavy|del|sup|sub|kbd|blur|psw|mark)\s+([^\%\}]+?)(?:\s+color:\s*([^\s\%\}]+))?\s*\%\}/g;
const CHECKBOX_RADIO_REGEX = /\{\%\s*(checkbox|radio)\s+([^%\}]+)\s*\%\}/g;
const NOTE_REGEX = /\{\%\s*note\s+([^%\}]+)\s*\%\}/g;
const COPY_REGEX = /\{\%\s*copy\s+([^%\}]+)\s*\%\}/g;
const IMAGE_REGEX = /\{\%\s*image\s+([^%\}]+)\s*\%\}/g;
const HASHTAG_REGEX = /\{\%\s*hashtag\s+([^%\}]+)\s*\%\}/g;

class EmojiWidget extends WidgetType {
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

class InlineLabelWidget extends WidgetType {
  constructor(
    readonly tag: string,
    readonly text: string,
    readonly color?: string
  ) {
    super();
  }

  toDOM() {
    const span = document.createElement(this.tag);
    span.textContent = this.text;
    span.className = `tag-plugin colorful ${this.tag}`;
    if (this.color) {
      span.setAttribute("color", this.color);
    }
    return span;
  }

  ignoreEvent() {
    return false;
  }
}

class CheckboxRadioWidget extends WidgetType {
  constructor(readonly type: string, readonly args: string) {
    super();
  }

  toDOM() {
    const args = this.args.split(" ");
    const params: Record<string, string> = {};
    let text = "";
    for (const arg of args) {
      if (arg.includes(":")) {
        const [key, value] = arg.split(":");
        params[key] = value;
      } else {
        text += ` ${arg}`;
      }
    }
    text = text.trim();

    const div = document.createElement("div");
    div.className = `tag-plugin colorful ${this.type}`;
    if (params.color) {
      div.setAttribute("color", params.color);
    }
    if (params.symbol) {
      div.setAttribute("symbol", params.symbol);
    }

    const input = document.createElement("input");
    input.type = this.type;
    if (params.checked === "true") {
      input.setAttribute("checked", "");
    }

    const span = document.createElement("span");
    span.textContent = text;

    div.appendChild(input);
    div.appendChild(span);

    return div;
  }

  ignoreEvent() {
    return false;
  }
}

class NoteWidget extends WidgetType {
  constructor(readonly args: string) {
    super();
  }

  toDOM() {
    const args = this.args.split(" ");
    const params: Record<string, string> = {};
    let title = "";
    let content = "";
    let hasTitle = false;

    for (const arg of args) {
      if (arg.includes(":")) {
        const [key, value] = arg.split(":");
        params[key] = value;
      } else {
        if (!hasTitle) {
          title = arg;
          hasTitle = true;
        } else {
          content += ` ${arg}`;
        }
      }
    }
    content = content.trim();

    if (content.length === 0) {
      content = title;
      title = "";
    }
    title = title.replace(/&nbsp;/g, " ");
    const div = document.createElement("div");
    div.className = "tag-plugin colorful note";
    if (params.color) {
      div.setAttribute("color", params.color);
    }

    if (title.length > 0) {
      const titleDiv = document.createElement("div");
      titleDiv.className = "title";
      titleDiv.textContent = title;
      div.appendChild(titleDiv);
    }

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "body";
    bodyDiv.textContent = content;
    div.appendChild(bodyDiv);

    return div;
  }

  ignoreEvent() {
    return false;
  }
}

class CopyWidget extends WidgetType {
  constructor(readonly args: string) {
    super();
  }

  toDOM() {
    const args = this.args.split(" ");
    const params: Record<string, string> = {};
    let text = "";
    for (const arg of args) {
      if (arg.includes(":")) {
        const [key, value] = arg.split(":");
        params[key] = value;
      } else {
        text += ` ${arg}`;
      }
    }
    text = text.trim();

    if (params.git) {
      if (text.startsWith("/")) {
        text = text.substring(1);
      }
      if (params.git === "ssh") {
        text = `git@github.com:${text}.git`;
      } else if (params.git === "gh") {
        text = `gh repo clone ${text}`;
      } else {
        text = `https://github.com/${text}.git`;
      }
    }

    const div = document.createElement("div");
    div.className = "tag-plugin copy";

    if (params.prefix) {
      const span = document.createElement("span");
      span.textContent = params.prefix;
      div.appendChild(span);
    }

    const input = document.createElement("input");
    input.className = "copy-area";
    input.value = text;
    const copyId = `copy_${Date.now()}`;
    input.id = copyId;
    div.appendChild(input);

    const button = document.createElement("button");
    button.className = "copy-btn";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon copy-btn");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute(
      "d",
      "M5.75 1a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-4.5zm.75 3V2.5h3V4h-3zm-2.874-.467a.75.75 0 00-.752-1.298A1.75 1.75 0 002 3.75v9.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-9.5a1.75 1.75 0 00-.874-1.515.75.75 0 10-.752 1.298.25.25 0 01.126.217v9.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-9.5a.25.25 0 01.126-.217z"
    );
    svg.appendChild(path);
    button.appendChild(svg);
    div.appendChild(button);

    return div;
  }

  ignoreEvent() {
    return false;
  }
}

class ImageWidget extends WidgetType {
  constructor(readonly args: string) {
    super();
  }

  toDOM() {
    const args = this.args.split(" ");
    const params: Record<string, string> = {};
    let src = "";
    let alt = "";
    for (const arg of args) {
      if (arg.includes(":") && !arg.includes("://") || arg.includes("download:http")) {
        const [key, value] = arg.split(":");
        params[key] = value;
      } else {
        if (!src) {
          src = arg;
        } else {
          alt += ` ${arg}`;
        }
      }
    }
    alt = alt.trim();

    const div = document.createElement("div");
    div.className = "tag-plugin image";

    const bgDiv = document.createElement("div");
    bgDiv.className = "image-bg";
    let style = "";
    if (params.bg) {
      style += `background:${params.bg};`;
    }
    if (params.padding) {
      style += `padding:${params.padding};`;
    }
    if (params.ratio) {
      style += `aspect-ratio:${params.ratio};`;
    }
    if (params.width) {
      style += `width:${params.width};`;
    }
    if (style) {
      bgDiv.setAttribute("style", style);
    }

    const img = document.createElement("img");
    img.className = "lazy";
    img.src = src;
    img.dataset.src = src;
    if (alt) {
      img.alt = alt;
    }

    bgDiv.appendChild(img);

    if (params.download) {
      const a = document.createElement("a");
      a.className = "image-download blur";
      a.style.opacity = "0";
      a.target = "_blank";
      if (params.download === "true") {
        a.href = src;
      } else {
        a.href = params.download;
      }
      if (alt) {
        a.download = alt;
      }
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "icon");
      svg.setAttribute("style", "width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;");
      svg.setAttribute("viewBox", "0 0 1024 1024");
      svg.setAttribute("version", "1.1");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M561.00682908 685.55838913a111.03077546 111.03077546 0 0 1-106.8895062 0L256.23182837 487.72885783a55.96309219 55.96309219 0 0 1 79.13181253-79.18777574L450.70357448 523.88101491V181.55477937a55.96309219 55.96309219 0 0 1 111.92618438 0v344.06109173l117.07478902-117.07478901a55.96309219 55.96309219 0 0 1 79.13181252 79.18777574zM282.81429711 797.1487951h447.70473912a55.96309219 55.96309219 0 0 1 0 111.92618438H282.81429711a55.96309219 55.96309219 0 0 1 0-111.92618438z");
      svg.appendChild(path);
      a.appendChild(svg);
      bgDiv.appendChild(a);
    }

    div.appendChild(bgDiv);

    if (alt) {
      const metaDiv = document.createElement("div");
      metaDiv.className = "image-meta";
      const captionSpan = document.createElement("span");
      captionSpan.className = "image-caption center";
      captionSpan.textContent = alt;
      metaDiv.appendChild(captionSpan);
      div.appendChild(metaDiv);
    }

    return div;
  }

  ignoreEvent() {
    return false;
  }
}

class HashtagWidget extends WidgetType {
  constructor(readonly args: string) {
    super();
  }

  toDOM() {
    const args = this.args.split(" ");
    const params: Record<string, string> = {};
    let text = "";
    let href = "";
    for (const arg of args) {
      if (arg.includes(":")) {
        const [key, value] = arg.split(":");
        params[key] = value;
      } else {
        if (!text) {
          text = arg;
        } else {
          href = arg;
        }
      }
    }

    const a = document.createElement("a");
    a.className = "tag-plugin colorful hashtag";
    if (params.color) {
      a.setAttribute("color", params.color);
    }else{
      const tag_colors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple']
      // 随机
      const randomIndex = Math.floor(Math.random() * tag_colors.length);
      const randomColor = tag_colors[randomIndex];
      a.setAttribute("color", randomColor);
    }
    a.href = href;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("t", "1701408144765");
    svg.setAttribute("class", "icon");
    svg.setAttribute("viewBox", "0 0 1024 1024");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("p-id", "4228");
    svg.setAttribute("width", "200");
    svg.setAttribute("height", "200");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M426.6 64.8c34.8 5.8 58.4 38.8 52.6 73.6l-19.6 117.6h190.2l23-138.6c5.8-34.8 38.8-58.4 73.6-52.6s58.4 38.8 52.6 73.6l-19.4 117.6H896c35.4 0 64 28.6 64 64s-28.6 64-64 64h-137.8l-42.6 256H832c35.4 0 64 28.6 64 64s-28.6 64-64 64h-137.8l-23 138.6c-5.8 34.8-38.8 58.4-73.6 52.6s-58.4-38.8-52.6-73.6l19.6-117.4h-190.4l-23 138.6c-5.8 34.8-38.8 58.4-73.6 52.6s-58.4-38.8-52.6-73.6l19.4-117.8H128c-35.4 0-64-28.6-64-64s28.6-64 64-64h137.8l42.6-256H192c-35.4 0-64-28.6-64-64s28.6-64 64-64h137.8l23-138.6c5.8-34.8 38.8-58.4 73.6-52.6z m11.6 319.2l-42.6 256h190.2l42.6-256h-190.2z");
    path.setAttribute("p-id", "4229");
    svg.appendChild(path);
    a.appendChild(svg);

    const span = document.createElement("span");
    span.textContent = text;
    a.appendChild(span);

    return a;
  }

  ignoreEvent() {
    return false;
  }
}


// --- CodeMirror 6 视图插件 ---
export const emojiPreviewPlugin = (settings: EmojiPluginSettings) =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      settings: EmojiPluginSettings;

      constructor(view: EditorView) {
        this.settings = settings;
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.selectionSet ||
          update.viewportChanged ||
          update.state.field(editorLivePreviewField) !==
            update.startState.field(editorLivePreviewField)
        ) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        if (!this.settings.renderInLivePreview && view.state.field(editorLivePreviewField)) {
          return Decoration.none;
        }

        if (!view.state.field(editorLivePreviewField)) {
          return Decoration.none;
        }

        const widgets: any[] = [];
        for (const { from, to } of view.visibleRanges) {
          const text = view.state.doc.sliceString(from, to);
          let match;

          // emoji
          while ((match = EMOJI_REGEX.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const cursorInside =
              view.state.selection.main.from >= start &&
              view.state.selection.main.to <= end;

            if (!cursorInside) {
              const type = match[1];
              const name = match[2];
              widgets.push(
                Decoration.replace({
                  widget: new EmojiWidget(type, name, this.settings),
                }).range(start, end)
              );
            }
          }

          // inline labels
          while ((match = INLINE_LABELS_REGEX.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const cursorInside =
              view.state.selection.main.from >= start &&
              view.state.selection.main.to <= end;

            if (!cursorInside) {
              const tag = match[1];
              const content = match[2];
              const color = match[3];
              widgets.push(
                Decoration.replace({
                  widget: new InlineLabelWidget(tag, content, color),
                }).range(start, end)
              );
            }
          }

          // checkbox and radio
          while ((match = CHECKBOX_RADIO_REGEX.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const cursorInside =
              view.state.selection.main.from >= start &&
              view.state.selection.main.to <= end;

            if (!cursorInside) {
              const type = match[1];
              const args = match[2];
              widgets.push(
                Decoration.replace({
                  widget: new CheckboxRadioWidget(type, args),
                }).range(start, end)
              );
            }
          }

          // note
          while ((match = NOTE_REGEX.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const cursorInside =
              view.state.selection.main.from >= start &&
              view.state.selection.main.to <= end;

            if (!cursorInside) {
              const args = match[1];
              widgets.push(
                Decoration.replace({
                  widget: new NoteWidget(args),
                }).range(start, end)
              );
            }
          }

          // copy
          while ((match = COPY_REGEX.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const cursorInside =
              view.state.selection.main.from >= start &&
              view.state.selection.main.to <= end;

            if (!cursorInside) {
              const args = match[1];
              widgets.push(
                Decoration.replace({
                  widget: new CopyWidget(args),
                }).range(start, end)
              );
            }
          }

          // image
          while ((match = IMAGE_REGEX.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const cursorInside =
              view.state.selection.main.from >= start &&
              view.state.selection.main.to <= end;

            if (!cursorInside) {
              const args = match[1];
              widgets.push(
                Decoration.replace({
                  widget: new ImageWidget(args),
                }).range(start, end)
              );
            }
          }

          // hashtag
          while ((match = HASHTAG_REGEX.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const cursorInside =
              view.state.selection.main.from >= start &&
              view.state.selection.main.to <= end;

            if (!cursorInside) {
              const args = match[1];
              widgets.push(
                Decoration.replace({
                  widget: new HashtagWidget(args),
                }).range(start, end)
              );
            }
          }
        }
        return Decoration.set(widgets, true);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
