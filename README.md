# obsidian-stellar-tags-renderer

在 Obsidian 实时预览中渲染 Hexo Stellar 主题的标签语法。

## 支持的标签

### emoji

从配置的表情源加载图片，或直接指定 URL。

```text
{% emoji [source] name [height:1.75em] %}
{% emoji url:http... [name:alt] [height:1.75em] %}
```

- `source`: 表情源类型（可选），对应设置面板中的 Key；省略时自动使用第一个已配置的源
- `name`: 表情名称（必填）
- `url`: 直接指定图片 URL，存在时不再查找 source 配置
- `height`: 图片高度（可选），默认 `1.8rem`

示例：`{% emoji neko happy %}`、`{% emoji url:https://example.com/emoji.png name:alt height:2em %}`

### inline-label

行内文本标记，支持可选颜色参数。

```text
{% tag content color:red %}
```

支持的标签类型：

| 标签 | HTML 元素 | 说明 |
|------|-----------|------|
| u    | `<u>`     | 下划线 |
| emp  | `<em>`    | 斜体 |
| wavy | `<wavy>`  | 波浪线 |
| del  | `<del>`   | 删除线 |
| sup  | `<sup>`   | 上标 |
| sub  | `<sub>`   | 下标 |
| kbd  | `<kbd>`   | 键盘样式 |
| blur | `<blur>`  | 模糊 |
| psw  | `<psw>`   | 密码隐藏 |
| mark | `<mark>`  | 高亮 |

示例：`{% u Hello %}`、`{% mark important color:orange %}`

### checkbox / radio

```text
{% type text color:red symbol:xxx checked:true %}
```

- `type`: `checkbox` 或 `radio`
- `color`: 颜色（可选）
- `symbol`: 符号标识（可选）
- `checked`: 是否默认选中，值为 `true`（可选）

示例：`{% checkbox Done color:green %}`、`{% radio Option A checked:true %}`

### note

提示框。第一个非键值参数作为标题，其余作为内容；若只有一个参数则作为内容。

```text
{% note title content color:red %}
```

- `color`: 颜色（可选）

示例：`{% note Info This is a tip color:blue %}`、`{% note Just content %}`

### copy

可复制的文本框，支持 GitHub URL 格式化。

```text
{% copy text git:type prefix:text %}
```

- `git`: GitHub URL 格式，可选值：
  - `https` → `https://github.com/text.git`
  - `ssh` → `git@github.com:text.git`
  - `gh` → `gh repo clone text`
- `prefix`: 显示在输入框前的前缀文本（可选）

示例：`{% copy thun888/repo git:ssh %}`、`{% copy some text prefix:Copy this: %}`

### image

带样式的图片展示。

```text
{% image src alt bg:#fff padding:10px ratio:16/9 width:300px download:true %}
```

- `src`: 图片地址（必填）
- `alt`: 替代文本，显示为图注（可选）
- `bg`: 背景样式（可选）
- `padding`: 内边距（可选）
- `ratio`: 宽高比（可选）
- `width`: 宽度（可选）
- `download`: 是否添加下载链接，值为 `true` 或具体 URL（可选）

示例：`{% image https://example.com/pic.png A photo width:200px %}`、`{% image https://example.com/pic.png download:http://other.com/file.zip %}`

### hashtag

带图标的标签链接。

```text
{% hashtag text href:url color:red %}
```

- `text`: 显示文本（必填）
- `href`: 链接地址（可选）
- `color`: 颜色，可选值：`red`、`orange`、`yellow`、`green`、`cyan`、`blue`、`purple`；不指定时随机选择

示例：`{% hashtag #obsidian href:https://obsidian.md color:blue %}`、`{% hashtag #tag %}`

### tip

带提示气泡的文本，支持跨行内容。

```text
{% tip text:提示文字 %}显示内容{% endtip %}
```

- `text`: 悬停/聚焦时显示的提示文字（可选）
- 标签之间的内容为正文显示部分

示例：`{% tip text:这是一个注解 %}重要词句{% endtip %}`、`{% tip %}纯文本{% endtip %}`

## 设置

### 在实时预览中渲染

控制是否在实时预览模式下渲染标签。默认开启。

### Emoji Sources

管理表情来源的 URL 模板。URL 中的 `{name}` 会被替换为表情的具体名称。

- **Key**: 类型标识（如 `neko`、`qq`）
- **Value**: URL 模板（如 `https://emoticons.hzchu.top/emoticons/neko/{name}.png`）

## 安装

### 从源码构建

```bash
pnpm install
pnpm run build
```

将插件文件夹放入 Obsidian 的 `.obsidian/plugins/` 目录，在设置中启用插件。
