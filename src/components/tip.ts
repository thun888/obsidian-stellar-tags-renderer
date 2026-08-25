import {WidgetType} from "@codemirror/view";

export class TipWidget extends WidgetType {
  constructor(readonly text: string, readonly content: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "tag-plugin tip";
    span.setAttribute("tabindex", "0");

    const textSpan = document.createElement("span");
    textSpan.className = "tip-text";
    textSpan.textContent = this.content;
    span.appendChild(textSpan);

    if (this.text.length > 0) {
      const bubbleSpan = document.createElement("span");
      bubbleSpan.className = "tip-bubble";
      bubbleSpan.setAttribute("role", "tooltip");
      bubbleSpan.textContent = this.text;
      span.appendChild(bubbleSpan);
    }

    return span;
  }

  ignoreEvent() {
    return false;
  }
}
