import {WidgetType} from "@codemirror/view";

export class CopyWidget extends WidgetType {
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