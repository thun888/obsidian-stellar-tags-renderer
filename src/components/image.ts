import {WidgetType} from "@codemirror/view";


export class ImageWidget extends WidgetType {
  constructor(readonly args: string) {
    super();
  }

  toDOM() {
    const args = this.args.split(" ");
    const params: Record<string, string> = {};
    let src = "";
    let alt = "";
    for (const arg of args) {
      if (arg.includes(":") && !arg.includes("://") || arg.includes("download:http")) {
        const [key, value] = arg.split(":");
        params[key] = value;
      } else {
        if (!src) {
          src = arg;
        } else {
          alt += ` ${arg}`;
        }
      }
    }
    alt = alt.trim();

    const div = document.createElement("div");
    div.className = "tag-plugin image";

    const bgDiv = document.createElement("div");
    bgDiv.className = "image-bg";
    let style = "";
    if (params.bg) {
      style += `background:${params.bg};`;
    }
    if (params.padding) {
      style += `padding:${params.padding};`;
    }
    if (params.ratio) {
      style += `aspect-ratio:${params.ratio};`;
    }
    if (params.width) {
      style += `width:${params.width};`;
    }
    if (style) {
      bgDiv.setAttribute("style", style);
    }

    const img = document.createElement("img");
    img.className = "lazy";
    img.src = src;
    img.dataset.src = src;
    if (alt) {
      img.alt = alt;
    }

    bgDiv.appendChild(img);

    if (params.download) {
      const a = document.createElement("a");
      a.className = "image-download blur";
      a.style.opacity = "0";
      a.target = "_blank";
      if (params.download === "true") {
        a.href = src;
      } else {
        a.href = params.download;
      }
      if (alt) {
        a.download = alt;
      }
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "icon");
      svg.setAttribute("style", "width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;");
      svg.setAttribute("viewBox", "0 0 1024 1024");
      svg.setAttribute("version", "1.1");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M561.00682908 685.55838913a111.03077546 111.03077546 0 0 1-106.8895062 0L256.23182837 487.72885783a55.96309219 55.96309219 0 0 1 79.13181253-79.18777574L450.70357448 523.88101491V181.55477937a55.96309219 55.96309219 0 0 1 111.92618438 0v344.06109173l117.07478902-117.07478901a55.96309219 55.96309219 0 0 1 79.13181252 79.18777574zM282.81429711 797.1487951h447.70473912a55.96309219 55.96309219 0 0 1 0 111.92618438H282.81429711a55.96309219 55.96309219 0 0 1 0-111.92618438z");
      svg.appendChild(path);
      a.appendChild(svg);
      bgDiv.appendChild(a);
    }

    div.appendChild(bgDiv);

    if (alt) {
      const metaDiv = document.createElement("div");
      metaDiv.className = "image-meta";
      const captionSpan = document.createElement("span");
      captionSpan.className = "image-caption center";
      captionSpan.textContent = alt;
      metaDiv.appendChild(captionSpan);
      div.appendChild(metaDiv);
    }

    return div;
  }

  ignoreEvent() {
    return false;
  }
}