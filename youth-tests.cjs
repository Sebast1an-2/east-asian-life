// 青年事件路径测试：全部使用正式事件和真实年度引擎，不注入剧情到页面。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ctx = vm.createContext({});
for (const file of ['player.js', 'life-state.js', 'events.js', 'events-young.js', 'engine.js', 'annual.js', 'validation.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, {filename: file});
}
const run = source => vm.runInContext(source, ctx);
const report = run('checkEvents(EVENTS)');
assert.equal(run('EVENTS.length'), 50);
assert.equal(report.errors.length, 0, report.errors.join('\n'));

run(`{
  const expect = (value, message) => {if (!value) throw Error(message);};
  const event = id => EVENTS.find(e => e.id === id);
  const setAge = (p, age) => {p.age = age; p.lifeStage = stageFor(age)[1];};
  const choose = (p, eventId, choiceId) => {
    const e = event(eventId); expect(eligible(e, p), '前置不满足: ' + eventId);
    applyChoice(p, e, e.choices.find(c => c.id === choiceId));
  };
  const p = createPlayer(); setAge(p, 23);
  choose(p, 'first_job', 'flexible'); setAge(p, 25);
  expect(eligible(event('young_fast_track'), p), '高压路线缺少机会');
  expect(!eligible(event('young_free_evening'), p), '高压路线进入平衡专属');
  choose(p, 'young_fast_track', 'take'); setAge(p, 27);
  expect(eligible(event('young_promotion'), p), '接下项目没有晋升后续');
  choose(p, 'young_promotion', 'accept');
  setAge(p, 29); p.stress = Math.max(p.stress, 35);
  expect(eligible(event('young_burnout'), p), '高压倦怠不符合条件');
  choose(p, 'young_job_change', 'clear_hours');
  expect(p.work.workStyle === 'balanced', '高压无法中途转向');
  expect(!eligible(event('young_burnout'), p) && eligible(event('young_free_evening'), p), '转向后事件池未改变');

  const balanced = createPlayer(); setAge(balanced, 23); choose(balanced, 'first_job', 'steady'); setAge(balanced, 28);
  expect(!eligible(event('young_fast_track'), balanced) && !eligible(event('young_burnout'), balanced), '平衡工作进入高压专属');
  expect(eligible(event('young_free_evening'), balanced), '平衡工作缺少生活事件');
  choose(balanced, 'young_free_evening', 'extra');
  expect(eligible(event('young_fast_track'), balanced), '平衡工作无法转回职业竞争');

  const single = createPlayer(); setAge(single, 28);
  expect(!eligible(event('young_married_daily'), single) && !eligible(event('young_commitment'), single), '单身出现婚恋专属');
  setAge(single, 24); choose(single, 'young_meet', 'date'); setAge(single, 26);
  choose(single, 'young_values', 'align'); setAge(single, 27);
  expect(eligible(event('young_commitment'), single), '关系链没有接通');
  choose(single, 'young_commitment', 'partner');
  setAge(single, 30);
  expect(!eligible(event('young_commitment'), single), '不婚后反复出现相同婚姻节点');
  expect(eligible(event('young_values'), single), '不婚没有关系后续');
  choose(single, 'young_values', 'register');
  expect(single.relationship.status === 'married' && !single.tags.includes('主动不婚'), '主动不婚不能重新选择');
  expect(!eligible(event('young_parenthood_plan'), single), '刚登记就自动要求生育讨论');
  choose(single, 'young_married_daily', 'share');
  expect(eligible(event('young_parenthood_plan'), single), '已婚缺少生育讨论');
  choose(single, 'young_parenthood_plan', 'no_child');
  setAge(single, 32); // 婚后日常刚发生过，先正常等待两年冷却。
  expect(single.child.hasChild === false && single.tags.includes('主动不生育') && eligible(event('young_married_daily'), single), '不生育被强制生育或关闭生活事件');

  const broken = createPlayer(); setAge(broken, 24); choose(broken, 'young_meet', 'date'); setAge(broken, 26);
  choose(broken, 'young_values', 'breakup'); setAge(broken, 29);
  expect(!eligible(event('young_values'), broken) && !eligible(event('young_commitment'), broken) && !eligible(event('young_married_daily'), broken), '分手后旧关系节点仍出现');
  expect(eligible(event('young_single_life'), broken), '分手后没有独立生活后续');

  const housing = () => {const q = createPlayer(); setAge(q, 24); choose(q, 'young_move_out', 'rent'); setAge(q, 29); q.money = 6000; return q;};
  const renter = housing(), owner = housing();
  choose(renter, 'young_housing_choice', 'keep_renting'); choose(owner, 'young_housing_choice', 'buy');
  setAge(renter, 30); setAge(owner, 30);
  expect(eligible(event('young_rent'), renter) && !eligible(event('young_home_care'), renter), '租房后续错误');
  expect(eligible(event('young_home_care'), owner) && !eligible(event('young_rent'), owner), '买房后续错误');
  choose(owner, 'young_home_care', 'sell_plan');
  expect(owner.housing.status === 'renting' && eligible(event('young_rent'), owner), '买房不能转向租住');
  choose(renter, 'young_rent', 'reconsider'); setAge(renter, 31);
  expect(eligible(event('young_housing_choice'), renter) === false, '重开讨论也必须遵守冷却');
  setAge(renter, 32); expect(eligible(event('young_housing_choice'), renter), '租房路线无法重新考虑买房');

  const unemployed = createPlayer(); setAge(unemployed, 22); choose(unemployed, 'young_direction', 'pause'); setAge(unemployed, 23);
  expect(!eligible(event('first_job'), unemployed) && eligible(event('young_job_search'), unemployed), '暂缓被第一份工作强行覆盖');
  choose(unemployed, 'young_job_search', 'restart');
  expect(unemployed.work.status === 'employed' && unemployed.work.workStyle === 'balanced', '失业无法重新就业');
  setAge(unemployed, 30); choose(unemployed, 'young_career_crisis', 'leave'); setAge(unemployed, 31);
  expect(eligible(event('young_job_search'), unemployed) && !eligible(event('young_fast_track'), unemployed), '失业后事件池没有改变');

  const echo = createPlayer(); setAge(echo, 24);
  echo.work = {status:'employed', careerType:'general', level:1, workStyle:'balanced', startYear:2023};
  expect(!eligible(event('young_salary_echo'), echo), '伪造压岁钱回声');
  echo.history.push({eventId:'first_job', choiceId:'steady'}, {eventId:'red_envelope', choiceId:'entrust'});
  expect(eligible(event('young_salary_echo'), echo), '真实压岁钱未解锁工资回声');
  setAge(echo, 26);
  expect(!eligible(event('young_decision_echo'), echo) && !eligible(event('young_ranking_echo'), echo), '无历史出现学生时代回声');
  echo.history.push({eventId:'interest', choiceId:'art'}, {eventId:'young_move_out', choiceId:'stay'}, {eventId:'ranking', choiceId:'review'});
  expect(!eligible(event('young_decision_echo'), echo) && !eligible(event('young_ranking_echo'), echo), '错误具体选择触发回声');
  echo.history.push({eventId:'interest', choiceId:'math'}, {eventId:'ranking', choiceId:'chase'});
  expect(eligible(event('young_decision_echo'), echo) && eligible(event('young_ranking_echo'), echo), '正确具体选择未触发回声');
}`);

// 完整年度模拟，固定随机种子使同样的输入可重复验证。
run(`
function simulateYouth(seed, policy, setup) {
  let value = seed;
  const random = () => {value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296;};
  const player = createPlayer(); if (setup) setup(player);
  const startAge = player.age;
  const state = {version:SAVE_VERSION, player, world:{...createWorld(), year:player.birthYear+player.age}, currentEventId:null, resolved:false, result:''};
  beginYear(state, random);
  const years = {}, seen = {}, choices = {};
  let guard = 0;
  while (player.alive) {
    if (++guard > 240) throw Error('年度流程死循环');
    const e = EVENTS.find(e => e.id === state.currentEventId);
    if (e && !state.resolved) {
      const wanted = policy[e.id];
      const choice = e.choices.find(c => c.id === wanted) || e.choices[Math.floor(random()*e.choices.length)];
      finishAnnualChoice(state, e, choice);
      seen[e.id] = (seen[e.id] || 0)+1;
      choices[e.id+':'+choice.id] = true;
      if (player.age >= 22 && player.age <= 35) (years[player.age] ||= []).push(e.id);
    }
    if (!validSave(state)) throw Error('无效存档 '+player.age+' '+state.currentEventId);
    const restored = upgradeSave(JSON.parse(JSON.stringify(state)));
    if (!validSave(restored)) throw Error('恢复失败');
    continueOrGrow(state, random);
  }
  let blank = 0, maxBlank = 0;
  for (let age=Math.max(22,startAge);age<=35;age++) {blank = years[age]?.length ? 0 : blank+1; maxBlank=Math.max(maxBlank,blank);}
  return {years, seen, choices, maxBlank, finalAge:player.age, health:player.health};
}
`);

// 质量修正：用真实选择和年度引擎验证延期机会、保护边界及普通事件的可达性。
run(`{
  const expect = (value, message) => {if (!value) throw Error(message);};
  const event = id => EVENTS.find(e => e.id === id);
  const age = (p, a) => {p.age=a; p.lifeStage=stageFor(a)[1];};
  const choose = (p, id, cid) => {const e=event(id); expect(eligible(e,p), '前置不满足 '+id); applyChoice(p,e,e.choices.find(c=>c.id===cid));};
  const state = p => {const s={version:SAVE_VERSION, player:p, world:{...createWorld(),year:p.birthYear+p.age}, currentEventId:null, resolved:false, result:''}; beginYear(s,()=>0); return s;};
  const finish = (s, cid) => {const e=event(s.currentEventId); finishAnnualChoice(s,e,e.choices.find(c=>c.id===cid)); expect(validSave(s),'保存无效 '+e.id);};
  for (const id of ['young_promotion','young_move_out','young_housing_choice','young_commitment','young_parenthood_plan']) expect(event(id).isMajorNode!==true,'普通人生选择仍被标为Major '+id);

  // 32岁重新就业，没有first_job历史；33岁主动争取岗位，34岁正常主抽晋升。
  const late=createPlayer(); age(late,32); late.work.status='unemployed';
  choose(late,'young_job_search','restart'); age(late,33); choose(late,'young_job_change','higher_pay'); age(late,34);
  expect(!late.history.some(h=>h.eventId==='first_job'),'测试错误地依赖唯一初职');
  const career=state(late); expect(career.currentEventId==='young_promotion','晚就业晋升被普通候选挤掉');
  finish(career,'accept'); expect(late.work.level===2 && !canContinueYear(career),'晋升错误占用同年追加');
  continueOrGrow(career,()=>0); expect(late.age===35,'取消Major后年度推进失败');
  const forged=createPlayer(); age(forged,34); forged.work={...late.work,level:1}; forged.tags=['争取晋升'];
  expect(!eligible(event('young_promotion'),forged),'没有真实职业选择，仅凭标签晋升');
  const notWorking=JSON.parse(JSON.stringify(late)); notWorking.work=createLifeStates().work; notWorking.tags.push('争取晋升');
  expect(!eligible(event('young_promotion'),notWorking),'未就业进入晋升');

  // 最晚35岁搬出，36岁仍能接住真实13岁经历的回声，不强行同年追加。
  const independent=createPlayer(); age(independent,13); choose(independent,'interest','math'); age(independent,35);
  const move=state(independent); expect(move.currentEventId==='young_move_out','35岁不能正常抽取搬出');
  finish(move,'rent'); expect(!canContinueYear(move),'搬出仍被同年追加规则处理');
  continueOrGrow(move,()=>0); expect(independent.age===36 && move.currentEventId==='young_decision_echo','晚搬出导致回声永久断裂');
  const restored=upgradeSave(JSON.parse(JSON.stringify(move))); expect(restored.currentEventId==='young_decision_echo' && validSave(restored),'回声待选刷新失败');
  finish(move,'joint_plan');

  const owner=createPlayer(); age(owner,32); owner.money=6000; owner.housing.status='owns_home';
  expect(!owner.tags.includes('已讨论住房') && !eligible(event('young_housing_choice'),owner),'缺少住房标签的房主仍被问是否买房');
  const renter=createPlayer(); age(renter,29); renter.money=6000; renter.housing.status='renting';
  choose(renter,'young_housing_choice','keep_renting'); age(renter,30); choose(renter,'young_rent','reconsider');
  age(renter,31); expect(!eligible(event('young_housing_choice'),renter),'重开讨论绕过冷却');
  age(renter,34); expect(eligible(event('young_housing_choice'),renter),'继续租住不能在较晚年份重新考虑');
  const housing=state(renter); expect(housing.currentEventId==='young_housing_choice','重开的住房讨论无法正常主抽'); finish(housing,'keep_renting');

  for (const a of [34,35]) {
    const partner=createPlayer(); age(partner,24); choose(partner,'young_meet','date'); age(partner,a===34?31:33); choose(partner,'young_values','align'); age(partner,a);
    const relationship=state(partner); expect(relationship.currentEventId==='young_commitment','晚发展的关系被年龄截止排除');
    for (const status of ['single','married']) {const p=JSON.parse(JSON.stringify(partner)); p.relationship.status=status; expect(!eligible(event('young_commitment'),p),status+'误入婚姻讨论');}
    const optedOut=JSON.parse(JSON.stringify(partner)); optedOut.tags.push('主动不婚'); expect(!eligible(event('young_commitment'),optedOut),'主动不婚误入讨论');
    const noHistory=JSON.parse(JSON.stringify(partner)); noHistory.history=[]; expect(!eligible(event('young_commitment'),noHistory),'无真实协商历史误入讨论');
    if (a===34) {choose(partner,'young_values','breakup'); expect(!eligible(event('young_commitment'),partner),'分手后旧讨论仍有效');}
    else finish(relationship,'partner');
  }

  // 先真实登记并协商共同生活，再有讨论机会；tag与历史任一声明不生育都受保护。
  const family=createPlayer(); age(family,24); choose(family,'young_meet','date'); age(family,28); choose(family,'young_values','register');
  expect(!eligible(event('young_parenthood_plan'),family),'仅结婚和年龄就触发生育讨论');
  choose(family,'young_married_daily','share'); age(family,29); choose(family,'young_move_out','rent'); age(family,34);
  expect(eligible(event('young_parenthood_plan'),family),'协商后的合法讨论被关闭');
  for(const status of ['single','dating']) {const p=JSON.parse(JSON.stringify(family)); p.relationship.status=status; expect(!eligible(event('young_parenthood_plan'),p),status+'误入生育讨论');}
  const noChild=JSON.parse(JSON.stringify(family)); noChild.tags.push('主动不生育'); expect(!eligible(event('young_parenthood_plan'),noChild),'已明确不育还被重复询问');
  const hasChild=JSON.parse(JSON.stringify(family)); hasChild.child={hasChild:true,birthYear:2033}; expect(!eligible(event('young_parenthood_plan'),hasChild),'已有孩子误入生育计划');
  const historyOnly=JSON.parse(JSON.stringify(family)); choose(historyOnly,'young_parenthood_plan','no_child'); historyOnly.tags=[];
  // 换测试id，单独验证历史排除，而不是仅靠不可重复规则。
  expect(!eligible({...event('young_parenthood_plan'),id:'history_guard_probe'},historyOnly),'移除标签后历史不育声明失效');
  const parenting=state(family); expect(parenting.currentEventId==='young_parenthood_plan','生育意愿讨论无法正常主抽'); finish(parenting,'no_child');
  const afterReload=upgradeSave(JSON.parse(JSON.stringify(parenting))); expect(!eligible(event('young_parenthood_plan'),afterReload.player),'刷新后重复生育讨论');

  // 更新前已经作为第二张卡片展示的Major，取消标记后能刷新并完成，不增年度名额。
  const oldPending=createPlayer(); age(oldPending,23); choose(oldPending,'first_job','flexible');
  age(oldPending,25); choose(oldPending,'young_fast_track','take'); age(oldPending,32);
  choose(oldPending,'young_holiday','stay');
  const stored={version:SAVE_VERSION,player:oldPending,world:{...createWorld(),year:2032},annual:createAnnualProgress(oldPending),currentEventId:'young_promotion',resolved:false,result:''};
  const restoredPending=upgradeSave(JSON.parse(JSON.stringify(stored))); finish(restoredPending,'accept');
  expect(restoredPending.annual.processedCount===2 && !canContinueYear(restoredPending),'已展示卡片恢复后重抽或多占名额');
  // 若新增保护使旧卡片不再合法，只撤下未选卡片，不丢此前历史或改变人生状态。
  const stale=JSON.parse(JSON.stringify(stored)); stale.currentEventId='young_parenthood_plan';
  const before=JSON.stringify(stale.player), staleRestored=upgradeSave(stale);
  expect(staleRestored.currentEventId===null && staleRestored.annual.processedCount===1 && JSON.stringify(staleRestored.player)===before,'撤下失效讨论丢失历史或状态');
  expect(staleRestored.annual.mainEventDrawn && !canContinueYear(staleRestored),'失效讨论恢复后重抽普通事件');
  const corrupt=JSON.parse(JSON.stringify(stale)); corrupt.player.health=-1;
  expect(!validSave(corrupt),'结构损坏存档被接受');
  let rejected=false; try {upgradeSave(corrupt);} catch {rejected=true;} expect(rejected,'撤下卡片机制绕过坏存档检查');
}`);
console.log('PASS: late employment/promotion, 35-to-36 independence echo, owner guard without tags, renter reopening, 34/35 commitment, child/no-child guards and reloads.');

// 小条件扩展仍用原校验器，拒绝未知状态、空条件和不存在的历史引用。
for (const conditions of [
  {statesNone:{housing:{status:'unknown'}}}, {statesNone:{}},
  {historyChoicesAny:[]}, {historyChoicesAny:[{eventId:'missing',choiceId:'take'}]},
  {historyChoicesAny:[{eventId:'young_job_change',choiceId:'missing'}]}
]) assert.ok(run(`checkEvents([{...EVENTS[0], conditions:${JSON.stringify(conditions)}}]).errors.length`) > 0, '非法新条件未被拒绝');
assert.ok(report.errors.length === 0);
// 条件互斥不做静态推理：合理窗口重叠仍保留明确的人工审查提醒。
assert.ok(run(`checkEvents([EVENTS[0],{...EVENTS[0],id:'review_only',conditions:{minAge:0,maxAge:0}}]).warnings.some(w=>w.includes('不一定是错误') && w.includes('人工核对'))`));
const common = {major:'safe', young_direction:'apply', art_class:'join', interest:'math', ranking:'chase', red_envelope:'entrust', young_salary_echo:'buffer', young_move_out:'rent', young_holiday:'stay', young_parenthood_plan:'no_child', old_album:'keep'};
const highPolicy = {...common, first_job:'flexible', boss_message:'reply', young_fast_track:'take', young_promotion:'accept', young_burnout:'push', young_job_change:'higher_pay', young_ranking_echo:'compete', young_meet:'date', young_values:'align', young_commitment:'marry', young_housing_choice:'buy', young_home_care:'repair', young_married_daily:'share'};
const balancedPolicy = {...common, first_job:'steady', boss_message:'morning', young_free_evening:'keep_time', young_ranking_echo:'own_scale', young_job_change:'clear_hours', young_meet:'single', young_single_life:'own_circle', young_housing_choice:'keep_renting', young_rent:'renew', young_career_crisis:'transfer'};
const results = [];
const counts = {};
for (let seed=1; seed<=240; seed++) {
  const result = run(`simulateYouth(${seed}, {}, null)`);
  for (const [id, count] of Object.entries(result.seen)) counts[id] = (counts[id] || 0)+count;
  results.push(result);
}
const missing = run('EVENTS.map(e=>e.id)').filter(id => !counts[id]);
assert.equal(missing.length, 0, '正式事件无法从出生触发：'+missing.join(', '));
const profilePaths = {};
for (const [name, policy] of [['high_married_owner', highPolicy], ['balanced_single_renter', balancedPolicy], ['unmarried_partner', {...balancedPolicy, young_meet:'date', young_values:'align', young_commitment:'partner'}], ['deferred_unemployed', {...balancedPolicy, young_direction:'pause', young_job_search:'wait', young_move_out:'stay'}]]) {
  const paths = [];
  for (let seed=1;seed<=60;seed++) paths.push(run(`simulateYouth(${seed}, ${JSON.stringify(policy)}, null)`));
  const worst = Math.max(...paths.map(p=>p.maxBlank));
  assert.ok(worst <= 1, name+' 连续空白 '+worst+' 年');
  assert.ok(paths.every(p=>p.finalAge===80), name+' 人生流程未完成');
  results.push(...paths);
  profilePaths[name] = paths;
  console.log('COVERAGE: '+name+', 60 lives, longest blank='+worst+' year(s).');
}
const exampleIndex = profilePaths.high_married_owner.findIndex((p, i) => p.seen.young_fast_track && profilePaths.balanced_single_renter[i].seen.young_free_evening);
assert.ok(exampleIndex >= 0, '缺少同种子两条工作路线的真实示例');
const highExample = profilePaths.high_married_owner[exampleIndex];
const balancedExample = profilePaths.balanced_single_renter[exampleIndex];
const promotedLives=profilePaths.high_married_owner.filter(p=>p.seen.young_promotion).length;
assert.ok(promotedLives>=48,'主动争取晋升的路线中，晋升正常主抽覆盖不足：'+promotedLives+'/60');
console.log('PROMOTION COVERAGE: '+promotedLives+'/60 career-seeking lives reached promotion as a normal main event.');
assert.ok(highExample.seen.young_fast_track);
assert.ok(!balancedExample.seen.young_fast_track && !balancedExample.seen.young_burnout);
assert.ok(balancedExample.seen.young_free_evening);
console.log('EXAMPLE high: '+JSON.stringify(highExample.years));
console.log('EXAMPLE balanced: '+JSON.stringify(balancedExample.years));
console.log('EXAMPLE seed: '+(exampleIndex+1));

// 特定合法当前状态的覆盖，避免只测到了“想结婚”却没有实际已婚的样本。
const employed = style => ({status:'employed', careerType:'general', level:1, workStyle:style, startYear:2023});
const fixtures = [
  ['single', {relationship:{status:'single',startYear:null}, work:employed('balanced'), housing:{status:'renting'}}],
  ['married_no_child', {relationship:{status:'married',startYear:2023}, work:employed('high_pressure'), housing:{status:'owns_home'}, tags:['已讨论住房']}],
  ['unmarried_partner', {relationship:{status:'dating',startYear:2023}, work:employed('balanced'), housing:{status:'renting'}, tags:['主动不婚','不登记的伴侣']}],
  ['childfree_married', {relationship:{status:'married',startYear:2023}, work:employed('balanced'), housing:{status:'renting'}, tags:['主动不生育','暂缓晋升']}],
  ['high_pressure', {work:employed('high_pressure'), housing:{status:'renting'}}],
  ['balanced', {work:employed('balanced'), housing:{status:'with_family'}}],
  ['unemployed_low_budget', {work:{status:'unemployed',careerType:null,level:0,workStyle:null,startYear:null}, money:500, housing:{status:'renting'}}],
  ['renter_low_budget', {work:employed('balanced'), money:500, housing:{status:'renting'}}],
  ['owner_with_child', {relationship:{status:'married',startYear:2022}, child:{hasChild:true,birthYear:2023}, work:employed('balanced'), housing:{status:'owns_home'}, tags:['已讨论住房']}],
  ['legacy_stable', {work:employed('stable'), housing:{status:'renting'}}]
];
for (const [name, fields] of fixtures) {
  let worst = 0;
  for (let seed=1;seed<=8;seed++) {
    const policy = {...balancedPolicy, young_job_search:'wait', young_values:'align', young_commitment:'partner', young_parenthood_plan:'no_child'};
    const result = run(`simulateYouth(${seed}, ${JSON.stringify(policy)}, p => {p.age=24; p.lifeStage=stageFor(24)[1]; Object.assign(p, ${JSON.stringify(fields)});})`);
    worst=Math.max(worst,result.maxBlank);
    assert.equal(result.finalAge, 80);
    if (name === 'unmarried_partner') assert.ok(!result.seen.young_commitment, '主动不婚状态被反复要求选择婚姻');
    if (name === 'owner_with_child') assert.ok(!result.seen.young_parenthood_plan, '已有孩子还被问是否成为父母');
    if (name === 'childfree_married') assert.ok(!result.seen.young_parenthood_plan, '明确不育路线被重新询问');
  }
  assert.ok(worst <= 1, name+' 状态覆盖出现连续空白 '+worst+' 年');
  console.log('STATE COVERAGE: '+name+', longest blank='+worst+' year(s).');
}
console.log('PASS: 50 events, 22 additions, choice/state branches, 3 real echoes, all events reachable, full annual saves/reloads; warnings='+report.warnings.length+'.');
