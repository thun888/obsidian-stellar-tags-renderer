import {WidgetType} from "@codemirror/view";

export class OrWidget extends WidgetType {
  constructor(readonly args: string) {
    super();
  }

  toDOM() {
    const items = this.args.split(/\s+/).filter((item) => item);

    const root = document.createElement("span");

    items.forEach((item, i) => {
      const itemSpan = document.createElement("span");
      itemSpan.className = "or-item";
      itemSpan.textContent = item;
      root.appendChild(itemSpan);

      if (i < items.length - 1) {
        const sepSpan = document.createElement("span");
        sepSpan.className = "or-sep";
        sepSpan.textContent = "/";
        root.appendChild(sepSpan);
      }
    });

    return root;
  }

  ignoreEvent() {
    return false;
  }
}