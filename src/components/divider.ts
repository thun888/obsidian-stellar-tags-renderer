import {WidgetType} from "@codemirror/view";

export class DividerWidget extends WidgetType {
  constructor(readonly direction: string, readonly content: string) {
    super();
  }

  toDOM() {
    const container = document.createElement("div");
    container.className = "divider-container";

    if (this.direction === "right" || this.direction === "center") {
      const lineLeft = document.createElement("div");
      lineLeft.className = "divider-line";
      container.appendChild(lineLeft);
    }

    const textSpan = document.createElement("span");
    textSpan.className = "divider-text";
    textSpan.textContent = this.content;
    container.appendChild(textSpan);

    if (this.direction === "left" || this.direction === "center") {
      const lineRight = document.createElement("div");
      lineRight.className = "divider-line";
      container.appendChild(lineRight);
    }

    return container;
  }

  ignoreEvent() {
    return false;
  }
}
