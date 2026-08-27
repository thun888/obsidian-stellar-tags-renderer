import {WidgetType} from "@codemirror/view";

export class BoxWidget extends WidgetType {
  private readonly params: Record<string, string> = {};
  private readonly title: string;
  private readonly lines: string[];

  constructor(readonly args: string, readonly content: string) {
    super();

    const parts = this.args.trim().split(/\s+/).filter((p) => p.length > 0);
    let hasTitle = false;
    for (const part of parts) {
      const idx = part.indexOf(":");
      if (idx > 0) {
        this.params[part.slice(0, idx)] = part.slice(idx + 1);
      } else if (!hasTitle) {
        this.title = part;
        hasTitle = true;
      }
    }
    this.title = this.title.replace(/&nbsp;/g, " ");
    this.lines = this.content.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  }

  // widget 实际占据多行，给 CodeMirror 一个高度估计，避免滚动条/高度测量异常
  get estimatedHeight(): number {
    return this.lines.length * 21 + (this.title.length > 0 ? 30 : 0) + 10;
  }

  toDOM() {
    const div = document.createElement("div");
    div.className = "tag-plugin colorful note";
    if (this.params.color) {
      div.setAttribute("color", this.params.color);
    }
    if (this.params.child) {
      div.setAttribute("child", this.params.child);
    }

    if (this.title.length > 0) {
      const titleDiv = document.createElement("div");
      titleDiv.className = "title";
      const strong = document.createElement("strong");
      strong.textContent = this.title;
      titleDiv.appendChild(strong);
      div.appendChild(titleDiv);
    }

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "body";
    for (const text of this.lines) {
      const p = document.createElement("p");
      p.textContent = text;
      bodyDiv.appendChild(p);
    }
    div.appendChild(bodyDiv);

    return div;
  }

  ignoreEvent() {
    return false;
  }
}
