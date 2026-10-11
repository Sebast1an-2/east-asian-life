// money是净现金（元），monthlyIncome是持续月收入。事件effects.money只记一次性收支。
// 普通生活支出是虚构社会的统一粗估，不模拟税、房贷、地段或共同资产。
const HOME_PURCHASE_COST = 120000;
const HOME_SALE_PROCEEDS = 90000;
function defaultMonthlyIncome(work) {
  if (work.status === "retired") return 1800; // 简化的退休生活收入，非现实养老金计算。
  if (work.status !== "employed") return 0;
  const base = {general: 4000, esports: 8000, esports_coach: 4500, streamer: 5000, musician: 3500};
  let income = base[work.careerType] || 4000;
  if (work.careerType === "general" && work.workStyle === "high_pressure") income = 6500;
  if (work.level >= 2) income += 1500; // 所有工作复用这一档责任差异，不另建职业工资树。
  return income;
}
function createEconomy(age = 0) { return {lastSettledAge: age - 1, lastSettlement: null}; }
function validMonthlyIncome(value) { return Number.isSafeInteger(value) && value >= 0 && value <= 1000000; }
function prepareIncome(player, next, choice) {
  let income = player.monthlyIncome;
  // 只有就业、主职业或岗位责任实际变化才采用默认收入；节奏调整与重复写入不改工资。
  const incomeBasisChanged = ["status", "careerType", "level"].some(key => player.work[key] !== next.work[key]);
  if (incomeBasisChanged) income = defaultMonthlyIncome(next.work);
  if (Object.hasOwn(choice, "monthlyIncome")) income = choice.monthlyIncome;
  if (!validMonthlyIncome(income) || (!["employed", "retired"].includes(next.work.status) && income !== 0)) throw new Error("持续收入与工作状态不一致");
  return income;
}
function annualLivingCost(player) {
  if (player.age < 18) return 0; // 成年以前基本生活由家里承担，个人事件支出仍单独记账。
  const monthly = {with_family: 1500, renting: 2300, owns_home: 1800}[player.housing.status];
  const childCost = player.child.hasChild && childAge(player) < 18 ? 900 : 0;
  return (monthly + childCost) * 12;
}
function settleYear(player) {
  if (!player.alive || player.economy.lastSettledAge >= player.age) return false;
  const income = player.monthlyIncome * 12, expenses = annualLivingCost(player);
  const balanceBefore = player.money, net = income - expenses, balanceAfter = balanceBefore + net;
  if (!Number.isFinite(balanceAfter)) throw new Error("年度资金无法结算");
  player.economy.lastSettlement = {age: player.age, year: player.birthYear + player.age, income, expenses, net, balanceBefore, balanceAfter};
  player.economy.lastSettledAge = player.age;
  player.money = balanceAfter;
  return true;
}
function validEconomy(player) {
  const e = player.economy;
  if (!validMonthlyIncome(player.monthlyIncome) || (!["employed", "retired"].includes(player.work.status) && player.monthlyIncome !== 0)) return false;
  if (!isRecord(e) || Object.keys(e).length !== 2 || !Number.isInteger(e.lastSettledAge) || e.lastSettledAge < -1 || e.lastSettledAge > player.age) return false;
  const s = e.lastSettlement;
  if (s === null) return true; // 新人生/升级不补过去账单。
  return isRecord(s) && Object.keys(s).length === 7 && s.age === e.lastSettledAge && s.year === player.birthYear + s.age &&
    ["income", "expenses", "net", "balanceBefore", "balanceAfter"].every(k => Number.isFinite(s[k])) && s.income >= 0 && s.expenses >= 0 &&
    s.net === s.income - s.expenses && s.balanceAfter === s.balanceBefore + s.net;
}
