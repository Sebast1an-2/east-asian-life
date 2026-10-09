// 当前情况单独存放；过去的经历仍保存在 History 中。
const SAVE_VERSION = 4;
const LIFE_STATE_FIELDS = {
  work: { status: ["not_working", "employed", "unemployed", "retired"], careerType: "textOrNull", level: "level", workStyle: [null, "stable", "balanced", "high_pressure", "flexible"], startYear: "yearOrNull" },
  relationship: { status: ["single", "dating", "married"], startYear: "yearOrNull" },
  child: { hasChild: "boolean", birthYear: "yearOrNull" },
  housing: { status: ["with_family", "renting", "owns_home"] }
};
function createLifeStates() {
  return {
    work: { status: "not_working", careerType: null, level: 0, workStyle: null, startYear: null },
    relationship: { status: "single", startYear: null },
    child: { hasChild: false, birthYear: null },
    housing: { status: "with_family" }
  };
}
function validStateValue(rule, value) {
  if (Array.isArray(rule)) return rule.includes(value);
  if (rule === "textOrNull") return value === null || isText(value);
  if (rule === "level") return isAge(value);
  if (rule === "yearOrNull") return value === null || Number.isSafeInteger(value);
  return rule === "boolean" && typeof value === "boolean";
}
// mode=changes 时只允许可写字段，年份由引擎填写，避免写错出生时间。
function stateFormatErrors(value, mode) {
  if (!isRecord(value)) return ["必须是状态对象"];
  const errors = [];
  for (const [group, fields] of Object.entries(value)) {
    if (!Object.hasOwn(LIFE_STATE_FIELDS, group)) { errors.push(`${group}：未知状态组`); continue; }
    if (!isRecord(fields) || !Object.keys(fields).length) { errors.push(`${group}：必须是非空字段对象`); continue; }
    for (const [key, val] of Object.entries(fields)) {
      const spec = LIFE_STATE_FIELDS[group];
      if (!Object.hasOwn(spec, key)) errors.push(`${group}.${key}：未知状态字段`);
      else if (mode === "changes" && ["startYear", "birthYear"].includes(key)) errors.push(`${group}.${key}：年份由引擎自动记录，不能手写`);
      else if (!validStateValue(spec[key], val)) errors.push(`${group}.${key}：非法状态值`);
    }
    if (mode === "changes") {
      if (group === "work" && fields.status && fields.status !== "employed" && ((fields.level !== undefined && fields.level !== 0) || fields.careerType != null || fields.workStyle != null)) errors.push("work：非就业状态不能同时填写岗位信息");
      if (group === "child" && fields.hasChild !== true) errors.push("child：只允许 hasChild: true，不能通过选择删除孩子");
    }
    if (group === "relationship" && fields.status === "single" && fields.startYear != null) errors.push("relationship：单身不能有当前关系开始年份");
    if (group === "child" && fields.hasChild === false && fields.birthYear != null) errors.push("child：无孩子不能有出生年份");
  }
  return errors;
}
function validLifeStates(player, year = player.birthYear + player.age) {
  const current = Object.fromEntries(Object.keys(LIFE_STATE_FIELDS).map(key => [key, player[key]]));
  if (stateFormatErrors(current, "full").length) return false;
  for (const [group, spec] of Object.entries(LIFE_STATE_FIELDS)) if (!Object.keys(spec).every(key => Object.hasOwn(player[group], key))) return false;
  const {work, relationship, child} = player;
  const validYear = value => Number.isSafeInteger(value) && value >= player.birthYear && value <= year;
  if (work.status === "employed") { if (!validYear(work.startYear)) return false; }
  else if (work.startYear !== null || work.careerType !== null || work.workStyle !== null || work.level !== 0) return false;
  if (relationship.status === "single" ? relationship.startYear !== null : !validYear(relationship.startYear)) return false;
  if (child.hasChild ? !validYear(child.birthYear) : child.birthYear !== null) return false;
  return true;
}
function matchesLifeStates(player, conditions) {
  return Object.entries(conditions).every(([group, fields]) => Object.entries(fields).every(([key, value]) => player[group]?.[key] === value));
}
function prepareStateChanges(player, patch = {}) {
  const errors = stateFormatErrors(patch, "changes");
  if (errors.length || !validLifeStates(player)) throw new Error(`人生状态修改无效：${errors.join("；") || "当前状态不合法"}`);
  const next = Object.fromEntries(Object.keys(LIFE_STATE_FIELDS).map(key => [key, {...player[key]}]));
  const year = player.birthYear + player.age;
  for (const [group, fields] of Object.entries(patch)) {
    Object.assign(next[group], fields);
    if (group === "work") {
      if (next.work.status !== "employed" && ((fields.level !== undefined && fields.level !== 0) || fields.careerType != null || fields.workStyle != null)) throw new Error("非就业状态不能填写岗位信息");
      if (next.work.status !== "employed") Object.assign(next.work, {careerType: null, level: 0, workStyle: null, startYear: null});
      else if (player.work.status !== "employed") next.work.startYear = year;
    }
    if (group === "relationship" && next.relationship.status !== player.relationship.status) next.relationship.startYear = next.relationship.status === "single" ? null : year;
    if (group === "child") {
      if (player.child.hasChild) throw new Error("已有孩子，不能再次记录出生或覆盖出生年份");
      next.child.birthYear = year;
    }
  }
  if (!validLifeStates({...player, ...next})) throw new Error("人生状态修改后不合法，例如未就业却填写岗位信息");
  const changes = {};
  for (const group of Object.keys(patch)) {
    if (JSON.stringify(player[group]) !== JSON.stringify(next[group])) changes[group] = {before: {...player[group]}, after: {...next[group]}};
  }
  return {next, changes};
}
function childAge(player) { return player.child.hasChild ? player.birthYear + player.age - player.child.birthYear : null; }
function legacyStateDefaults(player) {
  return Object.fromEntries(Object.entries(createLifeStates()).map(([group, defaults]) => [group, {...defaults, ...(player[group] || {})}]));
}
function upgradeSave(data) {
  if (!isRecord(data) || ![1, 2, 3, SAVE_VERSION].includes(data.version)) throw new Error("不支持的存档版本");
  // 内容保护也适用于旧版本的尚未选择卡片。验证其余内容后才可撤下，不丢历史。
  if (!validSave(data) && data.currentEventId && data.resolved === false && data.result === "" && data.player?.alive === true) {
    const event = EVENTS.find(e => e.id === data.currentEventId);
    const restored = {...data, currentEventId: null};
    const player = data.version === 1 ? {...data.player, ...legacyStateDefaults(data.player)} : data.player;
    if (event && event.isMajorNode !== true && validSave(restored) && !eligible(event, player)) data = restored;
  }
  if (data.version === SAVE_VERSION) {
    if (validSave(data)) return data;
    // 内容修正可能让已展示的普通讨论不再符合条件。只有其余存档完整合法时，
    // 撤下这张尚未选择的旧卡片；保留人生状态、历史和年度次数，不重抽普通事件。
    const event = EVENTS.find(e => e.id === data.currentEventId);
    if (event && event.isMajorNode !== true && data.resolved === false && data.result === "" && data.player?.alive === true) {
      const restored = {...data, currentEventId: null};
      if (validSave(restored) && !eligible(event, data.player)) return restored;
    }
    throw new Error("存档无效");
  }
  // 先验证原内容，再补缺失字段；不根据年龄、身份或标签猜测经历。
  if (!validSave(data)) throw new Error("旧存档无效");
  const upgraded = JSON.parse(JSON.stringify(data));
  if (data.version === 1) for (const [group, defaults] of Object.entries(createLifeStates())) upgraded.player[group] = {...defaults, ...(upgraded.player[group] || {})};
  // 旧版本当年已经抽过主要事件。只从真实历史恢复完成数，绝不重抽。
  if (data.version < 3) upgraded.annual = createAnnualProgress(upgraded.player);
  // 用原存档内容生成稳定种子。反复读取同一个旧档得到同一个结果，不凭空补人生经历。
  upgraded.player.lifespan = createLifespan(stableSeed(JSON.stringify(data)), upgraded.player.age);
  upgraded.player.death = null;
  if (!upgraded.player.alive) recordDeath(upgraded.player, upgraded.player.health === 0 ? "健康严重恶化" : "自然寿命终点");
  upgraded.version = SAVE_VERSION;
  if (!validSave(upgraded)) throw new Error("升级后存档无效");
  return upgraded;
}
