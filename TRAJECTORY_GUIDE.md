# V0.2 阶段1：人生轨迹数据基础

本阶段仍为28个正式事件、每年一个事件、80岁固定终点。
没有新成年剧情、寿命系统、年度属性快照或新人生总结。

## 当前状态与过去记录

Player 增加四组数据，新人生的默认值如下：

```js
work: {
  status: "not_working", // 其他值：employed / unemployed / retired
  careerType: null,      // 岗位类型的文字代号，未就业时为 null
  level: 0,             // 岗位层级，非负整数；非就业时为0
  workStyle: null,       // 在职可用 stable / high_pressure / flexible
  startYear: null        // 本次就业开始年份
},
relationship: {
  status: "single",      // 其他值：dating / married
  startYear: null        // 当前关系状态的开始年份
},
child: { hasChild: false, birthYear: null },
housing: { status: "with_family" } // 其他值：renting / owns_home
```

每个新人物使用独立的数据对象。孩子只有一个，年龄由当前年份减 birthYear 算出。
not_working 是尚未记录当前就业的安全默认值；unemployed 是明确的待业状态。
失业或退休会清空当前岗位信息，过去工作仍保存在历史中。
目前没有自动退休规则；原有 identity 仍是旧版年龄/身份显示字段，
未来事件判断当前就业应使用 work，不能依据 identity 猜测。
页面只多显示一行当前状态，方便试玩核对。

## 根据具体选择筛选事件

原有 historyEventIds 保留：要求这些事件发生过，不区分当时的选择。
新增 historyChoicesAll：列表内每一对事件和选择都必须在历史中出现过。
新增 historyChoicesNone：列表内任何一对事件和选择都不能出现过。

```js
conditions: {
  minAge: 35,
  maxAge: 40,
  historyChoicesAll: [{ eventId: "interest", choiceId: "art" }],
  historyChoicesNone: [{ eventId: "interest", choiceId: "math" }]
}
```

意思是：13岁在 interest 中选过 art（继续画画），且从未在该事件选过 math。
这里只判断“曾经选过”，不提供最近一次、距离几年等额外规则。
不支持任意代码或表达式。

当前状态条件也可直接写成字段对象，所有字段都必须符合：

```js
conditions: {
  states: {
    work: { status: "employed" },
    child: { hasChild: true }
  }
}
```

## 选择统一修改状态

Choice 可选填 stateChanges；不填时现有行为不变：

```js
stateChanges: {
  work: { status: "employed", careerType: "general", level: 1, workStyle: "stable" },
  housing: { status: "renting" }
}
```

结婚用 `relationship: { status: "married" }`；
记录孩子出生用 `child: { hasChild: true }`，表示孩子在本事件年份出生，
不是单纯计划将来生育。年份由引擎填写，事件不能手写 startYear 或 birthYear。
已有孩子时再次请求出生会被拒绝，不能用选择删除孩子。
从非就业进入就业记录年份；同一就业状态内改变岗位层级保留年份；
从恋爱变为已婚记录结婚年份，过去恋爱年份留在历史中。
只有真正改变的状态组会写入 History，含 before / after，年龄和年份沿用历史条目。
不会为每年或每次小选择保存完整人物快照。

本轮仅给已有“第一份工作”的两个选择补充就业状态记录，文案、属性、标签不变。
辞职、结婚、出生、住房等能力通过测试事件验证，还没有加入正式剧情。

## 检查与安全

开发数据检查会检查新条件的事件/选择是否存在、状态字段名和合法值。
页面顶部和 F12 控制台会给出具体错误，未知字段不会被默默接受。
运行时先检查整个状态修改，失败则属性、标签、状态和历史都不变化。
与当前状态有关的错误（例如已退休却只修改岗位层级）在执行前拒绝，页面显示提示。
保存和恢复检查状态与年份一致性，以及历史状态变更记录的格式。

## V0.1 存档升级

继续使用原 localStorage 名称 east-asian-life-v01，不让旧存档失去入口。
数字 version 从1升级为2；这是存档格式版本，与网页上的游戏版本名称不同。

1. 验证旧数据原有字段，异常存档不会被当作合法数据升级。
2. 复制数据，给缺失的新状态组/字段补默认值；已经存在的非法值会拒绝。
3. 保留姓名、年龄、属性、标签、历史和正在进行的选择；不追加虚构历史。
4. 不根据年龄、旧身份或标签猜测就业、婚姻、孩子或住房。
   因而已经经历第一份工作的旧存档，历史保留就业选择，但当前工作仍使用默认值。
5. 验证升级后的 version 2 数据，在内存中恢复。
6. 读取升级时不立即覆盖原 localStorage；下一次选择或长大时，正常保存 version 2。

version 2 缺失或非法的状态不会再次用默认值掩盖。

## 测试与后续

运行 `node tests.cjs`。包括原8个事件回归、28个事件160轮人生，
以及35岁测试后续按13岁 art/math 选择分流、排除条件、工作/关系/孩子/住房修改，
状态历史、非法修改不产生部分结果、V1升级和V2恢复。
新增的测试后续只存在于测试环境，正式事件仍为28个。

后续阶段再处理：同年多个事件、自动退休/寿命、新成年剧情、画像与总结。
没有为这些后续提前增加额外机制。
