import {WidgetType} from "@codemirror/view";

export class InlineLabelWidget extends WidgetType {
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