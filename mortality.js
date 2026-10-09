// 每个人只有一个隐藏种子；同一年龄的抽签不使用Math.random，刷新不能重抽。
const MAX_LIFE_AGE = 110;
function stableSeed(text) {
  let seed = 2166136261;
  for (const char of text) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  return seed;
}
function createLifespan(seed = Math.floor(Math.random() * 4294967296), age = 0) {
  return {seed, lastCheckedAge: age};
}
function mortalityRoll(seed, age) {
  let n = (seed ^ Math.imul(age + 1, 2654435761)) >>> 0;
  n = Math.imul(n ^ (n >>> 16), 2246822507);
  n = Math.imul(n ^ (n >>> 13), 3266489909);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function deathRisk(age, health) {
  if (age < 60) return 0;
  if (age >= MAX_LIFE_AGE) return 1; // 原型的明确终点保护，不是医学结论。
  const base = age < 70 ? .01 : age < 80 ? .03 : age < 90 ? .08 : age < 100 ? .18 : .35;
  return Math.min(.8, base + (100 - health) * .001);
}
function recordDeath(player, reason) {
  if (player.death) return; // 死亡只记录一次，不追加普通事件或改写原因。
  player.alive = false;
  player.death = {deathAge: player.age, deathYear: player.birthYear + player.age, deathReason: reason};
}
function checkMortality(player) {
  if (!player.alive) return;
  if (player.health <= 0) { recordDeath(player, "健康严重恶化"); return; }
  if (player.lifespan.lastCheckedAge >= player.age) return;
  player.lifespan.lastCheckedAge = player.age;
  if (mortalityRoll(player.lifespan.seed, player.age) < deathRisk(player.age, player.health)) recordDeath(player, "自然寿命终点");
}
function validLifespan(player) {
  const s = player.lifespan, d = player.death;
  if (!isRecord(s) || Object.keys(s).some(k => !["seed", "lastCheckedAge"].includes(k)) || !Number.isInteger(s.seed) || s.seed < 0 || s.seed > 4294967295 || !isAge(s.lastCheckedAge) || s.lastCheckedAge > player.age) return false;
  if (player.alive) return d === null && player.health > 0 && player.age < MAX_LIFE_AGE;
  return isRecord(d) && Object.keys(d).length === 3 && d.deathAge === player.age && d.deathYear === player.birthYear + player.age &&
    (d.deathReason === "健康严重恶化" ? player.health === 0 : d.deathReason === "自然寿命终点" && player.age >= 60 && player.health > 0);
}
