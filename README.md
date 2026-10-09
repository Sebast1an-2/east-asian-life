# 东亚小孩的一生 · V0.1

## 运行

直接双击 `index.html`，用 Chrome 或 Edge 打开。不需要安装依赖。
也可以在此目录运行 `python -m http.server 8000`（需要已安装 Python），然后打开 http://localhost:8000 。
直接打开文件时，部分浏览器会限制本地存储；如出现保存提示异常，请使用上面的本地服务器。
不同浏览器、文件地址和服务器地址的存档相互独立。存档不会上传网络。

## 文件分工

- `index.html`：页面结构和脚本加载顺序。
- `style.css`：颜色、间距、布局。
- `player.js`：Player、人生阶段和 World 初始数据，以及未来 NPC 结构说明。
- `events.js`：8 个测试事件，修改剧情先看这里。
- `engine.js`：事件筛选、排序、加权随机、冷却、属性变化和 History 记录。
- `app.js`：按钮、页面渲染、localStorage 存档与恢复。
- `tests.cjs`：用 Node.js 检查引擎，运行 `node tests.cjs`。

为了双击就能运行，这里用普通脚本按顺序加载，没有使用需要服务器的 ES Modules。
本版金钱可以为负数；自主性隐藏。没有经济、就业或升学模拟，阶段主要根据年龄切换。
无事件时可继续长大；80 岁结束用于验证总结流程，不是完整寿命模型。

## 第一次测试

1. 开始人生，选完出生事件后才能长大；留意属性、标签和历史变化。
2. 8 岁体验 95 分，13 岁选兴趣，17 岁模拟考，19 岁选专业，21 岁回家时看到旧试卷的后续。
3. 选择前、选择后分别刷新网页，检查年龄、待选事件、选择结果和历史是否保留。
4. 一直推进到 80 岁，查看总结；重新投胎后检查是否回到 0 岁。

## 添加事件

复制 `events.js` 中一个事件，使用新的事件 id 和 choice id。
conditions 支持 minAge/maxAge、lifeStages、tagsAll、tagsNone、historyEventIds，
以及 stats（例如 `stats: { stress: { min: 50 } }`）。
category 按 milestone、followup、conditional、random 的顺序筛选；
前三类使用 priority，random 使用 weight。冷却单位为年。
不要把两个必然事件设为同一年龄，本版每年只展示一个事件。
choice 的 effects 是增减值；addTags/removeTags 是标签数组；importance 取 0～3。

## 静态部署

整个目录可发布到静态托管平台。Vercel 不需要构建命令或框架，保留根目录 index.html 即可。
本轮未部署，也没有接入 LLM、账户或服务器。
