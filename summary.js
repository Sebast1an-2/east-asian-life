// 只从真实History/State生成结构化总结，不操作页面，不评分，不随机起称号。
const CAREER_LABELS = {general: "普通工作", esports: "职业选手", esports_coach: "电竞训练指导", streamer: "主播 / 内容创作", musician: "音乐工作"};
const WORK_LABELS = {not_working: "未在职", employed: "在职", unemployed: "待业", retired: "已退休"};
const RELATIONSHIP_LABELS = {single: "单身", dating: "恋爱中", married: "已婚"};
const HOUSING_LABELS = {with_family: "与家人同住", renting: "租住", owns_home: "自有住房"};
function careerLabel(work) { return work.status === "employed" ? CAREER_LABELS[work.careerType] || "工作类型不详" : WORK_LABELS[work.status]; }
function summaryDomain(h) {
  if (h.stateChanges?.work) return "工作";
  if (h.stateChanges?.relationship || h.eventTags?.includes("感情")) return "关系";
  if (h.stateChanges?.child) return "家庭";
  if (h.stateChanges?.housing || h.eventTags?.includes("居住")) return "居住";
  if (/interest|album|band|art_class/.test(h.eventId || "") || h.eventTags?.includes("兴趣")) return "兴趣";
  if (h.age <= 18) return "童年与求学";
  if (h.eventTags?.includes("回声") || /_echo|^home$/.test(h.eventId || "")) return "回声";
  if (h.eventTags?.includes("家庭") || h.eventTags?.includes("原生家庭")) return "家庭";
  if (h.eventTags?.includes("工作") || /esports|stream/.test(h.eventId || "")) return "工作";
  return "自己的生活";
}
function summaryMoment(h, index) {
  const state = h.stateChanges || {};
  const careerChange = state.work?.before.status === "employed" && state.work.after.status === "employed" && state.work.before.careerType !== state.work.after.careerType;
  const score = h.importance * 3 + (Object.keys(state).length ? 5 : 0) + (careerChange ? 4 : 0) + (/echo|band_return|old_album/.test(h.eventId) ? 4 : 0) + (h.eventId === "band_stage" ? 7 : 0);
  return {historyIndex: index, age: h.age, year: h.year, eventId: h.eventId, choiceId: h.choiceId,
    title: h.eventTitle, text: h.text, domain: summaryDomain(h), relevance: score};
}
function selectSummaryMoments(history, count, domainLimit) {
  const ranked = history.map(summaryMoment).filter(h => h.eventId && h.relevance > 0)
    .sort((a,b) => b.relevance - a.relevance || a.age - b.age || a.historyIndex - b.historyIndex);
  const chosen = [], domains = {}, events = new Set();
  const add = h => {chosen.push(h);domains[h.domain]=(domains[h.domain]||0)+1;events.add(h.eventId);};
  // 完整轨迹为童年、中年、晚年各留一席，避免一生91岁却只回顾到36岁。
  if (count >= 6) for (const [min,max] of [[0,18],[36,59],[60,MAX_LIFE_AGE]]) {
    const h=ranked.find(h=>h.age>=min && h.age<=max && (domains[h.domain]||0)<domainLimit);
    if(h)add(h);
  }
  // 先给每个出现过的主题留一席，再补重要节点，避免工作记录挤掉童年、关系与兴趣。
  for (const h of ranked) if (!domains[h.domain] && chosen.length < count) add(h);
  for (const h of ranked) if (chosen.length < count && !events.has(h.eventId) && domains[h.domain] < domainLimit) add(h);
  return chosen.sort((a,b) => a.historyIndex - b.historyIndex).map(({relevance,...h}) => h);
}
function summaryCareerPath(player) {
  const path = [];
  player.history.forEach((h,index) => {
    const change = h.stateChanges?.work;
    let work = change?.after;
    // V0.1没有stateChanges，但第一份工作的具体选择仍是可靠的职业事实。只用于回顾，不补State。
    if (!change && h.eventId === "first_job" && ["steady", "flexible"].includes(h.choiceId)) work = {status: "employed", careerType: "general"};
    if (!work || (change && change.before.status === work.status && change.before.careerType === work.careerType)) return;
    const label = careerLabel(work);
    if (path.at(-1)?.label !== label) path.push({age:h.age, year:h.year, label, historyIndex:index});
  });
  return path;
}
function summaryThemes(player) {
  const history = player.history, themes = [], groups = new Set();
  const refs = (id, choices) => history.map((h,i) => ({h,i})).filter(({h}) => h.eventId === id && choices.includes(h.choiceId)).map(({i}) => i);
  const add = (name, reason, evidence, group) => {
    if (evidence.length && !groups.has(group) && themes.length < 3) { themes.push({name, reason, evidence:[...new Set(evidence)]});groups.add(group); }
  };
  const earlyArt=refs("interest",["art"]), laterArt=refs("mid_interest_echo",["practice"]), music=refs("band_instrument",["learn"]);
  const putAside=refs("interest",["math"]), musicReturn=[...refs("band_return",["again"]),...refs("late_band_echo",["reunion","send"])];
  if (putAside.length && laterArt.length) add("迟到的画室", "年轻时放下画画，中年又为它留出时间。", [...putAside,...laterArt], "兴趣");
  if (music.length && musicReturn.length) add("又弹起那首歌", "学过的乐器，在多年以后重新发出声音。", [...music,...musicReturn], "兴趣");
  if (earlyArt.length && laterArt.length) add("给兴趣留一个位置", "两个不同人生阶段都选择为画画留时间。", [...earlyArt,...laterArt], "兴趣");
  const played=refs("esports_trial",["join"]), switched=[...refs("esports_transition",["coach","stream","ordinary"]),...refs("esports_season",["leave"])];
  if (played.length && switched.length) add("赛场之外还有人生", "做过职业选手，也选择了赛场以后的方向。", [...played,...switched], "职业");
  const content=refs("stream_fulltime",["fulltime"]), slow=[...refs("stream_midlife",["slow","change"]),...refs("stream_online",["schedule"])];
  if (content.length && slow.length) add("镜头之外的时间", "曾靠内容工作，也实际调整过在线节奏。", [...content,...slow], "职业");
  const score=refs("score95",["promise","celebrate"]), listen=refs("mid_score_echo",["listen"]), check=refs("mid_score_echo",["check"]);
  if (score.length && listen.length) add("旧话有了新的说法", "经历过95分，也在角色变化后选择先听努力。", [...score,...listen], "代际");
  if (score.length && check.length) add("带着熟悉的尺子", "经历过95分，后来又选择分析错题、商量目标。", [...score,...check], "代际");
  const autonomous=history.map((h,i)=>({h,i})).filter(({h})=>(h.effects?.autonomy||0)>=5);
  if (player.autonomy >= 65 && new Set(autonomous.map(({h})=>stageFor(h.age)[1])).size >= 3) add("标准答案以外", "在至少三个阶段，为自己的安排争取过空间。", autonomous.slice(0,4).map(({i})=>i), "自己");
  const caring=history.map((h,i)=>({h,i})).filter(({h})=>["mid_parents_help","young_married_daily","late_children","spring_home"].includes(h.eventId));
  if (player.family >= 65 && new Set(caring.map(({h})=>h.eventId)).size >= 2) add("关心落在具体的事上", "在不同关系里，用实际行动处理过相处与照顾。", caring.slice(0,3).map(({i})=>i), "关系");
  const selfTime=history.map((h,i)=>({h,i})).filter(({h})=>["mid_daily","late_daily","late_interest"].includes(h.eventId));
  if (player.happiness >= 65 && selfTime.length >= 3) add("把日子过成自己的样子", "多次安排自己的时间，也保留了一些快乐。", selfTime.slice(0,3).map(({i})=>i), "日常");
  // 稀疏旧档也只使用确实存在的记录；不凭婚育、房产或收入判定成败。
  const real=history.map((h,i)=>({h,i})).filter(({h})=>h.eventId);
  if (themes.length < 2 && real.length) add("留在日历里的选择", `历史留下了${real.length}次真实选择。`, [real[0].i,real.at(-1).i], "记录");
  if (themes.length < 2 && new Set(real.map(({h})=>stageFor(h.age)[1])).size >= 2) add("走过不同的年纪", "这份记录跨过了不同的人生阶段。", [real[0].i,real.at(-1).i], "时间");
  return themes;
}
function buildLifeSummary(player) {
  if (player.alive || !player.death) throw new Error("人生尚未结束");
  const trajectory = selectSummaryMoments(player.history, 10, 2);
  const highlights = selectSummaryMoments(player.history, 4, 1);
  const recapNodes = [...new Set([trajectory[0], trajectory[Math.floor(trajectory.length/2)], trajectory.at(-1)])].filter(Boolean);
  return {
    facts: {name:player.name, birthYear:player.birthYear, deathYear:player.death.deathYear, deathAge:player.death.deathAge,
      deathReason:player.death.deathReason, finalCareer:careerLabel(player.work), careerPath:summaryCareerPath(player),
      relationship:RELATIONSHIP_LABELS[player.relationship.status], housing:HOUSING_LABELS[player.housing.status], money:player.money},
    recap: recapNodes.map(h=>`${h.age}岁，${h.text}`).join(" "),
    trajectory, themes:summaryThemes(player), highlights, traits:visibleTags(player),
    // 现有“暂缓/放下”选择没有后来仍想继续的充分证据。保守不推断遗憾，尤其不把不婚/不育/租住当遗憾。
    unfinished: [],
    closing: "这一生，有些选择出于期待，有些慢慢成为自己的决定。它们都留在了走过的日子里。",
    question: "如果重新来一次呢？"
  };
}
