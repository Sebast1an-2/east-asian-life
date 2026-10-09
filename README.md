# 东亚小孩的一生 · V0.2 开发中

## 运行

直接双击 `index.html`，用 Chrome 或 Edge 打开。不需要安装依赖。
也可以在此目录运行 `python -m http.server 8000`（需要已安装 Python），然后打开 http://localhost:8000 。
直接打开文件时，部分浏览器会限制本地存储；如出现保存提示异常，请使用上面的本地服务器。
不同浏览器、文件地址和服务器地址的存档相互独立。存档不会上传网络。

## 文件分工

- `index.html`：页面结构和脚本加载顺序。
- `style.css`：颜色、间距、布局。
- `player.js`：Player、人生阶段和 World 初始数据，以及未来 NPC 结构说明。
- `life-state.js`：V0.2阶段1的最小人生状态、安全修改与旧存档升级。
- `annual.js`：阶段2的年度进度、同年重要节点和每年最多3件事件。
- `ANNUAL_GUIDE.md`：年度规则、刷新恢复和存档升级说明。
- `TRAJECTORY_GUIDE.md`：新增历史选择条件、状态格式和存档升级说明。
- `events.js`：28 个事件（原有 8 个和新增 20 个），修改剧情先看这里。
- `events-young.js`：阶段3新增22个青年候选事件。
- `events-middle.js`：阶段4新增18个中年候选事件，整个事件库共68个。
- `MIDDLE_CATALOG.md`：中年清单、9类真实回声、三段人生例子及覆盖结果。
- `middle-tests.cjs`：中年文案、亲子年龄、不同路线和刷新测试，由主测试自动调用。
- `YOUNG_CATALOG.md`：青年事件清单、三条事件链、回声与路线覆盖检查。
- `youth-tests.cjs`：青年路径测试，已由 `node tests.cjs` 自动调用。
- `EVENT_CATALOG.md`：按阶段整理的事件清单、前置条件和跨年龄事件链。
- `engine.js`：事件筛选、排序、加权随机、冷却、属性变化和 History 记录。
- `validation.js`：事件数据检查、必然节点冲突警告和存档格式检查。
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
historyChoicesAll 要求全部指定历史选择，historyChoicesAny 要求至少做过其中一个，
historyChoicesNone 排除指定历史选择；每项都是 `{eventId, choiceId}`。
states 要求匹配当前状态；statesNone 排除完全匹配的一组状态，
例如 `statesNone: {housing: {status: "owns_home"}}` 排除已经拥有住房的玩家。
category 按 milestone、followup、conditional、random 的顺序筛选；
前三类使用 priority，random 使用 weight。冷却单位为年。
“人生中的重大事件”不等于 `isMajorNode: true`。
只有漏掉会导致状态明显不合理、关键阶段缺失、重要剧情链永久断裂，
或具有真正不可替代时间窗口的节点，才考虑该标记；普通晋升、搬家、买房、
婚姻及生育意愿讨论可以延期，保持普通条件/后续事件。
标记为 true 的节点可以在主要事件后继续同一年，每年最多3件。
同年追加只处理重要节点，不追加普通随机事件；单一年龄节点仍要检查冲突。
choice 的 effects 是增减值；addTags/removeTags 是标签数组；importance 取 0～3。

## 静态部署

整个目录可发布到静态托管平台。Vercel 不需要构建命令或框架，保留根目录 index.html 即可。
本轮未部署，也没有接入 LLM、账户或服务器。

## 新增事件时的数据检查

保存 `events.js` 后刷新网页，检查会自动运行。正常时不显示提示。
数据写错时，页面顶部会显示「开发数据检查」，列出事件、选择位置和字段；
浏览器按 F12 打开 Console（控制台）也能看到错误或警告。
严重格式错误会阻止开始和恢复游戏，修复后刷新即可，不会自动覆盖原存档。
JavaScript 语法错误（例如缺少引号或括号）请查看控制台，数据检查无法检查尚未成功加载的代码。

事件 id 在整个事件列表中唯一；choice id 只需在所属事件中唯一，且为非空文字。
weight 必须是有限正数，priority 是有限数值，年龄和 cooldown 是非负整数。
effects 只接受 health、happiness、study、stress、family、autonomy、money 的数值增减。
标签字段使用文字数组；没有标签写 `[]`，不要写空文字或 null。
现有条件名为 `tagsAll`（全部标签必须存在）和 `tagsNone`（这些标签不能存在）；
`requiredTags` 不受当前引擎支持，检查会明确提示改为 `tagsAll`，其他未知条件名也会报错。

必然事件年龄范围重叠时会给出警告，列出双方 id 和重叠年龄。
这是保守提醒：其他条件可能让它们互斥，仍需作者核对；警告不会改变选事件的规则。
运行 `node tests.cjs` 可检查当前剧情和数据保护，错误时命令会失败。

恢复存档时检查人物、世界、属性范围、历史条目及当前事件状态。
异常存档会显示提示并回到标题页，不自动删除或覆盖，只有开始新人生才覆盖。
现有合法 V0.1 存档通过升级机制读取；阶段4仍使用存档格式version 3。
新选择的History附带eventDescription（当时卡片的文字），旧历史没有该字段也能恢复。
这只是一个可选文本字段，没有新增每年属性快照。

## 试玩青年分流

两局可在23岁分别选高薪高压和稳定普通工作。
高压路线试着接项目、争取晋升；另一局保留下班时间、不追求晋升。
还可在婚姻和住房讨论中分别选择登记/不登记、买房/继续租住，观察后续卡片区别。
22岁暂缓就业会转待业求职，不被23岁第一份工作强行覆盖。
青年生育意愿讨论只记录计划，不立即生成孩子。

## 试玩中年回声

36岁以后，过去的95分、兴趣、红包、手机、排名、饭桌问答、专业、老友和春节选择，
会影响回声文案。没有对应History就不假装记得；没有孩子也可以通过晚辈或年轻同事遇到回声。
实际计划过成为父母的已婚玩家，会有一次再次确认机会；选择迎接孩子才记录出生。
孩子年龄按当前年份计算，亲子成绩需要8～17岁、红包需要6～17岁。
高压工作可以转向平衡，专业岗位可以继续发展；单身、不婚、不育、租住都有生活候选。

中年事件可写可选descriptionDetails数组，每项为 `{conditions, text}`。
系统把满足条件的文字追加到基础description，条件与事件筛选共用，没有剧情脚本语言。
例如：

```js
descriptionDetails: [
  {conditions: {historyChoicesAll: [{eventId: "score95", choiceId: "promise"}]},
   text: "你想起当年说过：下次一定考满分。"}
]
```

childAge条件使用非负整数min/max；`allowNoChild: true`让无孩子玩家进入晚辈版本。
省略allowNoChild则必须有年龄合适的孩子。事件主条件和每段文案的条件、引用均会验证。
新增中年事件都没有Major标记；正常仍一年一个主要事件，原有年度节点机制保留。
