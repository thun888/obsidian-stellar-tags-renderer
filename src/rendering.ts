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

import { EmojiWidget, InlineLabelWidget, CheckboxRadioWidget, CopyWidget, NoteWidget, ImageWidget, HashtagWidget, TipWidget, DividerWidget, BoxWidget } from "./components";


// 渲染器接口
export interface TagRenderer {
  render(type: string, name: string): HTMLElement;
}

// 正则表达式
const EMOJI_REGEX = /\{\%\s*emoji\s+([^\%]+?)\s*\%\}/g;
const INLINE_LABELS_REGEX = /\{\%\s*(u|emp|wavy|del|sup|sub|kbd|blur|psw|mark)\s+([^\%\}]+?)(?:\s+color:\s*([^\s\%\}]+))?\s*\%\}/g;
const CHECKBOX_RADIO_REGEX = /\{\%\s*(checkbox|radio)\s+([^%\}]+)\s*\%\}/g;
const NOTE_REGEX = /\{\%\s*note\s+([^%\}]+)\s*\%\}/g;
const BOX_REGEX = /\{\%\s*box[ \t]+([^%\}\n]*?)[ \t]*%\}([\s\S]*?)\{\%\s*endbox[ \t]*%\}/gi;

/**
 * CodeMirror 6 不允许通过插件插入跨行的 replace 装饰（会抛
 * "Decorations that replace line breaks may not be specified via plugins"）。
 * 单行匹配：整段替换为 widget；
 * 跨行匹配：在首行替换开头标签为 widget，其余行用行装饰隐藏。
 */
function pushBlockDecoration(
  widgets: any[],
  view: EditorView,
  matchStart: number,
  matchEnd: number,
  openTagEnd: number,
  widget: WidgetType
) {
  const firstLine = view.state.doc.lineAt(matchStart);
  if (matchEnd <= firstLine.to) {
    widgets.push(Decoration.replace({widget}).range(matchStart, matchEnd));
    return;
  }
  widgets.push(
    Decoration.replace({widget}).range(matchStart, openTagEnd)
  );
  const lastLineNo = view.state.doc.lineAt(matchEnd - 1).number;
  for (let lineNo = firstLine.number + 1; lineNo <= lastLineNo; lineNo++) {
    widgets.push(
      Decoration.line({class: "stellar-hidden"}).range(
        view.state.doc.line(lineNo).from
      )
    );
  }
}
const COPY_REGEX = /\{\%\s*copy\s+([^%\}]+)\s*\%\}/g;
const IMAGE_REGEX = /\{\%\s*image\s+([^%\}]+)\s*\%\}/g;
const HASHTAG_REGEX = /\{\%\s*hashtag\s+([^%\}]+)\s*\%\}/g;
const TIP_REGEX = /\{\%\s*tip[ \t]+(?:text:[ \t]*([^%\}\n]+))?[ \t]*%\}([\s\S]*?)\{\%\s*endtip[ \t]*%\}/gi;
const DIVIDER_REGEX = /\{\%\s*divider\s+([^%]*)\%\}/g;


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
              const rawArgs = match[1].trim();
              const parts = rawArgs.split(/\s+/);
              const params: Record<string, string> = {};
              const positional: string[] = [];

              for (const part of parts) {
                if (part.includes(":")) {
                  const idx = part.indexOf(":");
                  const key = part.slice(0, idx);
                  const value = part.slice(idx + 1);
                  params[key] = value;
                } else {
                  positional.push(part);
                }
              }

              let type: string, name: string, directUrl: string | undefined, height: string | undefined;

              if (params.url) {
                // {% emoji url:http... [name:alt] [height:1.75em] %}
                directUrl = params.url;
                name = params.name || "";
                height = params.height;
                type = "";
              } else {
                // {% emoji [source] name [height:1.75em] %}
                if (positional.length >= 2) {
                  type = positional[0];
                  name = positional[1];
                } else if (positional.length === 1) {
                  // only one positional, treat as name with default source
                  const sources = this.settings.emojiSources;
                  const firstKey = Object.keys(sources)[0];
                  type = firstKey || "";
                  name = positional[0];
                } else {
                  type = "";
                  name = "";
                }
                height = params.height;
              }

              widgets.push(
                Decoration.replace({
                  widget: new EmojiWidget(type, name, this.settings, directUrl, height),
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

          // tip
          while ((match = TIP_REGEX.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const cursorInside =
              view.state.selection.main.from >= start &&
              view.state.selection.main.to <= end;

            if (!cursorInside) {
              const tipText = (match[1] || "").trim();
              const content = match[2].trim();
              const openTagEnd = start + match[0].indexOf("%}") + 2;
              pushBlockDecoration(
                widgets,
                view,
                start,
                end,
                openTagEnd,
                new TipWidget(tipText, content)
              );
            }
          }

          // box
          while ((match = BOX_REGEX.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const cursorInside =
              view.state.selection.main.from >= start &&
              view.state.selection.main.to <= end;

            if (!cursorInside) {
              const args = (match[1] || "").trim();
              const content = match[2] || "";
              const openTagEnd = start + match[0].indexOf("%}") + 2;
              pushBlockDecoration(
                widgets,
                view,
                start,
                end,
                openTagEnd,
                new BoxWidget(args, content)
              );
            }
          }

          // divider
          while ((match = DIVIDER_REGEX.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const cursorInside =
              view.state.selection.main.from >= start &&
              view.state.selection.main.to <= end;

            if (!cursorInside) {
              const rawArgs = match[1].trim();
              const parts = rawArgs.split(/\s+/);
              const params: Record<string, string> = {};
              let content = "";

              for (const part of parts) {
                if (part.includes(":")) {
                  const idx = part.indexOf(":");
                  const key = part.slice(0, idx);
                  const value = part.slice(idx + 1);
                  params[key] = value;
                } else {
                  content += (content ? " " : "") + part;
                }
              }

              if (!content) {
                continue;
              }

              const direction = params.direction || "";
              widgets.push(
                Decoration.replace({
                  widget: new DividerWidget(direction, content),
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
