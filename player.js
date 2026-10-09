// Player 和 World 的初始数据。自主性只供事件引擎使用，不显示在页面上。
const STAGES = [
  [0, "childhood", "童年"], [6, "primary_school", "小学"],
  [12, "middle_school", "初中"], [15, "high_school", "高中"],
  [19, "university", "大学年龄段"], [23, "working", "工作年龄段"],
  [36, "middle_age", "中年"], [60, "elderly", "晚年"]
];
const BOUNDED_STATS = ["health", "happiness", "study", "stress", "family", "autonomy"];
function stageFor(age) { return [...STAGES].reverse().find(stage => age >= stage[0]); }
function createPlayer() {
  const names = ["林小禾", "陈知远", "许安", "周小满"];
  return {
    name: names[Math.floor(Math.random() * names.length)],
    gender: Math.random() < 0.5 ? "女" : "男", age: 0, birthYear: 2000,
    lifeStage: "childhood", identity: "婴儿", alive: true,
    familyBackground: "普通家庭：日子过得去，期待从不缺席。",
    health: 80, happiness: 65, study: 30, stress: 10, family: 70,
    money: 0, autonomy: 40, tags: [], history: [], lifespan: createLifespan(), death: null, ...createLifeStates()
  };
}
function createWorld() {
  return { name: "虚构东亚社会", year: 2000, npcs: [] };
}
// 未来 NPC 可以使用 { id, name, relationship, tags }，本版暂不生成 NPC。
