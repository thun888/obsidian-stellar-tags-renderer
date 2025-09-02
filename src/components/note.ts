import {WidgetType} from "@codemirror/view";

export class NoteWidget extends WidgetType {
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