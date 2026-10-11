// 引擎不操作页面。History 同时记录事件、选择、结果和变化，供后续剧情查询。
const CATEGORY_ORDER = { milestone: 4, followup: 3, conditional: 2, random: 1 };
// 筛选事件和追加回声文案共用同一套简单条件，不建立第二套剧情规则。
function matchesConditions(c, player) {
  if (c.minAge !== undefined && player.age < c.minAge) return false;
  if (c.maxAge !== undefined && player.age > c.maxAge) return false;
  if (c.lifeStages && !c.lifeStages.includes(player.lifeStage)) return false;
  if (c.tagsAll && !c.tagsAll.every(tag => player.tags.includes(tag))) return false;
  if (c.tagsNone && c.tagsNone.some(tag => player.tags.includes(tag))) return false;
  if (c.historyEventIds && !c.historyEventIds.every(id => player.history.some(item => item.eventId === id))) return false;
  const chosen = ref => player.history.some(item => item.eventId === ref.eventId && item.choiceId === ref.choiceId);
  if (c.historyChoicesAll && !c.historyChoicesAll.every(chosen)) return false;
  if (c.historyChoicesAny && !c.historyChoicesAny.some(chosen)) return false;
  if (c.historyChoicesNone && c.historyChoicesNone.some(chosen)) return false;
  if (c.states && !matchesLifeStates(player, c.states)) return false;
  if (c.statesNone && matchesLifeStates(player, c.statesNone)) return false;
  if (c.childAge) {
    const age = childAge(player);
    if (age === null ? c.childAge.allowNoChild !== true :
      (c.childAge.min !== undefined && age < c.childAge.min) || (c.childAge.max !== undefined && age > c.childAge.max)) return false;
  }
  return Object.entries(c.stats || {}).every(([key, range]) =>
    (range.min === undefined || player[key] >= range.min) &&
    (range.max === undefined || player[key] <= range.max));
}
function eligible(event, player) {
  if (!player.alive) return false;
  const occurrences = player.history.filter(item => item.eventId === event.id);
  if (!event.repeatable && occurrences.length) return false;
  if (occurrences.length && player.age - occurrences[occurrences.length - 1].age < event.cooldown) return false;
  return matchesConditions(event.conditions, player);
}
// 所有符合条件的小段落都追加到基础文案；只展示文字，不改选项、状态或抽取规则。
function describeEvent(event, player) {
  return [event.description, ...(event.descriptionDetails || []).filter(part => matchesConditions(part.conditions, player)).map(part => part.text)].join(" ");
}
function eventWeight(event, player) {
  return (event.weightModifiers || []).filter(part => matchesConditions({stats: part.stats}, player))
    .reduce((weight, part) => weight * part.multiplier, event.weight);
}
// 只读真实历史的当前年和前两年；同年多个节点不重复累计主题。
// 这是一次抽取的临时分析，不补写旧历史，也不保存到Player。
function recentThemeCounts(player) {
  const years = new Map();
  for (const h of player.history) {
    if (!h.eventId || h.age < player.age - 2 || h.age > player.age || !Number.isSafeInteger(h.age)) continue;
    for (const tag of h.eventTags || []) {
      if (tag === "晚年" || tag === "生活") continue;
      if (!years.has(tag)) years.set(tag, new Set());
      years.get(tag).add(h.age);
    }
  }
  return new Map([...years].map(([tag, ages]) => [tag, ages.size]));
}
function themeDecay(event, recentThemes) {
  const count = Math.max(0, ...event.eventTags.map(tag => recentThemes.get(tag) || 0));
  return 1 / (1 + count); // 多标签取最高重复度，不叠加惩罚；始终保留正权重。
}
function triggerReasons(event, player, candidates = EVENTS) {
  if (!eligible(event, player)) return [];
  const reasons = [];
  const detail = stats => Object.entries(stats).filter(([key]) => key !== "autonomy").map(([key, r]) => `${key}${r.min === undefined ? "" : " >= " + r.min}${r.max === undefined ? "" : " <= " + r.max}`).join("；");
  for (const [key, text] of Object.entries(event.statReasons || {})) {
    if (key !== "autonomy" && matchesConditions({stats: {[key]: event.conditions.stats[key]}}, player)) reasons.push({text, detail: detail({[key]: event.conditions.stats[key]})});
  }
  // 权重只有在最后的抽取池里确有其他候选时才影响机会；单个候选不冒充数值因果。
  const pool = selectionPool(player, candidates);
  if (pool.length > 1 && pool.includes(event)) for (const part of event.weightModifiers || []) if (part.reason && !Object.hasOwn(part.stats, "autonomy") && matchesConditions({stats: part.stats}, player)) reasons.push({text: part.reason, detail: detail(part.stats) + `；抽取权重 ×${part.multiplier}`});
  return reasons.slice(0, 2);
}
function selectionPool(player, candidates = EVENTS, selection = {}) {
  selection.softDecay = false;
  let pool = candidates.filter(event => eligible(event, player));
  if (!pool.length) return [];
  const category = Math.max(...pool.map(event => CATEGORY_ORDER[event.category]));
  pool = pool.filter(event => CATEGORY_ORDER[event.category] === category);
  // 必然节点及后续事件按优先级排序；随机事件按权重抽取。
  if (category !== CATEGORY_ORDER.random) {
    const priority = Math.max(...pool.map(event => event.priority));
    pool = pool.filter(event => event.priority === priority);
  }
  // 只有整个最高类别池都是普通random才替换旧避重；包含Major的池保持原路径。
  selection.softDecay = pool.every(event => event.category === "random" && event.isMajorNode !== true);
  if (selection.softDecay) return pool;
  const last = [...player.history].reverse().find(item => item.eventId);
  const varied = pool.filter(event => !event.eventTags.some(tag => (last?.eventTags || []).includes(tag)));
  if (varied.length) pool = varied;
  return pool;
}
function pickEvent(player, random = Math.random, candidates = EVENTS) {
  const selection = {};
  const pool = selectionPool(player, candidates, selection);
  if (!pool.length) return null;
  // 唯一候选不降权；权重只计算一次，同一次抽取共用同一份临时主题分析。
  const themes = selection.softDecay && pool.length > 1 ? recentThemeCounts(player) : new Map();
  const weights = pool.map(event => eventWeight(event, player) * themeDecay(event, themes));
  let roll = random() * weights.reduce((sum, weight) => sum + weight, 0);
  for (let i = 0; i < pool.length; i++) { roll -= weights[i]; if (roll < 0) return pool[i]; }
  return pool[pool.length - 1];
}
function applyChoice(player, event, choice) {
  if (!player.alive) throw new Error("人生已结束，不能继续选择");
  // 修改前先检查，失败时连属性和历史也不改变。
  const prepared = prepareStateChanges(player, choice.stateChanges);
  const incomeBefore = player.monthlyIncome;
  const incomeAfter = prepareIncome(player, prepared.next, choice);
  const eventDescription = describeEvent(event, player);
  const reasons = triggerReasons(event, player);
  const changes = {};
  for (const [key, delta] of Object.entries(choice.effects)) {
    if (![...BOUNDED_STATS, "money"].includes(key)) continue;
    const before = player[key];
    player[key] = BOUNDED_STATS.includes(key) ? Math.max(0, Math.min(100, before + delta)) : before + delta;
    changes[key] = player[key] - before;
  }
  player.tags = [...new Set([...player.tags.filter(tag => !choice.removeTags.includes(tag)), ...choice.addTags])];
  if (choice.identity) player.identity = choice.identity;
  for (const group of Object.keys(prepared.changes)) player[group] = prepared.next[group];
  player.monthlyIncome = incomeAfter;
  player.history.push({ age: player.age, year: player.birthYear + player.age,
    eventId: event.id, eventTitle: event.title, eventTags: [...event.eventTags], eventDescription,
    choiceId: choice.id, text: choice.historyText, resultText: choice.resultText,
    effects: changes, addTags: [...choice.addTags], removeTags: [...choice.removeTags], importance: choice.importance,
    ...(reasons.length ? {triggerReasons: reasons} : {}),
    ...(incomeBefore !== incomeAfter ? {incomeChange: {before: incomeBefore, after: incomeAfter}} : {}),
    ...(choice.cashReason && changes.money ? {cashReason: choice.cashReason} : {}),
    ...(Object.keys(prepared.changes).length ? {stateChanges: prepared.changes} : {}) });
  if (player.health <= 0) recordDeath(player, "健康严重恶化");
}
function advanceYear(player, world) {
  if (!player.alive) return;
  settleYear(player); // 离开这一年才结算，同年追加、选择和刷新都不重复支付工资。
  player.age += 1;
  world.year = player.birthYear + player.age;
  player.lifeStage = stageFor(player.age)[1];
  if (player.age === 6) player.identity = "小学生";
  if (player.age === 12) player.identity = "初中生";
  if (player.age === 15) player.identity = "高中生";
  if (player.age === 23 && player.work.status !== "employed") player.identity = "社会新人";
  // 年龄到60不等于自动退休，退休由事件统一修改work状态。
  checkMortality(player);
}
