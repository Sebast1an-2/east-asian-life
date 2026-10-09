// 引擎不操作页面。History 同时记录事件、选择、结果和变化，供后续剧情查询。
const CATEGORY_ORDER = { milestone: 4, followup: 3, conditional: 2, random: 1 };
function eligible(event, player) {
  const c = event.conditions;
  const occurrences = player.history.filter(item => item.eventId === event.id);
  if (!event.repeatable && occurrences.length) return false;
  if (occurrences.length && player.age - occurrences[occurrences.length - 1].age < event.cooldown) return false;
  if (c.minAge !== undefined && player.age < c.minAge) return false;
  if (c.maxAge !== undefined && player.age > c.maxAge) return false;
  if (c.lifeStages && !c.lifeStages.includes(player.lifeStage)) return false;
  if (c.tagsAll && !c.tagsAll.every(tag => player.tags.includes(tag))) return false;
  if (c.tagsNone && c.tagsNone.some(tag => player.tags.includes(tag))) return false;
  if (c.historyEventIds && !c.historyEventIds.every(id => player.history.some(item => item.eventId === id))) return false;
  const chosen = ref => player.history.some(item => item.eventId === ref.eventId && item.choiceId === ref.choiceId);
  if (c.historyChoicesAll && !c.historyChoicesAll.every(chosen)) return false;
  if (c.historyChoicesNone && c.historyChoicesNone.some(chosen)) return false;
  if (c.states && !matchesLifeStates(player, c.states)) return false;
  return Object.entries(c.stats || {}).every(([key, range]) =>
    (range.min === undefined || player[key] >= range.min) &&
    (range.max === undefined || player[key] <= range.max));
}
function pickEvent(player, random = Math.random, candidates = EVENTS) {
  let pool = candidates.filter(event => eligible(event, player));
  if (!pool.length) return null;
  const category = Math.max(...pool.map(event => CATEGORY_ORDER[event.category]));
  pool = pool.filter(event => CATEGORY_ORDER[event.category] === category);
  // 必然节点及后续事件按优先级排序；随机事件按权重抽取。
  if (category !== CATEGORY_ORDER.random) {
    const priority = Math.max(...pool.map(event => event.priority));
    pool = pool.filter(event => event.priority === priority);
  }
  const last = [...player.history].reverse().find(item => item.eventId);
  const varied = pool.filter(event => !event.eventTags.some(tag => (last?.eventTags || []).includes(tag)));
  if (varied.length) pool = varied;
  let roll = random() * pool.reduce((sum, event) => sum + event.weight, 0);
  for (const event of pool) { roll -= event.weight; if (roll < 0) return event; }
  return pool[pool.length - 1];
}
function applyChoice(player, event, choice) {
  // 修改前先检查，失败时连属性和历史也不改变。
  const prepared = prepareStateChanges(player, choice.stateChanges);
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
  player.history.push({ age: player.age, year: player.birthYear + player.age,
    eventId: event.id, eventTitle: event.title, eventTags: [...event.eventTags],
    choiceId: choice.id, text: choice.historyText, resultText: choice.resultText,
    effects: changes, addTags: [...choice.addTags], removeTags: [...choice.removeTags], importance: choice.importance,
    ...(Object.keys(prepared.changes).length ? {stateChanges: prepared.changes} : {}) });
  if (player.health <= 0) player.alive = false;
}
function advanceYear(player, world) {
  if (!player.alive) return;
  player.age += 1;
  world.year = player.birthYear + player.age;
  player.lifeStage = stageFor(player.age)[1];
  if (player.age === 6) player.identity = "小学生";
  if (player.age === 12) player.identity = "初中生";
  if (player.age === 15) player.identity = "高中生";
  if (player.age === 23) player.identity = "社会新人";
  if (player.age === 60) player.identity = "退休者";
  // 原型用固定 80 岁终点验证人生总结；后续可替换为寿命规则。
  if (player.age >= 80 || player.health <= 0) player.alive = false;
}
