// V0.2阶段4：18个中年候选，普通人生选择可以延期，不占Major名额。
// descriptionDetails只追加满足条件的文字；具体历史选择与当前状态沿用同一套条件。
EVENTS.push(
  {
    id: "mid_parenthood", title: "再谈一次，新的日常", category: "followup", eventTags: ["家庭", "选择"],
    priority: 26, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 36, maxAge: 45, states: {relationship: {status: "married"}, child: {hasChild: false}}, tagsAll: ["考虑成为父母"], tagsNone: ["主动不生育"], historyChoicesAll: [{eventId: "young_parenthood_plan", choiceId: "plan"}], historyChoicesNone: [{eventId: "young_parenthood_plan", choiceId: "no_child"}]},
    description: "以前说过‘先准备条件’，如今你们又谈起时间、开销和想要的生活。要不要成为父母，仍需要自己决定，家里的期待没有替你们填答案。",
    choices: [
      {id: "begin",text: "再次讨论后，决定迎接新的家庭成员",resultText: "这一年，孩子出生了。喜悦和睡眠不足一起到来，日子开始需要新的分工。",effects: {money: -1500,happiness: 6,stress: 7,family: 4},stateChanges: {child: {hasChild: true}},addTags: ["开始养育"],removeTags: ["考虑成为父母"],historyText: "再次讨论并决定成为父母后，这一年孩子出生了。",importance: 3,cashReason: "迎接家庭新成员的一次性准备费用"},
      {id: "pause",text: "暂时不继续，保留自己的安排",resultText: "你们撤下了这一轮计划。需要向家里解释，也留出了重新安排生活的空间。",effects: {autonomy: 5,stress: -3,family: -2},addTags: ["暂缓育儿"],removeTags: ["考虑成为父母"],historyText: "再次讨论生育准备时，我们决定暂时不继续。",importance: 3},
      {id: "no_child",text: "重新确认，我们选择不生育",resultText: "过去的考虑不是必须兑现的承诺。你们把支持和陪伴安排在另一种生活里。",effects: {autonomy: 6,happiness: 3,family: -3,stress: 2},addTags: ["主动不生育","经营自己的关系网"],removeTags: ["考虑成为父母"],historyText: "重新确认后，我们选择不生育。",importance: 3}
    ]
  },
  {
    id: "mid_work_pressure", title: "职位后面的日历", category: "random", eventTags: ["工作", "时间"],
    priority: 0, weight: 3, repeatable: true, cooldown: 3,
    conditions: {tagsNone: ["特殊职业在岗"],minAge: 36, maxAge: 59, states: {work: {status: "employed", workStyle: "high_pressure"}}},
    description: "主管想和你谈管理责任、报酬与会议安排。你看着日历，想知道经验能不能换来清楚的下班时间。",
    descriptionDetails: [
      {conditions: {tagsAll: ["团队保护离线"], historyChoicesAll: [{eventId: "mid_boundary_echo", choiceId: "wait"}]}, text: "你曾把深夜消息留到白天，这次谈排期时也需要维护那条约定。"},
      {conditions: {tagsAll: ["团队允许临时急件"], historyChoicesAll: [{eventId: "mid_boundary_echo", choiceId: "send"}]}, text: "你发出的临时请求附有补休承诺，这些承诺也占着排期的位置。"}
    ],
    choices: [
      {id: "lead",text: "继续承担管理责任，谈清资源",resultText: "你谈定了月薪9000元的岗位安排，继续承担管理责任。你需要替团队接住压力，家里的时间仍要另找。",effects: {stress: 4,family: -2,autonomy: 2},stateChanges: {work: {level: 2}},addTags: ["中年继续争取"],removeTags: ["中年调整节奏"],historyText: "中年工作中，我谈定月薪9000元的岗位安排，继续承担管理责任。",importance: 3,monthlyIncome: 9000},
      {id: "ease",text: "调整工作节奏，约定清楚的工作边界",resultText: "同事未必理解这次调整，晚上开始能提前约定。你需要在日常安排里维护商量好的边界。",effects: {stress: -6,health: 3,autonomy: 5},stateChanges: {work: {workStyle: "balanced"}},addTags: ["中年调整节奏"],removeTags: ["中年继续争取","工作随时在线","争取晋升"],historyText: "中年时，我从高压工作转向更清楚的边界。",importance: 3}
    ]
  },
  {
    id: "mid_work_balance", title: "经验不只有一个头衔", category: "random", eventTags: ["工作", "意义"],
    priority: 0, weight: 3, repeatable: true, cooldown: 3,
    conditions: {tagsNone: ["特殊职业在岗"],minAge: 36, maxAge: 59, states: {work: {status: "employed"}}, statesNone: {work: {workStyle: "high_pressure"}}},
    description: "有人问你怎么还在做具体的事。年轻同事却把难题拿来找你：他们记得的是你会做什么，不只是名片上的字。",
    descriptionDetails: [{conditions: {tagsAll: ["团队保护离线"], historyChoicesAll: [{eventId: "mid_boundary_echo", choiceId: "wait"}]}, text: "你们把提问时间尽量留在白天，边界需要在每一次具体安排里兑现。"}],
    choices: [
      {id: "expert",text: "继续做好专业工作，保留自己的时间",resultText: "收入增长得慢，经验却有了具体去处。你不必给每一年都换一个更大的头衔。",effects: {study: 3,happiness: 3,stress: 1},addTags: ["专业岗位深耕"],removeTags: [],historyText: "中年工作中，我选择继续深耕专业岗位。",importance: 2,monthlyIncome: 4800},
      {id: "try_lead",text: "试着接管理责任，再评估节奏",resultText: "管理事务进入新的排期，会议占用更多时间。你给这次工作安排留了调整的余地。",effects: {stress: 4,family: -2},stateChanges: {work: {workStyle: "high_pressure",level: 2}},addTags: ["中年继续争取"],removeTags: ["中年调整节奏"],historyText: "中年时，我尝试承担更忙的管理岗位。",importance: 3}
    ]
  },
  {
    id: "mid_restart", title: "简历上又添了一行", category: "random", eventTags: ["工作", "重启"],
    priority: 0, weight: 4, repeatable: true, cooldown: 2,
    conditions: {minAge: 36, maxAge: 59, states: {work: {status: "unemployed"}}},
    description: "你把旧经验重新写进简历。有些岗位觉得你太资深，有些又想让资深经验按新人报价。你仍然可以谈条件。",
    choices: [
      {id: "restart",text: "接受普通收入、节奏清楚的新岗位",resultText: "新的工牌没有抹去旧经验。收入重新开始，你也需要适应不同的团队。",effects: {stress: 2,happiness: 3},stateChanges: {work: {status: "employed",careerType: "general",level: 1,workStyle: "balanced"}},addTags: ["中年重新开始"],removeTags: ["求职中","争取晋升"],historyText: "中年求职时，我在普通而清楚的新岗位重新开始。",importance: 3,monthlyIncome: 3600},
      {id: "prepare",text: "继续准备技能，把预算再算一遍",resultText: "缓冲金少了一点，准备具体了一点。暂停也需要你安排时间和开销。",effects: {money: -180,study: 4,stress: 2,autonomy: 3},addTags: ["求职中"],removeTags: [],historyText: "中年求职期，我继续准备技能和生活预算。",importance: 2,cashReason: "求职培训资料"}
    ]
  },
  {
    id: "mid_parents_help", title: "现在轮到你点确认", category: "random", eventTags: ["原生家庭", "边界"],
    priority: 0, weight: 3, repeatable: true, cooldown: 3,
    conditions: {minAge: 38, maxAge: 59},
    description: "父母把手机递给你，问这个按钮能不能点。以前替你签字的人，现在认真等你的意见，顺便抱怨字怎么越做越小。",
    descriptionDetails: [{conditions: {tagsAll: ["晚辈自己决定"], historyChoicesAll: [{eventId: "mid_decision_echo", choiceId: "space"}]}, text: "对年轻人说过‘你来决定’，这次你也试着先问父母想办什么。"}],
    choices: [
      {id: "do_together",text: "一起操作，留一张能看懂的步骤纸",resultText: "花了一个晚上，也吵了两句。下次他们未必记得，但这次没有被当成不会用的人。",effects: {money: -80,family: 5,stress: 2,happiness: 2},addTags: ["陪父母学新事"],removeTags: ["照顾有边界"],historyText: "父母需要帮助时，我陪他们一起弄懂新东西。",importance: 2,cashReason: "帮家人准备操作资料与用品"},
      {id: "boundary",text: "先解决急事，约好能帮忙的时间",resultText: "事情办成了，你也留出了自己的安排。父母还有一点不习惯，你需要继续解释。",effects: {family: 2,autonomy: 5,stress: 1,money: -100},addTags: ["照顾有边界"],removeTags: ["陪父母学新事"],historyText: "照顾父母的新需求时，我约好了能帮忙的时间。",importance: 2,cashReason: "帮家人办理事情的开销"}
    ]
  },
  {
    weightModifiers: [{stats: {health: {max: 45}}, multiplier: 3, reason: "当前健康状况较低"}, {stats: {stress: {min: 60}}, multiplier: 2, reason: "当前压力较高"}],
    id: "mid_health", title: "身体也有自己的日程", category: "random", eventTags: ["健康", "自我"],
    priority: 0, weight: 3, repeatable: true, cooldown: 2,
    conditions: {minAge: 36, maxAge: 59},
    description: "以前熬一晚像借一点时间，现在还款要分几天。没有惊人的体检结论，你先发现自己需要换一把舒服的椅子。",
    choices: [
      {id: "adjust",text: "花一点钱和时间，调整睡眠与活动",resultText: "安排没有立刻改变全部生活，早晨却轻了一点。你需要从别处腾出时间。",effects: {money: -120,health: 6,stress: -3,autonomy: 2},addTags: [],removeTags: [],historyText: "发现身体节奏变化后，我调整了睡眠与活动。",importance: 2,cashReason: "睡眠与活动用品"},
      {id: "finish_first",text: "先完成眼前安排，约定之后休息",resultText: "你保住了这段日程，疲惫还在。承诺的休息仍需要真正落进日历。",effects: {health: -2,stress: 2},addTags: [],removeTags: [],historyText: "身体提醒我慢一点时，我先完成了眼前安排。",importance: 1}
    ]
  },
  {
    id: "mid_daily", title: "留给自己的一个晚上", category: "random", eventTags: ["生活", "关系网"],
    priority: 0, weight: 4, repeatable: true, cooldown: 1,
    conditions: {minAge: 36, maxAge: 59},
    description: "一个晚上空了出来。生活没有自动给它安排用途，你可以去见人，也可以把门关上，认真做一点自己的事。",
    descriptionDetails: [
      {conditions: {tagsAll: ["中年为画画留时间"], historyChoicesAll: [{eventId: "mid_interest_echo", choiceId: "practice"}]}, text: "画桌已经不只是储物的位置，颜料在等你。"},
      {conditions: {tagsAll: ["中年老友重逢"], historyChoicesAll: [{eventId: "mid_friend_echo", choiceId: "meet"}]}, text: "老朋友发来一个不催回复的邀约。"},
      {conditions: {tagsAll: ["成就有自己的尺度"], historyChoicesAll: [{eventId: "mid_comparison_echo", choiceId: "own_scale"}]}, text: "这晚没有一个可填写的名次，你仍然可以用自己的生活衡量它。"},
      {conditions: {tagsAll: ["中年仍用指标规划"], historyChoicesAll: [{eventId: "mid_comparison_echo", choiceId: "measure"}]}, text: "你保留了一个可比较的目标，也试着为目标以外的时间留位置。"},
      {conditions: {tagsAll: ["团圆可以另约"], historyChoicesAll: [{eventId: "mid_holiday_echo", choiceId: "flexible"}]}, text: "家人也开始习惯另约相聚，今晚的安排可以先说清。"},
      {conditions: {states: {relationship: {status: "married"}}}, text: "你和伴侣商量，各留一段不必交代用途的时间。"},
      {conditions: {states: {relationship: {status: "dating"}}}, text: "相伴不必变成登记，也仍需要商量今晚怎么安排。"}
    ],
    choices: [
      {id: "connect",text: "约朋友或身边的人吃一顿慢饭",resultText: "花了钱，也听见一些平时来不及说的话。自己的清静留到下一次。",effects: {money: -100,happiness: 5,family: 2,stress: -2},addTags: ["经营自己的关系网"],removeTags: [],historyText: "中年的一个空闲晚上，我把时间留给身边的人。",importance: 1,cashReason: "见面活动的开销"},
      {id: "own_time",text: "留给兴趣或休息，提前说明安排",resultText: "没有热闹的照片，时间却有了自己的用途。联系仍需要以后主动维系。",effects: {money: -50,happiness: 4,autonomy: 4,health: 2},addTags: ["给生活留时间"],removeTags: [],historyText: "中年的一个空闲晚上，我为自己安排了时间。",importance: 1,cashReason: "个人兴趣用品"}
    ]
  },
  {
    id: "mid_housing", title: "住址里的生活", category: "random", eventTags: ["居住", "预算"],
    priority: 0, weight: 2, repeatable: true, cooldown: 3,
    conditions: {minAge: 36, maxAge: 59},
    description: "预算表里，住在哪里仍然占着一行。你想让日子舒服一点，也想给将来的变化留一点余地。",
    descriptionDetails: [
      {conditions: {states: {housing: {status: "renting"}}}, text: "续租通知来了。稳定的通勤和搬走的自由，仍需要分别付费。"},
      {conditions: {states: {housing: {status: "owns_home"}}}, text: "自己的住处又有一项修理。钥匙带来安定，也没有取消账单。"},
      {conditions: {states: {housing: {status: "with_family"}}}, text: "共享住处省下一笔钱，安静和边界仍需要一家人商量。"}
    ],
    choices: [
      {id: "comfort",text: "留一点预算，改善眼前的居住",resultText: "余额小了一点，每天使用的地方舒服了一点。转向的缓冲也少了一点。",effects: {money: -200,happiness: 4,stress: -2},addTags: [],removeTags: [],historyText: "中年居住安排中，我留预算改善眼前的生活。",importance: 1,cashReason: "居住用品与小修理"},
      {id: "buffer",text: "暂缓改善，留住流动的预算",resultText: "你接受几处不方便，没有增加装修开销。住址没有替你定义成败。",effects: {autonomy: 3,happiness: -1},addTags: [],removeTags: [],historyText: "中年居住安排中，我优先保留预算缓冲。",importance: 1}
    ]
  },
  {
    id: "mid_score_echo", title: "这次，那五分在谁手里", category: "followup", eventTags: ["成绩", "代际", "回声"],
    priority: 20, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 40, maxAge: 59, childAge: {min: 8, max: 17, allowNoChild: true}, historyChoicesAny: [{eventId: "score95", choiceId: "promise"}, {eventId: "score95", choiceId: "celebrate"}]},
    description: "一张95分的试卷摆在面前，晚辈的小声解释比红色数字更醒目。这次，轮到你先开口。",
    descriptionDetails: [
      {conditions: {childAge: {min: 8, max: 17}}, text: "递来试卷的是自己的孩子。"},
      {conditions: {states: {child: {hasChild: false}}}, text: "亲戚家的孩子来问你，95分到底算不算好。"},
      {conditions: {historyChoicesAll: [{eventId: "score95", choiceId: "promise"}]}, text: "你想起八岁时自己说的‘下次一定考满分’，那句话比试卷留得更久。"},
      {conditions: {historyChoicesAll: [{eventId: "score95", choiceId: "celebrate"}]}, text: "你想起八岁时说过‘可是我已经很努力了’，当年多希望有人先听完。"},
      {conditions: {historyChoicesAll: [{eventId: "home", choiceId: "talk"}]}, text: "大学回家那次，你已经向父母说过这段记忆，这回仍需要自己决定怎么回应。"}
    ],
    choices: [
      {id: "check",text: "先一起看错题，说明下一次的目标",resultText: "目标变得清楚，对方却还是紧张。你愿意提供帮助，也接下了期待带来的压力。",effects: {study: 3,family: 3,stress: 3,autonomy: -1},addTags: ["代际继续追五分"],removeTags: ["代际先听努力"],historyText: "面对晚辈的95分，我先分析错题并提出下一次目标。",importance: 3},
      {id: "listen",text: "先听努力的过程，再商量要不要补那五分",resultText: "对方松了口气，练习计划还要慢慢谈。认可没有代替帮助，只改变了先说哪句话。",effects: {family: 4,happiness: 3,autonomy: 4,study: -1},addTags: ["代际先听努力"],removeTags: ["代际继续追五分"],historyText: "面对晚辈的95分，我先听努力的过程，再商量下一步。",importance: 3}
    ]
  },
  {
    id: "mid_interest_echo", title: "画桌不必再参加考试", category: "followup", eventTags: ["兴趣", "自我", "回声"],
    priority: 19, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 36, maxAge: 59, historyChoicesAny: [{eventId: "interest", choiceId: "math"}, {eventId: "interest", choiceId: "art"}]},
    description: "社区画室贴了周末开放的通知。这次没有考级，也没有升学加分；报名表只问你愿不愿意留出时间。",
    descriptionDetails: [
      {conditions: {historyChoicesAll: [{eventId: "interest", choiceId: "math"}]}, text: "十三岁时，你把画画的位置让给了数学。今天可以重新决定，也可以珍藏那一段喜欢。"},
      {conditions: {historyChoicesAll: [{eventId: "interest", choiceId: "art"}]}, text: "十三岁时，你争取留下了画画的时间。那次选择没有替你保管以后每一个周末。"},
      {conditions: {historyChoicesAll: [{eventId: "old_album", choiceId: "draw"}]}, text: "成年时，你曾从旧画册里重新拿起画笔，现在要为它找一个更稳定的位置。"},
      {conditions: {historyChoicesAll: [{eventId: "old_album", choiceId: "keep"}]}, text: "成年时，你把旧画册收好留念；抽屉里的喜欢没有催你交作业。"}
    ],
    choices: [
      {id: "practice",text: "留一个固定晚上，重新或继续画画",resultText: "材料花了一点钱，别的安排少了一点时间。作品可以普通，这段时间属于你。",effects: {money: -200,happiness: 7,autonomy: 5,stress: 1},addTags: ["中年为画画留时间"],removeTags: ["中年收藏兴趣"],historyText: "中年遇见画室时，我为画画留下一段固定时间。",importance: 3,cashReason: "绘画用品"},
      {id: "keep",text: "看看作品，把时间留给现在更想做的事",resultText: "你没有报名，也没有替过去判一个输赢。喜欢可以留在记忆里，今天的时间仍有别的去处。",effects: {happiness: 3,stress: -2,autonomy: 2},addTags: ["中年收藏兴趣"],removeTags: ["中年为画画留时间"],historyText: "中年重新遇见画画，我选择珍藏兴趣，把时间留给当下。",importance: 3}
    ]
  },
  {
    id: "mid_money_echo", title: "红包里不只是一笔钱", category: "followup", eventTags: ["金钱", "代际", "回声"],
    priority: 18, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 39, maxAge: 59, childAge: {min: 6, max: 17, allowNoChild: true}, historyChoicesAny: [{eventId: "red_envelope", choiceId: "entrust"}, {eventId: "red_envelope", choiceId: "budget"}]},
    description: "晚辈拿着红包，问能不能自己安排一部分。旁边有人说‘大人替你存着’，你这次也有了说话的份量。",
    descriptionDetails: [
      {conditions: {childAge: {min: 6, max: 17}}, text: "握着红包的是自己的孩子，账本要由你们一起谈。"},
      {conditions: {states: {child: {hasChild: false}}}, text: "亲戚家的孩子带来一张歪歪扭扭的购物清单，请你一起算。"},
      {conditions: {historyChoicesAll: [{eventId: "red_envelope", choiceId: "entrust"}]}, text: "小时候你把钱交给家里，曾问过它会存到哪里。"},
      {conditions: {historyChoicesAll: [{eventId: "red_envelope", choiceId: "budget"}]}, text: "小时候你商量留下三百元，那是练习自己决定的一小块地方。"},
      {conditions: {historyChoicesAll: [{eventId: "young_salary_echo", choiceId: "share"}]}, text: "第一笔工资时，你选择给家里心意、其余自己安排；现在轮到你解释钱和关心的边界。"},
      {conditions: {historyChoicesAll: [{eventId: "young_salary_echo", choiceId: "buffer"}]}, text: "第一笔工资时，你先留了自己的缓冲，如今也更能听懂‘留一点自己用’。"}
    ],
    choices: [
      {id: "hold",text: "建议大人代存，但把去向和取用约定写清",resultText: "风险少了一点，决定权仍暂时在大人手里。透明账本需要有人持续负责。",effects: {family: 4,stress: 2,autonomy: -1,money: -60},addTags: ["代管钱也说清去向"],removeTags: ["给晚辈管钱空间"],historyText: "面对晚辈的红包，我建议透明代存并约定取用。",importance: 3,cashReason: "给晚辈的红包"},
      {id: "budget",text: "留一部分由晚辈安排，陪着试着记账",resultText: "会有几笔你觉得不值得的花费，也会有第一次自己算出的余额。帮助不保证没有失误。",effects: {money: -100,family: 2,happiness: 3,autonomy: 5},addTags: ["给晚辈管钱空间"],removeTags: ["代管钱也说清去向"],historyText: "面对晚辈的红包，我支持留一部分自己安排并学习记账。",importance: 3,cashReason: "给晚辈练习安排的红包"}
    ]
  },
  {
    id: "mid_boundary_echo", title: "发送键这次在你手里", category: "followup", eventTags: ["工作", "边界", "回声"],
    priority: 17, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 36, maxAge: 59, states: {work: {status: "employed"}}, historyChoicesAny: [{eventId: "phone_request", choiceId: "accept"}, {eventId: "phone_request", choiceId: "negotiate"}]},
    description: "夜里出现一个临时需求。这次由你协调安排，年轻同事的头像就在发送栏里。熟悉的开场白差点自己打出来。",
    descriptionDetails: [
      {conditions: {historyChoicesAll: [{eventId: "phone_request", choiceId: "accept"}]}, text: "学生时代拿到旧手机时，你答应过随时回应，方便联系后来有了很多种含义。"},
      {conditions: {historyChoicesAll: [{eventId: "phone_request", choiceId: "negotiate"}]}, text: "学生时代你商量过固定报平安时间，当年争取的空白如今成了别人的晚上。"},
      {conditions: {historyChoicesAll: [{eventId: "boss_message", choiceId: "reply"}]}, text: "年轻时老板问‘睡了吗’，你曾接下临时任务，知道道谢和疲惫可以同时存在。"},
      {conditions: {historyChoicesAll: [{eventId: "boss_message", choiceId: "morning"}]}, text: "年轻时你约定明早处理过一条深夜消息，现在要承担当时老板那一端的压力。"},
      {conditions: {states: {work: {level: 2}}}, text: "你现在承担管理责任，补休和排期也需要你负责兑现。"}
    ],
    choices: [
      {id: "send",text: "说明急迫程度、能否拒绝和补休，再发出去",resultText: "需求赶上了，对方的晚上也被占用了一点。你把补偿记进排期，仍要承认自己的请求有重量。",effects: {money: 300,stress: 3,family: -2,autonomy: 2},addTags: ["团队允许临时急件"],removeTags: ["团队保护离线"],historyText: "轮到我协调深夜需求时，我发出附有拒绝与补休约定的请求。",importance: 3,cashReason: "这次临时需求的一次性项目补贴"},
      {id: "wait",text: "先谈延期或自己处理，把消息留到白天",resultText: "进度和收入有些代价，你也接住了一部分压力。年轻同事保留了一个不必猜测的晚上。",effects: {stress: 2,autonomy: 5,happiness: 3},addTags: ["团队保护离线"],removeTags: ["团队允许临时急件"],historyText: "轮到我协调深夜需求时，我把消息留到白天，承担延期代价。",importance: 3}
    ]
  },
  {
    id: "mid_comparison_echo", title: "别人家的大人", category: "followup", eventTags: ["比较", "自我", "回声"],
    priority: 16, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 40, maxAge: 59, historyChoicesAny: [{eventId: "ranking", choiceId: "chase"}, {eventId: "ranking", choiceId: "review"}, {eventId: "neighbor", choiceId: "learn"}, {eventId: "neighbor", choiceId: "mud"}]},
    description: "聚会上有人问房子多大、职位多高。你发现比较没有毕业，只是换了表格；这一次你也可以决定问别人什么。",
    descriptionDetails: [
      {conditions: {historyChoicesAll: [{eventId: "ranking", choiceId: "chase"}]}, text: "当年你抄过前面的名字，想靠近那张榜单的上面。"},
      {conditions: {historyChoicesAll: [{eventId: "ranking", choiceId: "review"}]}, text: "当年你只看错题，没有把排名抄进自己的本子。"},
      {conditions: {historyChoicesAll: [{eventId: "neighbor", choiceId: "learn"}]}, text: "小时候听到别人家的孩子会背诗，你也跟着开始背。"},
      {conditions: {historyChoicesAll: [{eventId: "neighbor", choiceId: "mud"}]}, text: "小时候你继续搭完泥巴城堡，没有把它换成别人的奖状。"},
      {conditions: {historyChoicesAll: [{eventId: "young_ranking_echo", choiceId: "compete"}]}, text: "工位上的排名后来又让你争取了一次机会。"},
      {conditions: {historyChoicesAll: [{eventId: "young_ranking_echo", choiceId: "own_scale"}]}, text: "进入工作后，你曾选择用自己的生活衡量成绩。"},
      {conditions: {childAge: {min: 12, max: 18}}, text: "自己的孩子也在桌边听着，你如何问别人，会成为一份新的示范。"}
    ],
    choices: [
      {id: "measure",text: "保留可比较的目标，但讲清数字的局限",resultText: "数字帮你规划，也带来一点紧张。你得提醒自己别让一张表替别人解释全部生活。",effects: {study: 2,stress: 3,autonomy: -1},addTags: ["中年仍用指标规划"],removeTags: ["成就有自己的尺度"],historyText: "面对中年比较，我保留指标目标，同时说明它的局限。",importance: 3},
      {id: "own_scale",text: "问问彼此近来怎样，保留自己的目标",resultText: "聊天没有结出名次，也听见几段数字外的日子。你仍要自己判断下一步做什么。",effects: {money: -100,happiness: 4,autonomy: 5,family: 2},addTags: ["成就有自己的尺度"],removeTags: ["中年仍用指标规划"],historyText: "面对中年比较，我把话题转向生活，并保留自己的尺度。",importance: 3,cashReason: "相聚茶点开销"}
    ]
  },
  {
    id: "mid_table_echo", title: "你坐到了提问的那一边", category: "followup", eventTags: ["饭桌", "家庭", "回声"],
    priority: 15, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 38, maxAge: 59, historyChoicesAny: [{eventId: "relatives_child", choiceId: "perform"}, {eventId: "relatives_child", choiceId: "ask_back"}]},
    description: "饭桌上，晚辈夹菜的手停了停。你如今有了提问题的资格，也忽然认出了等待标准答案的那种安静。",
    descriptionDetails: [
      {conditions: {historyChoicesAll: [{eventId: "relatives_child", choiceId: "perform"}]}, text: "小时候你挑过让大家高兴的答案，一顿饭因此过得顺利，也藏下了一点自己。"},
      {conditions: {historyChoicesAll: [{eventId: "relatives_child", choiceId: "ask_back"}]}, text: "小时候你问过大人曾经想做什么，饭桌短暂地换了方向。"},
      {conditions: {historyChoicesAll: [{eventId: "relatives_adult", choiceId: "explain"}]}, text: "成年后的问答里，你曾讲过真实计划，也听了家人的担心。"},
      {conditions: {historyChoicesAll: [{eventId: "relatives_adult", choiceId: "redirect"}]}, text: "成年后的问答里，你曾把话题转回亲戚的近况，为自己保留一点隐私。"}
    ],
    choices: [
      {id: "ask",text: "问下一步的打算，也说明可以不回答",resultText: "你表达了关心，对方仍可能觉得被盯着。允许不回答，需要你接受真的没有答案。",effects: {family: 4,stress: 2,autonomy: -1},addTags: ["饭桌仍问规划"],removeTags: ["饭桌保留隐私"],historyText: "成为饭桌上的成年人后，我询问计划，同时允许不回答。",importance: 3},
      {id: "privacy",text: "先聊这道菜，把重要问题留给私下",resultText: "热闹继续了，想帮忙的心暂时没有落点。你需要另找一个对方愿意谈的时机。",effects: {family: 2,happiness: 3,autonomy: 4,study: -1},addTags: ["饭桌保留隐私"],removeTags: ["饭桌仍问规划"],historyText: "成为饭桌上的成年人后，我保留晚辈的隐私，把重要问题留给私下。",importance: 3}
    ]
  },
  {
    id: "mid_decision_echo", title: "经验是不是投票权", category: "followup", eventTags: ["选择", "代际", "回声"],
    priority: 14, weight: 1, repeatable: true, cooldown: 8,
    conditions: {minAge: 38, maxAge: 59, historyChoicesAny: [{eventId: "first_plan", choiceId: "pen"}, {eventId: "first_plan", choiceId: "toy"}, {eventId: "major", choiceId: "safe"}, {eventId: "major", choiceId: "like"}]},
    description: "一个晚辈想走不太稳妥的方向。家里说你见过世面，应该替对方把关；经验这次站在了选择的另一边。",
    descriptionDetails: [
      {conditions: {historyChoicesAll: [{eventId: "first_plan", choiceId: "pen"}]}, text: "抓周照片里你抓着笔，大人后来把那一刻解释成了人生方向。"},
      {conditions: {historyChoicesAll: [{eventId: "first_plan", choiceId: "toy"}]}, text: "抓周照片里你抱着玩具，大人当年也试着为它找一个未来的名字。"},
      {conditions: {historyChoicesAll: [{eventId: "major", choiceId: "safe"}]}, text: "选专业时，你曾接受家人推荐的稳妥安排，知道建议也有让人安心的一面。"},
      {conditions: {historyChoicesAll: [{eventId: "major", choiceId: "like"}]}, text: "选专业时，你曾选自己的兴趣，也承担了选择之后的不确定。"},
      {conditions: {historyChoicesAll: [{eventId: "young_decision_echo", choiceId: "own_plan"}]}, text: "青年时期谈居住时，你也曾坚持自己定下一步。"},
      {conditions: {historyChoicesAll: [{eventId: "young_decision_echo", choiceId: "joint_plan"}]}, text: "青年时期谈居住时，你接受过帮助，也试着说清边界。"},
      {conditions: {childAge: {min: 18, max: 22}}, text: "这次认真谈方向的，是已经长大的自己的孩子。"}
    ],
    choices: [
      {id: "guide",text: "给出稳妥方案，也说明建议的边界",resultText: "你提供了能用的经验，也承担了可能影响选择的重量。最后仍需要听见对方的意愿。",effects: {money: -100,family: 4,study: 3,autonomy: -1},addTags: ["给晚辈稳妥建议"],removeTags: ["晚辈自己决定"],historyText: "晚辈谈人生方向时，我提供稳妥方案并说明建议的边界。",importance: 3,cashReason: "帮助晚辈准备资料"},
      {id: "space",text: "一起算代价，把决定留给对方",resultText: "你付出了一点支持，也留下不能替人避开的风险。关心不再保证事情按你的方案走。",effects: {money: -200,family: -1,stress: 2,autonomy: 5},addTags: ["晚辈自己决定"],removeTags: ["给晚辈稳妥建议"],historyText: "晚辈谈人生方向时，我帮助比较代价，把决定留给对方。",importance: 3,cashReason: "支持晚辈尝试的材料"}
    ]
  },
  {
    id: "mid_friend_echo", title: "老朋友，也有新的近况", category: "followup", eventTags: ["朋友", "成长", "回声"],
    priority: 13, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 37, maxAge: 59, historyChoicesAny: [{eventId: "best_friend", choiceId: "keep"}, {eventId: "best_friend", choiceId: "goodbye"}]},
    description: "一张旧合照在群里出现，老朋友发来近况。你们仍然认得以前的彼此，也需要重新认识现在的日子。",
    descriptionDetails: [
      {conditions: {historyChoicesAll: [{eventId: "best_friend", choiceId: "keep"}]}, text: "当年你约定每月联系，约定是真实的，后来每段忙碌也各有重量。"},
      {conditions: {historyChoicesAll: [{eventId: "best_friend", choiceId: "goodbye"}]}, text: "当年你认真告别，没有许下固定约定；这次相遇也不必用亏欠开场。"}
    ],
    choices: [
      {id: "meet",text: "安排一次见面，少聊成败多听近况",resultText: "时间和路费花掉了，你听见了合照之后的故事。亲近仍要从现在开始。",effects: {money: -120,happiness: 7,autonomy: 2,stress: 1},addTags: ["中年老友重逢"],removeTags: ["中年各自珍重"],historyText: "中年收到老朋友近况，我安排了一次重新认识彼此的见面。",importance: 3,cashReason: "与朋友见面的路费"},
      {id: "message",text: "认真聊几句，不急着约定下一次",resultText: "没有立刻见面，也没有把关系判为失去。你们留下了一个可以再开口的位置。",effects: {happiness: 3,autonomy: 4,stress: -1},addTags: ["中年各自珍重"],removeTags: ["中年老友重逢"],historyText: "中年收到老朋友近况，我认真回应，但没有强留固定约定。",importance: 3}
    ]
  },
  {
    id: "mid_holiday_echo", title: "今年由你发团圆通知", category: "followup", eventTags: ["春节", "家庭", "回声"],
    priority: 12, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 42, maxAge: 59, historyChoicesAny: [{eventId: "young_holiday", choiceId: "home"}, {eventId: "young_holiday", choiceId: "stay"}, {eventId: "spring_home", choiceId: "gift"}, {eventId: "spring_home", choiceId: "cook"}]},
    description: "父母问你今年怎么安排，年轻亲人也等着消息。你从回答‘回不回’的人，慢慢变成了组织相聚的人。",
    descriptionDetails: [
      {conditions: {historyChoicesAll: [{eventId: "young_holiday", choiceId: "home"}]}, text: "青年时期，你曾花路费回去几天，知道一顿慢饭有它的份量。"},
      {conditions: {historyChoicesAll: [{eventId: "young_holiday", choiceId: "stay"}]}, text: "青年时期，你曾留下过节、另约联系，如今也知道有些不回来并不是不在乎。"},
      {conditions: {historyChoicesAll: [{eventId: "spring_home", choiceId: "gift"}]}, text: "第一份工作后的春节，你曾挑一份像样的礼物，让家里放心。"},
      {conditions: {historyChoicesAll: [{eventId: "spring_home", choiceId: "cook"}]}, text: "第一份工作后的春节，你曾说明预算，和父母一起做饭。"}
    ],
    choices: [
      {id: "gather",text: "认真安排一顿饭，邀请但不强求",resultText: "准备费了钱和时间，桌边的人各带着近况。空出的座位留给下一次，没有被写成一道欠条。",effects: {money: -250,family: 5,happiness: 3,stress: 2},addTags: ["团圆有邀请无欠条"],removeTags: ["团圆可以另约"],historyText: "轮到我组织春节时，我认真邀请家人，也接受各自的安排。",importance: 3,cashReason: "聚餐与团圆准备"},
      {id: "flexible",text: "分几次见面，让各自安排都有位置",resultText: "少了同一天的热闹，多了几段需要主动维系的相处。你把关心从一张日期里拆开。",effects: {money: -100,family: 2,autonomy: 4,stress: -2},addTags: ["团圆可以另约"],removeTags: ["团圆有邀请无欠条"],historyText: "轮到我组织春节时，我和家人分开约时间相聚。",importance: 3,cashReason: "分次相聚开销"}
    ]
  },
  {
    id: "mid_response", title: "说出口的话，后来又听见", category: "conditional", eventTags: ["代际", "关系", "后续"],
    priority: 8, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 38, maxAge: 59, historyChoicesAny: [{eventId: "mid_score_echo", choiceId: "check"}, {eventId: "mid_score_echo", choiceId: "listen"}, {eventId: "mid_money_echo", choiceId: "hold"}, {eventId: "mid_money_echo", choiceId: "budget"}, {eventId: "mid_table_echo", choiceId: "ask"}, {eventId: "mid_table_echo", choiceId: "privacy"}, {eventId: "mid_decision_echo", choiceId: "guide"}, {eventId: "mid_decision_echo", choiceId: "space"}]},
    description: "一次家庭聊天里，有人提起你以前说过的话。你的经验和期待没有在说出口后消失，现在有机会听听它落到别人身上是什么样。",
    descriptionDetails: [
      {conditions: {tagsAll: ["代际继续追五分"], historyChoicesAll: [{eventId: "mid_score_echo", choiceId: "check"}]}, text: "你提出的下一次目标被记住了，也有人问能不能先说说累在哪里。"},
      {conditions: {tagsAll: ["代际先听努力"], historyChoicesAll: [{eventId: "mid_score_echo", choiceId: "listen"}]}, text: "你先听过程的那次，让晚辈愿意再开口；接下来仍需要具体的帮助。"},
      {conditions: {tagsAll: ["代管钱也说清去向"], historyChoicesAll: [{eventId: "mid_money_echo", choiceId: "hold"}]}, text: "写下的代存约定到了需要兑现的时候。"},
      {conditions: {tagsAll: ["给晚辈管钱空间"], historyChoicesAll: [{eventId: "mid_money_echo", choiceId: "budget"}]}, text: "第一次自己记账有了几笔失误，也有几笔认真算过的余额。"},
      {conditions: {tagsAll: ["饭桌仍问规划"], historyChoicesAll: [{eventId: "mid_table_echo", choiceId: "ask"}]}, text: "有人感谢你问起计划，也有人认真用了你说过的‘可以不回答’。"},
      {conditions: {tagsAll: ["饭桌保留隐私"], historyChoicesAll: [{eventId: "mid_table_echo", choiceId: "privacy"}]}, text: "把问题留到私下后，晚辈愿意找一个更安静的时候再谈。"},
      {conditions: {tagsAll: ["晚辈自己决定"], historyChoicesAll: [{eventId: "mid_decision_echo", choiceId: "space"}]}, text: "你留出的决定权没有保证结果顺利，对方却知道可以带着问题回来。"},
      {conditions: {tagsAll: ["给晚辈稳妥建议"], historyChoicesAll: [{eventId: "mid_decision_echo", choiceId: "guide"}]}, text: "你提供的稳妥方案被认真考虑，也有人想保留一点不同意见。"}
    ],
    choices: [
      {id: "review",text: "听完反馈，把约定重新谈一遍",resultText: "谈话多花了时间，方案也不再完全像你最初想的那样。你们有了一份更具体的约定。",effects: {family: 4,autonomy: 4,stress: 2,money: -80},addTags: ["代际约定可以重谈"],removeTags: [],historyText: "听到晚辈对我的安排的反馈后，我重新协商了约定。",importance: 3,cashReason: "重新商量的活动开销"},
      {id: "keep",text: "说明原安排的理由，先兑现自己的部分",resultText: "边界清楚了，分歧没有立刻消失。你开始把当初说过的支持变成具体行动。",effects: {family: 3,stress: 1,money: -120,study: 2},addTags: ["代际约定重在兑现"],removeTags: [],historyText: "听到晚辈的反馈后，我说明安排的理由，并先兑现支持。",importance: 3,cashReason: "兑现约定的支持费用"}
    ]
  }
);
