import {WidgetType} from "@codemirror/view";

export class CheckboxRadioWidget extends WidgetType {
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