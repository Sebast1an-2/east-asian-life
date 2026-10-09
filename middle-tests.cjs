// 阶段4：条件文案、真实历史、角色变化和36～59岁覆盖，无第三方依赖。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ctx = vm.createContext({});
for (const file of ['player.js','life-state.js', 'mortality.js','events.js','events-young.js','events-middle.js','engine.js','annual.js','validation.js']) vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const run = source => vm.runInContext(source,ctx);
const report=run('checkEvents(EVENTS)');
assert.equal(run('EVENTS.length'),68);
assert.equal(run('EVENTS.filter(e=>e.id.startsWith("mid_")).length'),18);
assert.deepEqual(Array.from(report.errors),[]);
assert.equal(run('EVENTS.filter(e=>e.id.startsWith("mid_") && e.isMajorNode===true).length'),0);

run(`
function middleEvent(id) {return EVENTS.find(e=>e.id===id);}
function atAge(p,age) {p.age=age;p.lifeStage=stageFor(age)[1];}
function choosePast(p,id,cid) {
  const e=middleEvent(id);if(!eligible(e,p))throw Error('测试前置不满足 '+id+' / '+p.age);
  const c=e.choices.find(c=>c.id===cid);if(!c)throw Error('测试选择不存在 '+id+'/'+cid);
  applyChoice(p,e,c);
}
// 定向条件测试用真实applyChoice产生History，不靠手写记忆标签。
function middlePast(overrides={}) {
  const p=createPlayer();
  const steps=[[0,'birth','cry'],[1,'first_plan','pen'],[3,'art_class','join'],[5,'neighbor','learn'],
    [7,'red_envelope','entrust'],[8,'score95','promise'],[10,'relatives_child','perform'],
    [11,'ranking','chase'],[12,'phone_request','accept'],[13,'interest','math'],[14,'best_friend','keep'],
    [17,'mock','rest'],[19,'major','safe'],[21,'home','talk'],[23,'first_job','steady'],
    [24,'boss_message','morning'],[25,'young_salary_echo','buffer'],[26,'young_holiday','home'],[28,'old_album','keep']];
  for(const [age,id,cid] of steps){atAge(p,age);choosePast(p,id,overrides[id]||cid);}
  atAge(p,36);return p;
}
function middleState(p) {
  const state={version:SAVE_VERSION,player:p,world:{...createWorld(),year:p.birthYear+p.age},currentEventId:null,resolved:false,result:''};
  beginYear(state,()=>0);return state;
}
function middleSimulation(seed,p,policy={}) {
  let value=seed;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  const state={version:SAVE_VERSION,player:p,world:{...createWorld(),year:p.birthYear+p.age},currentEventId:null,resolved:false,result:''};
  beginYear(state,random);const years={},seen={};let guard=0;
  while(p.alive){
    if(++guard>240)throw Error('年度死循环');
    if(!validSave(state))throw Error('待选存档无效 '+p.age+' '+state.currentEventId);
    const pending=upgradeSave(JSON.parse(JSON.stringify(state)));
    if(JSON.stringify(pending)!==JSON.stringify(state))throw Error('待选刷新改变状态');
    const e=middleEvent(state.currentEventId);
    if(e&&!state.resolved){
      const c=e.choices.find(c=>c.id===policy[e.id])||e.choices[Math.floor(random()*e.choices.length)];
      const text=describeEvent(e,p);finishAnnualChoice(state,e,c);
      if(p.history.at(-1).eventDescription!==text)throw Error('当时文案没有保存');
      seen[e.id]=(seen[e.id]||0)+1;
      if(p.age>=36&&p.age<=59)(years[p.age]||=[]).push(e.id);
      if(e.id.startsWith('mid_')&&(p.age<36||p.age>59))throw Error('中年事件超出窗口');
    }
    if(!validSave(state)||!validLifeStates(p)||state.annual.processedCount>3)throw Error('选择后状态或年度上限损坏');
    const restored=upgradeSave(JSON.parse(JSON.stringify(state)));
    if(JSON.stringify(restored)!==JSON.stringify(state))throw Error('选择后刷新丢失状态');
    continueOrGrow(state,random);
  }
  let blank=0,maxBlank=0;for(let age=36;age<=59;age++){blank=years[age]?.length?0:blank+1;maxBlank=Math.max(maxBlank,blank);}
  return {seen,years,maxBlank,finalAge:p.age,history:p.history,states:[p.work,p.relationship,p.child,p.housing]};
}
`);

const echoes=[
  ['mid_score_echo','score95','promise','celebrate'],
  ['mid_interest_echo','interest','math','art'],
  ['mid_money_echo','red_envelope','entrust','budget'],
  ['mid_boundary_echo','phone_request','accept','negotiate'],
  ['mid_comparison_echo','ranking','chase','review'],
  ['mid_table_echo','relatives_child','perform','ask_back'],
  ['mid_decision_echo','major','safe','like'],
  ['mid_friend_echo','best_friend','keep','goodbye'],
  ['mid_holiday_echo','young_holiday','home','stay']
];
for(const [echo,source,a,b] of echoes){
  const pair=run(`(()=>{
    const e=middleEvent('${echo}');const p=middlePast({'${source}':'${a}'}),q=middlePast({'${source}':'${b}'});
    atAge(p,45);atAge(q,45);
    if(!eligible(e,p)||!eligible(e,q))throw Error('回声两条早期选择没有接通 ${echo}');
    const texts=[describeEvent(e,p),describeEvent(e,q)];
    const memories=['${a}','${b}'].map(cid=>e.descriptionDetails.find(part=>part.conditions.historyChoicesAll?.some(ref=>ref.eventId==='${source}'&&ref.choiceId===cid)).text);
    if(!texts[0].includes(memories[0])||texts[0].includes(memories[1])||!texts[1].includes(memories[1])||texts[1].includes(memories[0]))throw Error('回声具体选择文案混用 ${echo}');
    // 缺少所有可能的来源历史，即使保留全部标签，也不能伪造回忆。
    const sources=new Set(e.conditions.historyChoicesAny.map(ref=>ref.eventId));
    const absent=JSON.parse(JSON.stringify(p));absent.history=absent.history.filter(h=>!sources.has(h.eventId));
    if(eligible(e,absent))throw Error('无来源历史仍触发 ${echo}');
    const child=JSON.parse(JSON.stringify(p));child.relationship={status:'married',startYear:2030};child.child={hasChild:true,birthYear:2036};
    if(!eligible(e,child))throw Error('有孩子回声未接通 ${echo}');
    if('${echo}'==='mid_score_echo'&&!describeEvent(e,child).includes('自己的孩子'))throw Error('亲子成绩角色没有变化');
    if('${echo}'==='mid_money_echo'&&!describeEvent(e,child).includes('自己的孩子'))throw Error('亲子金钱角色没有变化');
    // 成年回应也有取舍：不同标签和真实History，能进入后续或改变之后日常文字。
    choosePast(p,e.id,e.choices[0].id);choosePast(q,e.id,e.choices[1].id);
    if(p.history.at(-1).choiceId===q.history.at(-1).choiceId||JSON.stringify(p.tags)===JSON.stringify(q.tags))throw Error('成年回应没有留下差异 ${echo}');
    return texts;
  })()`);
  assert.notEqual(pair[0],pair[1]);
  console.log('ECHO PASS: '+echo+' <- '+source+'/'+a+' vs '+b+'; true history and both child contexts.');
}

run(`{
  const expect=(v,m)=>{if(!v)throw Error(m);};
  const p=middlePast();atAge(p,29);choosePast(p,'young_meet','date');atAge(p,30);choosePast(p,'young_values','register');
  atAge(p,31);choosePast(p,'young_married_daily','share');atAge(p,32);choosePast(p,'young_parenthood_plan','plan');atAge(p,36);
  const s=middleState(p);expect(s.currentEventId==='mid_parenthood','真实计划没有接入成为父母');
  const e=middleEvent(s.currentEventId);finishAnnualChoice(s,e,e.choices.find(c=>c.id==='begin'));
  expect(p.child.hasChild&&p.child.birthYear===2036&&childAge(p)===0,'出生状态/年份错误');
  expect(p.history.at(-1).stateChanges.child.before.hasChild===false&&p.history.at(-1).stateChanges.child.after.birthYear===2036,'出生历史不完整');
  expect(!eligible(middleEvent('mid_parenthood'),p),'已有孩子重复出生');
  atAge(p,40);expect(!eligible(middleEvent('mid_score_echo'),p),'幼儿被写成拿考试试卷的孩子');
  atAge(p,44);expect(eligible(middleEvent('mid_score_echo'),p)&&describeEvent(middleEvent('mid_score_echo'),p).includes('自己的孩子'),'成长后的亲子95分未接通');
  atAge(p,60);expect(!eligible(middleEvent('mid_score_echo'),p),'中年回声越过59岁');
  const optedOut=middlePast();optedOut.relationship={status:'married',startYear:2030};optedOut.tags.push('主动不生育','考虑成为父母');
  expect(!eligible(middleEvent('mid_parenthood'),optedOut),'主动不育被生成孩子');
  for(const status of ['single','dating']){optedOut.relationship.status=status;expect(!eligible(middleEvent('mid_parenthood'),optedOut),'关系状态不合适仍生成孩子');}

  const high=middlePast({first_job:'flexible'}),balanced=middlePast();
  expect(eligible(middleEvent('mid_work_pressure'),high)&&!eligible(middleEvent('mid_work_balance'),high),'高压事件池混用');
  expect(eligible(middleEvent('mid_work_balance'),balanced)&&!eligible(middleEvent('mid_work_pressure'),balanced),'平衡事件池混用');
  choosePast(high,'mid_work_pressure','ease');expect(high.work.workStyle==='balanced'&&eligible(middleEvent('mid_work_balance'),high)&&!eligible(middleEvent('mid_work_pressure'),high),'中年无法转向');
  choosePast(balanced,'mid_work_balance','expert');expect(balanced.work.level===1,'专业路线被强制管理');
  const restarted=middlePast();atAge(restarted,34);choosePast(restarted,'young_career_crisis','leave');
  atAge(restarted,40);choosePast(restarted,'mid_restart','restart');
  expect(restarted.work.status==='employed'&&restarted.work.startYear===2040,'中年重新就业的状态/年份错误');
}`);

// 循环可以重复，也可以改变；中年选择真实解锁后续，随后日常读取最新标签。
run(`{
  const repeat=middlePast(),change=middlePast();atAge(repeat,45);atAge(change,45);
  choosePast(repeat,'mid_score_echo','check');choosePast(change,'mid_score_echo','listen');
  const next=middleEvent('mid_response');if(!eligible(next,repeat)||!eligible(next,change)||describeEvent(next,repeat)===describeEvent(next,change))throw Error('代际回应没有后续差异');
  const artist=middlePast();atAge(artist,45);choosePast(artist,'mid_interest_echo','practice');
  if(!describeEvent(middleEvent('mid_daily'),artist).includes('颜料'))throw Error('重拾兴趣没有影响日常');
  const friend=middlePast();atAge(friend,45);choosePast(friend,'mid_friend_echo','meet');
  if(!describeEvent(middleEvent('mid_daily'),friend).includes('老朋友'))throw Error('老友选择没有影响日常');
  const fake=createPlayer();atAge(fake,45);fake.tags=['中年为画画留时间','中年老友重逢','给晚辈管钱空间'];
  if(/颜料|老朋友/.test(describeEvent(middleEvent('mid_daily'),fake)))throw Error('仅凭标签伪造日常中的过去经历');
  if(describeEvent(next,fake).includes('第一次自己记账'))throw Error('仅凭标签伪造代际后续');
}`);

// 文案条件与主条件一样严格验证，未知字段、坏引用、非法孩子年龄都在开发期报错。
for(const part of [null,{text:'',conditions:{}},{text:'文本',conditions:{historyChoicesAll:[{eventId:'score95',choiceId:'missing'}]}},
  {text:'文本',conditions:{historyChoicesAny:[{eventId:'missing',choiceId:'go'}]}},
  {text:'文本',conditions:{childAge:{min:-1}}},{text:'文本',conditions:{childAge:{min:8,max:4}}},
  {text:'文本',conditions:{childAge:{min:6,allowNoChild:'true'}}},{text:'文本',conditions:{childAge:{unknown:8}}},
  {text:'文本',conditions:{states:{child:{hasChild:'yes'}}}},{text:'文本',conditions:{unknown:1}}]){
  assert.ok(run(`checkEvents([...EVENTS,{...EVENTS[0],id:'bad_details',descriptionDetails:[${JSON.stringify(part)}]}]).errors.length`)>0,'坏文案条件未拦截');
}
assert.ok(run('checkEvents([{...EVENTS[0],descriptionDetails:{}}]).errors.length')>0);
assert.equal(run('matchesConditions({childAge:{min:8,allowNoChild:true}},createPlayer())'),true);
assert.equal(run('matchesConditions({childAge:{min:8}},createPlayer())'),false);
// 新展示字段不是旧存档的必需项。
run(`{const p=middlePast();const s=middleState(p);for(const h of p.history)delete h.eventDescription;
  if(!validSave(s)||!validSave(upgradeSave(JSON.parse(JSON.stringify(s)))))throw Error('阶段3旧历史不兼容');
  p.history[0].eventDescription=17;if(validSave(s))throw Error('非法历史文案未被拒绝');}`);

const healthy={mid_health:'adjust',mid_daily:'own_time',mid_restart:'restart'};
const reach=new Set();
const examples={};
const exampleChains={score:['score95','home','mid_score_echo'],interest:['interest','old_album','mid_interest_echo'],boundary:['phone_request','boss_message','mid_boundary_echo']};
for(let seed=1;seed<=128;seed++){
  const result=run(`middleSimulation(${seed},createPlayer(),${JSON.stringify(healthy)})`);
  assert.ok(result.finalAge >= 60 && result.finalAge <= 110);assert.equal(result.maxBlank,0);
  for(const id of Object.keys(result.seen))reach.add(id);
  for(const [name,ids] of Object.entries(exampleChains))if(!examples[name]&&ids.every(id=>result.history.some(h=>h.eventId===id))) {
    examples[name]={seed,steps:ids.map(id=>{const h=result.history.find(h=>h.eventId===id);return {age:h.age,eventId:id,choiceId:h.choiceId,text:h.text,eventDescription:h.eventDescription};})};
  }
}
console.log('PASS: 128 seeded full birth-to-death lives, pending/resolved saves restored, 36-59 longest blank=0.');
for(const name of Object.keys(exampleChains)){assert.ok(examples[name],'缺少实际从出生走出的三段路径 '+name);console.log('LIFE EXAMPLE '+name+': '+JSON.stringify(examples[name]));}

const fixtures=[
  ['high_pressure',{workStyle:'high_pressure'},{}],
  ['balanced',{}, {mid_work_balance:'expert'}],
  ['turning',{workStyle:'high_pressure'},{mid_work_pressure:'ease',mid_work_balance:'expert'}],
  ['married_child',{relationship:'married',childYear:2032},{}],
  ['married_no_child',{relationship:'married',tags:['主动不生育']},{}],
  ['unmarried_partner',{relationship:'dating',tags:['主动不婚','不登记的伴侣']},{}],
  ['single',{tags:['选择单身']},{}],
  ['owner',{housing:'owns_home'},{}],
  ['renter',{housing:'renting'},{}],
  ['kept_interest',{interest:'art',old_album:'draw'},{}],
  ['gave_up_interest',{interest:'math',old_album:'keep'},{}],
  ['unemployed',{unemployed:true},{mid_restart:'prepare'}]
];
const coverage={};
for(const [name,fields,policy] of fixtures){
  let longest=0,minDistinct=99,minEchoes=99;
  for(let seed=1;seed<=8;seed++){
    const setup=JSON.stringify(fields);
    const result=run(`(()=>{const f=${setup},p=middlePast({interest:f.interest||'math',old_album:f.old_album||'keep'});
      if(f.workStyle)p.work.workStyle=f.workStyle;
      if(f.unemployed)p.work={status:'unemployed',careerType:null,level:0,workStyle:null,startYear:null};
      if(f.relationship)p.relationship={status:f.relationship,startYear:2030};
      if(f.childYear)p.child={hasChild:true,birthYear:f.childYear};
      if(f.housing)p.housing={status:f.housing};p.tags.push(...(f.tags||[]));
      return middleSimulation(${seed},p,${JSON.stringify({...healthy,...policy})});})()`);
    assert.ok(result.finalAge >= 60 && result.finalAge <= 110);longest=Math.max(longest,result.maxBlank);
    const ids=Object.keys(result.seen).filter(id=>id.startsWith('mid_'));
    minDistinct=Math.min(minDistinct,ids.length);minEchoes=Math.min(minEchoes,echoes.filter(([id])=>ids.includes(id)).length);
    for(const id of Object.keys(result.seen))reach.add(id);
    if(fields.tags?.includes('主动不生育'))assert.ok(!result.seen.mid_parenthood);
    if(name==='unmarried_partner'||name==='single')assert.ok(!result.seen.mid_parenthood);
    if(name==='balanced')assert.ok(!result.seen.mid_work_pressure);
    if(name==='turning')assert.ok(result.seen.mid_work_pressure&&result.seen.mid_work_balance);
    if(fields.tags?.includes('主动不生育')||fields.tags?.includes('主动不婚'))assert.ok(!result.history.filter(h=>h.age>=36&&h.age<=59).some(h=>/孤独|遗憾|失败/.test(h.eventDescription+' '+h.resultText)));
  }
  assert.equal(longest,0,name+' 中年内容断层');assert.ok(minDistinct>=8,name+' 中年内容不足');assert.ok(minEchoes>=7,name+' 回声过少');
  coverage[name]={longest,minDistinct,minEchoes};
  console.log('MIDDLE COVERAGE: '+name+', 8 lives, blank='+longest+', distinct>='+minDistinct+', echoes>='+minEchoes+'.');
}
assert.ok(coverage.married_no_child.minDistinct>=coverage.married_child.minDistinct-2,'无孩子路线明显少内容');

// 一条从真实青年生育计划接续的完整中年人生，验证出生到亲子回声的实际年度路径。
const parentPath=run(`(()=>{const p=middlePast();atAge(p,29);choosePast(p,'young_meet','date');atAge(p,30);choosePast(p,'young_values','register');atAge(p,31);choosePast(p,'young_married_daily','share');atAge(p,32);choosePast(p,'young_parenthood_plan','plan');atAge(p,36);return middleSimulation(1,p,{...${JSON.stringify(healthy)},mid_parenthood:'begin'});})()`);
assert.ok(parentPath.seen.mid_parenthood&&parentPath.seen.mid_score_echo&&parentPath.seen.mid_money_echo);
assert.ok(parentPath.history.find(h=>h.eventId==='mid_score_echo').eventDescription.includes('自己的孩子'));
assert.ok(parentPath.history.find(h=>h.eventId==='mid_money_echo').eventDescription.includes('自己的孩子'));
for(const id of Object.keys(parentPath.seen))reach.add(id);
const missing=run('EVENTS.filter(e=>e.id.startsWith("mid_")).map(e=>e.id)').filter(id=>!reach.has(id));assert.deepEqual(Array.from(missing),[],'中年不可达候选：'+missing.join(','));
console.log('PARENT PATH: '+JSON.stringify(parentPath.years));
console.log('PASS: 68 events, 18 additions, 9 echoes x 2 specific choices, 12 legal middle-age routes, choice followups, birth/child ages, saved descriptions, all 18 additions reachable; errors='+report.errors.length+', warnings='+report.warnings.length+'.');
