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

import { EmojiWidget, InlineLabelWidget, CheckboxRadioWidget, CopyWidget, NoteWidget, ImageWidget, HashtagWidget } from "./components";


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
