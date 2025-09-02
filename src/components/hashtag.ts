import {WidgetType} from "@codemirror/view";

export class HashtagWidget extends WidgetType {
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