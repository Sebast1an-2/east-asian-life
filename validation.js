// 数据检查只报告问题，不改变游戏规则。
function isRecord(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
function isText(v) { return typeof v === "string" && v.trim().length > 0; }
function isTextList(v) { return Array.isArray(v) && v.every(isText); }
function isAge(v) { return Number.isSafeInteger(v) && v >= 0; }
function isImportance(v) { return Number.isInteger(v) && v >= 0 && v <= 3; }
function validEffects(v) {
  return isRecord(v) && Object.entries(v).every(([key, delta]) => [...BOUNDED_STATS, "money"].includes(key) && Number.isFinite(delta));
}
function checkEvents(events) {
  const errors = [], warnings = [], ids = new Set();
  const error = (path, message) => errors.push(`${path}：${message}`);
  if (!Array.isArray(events)) return { errors: ["EVENTS 必须是数组"], warnings };
  events.forEach((e, index) => {
    const path = `事件[${index}] (${e?.id || "缺少 id"})`;
    if (!isRecord(e)) { error(path, "必须是对象"); return; }
    for (const key of ["id", "title", "description"]) if (!isText(e[key])) error(`${path}.${key}`, "必须是非空文字");
    if (ids.has(e.id)) error(`${path}.id`, "事件 id 重复");
    ids.add(e.id);
    if (!["milestone", "followup", "conditional", "random"].includes(e.category)) error(`${path}.category`, "未知事件分类");
    if (!isTextList(e.eventTags)) error(`${path}.eventTags`, "必须是文字数组");
    if (!Number.isFinite(e.weight) || e.weight <= 0) error(`${path}.weight`, "必须是有限正数");
    if (!Number.isFinite(e.priority)) error(`${path}.priority`, "必须是有限数值");
    if (typeof e.repeatable !== "boolean") error(`${path}.repeatable`, "必须是 true 或 false");
    if (!isAge(e.cooldown)) error(`${path}.cooldown`, "必须是非负整数（年）");
    const c = e.conditions;
    if (!isRecord(c)) error(`${path}.conditions`, "必须是对象");
    else {
      const allowed = ["minAge", "maxAge", "lifeStages", "tagsAll", "tagsNone", "historyEventIds", "stats"];
      for (const key of Object.keys(c)) if (!allowed.includes(key)) error(`${path}.conditions.${key}`, key === "requiredTags" ? "请改用 tagsAll；当前引擎不支持 requiredTags" : "不支持的条件字段，请检查拼写");
      for (const key of ["minAge", "maxAge"]) if (key in c && !isAge(c[key])) error(`${path}.conditions.${key}`, "必须是非负整数年龄");
      if (isAge(c.minAge) && isAge(c.maxAge) && c.minAge > c.maxAge) error(`${path}.conditions`, "minAge 不能大于 maxAge");
      for (const key of ["lifeStages", "tagsAll", "tagsNone", "historyEventIds"]) if (key in c && !isTextList(c[key])) error(`${path}.conditions.${key}`, "必须是文字数组");
      if (isTextList(c.lifeStages) && c.lifeStages.some(s => !STAGES.some(item => item[1] === s))) error(`${path}.conditions.lifeStages`, "包含未知人生阶段");
      if (isTextList(c.tagsAll) && isTextList(c.tagsNone) && c.tagsAll.some(t => c.tagsNone.includes(t))) error(`${path}.conditions`, "同一标签不能同时要求存在和不存在");
      if ("stats" in c) {
        if (!isRecord(c.stats)) error(`${path}.conditions.stats`, "必须是属性范围对象");
        else for (const [key, range] of Object.entries(c.stats)) {
          if (![...BOUNDED_STATS, "money"].includes(key)) error(`${path}.conditions.stats.${key}`, "未知属性名");
          if (!isRecord(range) || !Object.keys(range).length || Object.keys(range).some(k => !["min", "max"].includes(k)) || Object.values(range).some(n => !Number.isFinite(n))) error(`${path}.conditions.stats.${key}`, "必须包含合法的 min 和/或 max 数值");
          else if (range.min !== undefined && range.max !== undefined && range.min > range.max) error(`${path}.conditions.stats.${key}`, "min 不能大于 max");
        }
      }
    }
    if (!Array.isArray(e.choices) || !e.choices.length) { error(`${path}.choices`, "必须是至少包含一个选择的数组"); return; }
    const choiceIds = new Set();
    e.choices.forEach((choice, i) => {
      const cp = `${path}.choices[${i}]`;
      if (!isRecord(choice)) { error(cp, "必须是对象"); return; }
      for (const key of ["id", "text", "resultText", "historyText"]) if (!isText(choice[key])) error(`${cp}.${key}`, "必须是非空文字");
      if (choiceIds.has(choice.id)) error(`${cp}.id`, "同一事件内 choice id 重复");
      choiceIds.add(choice.id);
      if (!validEffects(choice.effects)) error(`${cp}.effects`, "须使用已知属性名和有限数值增减量");
      for (const key of ["addTags", "removeTags"]) if (!isTextList(choice[key])) error(`${cp}.${key}`, "必须是文字数组（没有标签时写 []）");
      if (!isImportance(choice.importance)) error(`${cp}.importance`, "必须是 0～3 的整数");
      if ("identity" in choice && !isText(choice.identity)) error(`${cp}.identity`, "必须是非空文字");
    });
  });
  for (const e of events) if (isTextList(e?.conditions?.historyEventIds)) {
    for (const id of e.conditions.historyEventIds) if (!ids.has(id)) error(`事件 (${e.id}).conditions.historyEventIds`, `找不到事件 ${id}`);
  }
  // 保守检查年龄重叠：其他条件可能使两个事件互斥，警告供作者核对。
  const milestones = events.filter(e => isRecord(e) && e.category === "milestone" && isRecord(e.conditions));
  for (let i = 0; i < milestones.length; i++) for (let j = i + 1; j < milestones.length; j++) {
    const a = milestones[i], b = milestones[j];
    const start = Math.max(a.conditions.minAge ?? 0, b.conditions.minAge ?? 0);
    const end = Math.min(a.conditions.maxAge ?? Infinity, b.conditions.maxAge ?? Infinity);
    if (start <= end) warnings.push(`必然事件 ${a.id} 与 ${b.id} 在 ${start}～${end === Infinity ? "不限" : end} 岁可能冲突：每年只选一个，请核对其他条件和年龄安排。`);
  }
  return { errors, warnings };
}
function validSave(data) {
  if (!isRecord(data) || data.version !== 1 || !isRecord(data.player) || !isRecord(data.world)) return false;
  const p = data.player, w = data.world;
  if (!isAge(p.age) || p.age > 80 || !Number.isSafeInteger(p.birthYear) || !Number.isSafeInteger(p.birthYear + p.age)) return false;
  if (!["name", "gender", "identity", "familyBackground"].every(k => isText(p[k]))) return false;
  if (typeof p.alive !== "boolean" || p.lifeStage !== stageFor(p.age)[1]) return false;
  if (!BOUNDED_STATS.every(k => Number.isFinite(p[k]) && p[k] >= 0 && p[k] <= 100) || !Number.isFinite(p.money)) return false;
  if (p.alive !== (p.age < 80 && p.health > 0) || !isTextList(p.tags) || !Array.isArray(p.history)) return false;
  if (!isText(w.name) || w.year !== p.birthYear + p.age || !Array.isArray(w.npcs)) return false;
  let previousAge = -1;
  for (const h of p.history) {
    if (!isRecord(h) || !isAge(h.age) || h.age > p.age || h.age < previousAge || h.year !== p.birthYear + h.age || !isText(h.text) || !isTextList(h.eventTags) || !isImportance(h.importance)) return false;
    previousAge = h.age;
    if (h.eventId !== null && (!isText(h.eventId) || !isText(h.eventTitle) || !isText(h.choiceId) || !isText(h.resultText) || !validEffects(h.effects) || !isTextList(h.addTags) || !isTextList(h.removeTags))) return false;
  }
  if (typeof data.resolved !== "boolean" || typeof data.result !== "string") return false;
  if (data.currentEventId !== null) {
    const event = EVENTS.find(e => e.id === data.currentEventId);
    if (!event || (!p.alive && !data.resolved)) return false;
    const last = p.history[p.history.length - 1];
    if (data.resolved && (!last || last.age !== p.age || last.eventId !== event.id || !event.choices.some(c => c.id === last.choiceId) || data.result !== last.resultText)) return false;
    if (!data.resolved && (!eligible(event, p) || data.result !== "")) return false;
  } else if (data.resolved || data.result !== "") return false;
  return true;
}
