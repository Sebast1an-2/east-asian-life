# 当前状态：V0.2.3 Life Realism Update (Release Approved / Committed)

核对日期：2026-10-11。项目：《东亚小孩的一生》（East Asian Life Simulator），原生 HTML / CSS / JavaScript 网页人生模拟。

V0.2.3 Life Realism Update 已完成代码开发、自动测试、Final Integration Audit、Narrative Consistency Fix 和人工浏览器试玩，当前状态为 **Release Approved / Committed**。**Human Playtest: Passed；Automated Validation: Passed；Release Status: Approved**。V0.2.3 implementation commit 已完成，当前为 **Local commit complete；Pending push and official release**，不能写成已公开发布。

本版目标是让已有的人生更可信：修正职业连续性、经济叙事和事件重复感，不增加事件数量、职业数量或经济玩法。当前只进行已授权的发布准备，不开发新阶段。

## 历史记录

V0.2「人生轨迹版」六个阶段已完成，项目拥有者已人工试玩确认。核心闭环为出生 → 选择与因果 → 青年/中年/晚年 → 稳定死亡 →《你的一生》→ 重新投胎。该试玩确认属于 V0.2，不替代当前 V0.2.3 RC 验收。

V0.2.1 Project Cleanup 已完成并提交，仅整理 Markdown 文档、归档历史阶段资料和更新链接；该次整理未改变游戏代码、HTML/CSS、事件数据、存档结构、测试逻辑或代码目录。历史同步 commit 为 `fa139dd4e84650888abe33e9960bfa20d31b407f`（`docs: organize project documentation`），不代表 V0.2.3 已提交。

## 版本与接手入口

- 历史 V0.2 发布 commit：`ecea04cd3a920a8f0763948634372513a263a4b0`，message：`release: v0.2 complete life simulation`。V0.2.3 implementation commit 见下文；官方 release 尚未执行。
- 本地标签 `v0.2` 指向该 commit；存档格式 `SAVE_VERSION = 5`，localStorage 键沿用 `east-asian-life-v01`。
- 先读 [AGENTS.md](AGENTS.md)，再读本文和 [PROJECT_BIBLE.md](PROJECT_BIBLE.md)。README 可查运行方法；阶段指南主要是历史记录。
- 根目录保留 [README.md](README.md)、[AGENTS.md](AGENTS.md)、本文和 [PROJECT_BIBLE.md](PROJECT_BIBLE.md)，作为当前项目入口。六份历史阶段文档已移至 [docs/archive/](docs/archive/README.md)，它们是历史开发记录，不是当前规则清单。

## V0.2.3 已完成模块

### Career Consistency

- 修正职业状态一致性：结束乐队合作不覆盖主职业、身份、收入或工作开始年份，保留过去音乐经历。
- 普通跳槽事件只允许当前 `work.status === employed` 且 `careerType === general` 的玩家触发，不依赖内部标签保护职业。
- 工作方式、压力或工作边界调整不错误重置收入；实际就业、职业或岗位责任变化仍可重算收入，显式 `monthlyIncome` 优先。

### Economy Consistency

- 修正转型、家庭与工作事件中的经济叙事，使收入与准备程度描述符合真实条件和实际效果。
- 保留合理的职业转换、明确合同和晋升收入描述，不将工作节奏调整写成必然加薪或减薪。
- 保持原有经济模型、生活成本公式和年度结算流程，保持 `SAVE_VERSION = 5`，不增加经济字段。

### Event Diversity

- Recent Theme Memory：从已有 History 临时推导当前年及前两年的真实事件主题，忽略 `eventId = null` 的平静年份，不写入 Player 或 Save。
- Theme Soft Decay：只对普通 random 候选软降权，保留正概率和唯一候选；Major、milestone、followup、conditional 的原机制及 cooldown 保持不变。
- Late Life Theme Refinement：局部细分晚年工作、日常、健康、兴趣、朋友、关系、亲子主题，保留“晚年”阶段标签；Summary 回归通过。

### Narrative Consistency Fix

- 修正 `stats_stress/rest` 的结果与历史文本：描述休息产生消费成本，不再暗示工资下降。
- 修正 `stream_online/schedule、chase` 的结果与历史文本：描述直播安排、投入和生活节奏变化，不保证收入增加或减少。
- Final Fix 仅修改 6 个文本字段，数值、条件、状态、标签和 event / choice id 均未改变；旧 History 不追溯改写。

## 架构与数据兼容状态

- 保持原生 HTML / CSS / JavaScript、普通脚本顺序加载；没有更换框架或增加依赖。
- 存档格式仍为 `SAVE_VERSION = 5`；Player、History、State、Tags 结构保持不变，无新增长期存档字段。
- History 是人生事实来源，State 表达当前状态，Tags 保留持续倾向与兼容所需经历信息；不删除过去的人生经历。
- 事件库仍为 100 个候选，event / choice id、Major 配置和 cooldown 保持不变；年度流程与 Summary 实现未修改。
- 无 AI 系统、NPC 系统或新增复杂职业树。

## Repository Status

- GitHub repository exists：仓库为 [Sebast1an-2/east-asian-life](https://github.com/Sebast1an-2/east-asian-life)。
- V0.2.3 implementation commit：已完成，commit hash 为 `25eff1dfdc3cd86186b1796e8d67a3c705b7bc01`，message 为 `fix: v0.2.3 life realism update`。提交包含 11 个代码/测试文件及 `CURRENT_STATUS.md`，共 12 个文件。实现与事件文件为 `economy.js`、`engine.js`、`events-young.js`、`events-middle.js`、`events-special.js`、`events-elderly.js`；测试文件为 `tests.cjs`、`youth-tests.cjs`、`middle-tests.cjs`、`late-tests.cjs`、`final-tests.cjs`。
- Documentation sync：上述 12 个文件已提交；本轮仅更新本文，当前文档同步尚未提交。此前授权创建的 `ROADMAP.md`、`ULTIMATE_VISION.md` 仍未跟踪，本次保持原样，未纳入 implementation commit。
- Local commit complete：本地 `HEAD` 为 `25eff1dfdc3cd86186b1796e8d67a3c705b7bc01`，跟踪引用 `origin/master` 仍为 `f5958cd`（`docs: update project status`），当前分支领先该引用 1 个提交。Pending push and official release；本次未联网核实远程状态，不据此声称已推送或发布。
- v0.2 tag exists：本地 `v0.2` 指向发布 commit `ecea04cd3a920a8f0763948634372513a263a4b0`；本次不创建或移动标签，不据此假定远程已有同名标签。
- Current branch tracks origin/master：当前分支为 `master`，上游为 `origin/master`；`origin` 指向上述 GitHub 仓库。

## Release Pending / Deployment Status

| 项目 | 当前状态 |
|---|---|
| V0.2.3 Public Release | Pending：Release Approved / Committed；Local commit complete；Pending push and official release |
| GitHub repository | 仓库已建立，V0.2 游戏与 V0.2.1 文档整理已有提交和同步记录；V0.2.3 implementation commit 已在本地完成，尚未推送 |
| Public web deployment | 2026-10-10 的旧记录为尚无公开游戏地址；本次未核实线上部署，不将本地 commit 标记为已上线。上传 GitHub 不等于网页上线 |
| Browser testing | Human Playtest: Passed；开发者已完成 V0.2.3 人工浏览器试玩，核心人生循环体验通过验证，未发现阻塞性问题 |
| Mobile testing | 当前版本在真实手机上的操作、显示与存储验收仍待确认 |

## 已经能做什么

- 100 个候选事件：原始 28、青年 22、中年 18、职业链 17、晚年/属性 15。
- 具体历史 choice 条件；最小工作、关系、一个孩子、居住状态；重要变更记录 before / after。
- 一年一次主要抽取，动态追加真正 Major，最多 3 个；刷新不重复已完成事件。
- 青年工作/关系/住房分流，中年 9 类跨年龄回声；有孩子与无孩子均有内容。
- 职业选手、主播、乐队的进入/转向/退出/后期回声；玩家界面没有路线等级暗示。
- 真实 Stats 资格/权重及触发原因，自主性隐藏；历史以无序号时间线展示。
- 持续月收入、离开年份时的一次资金结算、真实购房扣款；money 表示元计净现金。
- 60+ 晚年内容、年龄/健康影响的稳定寿命判定、死亡一次处理、110 岁终点保护。
- 基于真实 History 的事实、轨迹、主题和高光总结；可见倾向最多 8 条；旧档安全升级与重新投胎。

## 当前检查与实际限制

Automated Validation: Passed。最近验证记录：2026-10-11，Final Fix 完整自动测试通过；RC Review 核对候选文件与受测快照一致，并再次通过事件校验和 diff 检查。

| 检查 | 结果与覆盖范围 |
|---|---|
| `node tests.cjs` | 通过，退出码 0；包含原始回归及下面四个专项 |
| `checkEvents(EVENTS)` | 100 events，0 errors，0 warnings |
| [youth-tests.cjs](youth-tests.cjs) | 通过：青年路线、职业资格、状态与历史条件 |
| [middle-tests.cjs](middle-tests.cjs) | 通过：中年路线、回声、实际状态转向与可达性 |
| [late-tests.cjs](late-tests.cjs) | 通过：200 full-life、360 late-life states；包括晚年可达性、Summary 和存档兼容回归 |
| [final-tests.cjs](final-tests.cjs) | 通过：20 route coverage、194 full-life samples；包括职业收入、年度结算去重与旧档兼容 |
| Final Fix History 一致性检查 | 8 个针对性场景通过：休息消费，以及直播收入增加、减少、不变；已有历史保持原样 |

这些数字分别属于不同专项，不合并声称为去重后的总样本数。自动测试采用 Node VM、简易 DOM / localStorage 模拟，只说明所测逻辑和样本通过，不能保证所有人生组合，也不能替代真实浏览器、手机和线上验收。**Human Playtest: Passed**：根据开发者反馈“试玩感受基本不错”，V0.2.3 已完成人工浏览器试玩，核心人生循环体验通过验证，未发现阻塞性问题。这表示核心体验目标达到，不证明所有人生组合均完美，也不代表移动端或线上环境均已验收。本次状态文档同步只核对事实、链接和 Git 范围，没有重新运行游戏测试。

历史测试记录保留：2026-10-09 的 V0.2 完整测试退出码为 0，四个专项通过，当时收尾覆盖 20 种路线、160 次完整人生，事件校验为 100 个候选、0 errors、0 warnings；这是旧版记录，不替代当前 RC 的结果。

已完成依据仓库文档与代码进行的接手阅读和只读结构审计。根目录文档用于定位当前项目、设计原则、架构、维护边界和下一步；归档资料用于了解过去阶段，不能覆盖当前实现。

V0.2.3 已完成 Final Integration Audit 与 Final Fix，RC Review 未发现新的代码级发布阻塞；人工浏览器试玩已通过，Final Release Review 结论为 Release Status: Approved，implementation commit 已完成，正式发布仍待 push 和 official release 执行。下面是保留的已知取舍和维护债务，不是本轮需要顺手修复的 Bug：

| 项目 | 实际情况与后续注意事项 |
|---|---|
| 阶段文档过时 | [YOUNG_CATALOG](docs/archive/YOUNG_CATALOG.md)/[LATE_GUIDE](docs/archive/LATE_GUIDE.md) 写住房门槛 4000，实际为 120000 元；[EVENT_CATALOG](docs/archive/EVENT_CATALOG.md) 写抓周/老友暂无后续，实际已接通。旧格式版本和“无总结”也是当时状态。历史内容保留，不改写成当前规则 |
| 原始标签较多 | 140 个原始标签仍有 State/History 重复，保留旧链兼容；19 类白名单控制展示。不要一次批量删除 |
| 脚本加载耦合 | 普通脚本共享顶层变量，页面与多个测试有加载列表。以后改模块时核对顺序，不擅自换框架 |
| 经济是粗估 | 全年按年末状态结算，负净现金仅表示缺口；无房贷/税/完整资产。仅存最近账单，不可声称能算完整历史财富曲线 |
| 资料粒度 | 无每年完整 Stats 快照；出生年和家庭背景固定；单孩子、无完整 NPC。这些是当前范围边界 |
| 遗憾栏保守 | `unfinished` 固定为空。没有可靠证据就不替玩家写遗憾，不是已实现通用分析器 |
| 测试边界 | 样本路线可达性不保证所有组合；真实浏览器、移动端、部署后存储仍需验收 |
| 本地存档 | 一浏览器来源一份存档，无导出/同步。上线地址不会自动读取本地文件地址的旧档 |

## 发布前待办，尚未完成

1. 由项目拥有者检查本次状态同步；V0.2.3 人工浏览器试玩已通过，真实手机与公开部署后的刷新、存储验收分别记录，不由本次试玩或自动测试代替。
2. implementation commit 已完成；本文更新尚未提交，后续文档提交与 push 等待明确授权，此前长期文档仍不纳入本次发布范围。
3. 在 push 和 official release 执行完成后，再更新正式 Release 状态与实际发布记录；人工浏览器试玩已通过，公开网页部署状态仅按真实结果记录。

未经明确授权，不自动进入下一项、修复上述取舍、开发新功能或创建 Git commit。长期原则、精确数据语义、迁移和模块职责见 PROJECT_BIBLE。
