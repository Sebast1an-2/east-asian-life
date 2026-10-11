// 阶段6：资金、标签、事实总结与整个人生。无第三方依赖，node tests.cjs 自动调用。
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const files=['player.js','life-state.js','mortality.js','economy.js','tags.js','events.js','events-young.js','events-middle.js','events-special.js','events-elderly.js','engine.js','annual.js','validation.js','summary.js'];
const ctx=vm.createContext({});
for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const run=code=>vm.runInContext(code,ctx);
const report=run('checkEvents(EVENTS)');
assert.equal(run('EVENTS.length'),100);
assert.equal(report.errors.length,0,report.errors.join('\n'));
run(`
function expect(ok,message){if(!ok)throw Error(message);}
function ev(id){return EVENTS.find(e=>e.id===id);}
function age(p,n){p.age=n;p.lifeStage=stageFor(n)[1];}
function choose(p,id,cid,n){if(n!==undefined)age(p,n);const e=ev(id),c=e.choices.find(c=>c.id===cid);expect(eligible(e,p)&&c,'测试前置 '+id);applyChoice(p,e,c);}
function saved(p){return {version:SAVE_VERSION,player:p,world:{...createWorld(),year:p.birthYear+p.age},annual:createAnnualProgress(p),currentEventId:null,resolved:false,result:''};}
function reload(s){const raw=JSON.stringify(s);expect(validSave(s),'无效存档 '+s.player.age+' '+s.currentEventId);const next=upgradeSave(JSON.parse(raw));expect(JSON.stringify(next)===raw,'刷新改变年度/现金/历史');return next;}
{
 const p=createPlayer();choose(p,'first_job','steady',23);
 expect(p.monthlyIncome===4000&&p.money===0,'工资被当成一次性存款');
 expect(p.history.at(-1).incomeChange.after===4000,'历史没有记录收入变更');
 expect(settleYear(p)&&p.money===30000,'年度收入48000-家庭生活18000');
 expect(!settleYear(p)&&p.money===30000,'同一年重复结算');
 const s=reload(saved(p));expect(!settleYear(s.player)&&s.player.money===30000,'刷新后重复结算');
 advanceYear(p,{year:2023});expect(p.money===30000&&p.age===24,'已结算年度在长大时又到账');
 p.work={...createLifeStates().work,status:'unemployed'};p.monthlyIncome=0;
 expect(settleYear(p)&&p.money===12000,'待业还得到工资');
 const pressure=createPlayer();choose(pressure,'first_job','flexible',23);settleYear(pressure);
 expect(pressure.monthlyIncome===6500&&pressure.money===60000,'不同工作没有收入差异');
 const coach=createPlayer();choose(coach,'caught_gaming','agree',10);choose(coach,'ranking','chase',11);
 choose(coach,'esports_amateur','practice',14);choose(coach,'esports_trial','join',20);choose(coach,'esports_transition','coach',28);
 choose(coach,'young_ranking_echo','compete',29);choose(coach,'young_promotion','accept');
 expect(coach.work.careerType==='esports_coach'&&coach.monthlyIncome===6000&&coach.history.at(-1).incomeChange.before===4500,'转型教练晋升时工作/收入记录不一致');
 pressure.child={hasChild:true,birthYear:2023};age(pressure,24);
 expect(annualLivingCost(pressure)===28800,'抚养未成年孩子的基本开销');
 const before=JSON.stringify(pressure);
 for(const bad of [-1,Infinity,'4000',1000001]){
  let rejected=false;try{applyChoice(pressure,ev('first_job'),{...ev('first_job').choices[0],monthlyIncome:bad});}catch{rejected=true;}
  expect(rejected&&JSON.stringify(pressure)===before,'非法收入部分改变人物');
 }
 const rent=createPlayer();age(rent,30);rent.housing.status='renting';rent.money=HOME_PURCHASE_COST-1;
 expect(!eligible(ev('young_housing_choice'),rent),'不足现金可以进入购房讨论');
 rent.money=HOME_PURCHASE_COST;choose(rent,'young_housing_choice','buy');
 expect(rent.money===0&&rent.housing.status==='owns_home','买房没有扣款');
 expect(rent.history.at(-1).cashReason&&rent.history.at(-1).effects.money===-HOME_PURCHASE_COST,'买房历史没有一次性账单');
 expect(!eligible(ev('young_housing_choice'),rent),'有房还问买房');
 choose(rent,'young_home_care','sell_plan');expect(rent.money===HOME_SALE_PROCEEDS&&rent.housing.status==='renting','出售住房没有对应收入');
 const q=createPlayer();age(q,30);q.money=150000;q.housing.status='renting';choose(q,'young_housing_choice','keep_renting');
 expect(q.money===149800,'继续租房的200元安排费用记账错误');age(q,33);choose(q,'young_rent','reconsider');
 expect(eligible(ev('young_housing_choice'),q),'租房不能再次考虑住房');
 for(const e of EVENTS)for(const c of e.choices)if(c.effects.money)expect(isText(c.cashReason),'一次性收支没有说明 '+e.id+'/'+c.id);
}
`);
console.log('PASS: monthly income vs cash, employment/unemployment/retirement rates, once-only annual ledger, child costs, atomic invalid-income rejection, buy/sell/rent cash.');

// Phase 1：通过真实事件验证状态调整与收入变化的区别，不按事件id推断工资。
run(`{
 function working(){const p=createPlayer();choose(p,'ranking','chase',11);choose(p,'first_job','flexible',23);return p;}
 for(const [id,cid,n] of [['young_ranking_echo','own_scale',28],['young_burnout','change',28],['young_promotion','decline',29],['mid_work_pressure','ease',40]]){
  const p=working();if(id==='young_promotion')choose(p,'young_ranking_echo','compete',26);
  p.monthlyIncome=13750;p.stress=60;
  const work={...p.work},history=JSON.stringify(p.history);choose(p,id,cid,n);
  expect(p.work.workStyle==='balanced'&&p.monthlyIncome===13750,'工作方式重置收入 '+id);
  for(const key of ['status','careerType','level','startYear'])expect(p.work[key]===work[key],'工作方式污染职业 '+id+'/'+key);
  expect(!p.history.at(-1).incomeChange&&p.history.at(-1).stateChanges.work,'历史伪造收入变化 '+id);
  expect(JSON.stringify(p.history.slice(0,-1))===history,'工作调整重写旧历史 '+id);reload(saved(p));
 }
 const special=working();special.work.careerType='esports_coach';special.monthlyIncome=12345;
 choose(special,'young_ranking_echo','own_scale',28);expect(special.monthlyIncome===12345&&special.work.careerType==='esports_coach','回声污染教练职业/工资');
 const stress=working();stress.monthlyIncome=13750;stress.stress=60;choose(stress,'young_burnout','push',28);
 expect(stress.monthlyIncome===13750&&!stress.history.at(-1).incomeChange&&stress.money===2000,'压力/一次性奖金重置持续收入');

 // 同一个临时选择测试不同语义；不向正式事件池添加事件。
 const e=ev('young_ranking_echo'),base={...e.choices.find(c=>c.id==='own_scale'),effects:{},addTags:[],removeTags:[]};
 const p=working();age(p,28);p.monthlyIncome=13750;
 for(const patch of [{work:{status:'employed',careerType:'general',level:1,workStyle:'high_pressure'}},{work:{workStyle:'balanced'}},{housing:{status:'renting'}},{}]){
  applyChoice(p,e,{...base,stateChanges:patch});expect(p.monthlyIncome===13750&&!p.history.at(-1).incomeChange,'重复写入或无关状态重置收入');
 }
 applyChoice(p,e,{...base,stateChanges:{work:{workStyle:'high_pressure'}},monthlyIncome:7100});
 expect(p.monthlyIncome===7100&&p.history.at(-1).incomeChange.after===7100,'显式工资没有优先于工作方式');
 applyChoice(p,e,{...base,monthlyIncome:7300,stateChanges:{}});expect(p.monthlyIncome===7300,'纯显式涨薪失效');
 applyChoice(p,e,{...base,stateChanges:{work:{careerType:'streamer',workStyle:'flexible'}},monthlyIncome:7200});
 expect(p.monthlyIncome===7200&&p.work.careerType==='streamer','显式合同没有优先于默认职业收入');

 for(const cid of ['higher_pay','clear_hours']){
  const q=working();q.work.level=2;q.monthlyIncome=13750;const start=q.work.startYear;choose(q,'young_job_change',cid,30);
  expect(q.monthlyIncome===(cid==='higher_pay'?6500:4000)&&q.work.level===2&&q.work.startYear===start&&q.work.careerType==='general','新岗位合同收入或职业错误 '+cid);
  expect(q.history.at(-1).incomeChange.before===13750,'新岗位收入变化未如实记入History');reload(saved(q));
 }
 const promoted=working();choose(promoted,'young_ranking_echo','compete',26);choose(promoted,'young_promotion','accept',29);
 expect(promoted.monthlyIncome===8000&&promoted.history.at(-1).incomeChange.before===6500,'真实晋升不再改变收入');
 choose(promoted,'mid_work_pressure','lead',40);expect(promoted.monthlyIncome===9000,'管理合同收入失效');
 choose(promoted,'mid_work_pressure','lead',43);expect(promoted.monthlyIncome===9000&&!promoted.history.at(-1).incomeChange,'相同合同伪造收入变化');
 choose(promoted,'late_retirement','retire',65);expect(promoted.monthlyIncome===1800&&promoted.work.status==='retired','退休收入失效');reload(saved(promoted));
 const unemployed=working();choose(unemployed,'young_career_crisis','leave',30);
 expect(unemployed.monthlyIncome===0&&unemployed.work.status==='unemployed','离职继续领工资');
 choose(unemployed,'young_job_search','restart',31);expect(unemployed.monthlyIncome===3200&&unemployed.work.startYear===unemployed.birthYear+31,'重新就业工资/时间失效');reload(saved(unemployed));

 // 真正的职业转换仍按现有规则产生工资，兴趣尝试不产生职业工资。
 const stream=createPlayer();choose(stream,'interest','art',13);stream.autonomy=60;choose(stream,'stream_first','continue',21);
 expect(stream.monthlyIncome===0&&stream.work.status==='not_working','尝试创作直接成为职业');
 choose(stream,'first_job','steady',23);stream.money=2000;choose(stream,'stream_fulltime','fulltime',25);
 expect(stream.work.careerType==='streamer'&&stream.monthlyIncome===5000&&stream.history.at(-1).incomeChange.before===4000,'主播转换收入失效');
 choose(stream,'stream_midlife','slow',42);expect(stream.monthlyIncome===3000&&stream.work.careerType==='streamer','主播明确减收合同失效');reload(saved(stream));
 const music=createPlayer();choose(music,'art_class','join',3);choose(music,'interest','art',13);choose(music,'band_instrument','learn',15);
 choose(music,'band_rehearsal','join',20);choose(music,'band_stage','play',21);choose(music,'first_job','steady',23);music.money=2000;
 choose(music,'band_direction','career',24);expect(music.work.careerType==='musician'&&music.monthlyIncome===3500,'音乐职业转换收入失效');reload(saved(music));

 const coach=working();coach.work.careerType='esports_coach';coach.tags=[];coach.monthlyIncome=12345;age(coach,30);
 const stale=saved(coach);stale.currentEventId='young_job_change';const oldPlayer=JSON.stringify(coach),oldAnnual=JSON.stringify(stale.annual);
 const restored=upgradeSave(JSON.parse(JSON.stringify(stale)));
 expect(validSave(restored)&&restored.version===5&&restored.currentEventId===null&&JSON.stringify(restored.player)===oldPlayer&&JSON.stringify(restored.annual)===oldAnnual,'旧普通跳槽卡破坏职业/历史/年度进度');
 beginYear(restored,()=>0);expect(restored.currentEventId===null,'旧普通跳槽卡撤下后重抽');
 const money=restored.player.money;expect(settleYear(restored.player)&&restored.player.money===money+12345*12-18000,'旧职业工资年度结算错误');
 const reloaded=reload(restored);expect(!settleYear(reloaded.player),'旧工资重复结算');
}`);
console.log('PASS: Phase 1 style/stress/boundary changes preserve pay; actual employment/career/level changes and explicit contracts change pay; History and V5 stale-card/once-only settlements remain compatible.');

// 构造两个临时Major，专门证明同年追加不支付第二份工资；正式池不新增事件。
run(`{
 const p=createPlayer();choose(p,'first_job','steady',23);age(p,28);
 const node=(id)=>({...ev('birth'),id,title:id,category:'conditional',isMajorNode:true,conditions:{minAge:28,maxAge:28},choices:[{...ev('birth').choices[0],effects:{},addTags:[],removeTags:[]}]});
 const a=node('finance_a'),b=node('finance_b');EVENTS.push(a,b);
 let s=saved(p);s.currentEventId=a.id;s=reload(s);finishAnnualChoice(s,a,a.choices[0]);s=reload(s);
 expect(s.player.money===0&&canContinueYear(s),'第一个事件后错误结算');continueOrGrow(s,()=>0);
 expect(s.currentEventId===b.id&&s.player.age===28&&s.player.money===0,'同年追加提前工资到账');
 finishAnnualChoice(s,b,b.choices[0]);s=reload(s);expect(s.player.money===0&&!canContinueYear(s),'第二个事件错误结算');
 continueOrGrow(s,()=>0);expect(s.player.age===29&&s.player.money===30000&&s.player.economy.lastSettledAge===28,'离开年份结算错误');
 s=reload(s);expect(s.player.money===30000,'长大后刷新重复工资');EVENTS.splice(-2);
}`);
console.log('PASS: two Major nodes and three reloads, salary settled once when leaving age28.');

// 所有旧版本均保留现金、历史、内部标签。V4不能重新生成种子或死亡结果。
run(`{
 for(const version of [1,2,3,4]){
  const p=createPlayer();choose(p,'first_job','steady',23);p.money=54321;p.tags.push('已讨论住房');
  const s=saved(p);s.version=version;delete p.monthlyIncome;delete p.economy;
  if(version<3)delete s.annual;
  if(version<4){delete p.lifespan;delete p.death;}
  if(version===1){for(const g of Object.keys(LIFE_STATE_FIELDS))delete p[g];for(const h of p.history){delete h.stateChanges;delete h.incomeChange;}}
  const source=JSON.stringify(s),oldHistory=JSON.stringify(p.history),oldTags=JSON.stringify(p.tags);
  const upgraded=upgradeSave(JSON.parse(source)),again=upgradeSave(JSON.parse(source));
  expect(JSON.stringify(upgraded)===JSON.stringify(again)&&validSave(upgraded),'旧档升级不稳定 '+version);
  expect(upgraded.version===5&&upgraded.player.money===54321,'旧档现金被缩放或补薪 '+version);
  expect(JSON.stringify(upgraded.player.history)===oldHistory&&JSON.stringify(upgraded.player.tags)===oldTags,'旧历史或标签丢失');
  expect(upgraded.player.monthlyIncome===(version===1?0:4000),'旧档凭空生成就业/工资');
  expect(upgraded.player.relationship.status==='single'&&!upgraded.player.child.hasChild&&upgraded.player.housing.status==='with_family','旧档虚构婚育房产');
  expect(upgraded.player.economy.lastSettlement===null&&upgraded.player.economy.lastSettledAge===22,'升级追溯结算往年');
  if(version===4)expect(JSON.stringify(upgraded.player.lifespan)===JSON.stringify(p.lifespan),'V4寿命种子被替换');
 }
 const p=createPlayer();choose(p,'first_job','steady',23);age(p,29);p.money=5000;p.housing.status='renting';
 const stale=saved(p);stale.version=4;delete p.monthlyIncome;delete p.economy;stale.currentEventId='young_housing_choice';
 const restored=upgradeSave(stale);expect(restored.currentEventId===null&&restored.annual.mainEventDrawn&&restored.player.money===5000,'旧版低现金买房卡片错误恢复');
 const ended=createPlayer();age(ended,80);recordDeath(ended,'自然寿命终点');const end=saved(ended);end.version=4;delete ended.monthlyIncome;delete ended.economy;
 const newer=upgradeSave(end);expect(JSON.stringify(newer.player.death)===JSON.stringify(ended.death)&&!newer.player.alive,'V4死亡记录被改写');
 const good=saved(createPlayer());
 for(const change of [p=>p.monthlyIncome=10,p=>p.economy.lastSettledAge=99,p=>p.economy.lastSettlement={},p=>delete p.economy]){
  const bad=JSON.parse(JSON.stringify(good));change(bad.player);expect(!validSave(bad),'异常经济存档被接受');
 }
}`);
for(const mutation of ['c.monthlyIncome=-1','c.monthlyIncome="5000"','c.cashReason=""','c.effects.money=100;delete c.cashReason','c.monthlyIncome=5000;c.stateChanges={work:{status:"unemployed"}}']){
 assert.ok(run(`(()=>{const e=JSON.parse(JSON.stringify(EVENTS[0])),c=e.choices[0];${mutation};return checkEvents([e,...EVENTS.slice(1)]).errors.length;})()`)>0,mutation);
}
console.log('PASS: V1/V2/V3/V4 -> V5, no historical pay/repricing/invented states, stable old seed/death, stale house-card withdrawal and financial validation.');

run(`{
 const all=[...new Set(EVENTS.flatMap(e=>[...(e.conditions.tagsAll||[]),...(e.conditions.tagsNone||[]),...e.choices.flatMap(c=>[...c.addTags,...c.removeTags])]))];
 const categorized=Object.values(TAG_TYPES).flat();expect(all.length===140&&categorized.length===140&&new Set(categorized).size===140,'标签审计没有完整覆盖');
 expect(all.every(t=>categorized.includes(t)),'未分类标签');
 const p=createPlayer();p.tags=[...TAG_TYPES.states,...TAG_TYPES.history,...TAG_TYPES.internal,'unknown'];expect(visibleTags(p).length===0,'状态/历史/流程标签泄漏');
 p.tags=all;expect(visibleTags(p).length<=8&&!visibleTags(p).includes('习惯比较'),'白名单超过上限或新尺度仍被旧比较覆盖');
 expect(TAG_GROUPS.every(g=>g.tags.every(t=>TAG_TYPES.traits.includes(t))),'可见标签不属于持续倾向');
}`);
console.log('PASS: 140 tags categorized, 19 visible groups / max8, technical and unknown tags hidden, original tags retained.');

// 完整出生到死亡：按明确策略玩，绝不给History手写剧情。20种路线分别寻找真实见证人生。
run(`
function playLife(seed,policy={},initial={}){
 let value=seed;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
 const player=createPlayer();Object.assign(player,initial);player.name='测试人生'+seed;player.lifespan=createLifespan(seed,0);
 let s={version:SAVE_VERSION,player,world:createWorld(),currentEventId:null,resolved:false,result:''};beginYear(s,random);
 let turns=0;const years={};
 while(s.player.alive){
  expect(++turns<340,'完整人生死循环');s=reload(s);
  const e=ev(s.currentEventId);
  if(e&&!s.resolved){
   const c=e.choices.find(c=>c.id===policy[e.id])||e.choices[0];expect(eligible(e,s.player),'实际不符合条件');
   const description=describeEvent(e,s.player);
   finishAnnualChoice(s,e,c);(years[s.player.age]||=[]).push(e.id);expect(s.annual.processedCount<=3,'超过年度上限');
   expect(s.player.history.at(-1).eventDescription===description,'历史没有保存选择前的文案');
  }
  s=reload(s);const n=s.player.age,cash=s.player.money,marker=s.player.economy.lastSettledAge;
  continueOrGrow(s,random);
  if(s.player.age===n)expect(s.player.money===cash&&s.player.economy.lastSettledAge===marker,'同年追加结算');
 }
 s=reload(s);const before=JSON.stringify(s.player),summary=buildLifeSummary(s.player);
 expect(JSON.stringify(s.player)===before&&JSON.stringify(summary)===JSON.stringify(buildLifeSummary(s.player)),'总结修改状态或随机');
 expect(summary.facts.money===s.player.money&&summary.facts.deathAge===s.player.age,'基本事实错误');
 const checkMoment=h=>{const real=s.player.history[h.historyIndex];expect(real?.eventId===h.eventId&&real.choiceId===h.choiceId&&real.text===h.text&&real.age===h.age&&real.eventTitle===h.title,'总结伪造经历');};
 summary.trajectory.forEach(checkMoment);summary.highlights.forEach(checkMoment);
 summary.facts.careerPath.forEach(h=>expect(s.player.history[h.historyIndex]?.age===h.age,'职业轨迹没有历史依据'));
 summary.themes.forEach(t=>expect(t.evidence.length&&t.evidence.every(i=>s.player.history[i]?.eventId),'称号没有历史依据'));
 expect(summary.trajectory.length<=10&&summary.highlights.length<=4&&summary.themes.length>=2&&summary.themes.length<=3,'总结数量错误');
 expect(!summary.unfinished.length,'没有足够证据却制造遗憾');
 expect(!JSON.stringify(summary).match(/GOOD END|BAD END|总分|失败者|特殊路线|稀有路线/),'总结强制评级/特殊化');
 for(const [min,max] of [[0,18],[36,59],[60,110]])if(s.player.history.some(h=>h.eventId&&h.age>=min&&h.age<=max))expect(summary.trajectory.some(h=>h.age>=min&&h.age<=max),'总结遗漏实际经历过的年龄阶段');
 const end=JSON.stringify(s);expect(!continueOrGrow(s,random)&&end===JSON.stringify(s),'死后继续处理事件');
 return {state:s,summary,years};
}
`);
const common={birth:'sleep',ranking:'review',score95:'celebrate',mock:'rest',late_study:'sleep',exam_eve:'walk',first_job:'steady',boss_message:'morning',young_meet:'single',young_values:'align',young_housing_choice:'keep_renting',young_ranking_echo:'own_scale',young_free_evening:'keep_time',young_job_change:'clear_hours',young_burnout:'change',young_career_crisis:'transfer',young_holiday:'home',young_married_daily:'share',young_parenthood_plan:'no_child',mid_work_pressure:'ease',mid_health:'adjust',mid_daily:'own_time',mid_interest_echo:'practice',mid_boundary_echo:'wait',mid_comparison_echo:'own_scale',mid_score_echo:'listen',late_retirement:'retire',late_work:'finish',late_body:'adjust',late_daily:'own',late_interest:'learn',stats_health:'care',stats_stress:'rest',esports_amateur:'hobby',esports_trial:'decline',stream_first:'stop',band_instrument:'listen'};
const did=(r,id,c)=>r.state.player.history.some(h=>h.eventId===id&&(!c||h.choiceId===c));
const married={young_direction:'pause',young_job_search:'restart',young_meet:'date',young_values:'register',young_commitment:'marry'};
const esports={caught_gaming:'agree',esports_amateur:'practice',esports_trial:'join',esports_transition:'coach',esports_season:'adjust',esports_analysis:'teach'};
const stream={interest:'art',stream_first:'continue',stream_fulltime:'fulltime',stream_online:'schedule',stream_midlife:'slow'};
const band={art_class:'join',interest:'art',band_instrument:'learn',band_rehearsal:'join',band_stage:'play',band_direction:'career',band_changes:'adapt',band_return:'again'};
const scenarios=[
 ['普通工作',{},r=>did(r,'first_job','steady')],
 ['职业选手',esports,r=>did(r,'esports_trial','join')&&did(r,'late_esports_echo')],
 ['主播',stream,r=>did(r,'stream_fulltime','fulltime')&&did(r,'late_stream_echo')],
 ['乐队',band,r=>did(r,'band_stage','play')&&did(r,'band_direction','career')&&did(r,'late_band_echo')],
 ['高压事业',{first_job:'flexible',boss_message:'reply',young_fast_track:'take',young_promotion:'accept',young_burnout:'push',young_job_change:'higher_pay',mid_work_pressure:'lead'},r=>did(r,'young_promotion','accept')],
 ['平衡工作',{},r=>did(r,'young_free_evening','keep_time')],
 ['已婚有孩子',{...married,young_parenthood_plan:'plan',mid_parenthood:'begin'},r=>r.state.player.relationship.status==='married'&&r.state.player.child.hasChild],
 ['已婚无孩子',married,r=>r.state.player.relationship.status==='married'&&!r.state.player.child.hasChild],
 ['主动不婚',{young_meet:'date',young_values:'align',young_commitment:'partner'},r=>r.state.player.tags.includes('主动不婚')],
 ['主动不育',married,r=>r.state.player.tags.includes('主动不生育')],
 ['长期单身',{},r=>r.state.player.relationship.status==='single'&&!r.state.player.history.some(h=>h.stateChanges?.relationship)],
 ['买房',{young_housing_choice:'buy'},r=>did(r,'young_housing_choice','buy')],
 ['长期租房',{},r=>r.state.player.housing.status==='renting'&&!did(r,'young_housing_choice','buy')],
 ['高自主',{major:'like',red_envelope:'budget',phone_request:'negotiate',relatives_child:'ask_back',young_decision_echo:'own_plan',mid_decision_echo:'space'},r=>r.state.player.autonomy>=65],
 ['高家庭',{...married,spring_home:'cook',mid_parents_help:'do_together',young_parenthood_plan:'plan',mid_parenthood:'begin'},r=>r.state.player.family>=65&&did(r,'mid_parents_help')],
 ['长期兴趣',{interest:'art',old_album:'draw',mid_interest_echo:'practice'},r=>did(r,'interest','art')&&did(r,'mid_interest_echo','practice')],
 ['放下兴趣',{interest:'math',old_album:'keep',mid_interest_echo:'keep'},r=>did(r,'interest','math')&&did(r,'mid_interest_echo','keep')],
 ['高压力',{first_job:'flexible',boss_message:'reply',young_fast_track:'take',young_burnout:'push',young_job_change:'higher_pay',mid_work_pressure:'lead',stats_stress:'support'},r=>did(r,'stats_stress')],
 ['低健康',{mid_health:'finish_first',stats_health:'care'},r=>did(r,'stats_health'),{health:35}],
 ['不同寿命',{},r=>r.state.player.death.deathAge>=60]
];
const examples={},coverage={};let fullLives=0;
for(const [name,extra,witness,initial={}] of scenarios){
 let match=null;const ages=[];
 for(let seed=1;seed<=60;seed++){
  const result=run(`playLife(${seed},${JSON.stringify({...common,...extra})},${JSON.stringify(initial)})`);fullLives++;ages.push(result.state.player.age);
  if(witness(result)&&!match)match=result;
  if(seed>=8&&match)break;
 }
 assert.ok(match,name+' 没有真实完整人生见证');
 assert.ok(match.summary.trajectory.length>=6&&match.summary.highlights.length>=2,name+' 总结过于稀疏');
 assert.ok(new Set(match.summary.trajectory.map(h=>h.domain)).size>=4,name+' 工作挤掉其他人生节点');
 if(['主动不婚','主动不育','长期单身','长期租房','放下兴趣'].includes(name))assert.equal(match.summary.unfinished.length,0);
 coverage[name]={lives:ages.length,deathAgeRange:[Math.min(...ages),Math.max(...ages)]};
 if(['普通工作','已婚有孩子','职业选手','乐队'].includes(name))examples[name]=JSON.parse(JSON.stringify(match.summary));
}
assert.ok(new Set(Object.values(coverage).flatMap(v=>v.deathAgeRange)).size>1,'所有人生寿命都相同');
console.log('FINAL COVERAGE: '+fullLives+' full birth-to-death lives across '+scenarios.length+' witnessed routes; '+JSON.stringify(coverage));

// 普通玩家与开发模式隔离、死亡总结、重新投胎。简易DOM检查实际app渲染函数。
class Element{constructor(){this.children=[];this.textContent='';}append(n){this.children.push(n);}replaceChildren(){this.children=[];}setAttribute(){}}
const storage=new Map();
function ui(debug=false,beforeApp=''){
 const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);};
 const c=vm.createContext({console:{error(){},warn(){}},URLSearchParams,location:{search:debug?'?debug=1':''},document:{getElementById:get,createElement:()=>new Element()},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},confirm:()=>true});
 for(const f of [...files,'app.js']){if(f==='app.js'&&beforeApp)vm.runInContext(beforeApp,c);vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});}
 return {nodes,run:code=>vm.runInContext(code,c)};
}
const content=n=>[n.textContent,...n.children.map(content)].join(' ');
let u=ui(false,"EVENTS.push({...EVENTS[0],id:'review_birth'});");
assert.equal(u.nodes.get('data-diagnostics').hidden,true);
assert.equal(u.nodes.get('data-diagnostics').textContent,'');
u.nodes.get('start').onclick();assert.doesNotMatch(u.nodes.get('event-meta').textContent,/birth|milestone/);
u=ui(true,"EVENTS.push({...EVENTS[0],id:'review_birth'});");assert.equal(u.nodes.get('data-diagnostics').hidden,false);
assert.match(u.nodes.get('event-meta').textContent,/birth|review_birth/);
storage.clear();u=ui();u.run(`{const p=createPlayer();p.tags=['特殊职业在岗','已讨论住房','开始养育','未知技术标签','喜欢画画'];state={version:SAVE_VERSION,player:p,world:createWorld(),currentEventId:null,resolved:false,result:''};beginYear(state);save();render();}`);
assert.equal(content(u.nodes.get('tags')),' 喜欢画画');
const exampleLife=run(`playLife(1,${JSON.stringify(common)})`);
storage.set('east-asian-life-v01',JSON.stringify(exampleLife.state));u=ui();
assert.equal(u.nodes.get('life-summary').hidden,false);assert.equal(u.nodes.get('event-card').hidden,true);
assert.match(content(u.nodes.get('life-summary')),/你的一生|人生轨迹|人生高光/);
assert.doesNotMatch(content(u.nodes.get('life-summary')),/特殊路线|hidden|debug|milestone|eventId|choiceId/);
assert.match(u.nodes.get('life-question').textContent,/如果重新来一次/);
const old=JSON.parse(storage.get('east-asian-life-v01'));u.nodes.get('restart').onclick();
assert.equal(u.run('state.player.age'),0);assert.equal(u.run('state.player.money'),0);assert.equal(u.run('state.player.monthlyIncome'),0);
assert.equal(u.run('state.player.history.length'),0);assert.equal(u.run('state.player.tags.length'),0);
assert.equal(u.run('state.player.child.hasChild'),false);assert.equal(u.run('state.player.relationship.status'),'single');
assert.equal(u.run('state.player.housing.status'),'with_family');assert.equal(u.run('state.player.work.status'),'not_working');
assert.equal(u.run('state.player.economy.lastSettlement'),null);assert.equal(u.run('state.version'),5);
assert.equal(u.run('state.annual.processedCount'),0);assert.equal(u.run('state.currentEventId'),'birth');
assert.equal(u.nodes.get('life-summary').hidden,true);assert.equal(u.nodes.get('life-summary').children.length,0);
assert.ok(u.run('state.player.alive && validSave(state)'));u.nodes.get('choices').children[0].onclick();u=ui();assert.ok(u.run('validSave(state) && state.player.history.length===1'));
assert.notDeepEqual(JSON.parse(storage.get('east-asian-life-v01')).player.history,old.player.history);
console.log('PASS: normal/debug isolation, no raw tags/event ids/special labels, factual summary rendering/death refresh, reincarnation clears all previous life and continues normally.');
console.log('STAGE6 PASS: events='+run('EVENTS.length')+', errors='+report.errors.length+', warnings='+report.warnings.length+'.');
// 文档可复用这些确实从出生运行到死亡的总结，不手编一个故事冒充测试。
module.exports={examples,coverage,fullLives};
