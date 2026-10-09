const SAVE_KEY = "east-asian-life-v01";
const STAT_LABELS = { health: "健康", happiness: "快乐", study: "学业", stress: "压力", family: "家庭关系", money: "金钱" };
let state = null;
const $ = id => document.getElementById(id);
const eventReport = checkEvents(EVENTS);
if (eventReport.errors.length || eventReport.warnings.length) {
  $("data-diagnostics").hidden = false;
  $("data-diagnostics").textContent = ["开发数据检查", ...eventReport.errors.map(x => `错误：${x}`), ...eventReport.warnings.map(x => `警告：${x}`)].join("\n");
  eventReport.errors.forEach(x => console.error(`[事件数据] ${x}`));
  eventReport.warnings.forEach(x => console.warn(`[事件数据] ${x}`));
}
$("start").disabled = eventReport.errors.length > 0;
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); $("save-status").textContent = "已自动保存到本浏览器。"; }
  catch { $("save-status").textContent = "浏览器无法保存；当前仍可游玩，但关闭后可能丢失进度。"; }
}
function newLife() {
  if (eventReport.errors.length) return;
  const player = createPlayer();
  state = { version: 1, player, world: createWorld(), currentEventId: pickEvent(player)?.id || null, resolved: false, result: "" };
  save(); render();
}
function addText(parent, tag, text, className) {
  const node = document.createElement(tag); node.textContent = text;
  if (className) node.className = className;
  parent.append(node); return node;
}
function render() {
  $("title-screen").hidden = !!state; $("game").hidden = !state;
  if (!state) return;
  const p = state.player;
  $("profile").textContent = `${p.name} · ${p.gender} · ${p.age} 岁`;
  $("background").textContent = `${state.world.year} 年 · ${stageFor(p.age)[2]} · ${p.identity}｜${p.familyBackground}`;
  $("stats").replaceChildren();
  for (const [key, label] of Object.entries(STAT_LABELS)) {
    const wrapper = addText($("stats"), "div", "");
    const row = addText(wrapper, "div", "", "stat-label");
    addText(row, "span", label); addText(row, "span", key === "money" ? `¥ ${p[key].toLocaleString("zh-CN")}` : String(p[key]));
    if (key !== "money") { const bar = document.createElement("progress"); bar.max = 100; bar.value = p[key]; bar.setAttribute("aria-label", label); wrapper.append(bar); }
  }
  $("tags").replaceChildren();
  if (!p.tags.length) addText($("tags"), "span", "还没有标签，人生才刚开始。");
  p.tags.forEach(tag => addText($("tags"), "span", tag, "tag"));
  $("history").replaceChildren();
  [...p.history].reverse().forEach(item => addText($("history"), "li", `${item.age} 岁 · ${item.year} 年：${item.text}`));
  if (!p.history.length) addText($("history"), "li", "故事还没有写下第一行。");
  const event = EVENTS.find(item => item.id === state.currentEventId);
  $("choices").replaceChildren();
  $("event-meta").textContent = event && p.alive ? `${p.age} 岁 · ${event.eventTags.join(" / ")}` : "人生的一页";
  $("result").textContent = state.result;
  if (!p.alive) {
    $("event-title").textContent = "这一生，走到了终点";
    const important = p.history.filter(item => item.importance >= 3).map(item => `${item.age} 岁：${item.text}`);
    $("description").textContent = `你走过了 ${p.age} 年，做出 ${p.history.filter(item => item.eventId).length} 次选择。${important.length ? "回望那些转折——" + important.join(" ") : "平凡的日子也构成了你的一生。"}`;
    $("result").textContent = "可以翻看人生历史，然后重新投胎。";
  } else if (event) {
    $("event-title").textContent = event.title; $("description").textContent = event.description;
    if (!state.resolved) event.choices.forEach(choice => {
      const button = addText($("choices"), "button", choice.text);
      button.onclick = () => {
        if (state.resolved || !state.player.alive) return;
        applyChoice(state.player, event, choice); state.resolved = true; state.result = choice.resultText;
        save(); render();
      };
    });
  } else {
    $("event-title").textContent = "平静的一年";
    $("description").textContent = "这一年没有特别的事件。生活也由这些平凡的日子组成。";
  }
  $("grow").disabled = !p.alive || (!!event && !state.resolved);
  $("grow").textContent = event && !state.resolved && p.alive ? "先做出选择，再长大" : "长大一岁 →";
}
$("start").onclick = newLife;
$("restart").onclick = () => { if (confirm("重新投胎会覆盖当前人生存档。确定开始吗？")) newLife(); };
$("grow").onclick = () => {
  if (!state || !state.player.alive || (state.currentEventId && !state.resolved)) return;
  if (!state.currentEventId) state.player.history.push({ age: state.player.age, year: state.world.year, eventId: null, eventTags: [], text: "平静地度过了这一年。", importance: 0 });
  advanceYear(state.player, state.world);
  state.currentEventId = state.player.alive ? pickEvent(state.player)?.id || null : null;
  state.resolved = false; state.result = ""; save(); render();
};
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw && !eventReport.errors.length) {
    const loaded = JSON.parse(raw);
    if (!validSave(loaded)) throw new Error("invalid save");
    state = loaded; $("save-status").textContent = "已恢复上次的人生。";
  }
} catch { state = null; $("save-status").textContent = "存档无法读取。原存档尚未覆盖；点击开始新人生即可重新开始。"; }
render();
