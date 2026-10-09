// 年度进度只记录已完成事件，不提前安排不会更新的队列。
const MAX_EVENTS_PER_YEAR = 3;
function createAnnualProgress(player, mainEventDrawn = true) {
  const eventIds = player.history.filter(h => h.age === player.age && h.eventId !== null).map(h => h.eventId);
  return {age: player.age, year: player.birthYear + player.age, mainEventDrawn, eventIds, processedCount: eventIds.length};
}
function pendingMajorNodes(state) {
  if (!state.player.alive || !state.annual.mainEventDrawn || (state.currentEventId && !state.resolved)) return [];
  return EVENTS.filter(event => event.isMajorNode === true && !state.annual.eventIds.includes(event.id) && eligible(event, state.player));
}
function canContinueYear(state) {
  return state.annual.processedCount < MAX_EVENTS_PER_YEAR && pendingMajorNodes(state).length > 0;
}
function beginYear(state, random = Math.random) {
  if (state.annual?.age === state.player.age && state.annual.year === state.world.year && state.annual.mainEventDrawn) return;
  state.annual = createAnnualProgress(state.player, false);
  state.currentEventId = state.player.alive ? pickEvent(state.player, random)?.id || null : null;
  state.annual.mainEventDrawn = true;
  state.resolved = false;
  state.result = "";
}
function finishAnnualChoice(state, event, choice) {
  if (!state.player.alive || state.resolved || state.currentEventId !== event.id || state.annual.eventIds.includes(event.id) || state.annual.processedCount >= MAX_EVENTS_PER_YEAR) throw new Error("本年度事件不能重复或超出上限");
  if (!eligible(event, state.player) || (state.annual.processedCount > 0 && event.isMajorNode !== true)) throw new Error("事件不再符合当前状态，或不是可追加的重要节点");
  if (!event.choices.includes(choice)) throw new Error("选择不属于当前事件");
  applyChoice(state.player, event, choice);
  state.annual.eventIds.push(event.id);
  state.annual.processedCount = state.annual.eventIds.length;
  state.resolved = true;
  state.result = choice.resultText;
}
function continueOrGrow(state, random = Math.random) {
  if (!state.player.alive || (state.currentEventId && !state.resolved)) return false;
  // 在实际展示前再次筛选，读取上一个选择修改后的状态。
  if (canContinueYear(state)) {
    const event = pickEvent(state.player, random, pendingMajorNodes(state));
    state.currentEventId = event.id;
    state.resolved = false;
    state.result = "";
    return true;
  }
  if (state.annual.processedCount === 0 && !state.player.history.some(h => h.age === state.player.age)) state.player.history.push({age: state.player.age, year: state.world.year, eventId: null, eventTags: [], text: "平静地度过了这一年。", importance: 0});
  advanceYear(state.player, state.world);
  beginYear(state, random);
  return true;
}
function validAnnualProgress(state) {
  const a = state.annual;
  if (!isRecord(a) || a.age !== state.player.age || a.year !== state.world.year || a.mainEventDrawn !== true || !isTextList(a.eventIds) || !isAge(a.processedCount)) return false;
  if (a.processedCount !== a.eventIds.length || a.processedCount > MAX_EVENTS_PER_YEAR || new Set(a.eventIds).size !== a.eventIds.length) return false;
  const historyIds = state.player.history.filter(h => h.age === a.age && h.eventId !== null).map(h => h.eventId);
  if (JSON.stringify(historyIds) !== JSON.stringify(a.eventIds)) return false;
  if (state.currentEventId !== null) {
    if (state.resolved) { if (a.eventIds.at(-1) !== state.currentEventId) return false; }
    else {
      if (a.eventIds.includes(state.currentEventId) || a.processedCount >= MAX_EVENTS_PER_YEAR) return false;
      if (a.processedCount > 0 && !EVENTS.some(e => e.id === state.currentEventId && e.isMajorNode === true)) return false;
    }
  }
  return true;
}
