// 阶段5：用真实选择、真实年度引擎及简易DOM检查路线、属性提示和寿命。
// 无外部依赖；node tests.cjs 会调用本文件，也可 node late-tests.cjs 单独运行。
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const files=['player.js','life-state.js','mortality.js','economy.js','tags.js','events.js','events-young.js','events-middle.js','events-special.js','events-elderly.js','engine.js','annual.js','validation.js','summary.js'];
const ctx=vm.createContext({});
for(const file of files)vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const run=code=>vm.runInContext(code,ctx);
const report=run('checkEvents(EVENTS)');
assert.equal(run('EVENTS.length'),100);
assert.equal(report.errors.length,0,report.errors.join('\n'));
run(`
function expect(ok,message){if(!ok)throw Error(message);}
function ev(id){return EVENTS.find(e=>e.id===id);}
function age(p,n){p.age=n;p.lifeStage=stageFor(n)[1];}
function chosen(p,id,cid,n){
 if(n!==undefined)age(p,n);
 const e=ev(id),c=e.choices.find(c=>c.id===cid);
 expect(eligible(e,p),'前置不满足 '+id+' '+p.age);
 expect(c,'选择不存在 '+id+'/'+cid);applyChoice(p,e,c);
}
function saved(p){return {version:SAVE_VERSION,player:p,world:{...createWorld(),year:p.birthYear+p.age},annual:createAnnualProgress(p),currentEventId:null,resolved:false,result:''};}
function esportsPast(){
 const p=createPlayer();chosen(p,'caught_gaming','agree',10);
 chosen(p,'esports_amateur','practice',14);p.health=80;p.stress=20;
 chosen(p,'esports_trial','join',20);return p;
}
function musicPast(){
 const p=createPlayer();chosen(p,'art_class','join',3);chosen(p,'interest','art',13);
 chosen(p,'band_instrument','learn',15);chosen(p,'band_rehearsal','join',20);
 chosen(p,'band_stage','play',21);p.money=2000;chosen(p,'band_direction','career',24);return p;
}
function streamPast(){
 const p=createPlayer();chosen(p,'interest','art',13);p.autonomy=60;
 chosen(p,'stream_first','continue',21);p.money=2000;chosen(p,'stream_fulltime','fulltime',25);return p;
}
function ordinaryPast(style='balanced'){
 const p=createPlayer();chosen(p,'first_job',style==='high_pressure'?'flexible':'steady',23);return p;
}
function simulation(seed,p=createPlayer(),policy={},firstChoices=false){
 p.lifespan=createLifespan(seed,p.age);
 let value=seed;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
 let s={version:SAVE_VERSION,player:p,world:{...createWorld(),year:p.birthYear+p.age},currentEventId:null,resolved:false,result:''};
 beginYear(s,random);const seen={},years={},trace=[];let turns=0;
 while(s.player.alive){
  expect(++turns<340,'死循环');
  expect(validSave(s),'选择前无效 '+s.player.age+' '+s.currentEventId);
  const before=JSON.stringify(s);s=upgradeSave(JSON.parse(before));expect(JSON.stringify(s)===before,'选择前刷新变化');
  const e=ev(s.currentEventId);
  if(e&&!s.resolved){
   const c=e.choices.find(c=>c.id===policy[e.id])||(firstChoices?e.choices[0]:e.choices[Math.floor(random()*e.choices.length)]);
   finishAnnualChoice(s,e,c);seen[e.id]=(seen[e.id]||0)+1;(years[s.player.age]||=[]).push(e.id);
   trace.push({age:s.player.age,event:e.id,choice:c.id});
  }
  expect(validSave(s),'选择后无效 '+s.player.age+' '+s.currentEventId);
  const after=JSON.stringify(s);s=upgradeSave(JSON.parse(after));expect(JSON.stringify(s)===after,'选择后刷新变化');
  continueOrGrow(s,random);
 }
 expect(validSave(s),'终点存档无效');
 const end=JSON.stringify(s);expect(!continueOrGrow(s,random)&&JSON.stringify(s)===end,'死后仍推进');
 expect(!pickEvent(s.player,random),'死后仍抽事件');
 let blank=0,maxBlank=0;
 for(let n=60;n<s.player.age;n++){blank=years[n]?.length?0:blank+1;maxBlank=Math.max(blank,maxBlank);}
 return {age:s.player.age,death:s.player.death,seen,years,maxBlank,trace,player:s.player};
}
`);
// 职业选手：成功机会、受挫、主动退出、退役三种转型均用真实选择验证。
run(`{
 const p=esportsPast();expect(p.work.careerType==='esports','未进入职业选手');
 age(p,23);expect(!eligible(ev('first_job'),p),'普通入职覆盖已有特殊职业');
 age(p,25);expect(!eligible(ev('young_fast_track'),p),'通用晋升侵入特殊路线');
 chosen(p,'esports_season','push',24);expect(p.tags.includes('电竞争取首发'),'没有比赛后续');
 p.study=60;chosen(p,'esports_analysis','teach',25);
 for(const [id,career] of [['coach','esports_coach'],['stream','streamer'],['ordinary','general']]){
  const q=JSON.parse(JSON.stringify(p));chosen(q,'esports_transition',id,28);
  expect(q.work.careerType===career&&q.tags.includes('电竞已退役'),'退役转型失效 '+id);
  age(q,65);expect(eligible(ev('late_esports_echo'),q),'退役后失去真实回声');
  if(id==='stream'){age(q,45);expect(eligible(ev('stream_midlife'),q),'退役进入主播无法中年退出');}
 }
 const q=esportsPast();chosen(q,'esports_season','leave',24);
 expect(q.work.status==='unemployed'&& !q.tags.includes('特殊职业在岗'),'主动离开没有清理保护标签');
 age(q,30);expect(eligible(ev('esports_second_life'),q)&&eligible(ev('young_job_search'),q),'退出后没有第二人生');
 const hobby=createPlayer();chosen(hobby,'caught_gaming','hide',10);chosen(hobby,'esports_amateur','hobby',14);age(hobby,20);
 expect(!eligible(ev('esports_trial'),hobby),'休闲路线误入职业试训');
 const weak=esportsPast();weak.history=weak.history.filter(h=>h.eventId!=='esports_trial');weak.health=40;age(weak,21);
 expect(!eligible(ev('esports_trial'),weak),'低健康误获试训资格');
}`);
// 主播全职/副业、收入与在线压力、中年转向；乐队职业/副业、解散和重拾。
run(`{
 const p=streamPast();expect(p.work.careerType==='streamer','未进入主播职业');
 chosen(p,'stream_business','accept',26);chosen(p,'stream_online','schedule',27);
 chosen(p,'stream_midlife','change',42);expect(p.work.careerType==='general'&&!p.tags.includes('特殊职业在岗'),'主播无法转向');
 age(p,65);expect(eligible(ev('late_stream_echo'),p),'停播后旧创作消失');
 const side=createPlayer();chosen(side,'interest','art',13);side.autonomy=60;chosen(side,'stream_first','continue',21);side.money=2000;
 chosen(side,'stream_fulltime','parttime',25);expect(side.work.status==='not_working'&&side.tags.includes('内容作为副业'),'副业强制变成职业');
 const band=musicPast();expect(band.work.careerType==='musician','未进入音乐工作');
 chosen(band,'band_changes','end',30);expect(band.work.careerType==='musician'&&band.tags.includes('认真玩过乐队')&&band.tags.includes('乐队暂别'),'结束合作覆盖职业或删除经历');
 chosen(band,'band_return','again',45);age(band,65);expect(eligible(ev('late_band_echo'),band),'解散后失去乐队回声');
 const hobby=musicPast();hobby.history=hobby.history.filter(h=>h.eventId!=='band_direction');hobby.work=createLifeStates().work;hobby.monthlyIncome=0;
 chosen(hobby,'band_direction','side',24);expect(hobby.work.status==='not_working','音乐副业强制就业');
 const nobody=createPlayer();age(nobody,65);
 for(const id of ['late_esports_echo','late_stream_echo','late_band_echo'])expect(!eligible(ev(id),nobody),'伪造职业回忆 '+id);
}`);
console.log('PASS: 3 special careers, real early choices, successes/pressures, exits/changes, hobby/side-work, late echoes and ordinary-career guards.');
// 结束的是这段合作：主职业、收入、身份和过去经历均不受影响。
run(`{
 const profiles=[['employed','general'],['employed','esports'],['employed','esports_coach'],['employed','streamer'],['employed','musician'],['unemployed',null],['not_working',null],['retired',null]];
 for(const [status,career] of profiles){
  const p=musicPast();
  p.work=status==='employed'?{status,careerType:career,level:2,workStyle:'high_pressure',startYear:2024}:{...createLifeStates().work,status};
  p.monthlyIncome=status==='employed'?13750:status==='retired'?1800:0;p.identity='测试原身份';
  p.tags.push('乐队作为副业');chosen(p,'band_changes','adapt',28);
  const work=JSON.stringify(p.work),history=JSON.stringify(p.history),tags=[...p.tags],identity=p.identity,income=p.monthlyIncome,money=p.money;
  chosen(p,'band_changes','end',32);
  expect(JSON.stringify(p.work)===work&&p.monthlyIncome===income&&p.identity===identity&&p.money===money,'乐队结束污染职业 '+status+'/'+career);
  expect(JSON.stringify(p.history.slice(0,-1))===history&&tags.every(t=>p.tags.includes(t)),'乐队结束删除过去经历 '+career);
  expect(p.tags.includes('乐队暂别')&&!p.history.at(-1).incomeChange&&!p.history.at(-1).stateChanges,'乐队结束制造工作/收入变更 '+career);
  age(p,36);expect(!eligible(ev('band_changes'),p),'冷却结束后又要求结束同一合作');
  const raw=JSON.stringify(saved(p)),restored=upgradeSave(JSON.parse(raw));expect(validSave(restored)&&JSON.stringify(restored)===raw,'退出后的V5存档改变');
  chosen(p,'band_return','again',45);expect(p.monthlyIncome===income&&JSON.stringify(p.work)===work,'重拾乐器误成职业');
  age(p,49);expect(!eligible(ev('band_changes'),p),'重拾乐器自动重开旧合作');
  age(p,65);expect(eligible(ev('late_band_echo'),p),'退出后失去真实音乐回声');
 }
 const p=createPlayer();chosen(p,'art_class','join',3);chosen(p,'interest','art',13);chosen(p,'band_instrument','learn',15);
 chosen(p,'band_rehearsal','join',20);chosen(p,'band_stage','play',21);p.money=2000;age(p,28);
 expect(eligible(ev('band_direction'),p),'结束前音乐工作讨论不可达');chosen(p,'band_changes','end');
 age(p,29);expect(!eligible(ev('band_direction'),p),'结束合作后仍靠过去标签邀请音乐工作');
 const stale=saved(p);stale.currentEventId='band_direction';const history=JSON.stringify(p.history),annual=JSON.stringify(stale.annual);
 const restored=upgradeSave(JSON.parse(JSON.stringify(stale)));
 expect(validSave(restored)&&restored.currentEventId===null&&JSON.stringify(restored.player.history)===history&&JSON.stringify(restored.annual)===annual,'旧乐队卡撤下时丢失历史/年度进度');
 beginYear(restored,()=>0);expect(restored.currentEventId===null,'旧乐队卡撤下后重抽');
}`);
console.log('PASS: band closure preserves 8 employment/career profiles, music history/tags, identity, pay and late echoes; closed cooperation stays closed and stale V5 cards withdraw safely.');
// Stats实际资格与权重，不靠文案假装。使用同一抽签值验证高压力确实改变选中的事件。
run(`{
 const p=createPlayer();age(p,40);
 p.stress=20;expect(!eligible(ev('stats_stress'),p),'低压力误入');p.stress=80;expect(eligible(ev('stats_stress'),p),'高压力没有后果');
 p.health=80;expect(!eligible(ev('stats_health'),p),'高健康误入警告');p.health=30;expect(eligible(ev('stats_health'),p),'低健康没有警告');
 p.family=80;expect(!eligible(ev('stats_family'),p),'高家庭关系误入摩擦');p.family=25;expect(eligible(ev('stats_family'),p),'低家庭关系没有区别');
 const creator=streamPast();creator.history=creator.history.filter(h=>h.eventId!=='stream_fulltime');creator.work=createLifeStates().work;age(creator,25);
 creator.money=200;expect(!eligible(ev('stream_fulltime'),creator),'无缓冲资金仍全职邀请');creator.money=2000;expect(eligible(ev('stream_fulltime'),creator),'有资金不能试错');
 const gamer=esportsPast();age(gamer,24);gamer.study=20;expect(!eligible(ev('esports_analysis'),gamer),'低学习积累进入复盘传递');gamer.study=60;expect(eligible(ev('esports_analysis'),gamer),'学业积累成年没有后果');
 const mood=createPlayer();age(mood,65);mood.happiness=20;const low=eventWeight(ev('late_interest'),mood);mood.happiness=80;
 expect(eventWeight(ev('late_interest'),mood)===low*2,'快乐没有影响兴趣池');
 const independent=createPlayer();chosen(independent,'interest','art',13);age(independent,21);independent.autonomy=20;expect(!eligible(ev('stream_first'),independent),'自主性没有资格作用');
 independent.autonomy=60;expect(eligible(ev('stream_first'),independent),'自主选择没有开放路线');
 expect(triggerReasons(ev('stream_first'),independent).every(r=>!r.detail.includes('autonomy')),'泄露自主性');
 const a={...ev('late_daily'),id:'weight_a',weight:1,eventTags:[],weightModifiers:[{stats:{stress:{min:60}},multiplier:3,reason:'当前压力较高'}]};
 const b={...a,id:'weight_b',weightModifiers:[]};p.history=[];age(p,65);p.stress=20;expect(pickEvent(p,()=>.6,[a,b]).id==='weight_b','基础权重抽取错误');
 expect(triggerReasons(a,p,[a,b]).length===0,'未命中阈值也解释压力');p.stress=80;expect(pickEvent(p,()=>.6,[a,b]).id==='weight_a','权重没有改变真实抽取结果');
 expect(triggerReasons(a,p,[a,b])[0].detail.includes('stress >= 60'),'缺少精确开发条件');
 expect(triggerReasons(a,p,[a]).length===0,'唯一候选的权重冒充触发原因');
 expect(triggerReasons(ev('late_daily'),p).length===0,'为年龄随机事件编造原因');
 age(p,40);const reasons=triggerReasons(ev('stats_stress'),p);applyChoice(p,ev('stats_stress'),ev('stats_stress').choices[0]);
 expect(JSON.stringify(p.history.at(-1).triggerReasons)===JSON.stringify(reasons),'选择后解释被新数值改写');
}`);
console.log('PASS: stress/health/family/money/study/happiness/autonomy eligibility/weights, real weighted draw and pre-choice explanations.');

// Phase 3：标签细分不能改变同一组事实的Summary取材，也不能丢失晚年阶段。
run(`{
 const refined = {late_work:'劳动',late_daily:'日常',late_body:'健康',late_interest:'兴趣',late_friend:'朋友',late_partner:'关系',late_children:'亲子'};
 const base=createPlayer();chosen(base,'birth',ev('birth').choices[0].id,0);
 chosen(base,'first_job','steady',23);chosen(base,'young_meet','date',24);chosen(base,'young_values','register',26);
 chosen(base,'young_married_daily','share',28);chosen(base,'young_parenthood_plan','plan',30);
 chosen(base,'mid_parenthood','begin',36);chosen(base,'mid_daily','own_time',40);
 let cases=0;
 for(const [id,tag] of Object.entries(refined)){
  const e=ev(id);expect(e.category==='random'&&!e.isMajorNode&&JSON.stringify(e.eventTags)===JSON.stringify(['晚年',tag]),'晚年主题范围错误 '+id);
  for(const prepared of [false,true])for(const choice of e.choices){
   const p=JSON.parse(JSON.stringify(base));
   if(prepared)chosen(p,'late_work','part',61); // 已限定工时：再次part不会制造work变化。
   const previous=JSON.stringify(p.history);chosen(p,id,choice.id,65);
   expect(JSON.stringify(p.history.slice(0,-1))===previous,'细分主题回写过去 '+id);
   expect(p.history.at(-1).eventTags.includes('晚年'),'新History丢失晚年阶段 '+id);
   if(id==='late_work'&&prepared&&choice.id==='part')expect(!p.history.at(-1).stateChanges,'测试未覆盖工作状态无变化');
   const old=JSON.parse(JSON.stringify(p));
   for(const h of old.history)if(Object.hasOwn(refined,h.eventId))h.eventTags=['晚年','生活'];
   for(let i=0;i<p.history.length;i++)expect(summaryDomain(p.history[i])===summaryDomain(old.history[i]),'标签改变Summary分类 '+id+'/'+choice.id);

   // V5旧标签、已选择结果及尚未选择卡片，均原样恢复，不重新抽取。
   const selected=saved(old);selected.currentEventId=id;selected.resolved=true;selected.result=choice.resultText;
   const raw=JSON.stringify(selected),restored=upgradeSave(JSON.parse(raw));
   expect(SAVE_VERSION===5&&validSave(restored)&&JSON.stringify(restored)===raw,'V5旧标签/结果卡改变 '+id);
   const atRest=JSON.stringify(restored);recentThemeCounts(restored.player);pickEvent(restored.player,()=>.5);beginYear(restored,()=>.9);
   expect(JSON.stringify(restored)===atRest,'临时主题写入存档或重抽已选卡 '+id);
   const pendingPlayer=JSON.parse(JSON.stringify(base));age(pendingPlayer,65);
   const pending=saved(pendingPlayer);pending.currentEventId=id;
   const pendingRaw=JSON.stringify(pending),loaded=upgradeSave(JSON.parse(pendingRaw));beginYear(loaded,()=>.999);
   expect(validSave(loaded)&&JSON.stringify(loaded)===pendingRaw,'V5待选卡被重抽 '+id);

   age(p,90);age(old,90);recordDeath(p,'自然寿命终点');recordDeath(old,'自然寿命终点');
   const summary=buildLifeSummary(p),oldSummary=buildLifeSummary(old);
   expect(JSON.stringify(summary)===JSON.stringify(oldSummary),'主题细分改变Summary内容 '+id+'/'+choice.id);
   for(const [min,max] of [[0,18],[36,59],[60,110]])expect(summary.trajectory.some(h=>h.age>=min&&h.age<=max),'Summary丢失人生阶段 '+min);
   cases++;
  }
 }
 expect(cases===28,'晚年选择/状态覆盖不足');
 const p=JSON.parse(JSON.stringify(base));age(p,65);p.history.push({age:64,eventId:'legacy',eventTags:['晚年','生活']});
 expect(recentThemeCounts(p).size===0,'从旧宽泛标签虚构近期主题');
}`);
console.log('PASS: 28 late-choice/state cases preserve exact Summary, childhood/middle/late stages, historical records and V5 pending/resolved saves; old broad tags stay factual.');
// 自然风险、健康差异、同年只判一次、死亡只记录一次、刷新稳定。
run(`{
 expect(deathRisk(59,1)===0,'年轻随机死亡');expect(deathRisk(75,80)>deathRisk(65,80),'年龄未提高风险');
 expect(deathRisk(80,20)>deathRisk(80,95),'健康未影响风险');
 let lowOnly=0,highDeaths=0,lowAlive=0;
 for(let seed=0;seed<1000;seed++){
  const a=createPlayer();age(a,79);a.health=95;a.lifespan=createLifespan(seed,79);const b=JSON.parse(JSON.stringify(a));b.health=20;
  const wa={year:2079},wb={year:2079};advanceYear(a,wa);advanceYear(b,wb);
  if(!a.alive)highDeaths++;if(b.alive)lowAlive++;if(!b.alive&&a.alive)lowOnly++;
  const copy=JSON.parse(JSON.stringify(b)),before=JSON.stringify(copy);checkMortality(copy);
  expect(JSON.stringify(copy)===before,'同年重新抽寿命');
 }
 expect(lowOnly>0 && highDeaths>0 && lowAlive>0,'高健康保证不死或低健康立即死');
 let seed=0;while(mortalityRoll(seed,80)>=deathRisk(80,30))seed++;
 const p=createPlayer();age(p,79);p.health=30;p.lifespan=createLifespan(seed,79);
 const base=saved(p),a=upgradeSave(JSON.parse(JSON.stringify(base))),b=upgradeSave(JSON.parse(JSON.stringify(base)));
 continueOrGrow(a,()=>.1);continueOrGrow(b,()=>.9);
 expect(!a.player.alive&&JSON.stringify(a.player.death)===JSON.stringify(b.player.death),'刷新前相同存档死亡不稳定');
 expect(a.currentEventId===null&&validSave(a),'死亡还显示待选普通事件');
 const before=JSON.stringify(a.player);recordDeath(a.player,'健康严重恶化');checkMortality(a.player);expect(JSON.stringify(a.player)===before,'重复死亡覆盖原因');
 let rejected=false;try{applyChoice(a.player,ev('late_daily'),ev('late_daily').choices[0]);}catch{rejected=true;}expect(rejected,'死亡后仍能选择');
 const zero=createPlayer();age(zero,40);zero.health=1;applyChoice(zero,ev('mid_health'),ev('mid_health').choices[1]);
 expect(zero.death.deathReason==='健康严重恶化'&&zero.death.deathYear===2040,'健康归零原因未记录');
 const cap=createPlayer();age(cap,109);cap.health=100;cap.lifespan=createLifespan(123,109);advanceYear(cap,{year:2109});
 expect(cap.death.deathAge===110,'缺少可测试的最大终点保护');
}`);
console.log('PASS: stable seed/year mortality, 1000 matched high/low health cases, natural/health reasons, once-only death, no post-death events, age110 guard.');
// 老存档升级保留年度、选择和状态，反复读取旧原文不会重抽；旧终点不复活。
run(`{
 for(const version of [1,2,3]){
  const p=ordinaryPast();p.age=24;p.lifeStage=stageFor(24)[1];const s=saved(p);s.version=version;delete p.lifespan;delete p.death;
  if(version<3)delete s.annual;
  if(version===1){for(const group of Object.keys(LIFE_STATE_FIELDS))delete p[group];for(const h of p.history)delete h.stateChanges;}
  expect(validSave(s),'合法旧档不能验证 '+version);
  const a=upgradeSave(JSON.parse(JSON.stringify(s))),b=upgradeSave(JSON.parse(JSON.stringify(s)));
  expect(a.version===SAVE_VERSION&&validSave(a)&&JSON.stringify(a)===JSON.stringify(b),'升级不稳定 '+version);
  expect(a.player.history[0].choiceId==='steady'&&a.player.child.hasChild===false&&a.annual.mainEventDrawn,'升级丢失选择或虚构家人');
  if(version>=2)expect(a.player.work.startYear===2023,'升级改写工作年份');
  if(version===3)expect(JSON.stringify(a.annual)===JSON.stringify(s.annual),'V3丢失年度进度');
  const ended=JSON.parse(JSON.stringify(s));age(ended.player,80);ended.player.alive=false;ended.world.year=2080;
  if(version===3)ended.annual=createAnnualProgress(ended.player);
  const end=upgradeSave(ended);expect(!end.player.alive&&end.player.death.deathAge===80&&validSave(end),'复活V'+version+'的旧终点');
 }
 const invalid=saved(createPlayer());invalid.player.lifespan.seed=-1;expect(!validSave(invalid),'坏种子未拒绝');
 const invalidDeath=saved(createPlayer());invalidDeath.player.death={deathAge:80,deathYear:2080,deathReason:'natural'};expect(!validSave(invalidDeath),'活人存在死亡记录');
}`);
for(const mutation of [
"e.statReasons={health:'fake'}","e.statReasons={autonomy:'hidden'}",
"e.weightModifiers=[{stats:{typo:{min:1}},multiplier:2,reason:'wrong'}]",
"e.weightModifiers=[{stats:{stress:{min:60}},multiplier:0}]",
"e.weightModifiers=[{stats:{},multiplier:2}]",
"e.weightModifiers=[{stats:{stress:{min:60}},multiplier:2,reason:''}]",
"e.weightModifiers=[{stats:{autonomy:{min:60}},multiplier:2,reason:'hidden'}]"
])assert.ok(run(`(()=>{const e=JSON.parse(JSON.stringify(EVENTS[0]));${mutation};return checkEvents([e,...EVENTS.slice(1)]).errors.length;})()`)>0,mutation);
console.log('PASS: V1/V2/V3-to-current stable migration, original ended lives preserved, invalid seed/death/reason/modifier validation.');
// 不同晚年状态，每种24个固定寿命种子。从实际职业历史构造，无child也有足够内容。
const fixtures=[
['ordinary','ordinaryPast()',{}],['high_pressure',"ordinaryPast('high_pressure')",{}],
['esports','esportsPast()',{}],['stream','streamPast()',{}],['band','musicPast()',{}],
['married_child','ordinaryPast()',{relationship:{status:'married',startYear:2030},child:{hasChild:true,birthYear:2036}}],
['married_no_child','ordinaryPast()',{relationship:{status:'married',startYear:2030},tags:['主动不生育']}],
['unmarried','ordinaryPast()',{relationship:{status:'dating',startYear:2030},tags:['主动不婚']}],
['single','ordinaryPast()',{}],['high_health','ordinaryPast()',{health:95}],['low_health','ordinaryPast()',{health:25}],
['interest_return','musicPast()',{}],
['gradual_retirement','ordinaryPast()',{}, {late_retirement:'gradual',late_work:'part'}],
['family_tension','ordinaryPast()',{family:25}],
['gave_up_then_returned',"(()=>{const p=createPlayer();chosen(p,'interest','math',13);chosen(p,'first_job','steady',23);chosen(p,'mid_interest_echo','practice',40);return p;})()",{}]
];
const reached=new Set(),lateResults={};
const healthy={stats_health:'care',stats_stress:'rest',late_body:'adjust',late_retirement:'retire',late_daily:'own',late_interest:'learn'};
for(const [name,factory,fields,policy={}] of fixtures){
 let worst=0,minEvents=99,ages=[];
 for(let seed=1;seed<=24;seed++){
  const result=run(`(()=>{const p=${factory};${name==='esports'?"chosen(p,'esports_transition','coach',28);":''}${name==='interest_return'?"chosen(p,'band_changes','end',30);chosen(p,'band_return','again',45);":''}Object.assign(p,${JSON.stringify(fields)});age(p,60);return simulation(${seed},p,${JSON.stringify({...healthy,...policy})});})()`);
  worst=Math.max(worst,result.maxBlank);minEvents=Math.min(minEvents,result.trace.filter(h=>h.age>=60).length);ages.push(result.age);
  for(const id of Object.keys(result.seen))reached.add(id);
  assert.ok(result.age>=61 && result.age<=110);
  if(name==='married_no_child'||name==='unmarried'||name==='single')assert.ok(!result.seen.late_children);
 }
 assert.equal(worst,0,name+' 晚年出现事件荒');
 lateResults[name]={blank:worst,minEvents,deathAgeRange:[Math.min(...ages),Math.max(...ages)]};
 console.log('LATE COVERAGE: '+name+', 24 lives, '+JSON.stringify(lateResults[name]));
}
// 完整出生到死亡，正式池中的新事件都必须有真实触发路径。
const counts={},witness={};
for(let seed=1;seed<=180;seed++){
 const result=run(`simulation(${seed},createPlayer(),${JSON.stringify({...healthy,esports_amateur:'practice',esports_trial:'join',band_instrument:'learn',band_rehearsal:'join',band_stage:'play',stream_first:'continue'})})`);
 assert.equal(result.maxBlank,0,'完整人生晚年内容断层');
 for(const id of Object.keys(result.seen)){counts[id]=(counts[id]||0)+1;reached.add(id);witness[id] ||= result.trace.filter(h=>h.event===id);}
}
// 各路线单独验证：同时坚持直播/乐队会合理改变职业，不能要求一局兼任所有职业。
for(let seed=1;seed<=20;seed++){
 const result=run('simulation('+seed+',createPlayer(),'+JSON.stringify({...healthy,caught_gaming:'agree',esports_amateur:'practice',esports_trial:'join',esports_season:'adjust',esports_transition:'coach',band_instrument:'listen',stream_first:'stop',young_meet:'single'})+',true)');
 for(const id of Object.keys(result.seen))reached.add(id);
}
const added=run('EVENTS.slice(68).map(e=>e.id)'),missing=added.filter(id=>!reached.has(id));
assert.deepEqual(Array.from(missing),[],'阶段5不可达候选 '+missing.join(','));
console.log('PASS: 200 full birth-to-death lives + 360 late-state lives, all 32 additions reachable; no living-year blanks after60.');
// 普通/开发UI、解释刷新、无序号时间线和完整100事件按钮流程。
class Element{constructor(){this.children=[];this.textContent='';}append(n){this.children.push(n);}replaceChildren(){this.children=[];}setAttribute(){}}
const storage=new Map();
function ui(debug=false){
 const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);};
 const c=vm.createContext({console:{error(){},warn(){}},URLSearchParams,location:{search:debug?'?debug=1':''},document:{getElementById:get,createElement:()=>new Element()},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},confirm:()=>true});
 for(const f of [...files,'app.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
 return {c,nodes,run:code=>vm.runInContext(code,c)};
}
let u=ui();u.run(`{const p=createPlayer();p.age=40;p.lifeStage=stageFor(40)[1];p.stress=65;
state={version:SAVE_VERSION,player:p,world:{...createWorld(),year:2040},annual:createAnnualProgress(p),currentEventId:'stats_stress',resolved:false,result:''};save();render();}`);
assert.match(u.nodes.get('trigger-reasons').textContent,/压力/);
assert.doesNotMatch(u.nodes.get('trigger-reasons').textContent,/stress|>=|autonomy/);
u=ui(true);assert.match(u.nodes.get('trigger-reasons').textContent,/stress >= 60/);
u.nodes.get('choices').children[0].onclick();const reason=u.nodes.get('trigger-reasons').textContent;
u=ui(true);assert.equal(u.nodes.get('trigger-reasons').textContent,reason);
assert.equal(u.nodes.get('history').children[0].children[0].textContent.startsWith('40 岁'),true);
storage.clear();u=ui();u.nodes.get('start').onclick();u.run('state.player.lifespan.seed=7;save();');
let guard=0;
while(u.run('state.player.alive')){
 assert.ok(++guard<340);
 if(u.nodes.get('choices').children.length){
  const before=u.nodes.get('description').textContent,reasonBefore=u.nodes.get('trigger-reasons').textContent;
  u=ui();assert.equal(u.nodes.get('description').textContent,before);assert.equal(u.nodes.get('trigger-reasons').textContent,reasonBefore);
  u.nodes.get('choices').children[0].onclick();
  const snapshot=u.run('JSON.stringify(state)');u=ui();assert.equal(u.run('JSON.stringify(state)'),snapshot);
 }
 assert.ok(u.run('validSave(state)'));u.nodes.get('grow').onclick();
}
assert.ok(u.nodes.get('grow').disabled);u=ui();assert.ok(u.run('!state.player.alive && validSave(state)'));
assert.match(u.nodes.get('result').textContent,/自然寿命终点|健康严重恶化/);
assert.ok(fs.readFileSync('index.html','utf8').includes('<ul id="history">'));
assert.ok(/#history\s*{[^}]*list-style:\s*none/.test(fs.readFileSync('style.css','utf8')));
console.log('PASS: full100-event mock DOM UI, normal/debug truthful reasons, before/after-choice reloads, death refresh, unnumbered history.');
console.log('STAGE5 PASS: errors='+report.errors.length+', warnings='+report.warnings.length+'; stage5 regression suite.');
