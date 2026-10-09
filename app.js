const SAVE_KEY = "east-asian-life-v01";
const STAT_LABELS = { health: "健康", happiness: "快乐", study: "学业", stress: "压力", family: "家庭关系", money: "存款 / 净现金" };
// 地址末尾加 ?debug=1 显示公开属性的精确条件；自主性继续隐藏。
const DEBUG_MODE = typeof location !== "undefined" && new URLSearchParams(location.search).get("debug") === "1";
let state = null;
const $ = id => document.getElementById(id);
$("data-diagnostics").hidden = true;
$("data-diagnostics").textContent = "";
const eventReport = checkEvents(EVENTS);
if (eventReport.errors.length || eventReport.warnings.length) {
  if (DEBUG_MODE) {
    $("data-diagnostics").hidden = false;
    $("data-diagnostics").textContent = ["开发数据检查", ...eventReport.errors.map(x => `错误：${x}`), ...eventReport.warnings.map(x => `警告：${x}`)].join("\n");
    eventReport.errors.forEach(x => console.error(`[事件数据] ${x}`));
    eventReport.warnings.forEach(x => console.warn(`[事件数据] ${x}`));
  } else if (eventReport.errors.length) $("save-status").textContent = "故事资料暂时无法加载，已有的人生存档仍保留。";
}
$("start").disabled = eventReport.errors.length > 0;
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); $("save-status").textContent = "已自动保存到本浏览器。"; }
  catch { $("save-status").textContent = "浏览器无法保存；当前仍可游玩，但关闭后可能丢失进度。"; }
}
function newLife() {
  if (eventReport.errors.length) return;
  const player = createPlayer();
  state = { version: SAVE_VERSION, player, world: createWorld(), currentEventId: null, resolved: false, result: "" };
  beginYear(state);
  save(); render();
}
function addText(parent, tag, text, className) {
  const node = document.createElement(tag); node.textContent = text;
  if (className) node.className = className;
  parent.append(node); return node;
}
function yuan(value) { return `¥ ${value.toLocaleString("zh-CN")}`; }
function renderLifeSummary(summary) {
  const box = $("life-summary"), f = summary.facts;
  addText(box, "h2", "你的一生");
  addText(box, "p", `${f.name} · ${f.birthYear}—${f.deathYear} · 享年 ${f.deathAge} 岁`);
  addText(box, "p", `${f.finalCareer} · ${f.relationship} · ${f.housing} · 最终净现金 ${yuan(f.money)}`);
  if (f.careerPath.length) addText(box, "p", "职业足迹：" + f.careerPath.map(h=>`${h.age}岁 ${h.label}`).join(" → "));
  addText(box, "p", `最后一页：${f.deathReason}。${summary.recap}`);
  addText(box, "h3", "这一生的主题");
  summary.themes.forEach(t=>{addText(box,"strong",t.name,"summary-theme");addText(box,"p",t.reason);});
  for (const [heading, items] of [["人生轨迹",summary.trajectory],["人生高光",summary.highlights]]) {
    if (!items.length) continue;
    addText(box,"h3",heading);
    const list=addText(box,"ul","","summary-timeline");
    items.forEach(h=>{const row=addText(list,"li","");addText(row,"strong",`${h.age}岁 · 《${h.title}》`);addText(row,"div",h.text);});
  }
  if (summary.unfinished.length) {addText(box,"h3","没有走完的路");summary.unfinished.forEach(h=>addText(box,"p",h.text));}
  $("life-question").textContent = `${summary.closing}\n\n${summary.question}`;
}
function render() {
  $("title-screen").hidden = !!state; $("game").hidden = !state;
  if (!state) return;
  const p = state.player;
  $("profile").textContent = `${p.name} · ${p.gender} · ${p.age} 岁`;
  $("background").textContent = `${state.world.year} 年 · ${stageFor(p.age)[2]} · ${p.identity}｜${p.familyBackground}`;
  $("life-states").textContent = `当前生活：${p.work.status === "employed" ? "在职 · " : ""}${careerLabel(p.work)} · ${RELATIONSHIP_LABELS[p.relationship.status]} · ${p.child.hasChild ? `孩子 ${childAge(p)} 岁` : "无孩子"} · ${HOUSING_LABELS[p.housing.status]}`;
  const bill=p.economy.lastSettlement;
  $("income").textContent = `每月持续收入 ${yuan(p.monthlyIncome)}${p.work.status === "retired" ? "（退休生活收入）" : ""}。${p.money < 0 ? "净现金为负表示尚未覆盖的资金缺口。" : ""}`;
  $("yearly-money").textContent = bill && bill.age >= 18 ? `${bill.year}年：收入 ${yuan(bill.income)} − 基本生活支出 ${yuan(bill.expenses)}，年度净变化 ${yuan(bill.net)}。事件的一次性收支另记。` : "持续收入与基本生活支出，在长大一岁时结算。";
  $("stats").replaceChildren();
  for (const [key, label] of Object.entries(STAT_LABELS)) {
    const wrapper = addText($("stats"), "div", "");
    const row = addText(wrapper, "div", "", "stat-label");
    addText(row, "span", label); addText(row, "span", key === "money" ? `¥ ${p[key].toLocaleString("zh-CN")}` : String(p[key]));
    if (key !== "money") { const bar = document.createElement("progress"); bar.max = 100; bar.value = p[key]; bar.setAttribute("aria-label", label); wrapper.append(bar); }
  }
  $("tags").replaceChildren();
  const traits=visibleTags(p);
  if (!traits.length) addText($("tags"), "span", "有些倾向，要走过一些日子才看得见。");
  traits.forEach(tag => addText($("tags"), "span", tag, "tag"));
  $("history").replaceChildren();
  [...p.history].reverse().forEach(item => {
    const row = addText($("history"), "li", "");
    addText(row, "strong", `${item.age} 岁 · ${item.eventTitle ? `《${item.eventTitle}》` : "这一年"}`);
    addText(row, "div", `${item.year} 年 · ${item.text}`);
  });
  if (!p.history.length) addText($("history"), "li", "故事还没有写下第一行。");
  const event = EVENTS.find(item => item.id === state.currentEventId);
  $("choices").replaceChildren();
  $("event-meta").textContent = event && p.alive ? `${p.age} 岁 · 今年第 ${state.resolved ? state.annual.processedCount : state.annual.processedCount + 1} 件事${DEBUG_MODE ? ` · ${event.id} / ${event.category}` : ""}` : "人生的一页";
  $("result").textContent = state.result;
  $("trigger-reasons").textContent = "";
  $("event-card").hidden = !p.alive;
  $("life-summary").hidden = p.alive;
  $("life-summary").replaceChildren();
  $("life-question").hidden = p.alive;
  $("life-question").textContent = "";
  if (!p.alive) {
    const summary=buildLifeSummary(p);
    renderLifeSummary(summary);
    $("event-title").textContent = "你的一生";
    $("description").textContent = summary.recap;
    $("result").textContent = `${p.death.deathYear} 年 · ${p.death.deathReason}。可以翻看人生历史，然后重新投胎。`;
  } else if (event) {
    $("event-title").textContent = event.title;
    // 已选卡片保留当时看到的文案，避免状态变化后把过去的情境重新改写。
    const last = p.history.at(-1);
    $("description").textContent = state.resolved && last?.eventId === event.id && last.eventDescription ? last.eventDescription : describeEvent(event, p);
    const reasons = state.resolved ? (last?.triggerReasons || []) : triggerReasons(event, p);
    $("trigger-reasons").textContent = reasons.map(r => `触发原因：${r.text}${DEBUG_MODE ? `（${r.detail}）` : ""}`).join("；");
    if (state.resolved && last?.eventId === event.id) {
      if (last.cashReason) $("result").textContent += `\n${last.cashReason}：${yuan(last.effects.money)}。`;
      if (last.incomeChange) $("result").textContent += `\n持续月收入：${yuan(last.incomeChange.before)} → ${yuan(last.incomeChange.after)}。`;
    }
    if (!state.resolved) event.choices.forEach(choice => {
      const button = addText($("choices"), "button", choice.text);
      button.onclick = () => {
        if (state.resolved || !state.player.alive) return;
        try { finishAnnualChoice(state, event, choice); }
        catch (error) { $("save-status").textContent = DEBUG_MODE ? `选择未执行：${error.message}` : "这一选择暂时无法完成，请刷新后再试。"; if (DEBUG_MODE) console.error(error); return; }
        save(); render();
      };
    });
  } else {
    $("event-title").textContent = "平静的一年";
    $("description").textContent = "这一年没有特别的事件。生活也由这些平凡的日子组成。";
  }
  $("grow").disabled = !p.alive || (!!event && !state.resolved);
  $("grow").textContent = event && !state.resolved && p.alive ? "先做出选择，再继续" : (canContinueYear(state) ? "继续这一年 →" : "长大一岁 →");
}
$("start").onclick = newLife;
$("restart").onclick = () => { if (confirm("重新投胎会覆盖当前人生存档。确定开始吗？")) newLife(); };
$("grow").onclick = () => {
  if (state && continueOrGrow(state)) { save(); render(); }
};
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw && !eventReport.errors.length) {
    const loaded = JSON.parse(raw);
    state = upgradeSave(loaded);
    $("save-status").textContent = loaded.version === SAVE_VERSION ? "已恢复上次的人生。" : "已接着上次的人生，原有选择和记录都已保留。";
  }
} catch { state = null; $("save-status").textContent = "存档无法读取。原存档尚未覆盖；点击开始新人生即可重新开始。"; }
render();
