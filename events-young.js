// V0.2 阶段3：22～35岁的候选事件。状态、标签和历史条件沿用现有引擎。
// 人生中的重大事件 ≠ isMajorNode:true。普通职业、住房、关系和生育意愿讨论可以延期。
EVENTS.push(
  {
    id: "young_direction", title: "毕业后的方向", category: "conditional", eventTags: ["工作", "自我"],
    priority: 20, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 22, maxAge: 24, states: {work: {status: "not_working"}}},
    description: "群里有人晒录用通知，有人还在改简历。父母问你接下来怎么安排，问完补了一句：我们也不懂现在的行情。",
    choices: [
      {id: "apply", text: "先找一份正式工作，再慢慢调整", resultText: "你把简历发了出去。方向还没完全想好，日程已经开始排了。", effects: {study: 3, stress: 4, autonomy: 2}, addTags: ["先进入职场"], removeTags: [], historyText: "毕业后，我决定先进入职场再寻找方向。", importance: 3},
      {id: "pause", text: "说明预算，留一点时间再找", resultText: "家里给了一段缓冲期，你也答应认真记录开销。空白不是免费，也不是失败。", effects: {money: -300, stress: -5, family: -2, autonomy: 6}, stateChanges: {work: {status: "unemployed"}}, addTags: ["求职中", "暂缓进入职场"], removeTags: [], historyText: "毕业后，我选择短暂缓冲，再开始求职。", importance: 3}
    ]
  },
  {
    id: "young_fast_track", title: "被看见的代价", category: "followup", eventTags: ["工作", "机会"],
    priority: 24, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 25, maxAge: 29, states: {work: {status: "employed", workStyle: "high_pressure"}}, historyEventIds: ["first_job"]},
    description: "主管想让你带一个急项目：钱多一些，晚上的消息也多一些。他说自己当年就是这么过来的，眼底的疲惫不像奖章。",
    choices: [
      {id: "take", text: "接下来，争取下一次机会", resultText: "奖金到账了，日历的空白被填掉。晋升讨论开始出现你的名字。", effects: {money: 5000, stress: 9, health: -4}, addTags: ["争取晋升"], removeTags: ["暂缓晋升"], historyText: "高压工作里，我接下急项目，争取晋升机会。", importance: 3},
      {id: "step_back", text: "换到节奏清晰的任务，少拿一些钱", resultText: "奖金缩水了，下班时间却变得可以约人。你还需要适应不被随时叫到的安静。", effects: {money: -500, stress: -7, happiness: 4, autonomy: 6}, stateChanges: {work: {workStyle: "balanced"}}, addTags: ["暂缓晋升", "工作边界起步"], removeTags: ["争取晋升", "工作随时在线"], historyText: "面对急项目，我选择换到节奏清晰的工作。", importance: 3}
    ]
  },
  {
    id: "young_free_evening", title: "下班后，时间是谁的", category: "random", eventTags: ["兴趣", "日常"],
    priority: 4, weight: 2, repeatable: true, cooldown: 2,
    conditions: {minAge: 24, maxAge: 35, states: {work: {status: "employed", workStyle: "balanced"}}},
    description: "按时下班的晚上，手机没响。你可以去见人、画两笔，也可以接一点额外工作。空出的时间并不会自动知道该去哪里。",
    choices: [
      {id: "keep_time", text: "把时间留给兴趣和身边的人", resultText: "没有额外收入，你却有一晚不需要向工作交代的生活。", effects: {money: -100, happiness: 6, health: 2, stress: -4}, addTags: ["给生活留时间"], removeTags: [], historyText: "一个按时下班的晚上，我把时间留给自己的生活。", importance: 2},
      {id: "extra", text: "试着接更忙的岗位，多挣一点", resultText: "报酬多了一点，清静也有了新的标价。你决定先试，再看要不要继续。", effects: {money: 2500, stress: 6, health: -2}, stateChanges: {work: {workStyle: "high_pressure"}}, addTags: ["争取晋升"], removeTags: ["暂缓晋升"], historyText: "我选择接下更忙的岗位，暂时换取更多收入。", importance: 3}
    ]
  },
  {
    id: "young_promotion", title: "晋升谈话", category: "followup", eventTags: ["工作", "选择"],
    priority: 30, weight: 1, repeatable: false, cooldown: 0,
    // 不限于第一份工作：重新就业后，也可通过换岗位或争取机会进入后续。
    conditions: {minAge: 27, maxAge: 35, tagsAll: ["争取晋升"], states: {work: {status: "employed", level: 1}}, historyChoicesAny: [
      {eventId: "young_fast_track", choiceId: "take"}, {eventId: "young_free_evening", choiceId: "extra"},
      {eventId: "young_job_change", choiceId: "higher_pay"}, {eventId: "young_burnout", choiceId: "push"},
      {eventId: "young_ranking_echo", choiceId: "compete"}
    ]},
    description: "新头衔意味着带人，也意味着替别人解释延期。主管说‘你可以考虑’，这次你认真考虑了头衔后面的日子。",
    choices: [
      {id: "accept", text: "接受岗位，试着学会带人", resultText: "收入和责任一起增长。你开始拥有一点决定权，也开始接住别人的压力。", effects: {money: 3000, stress: 7, autonomy: 3}, stateChanges: {work: {level: 2}}, addTags: ["带团队起步"], removeTags: ["争取晋升"], historyText: "晋升谈话中，我接受了带团队的岗位。", importance: 3},
      {id: "decline", text: "留在专业岗位，调整工作节奏", resultText: "你错过了这一轮加薪。时间空了下来，同事却不一定理解你的取舍。", effects: {happiness: 4, stress: -5, money: -300, autonomy: 6}, stateChanges: {work: {workStyle: "balanced"}}, addTags: ["暂缓晋升"], removeTags: ["争取晋升", "工作随时在线"], historyText: "晋升谈话中，我留在专业岗位，调整了节奏。", importance: 3}
    ]
  },
  {
    id: "young_job_change", title: "换一条通勤路", category: "conditional", eventTags: ["工作", "转向"],
    priority: 8, weight: 2, repeatable: true, cooldown: 4,
    conditions: {minAge: 29, maxAge: 35, states: {work: {status: "employed"}}},
    description: "你收到两个方向不同的机会：待遇更高但节奏更紧，或者普通收入加清楚的下班时间。原公司也说愿意再谈谈。",
    choices: [
      {id: "higher_pay", text: "换到收入更高的岗位", resultText: "你重新做了一遍自我介绍，也重新排了晚上的时间。", effects: {money: 3500, stress: 6, health: -2}, stateChanges: {work: {careerType: "general", workStyle: "high_pressure"}}, addTags: ["争取晋升"], removeTags: ["暂缓晋升", "给生活留时间"], historyText: "我换到收入更高、节奏更紧的岗位。", importance: 3},
      {id: "clear_hours", text: "选择边界清楚的工作", resultText: "收入少了一点，约好的晚饭不再总被取消。你得把预算重新算一遍。", effects: {money: -400, stress: -6, autonomy: 6, happiness: 3}, stateChanges: {work: {careerType: "general", workStyle: "balanced"}}, addTags: ["工作边界起步", "暂缓晋升"], removeTags: ["争取晋升", "工作随时在线"], historyText: "工作调整时，我选择了边界清楚的岗位。", importance: 3}
    ]
  },
  {
    id: "young_burnout", title: "醒来已经很累", category: "conditional", eventTags: ["工作", "健康"],
    priority: 12, weight: 2, repeatable: true, cooldown: 3,
    conditions: {minAge: 28, maxAge: 35, states: {work: {status: "employed", workStyle: "high_pressure"}}, stats: {stress: {min: 35}}},
    description: "闹钟还没响，你已经在脑子里开会了。体检单暂时没写严重的问题，身体却好像一直在提交延期申请。",
    choices: [
      {id: "push", text: "完成这一轮，再争取资源", resultText: "你得到一笔报酬，疲惫没有一起结清。下一轮谈岗位时，你想把这次算进去。", effects: {money: 2000, health: -5, stress: 5}, addTags: ["争取晋升"], removeTags: [], historyText: "疲惫时，我决定先完成这一轮工作。", importance: 2},
      {id: "change", text: "申请换到更可持续的节奏", resultText: "收入和评价都有不确定，早晨却终于不再像加班的延长线。", effects: {money: -500, health: 4, stress: -10, autonomy: 5}, stateChanges: {work: {workStyle: "balanced"}}, addTags: ["工作边界起步", "暂缓晋升"], removeTags: ["争取晋升", "工作随时在线"], historyText: "倦怠出现后，我选择调整工作节奏。", importance: 3}
    ]
  },
  {
    id: "young_career_crisis", title: "会议室里的调整名单", category: "random", eventTags: ["工作", "危机"],
    priority: 0, weight: 0.08, repeatable: false, cooldown: 0,
    conditions: {minAge: 30, maxAge: 35, states: {work: {status: "employed"}}},
    description: "业务要缩减，名单里有你。负责人念完补偿安排，低头找不到下一句。表现并没有替所有人挡住这次变化。",
    choices: [
      {id: "leave", text: "接受补偿，先离开再找", resultText: "账户有了一点缓冲，日历突然空了。你需要重新安排没有上班的早晨。", effects: {money: 2500, stress: 7, happiness: -3}, stateChanges: {work: {status: "unemployed"}}, addTags: ["求职中"], removeTags: ["争取晋升", "工作随时在线"], historyText: "职业调整中，我接受补偿离开，重新求职。", importance: 3},
      {id: "transfer", text: "接受普通收入的内部调岗", resultText: "工作保住了，熟悉的团队散了。你要学新东西，也能早点回家。", effects: {money: -700, study: 3, stress: 3, autonomy: 2}, stateChanges: {work: {workStyle: "balanced", level: 1}}, addTags: ["暂缓晋升"], removeTags: ["争取晋升"], historyText: "职业调整中，我接受了普通收入的内部调岗。", importance: 3}
    ]
  },
  {
    id: "young_job_search", title: "没有工牌的早晨", category: "random", eventTags: ["工作", "重启"],
    priority: 0, weight: 6, repeatable: true, cooldown: 1,
    conditions: {minAge: 23, maxAge: 35, states: {work: {status: "unemployed"}}},
    description: "早餐后不必赶车，你还是打开了招聘页。家里问要不要先回来住一阵，你听见的是关心，也有一点难以解释的压力。",
    choices: [
      {id: "restart", text: "接受一份普通但节奏清楚的工作", resultText: "收入重新开始，起点未必和从前一样。你决定先把日子接起来。", effects: {money: 1800, stress: -4, happiness: 3}, stateChanges: {work: {status: "employed", careerType: "general", level: 1, workStyle: "balanced"}}, addTags: ["工作边界起步"], removeTags: ["求职中", "暂缓进入职场", "争取晋升"], historyText: "求职期，我接受了节奏清楚的普通工作。", importance: 3},
      {id: "wait", text: "再留一点时间，更新简历和技能", resultText: "存款少了些，你补上了简历里不敢写的空白。等待也需要安排，不是无限暂停。", effects: {money: -250, study: 5, stress: 3, autonomy: 3}, addTags: ["求职中"], removeTags: [], historyText: "没有工作的一段时间，我继续准备下一次求职。", importance: 2}
    ]
  },
  {
    id: "young_meet", title: "要不要多见一次", category: "random", eventTags: ["亲密关系", "相遇"],
    priority: 0, weight: 5, repeatable: true, cooldown: 4,
    conditions: {minAge: 24, maxAge: 32, states: {relationship: {status: "single"}}, tagsNone: ["选择单身"]},
    description: "一次聚会后，有人问你下周要不要一起吃饭。你很想见对方，也知道关系会占用时间，不只占用一个周末。",
    choices: [
      {id: "date", text: "认真开始了解彼此", resultText: "你们决定试着交往。生活多了一个可以分享的人，也多了需要协商的安排。", effects: {happiness: 7, money: -150, stress: 3}, stateChanges: {relationship: {status: "dating"}}, addTags: [], removeTags: ["选择单身", "关系已结束", "愿意谈未来"], historyText: "我决定开始一段恋爱关系。", importance: 3},
      {id: "single", text: "说明心意，暂时保留单身生活", resultText: "你没有开始关系，也没有贬低这次相遇。一个人安排生活的空间和孤单都留下了。", effects: {autonomy: 6, happiness: -2, stress: -3}, addTags: ["选择单身"], removeTags: [], historyText: "一次相遇后，我选择暂时保留单身生活。", importance: 3}
    ]
  },
  {
    id: "young_values", title: "两个人的日历", category: "conditional", eventTags: ["亲密关系", "协商"],
    priority: 11, weight: 2, repeatable: true, cooldown: 3,
    conditions: {minAge: 26, maxAge: 35, states: {relationship: {status: "dating"}}},
    description: "一个想多攒钱，一个想留些时间。你们摊开日历，不是为了证明谁更成熟，而是看看能不能把日子放在同一页。",
    choices: [
      {id: "align", text: "各退一点，认真谈下一步", resultText: "方案不像任何一方最初想的那样。你们愿意继续，也准备讨论关系的形式。", effects: {happiness: 4, autonomy: -2, stress: 2}, addTags: ["愿意谈未来"], removeTags: [], historyText: "恋爱中，我们协商了不同的生活期待。", importance: 3},
      {id: "breakup", text: "承认现在走向不同，好好分开", resultText: "你们没有把对方写成坏人。新的自由里，有一段需要慢慢消化的失落。", effects: {happiness: -7, stress: -4, autonomy: 6}, stateChanges: {relationship: {status: "single"}}, addTags: ["关系已结束", "选择单身"], removeTags: ["愿意谈未来", "不登记的伴侣"], historyText: "发现生活期待不同后，我们决定分手。", importance: 3},
      {id: "register", text: "双方愿意登记，这次开始办手续", resultText: "你们可以改变过去的安排。证件带来新的形式，日常仍然需要两个人继续谈。", effects: {money: -1200, family: 3, happiness: 4, stress: 3}, stateChanges: {relationship: {status: "married"}}, addTags: ["已讨论婚姻"], removeTags: ["主动不婚", "不登记的伴侣", "愿意谈未来"], historyText: "重新讨论生活安排时，我们选择登记结婚。", importance: 3}
    ]
  },
  {
    id: "young_commitment", title: "我们要结婚吗？", category: "followup", eventTags: ["亲密关系", "选择"],
    priority: 25, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 27, maxAge: 35, states: {relationship: {status: "dating"}}, tagsAll: ["愿意谈未来"], tagsNone: ["主动不婚"], historyChoicesAll: [{eventId: "young_values", choiceId: "align"}]},
    description: "你们谈到登记。家里有人高兴，有人担心开销；你们想知道，一张证件会改变什么，又不会替你们解决什么。",
    choices: [
      {id: "marry", text: "登记，把承诺变成新的安排", resultText: "关系有了新的形式。办手续并不替你们分配家务，只是开始另一段协商。", effects: {money: -1200, family: 4, happiness: 5, stress: 3}, stateChanges: {relationship: {status: "married"}}, addTags: ["已讨论婚姻"], removeTags: ["主动不婚", "不登记的伴侣"], historyText: "谈过未来之后，我们选择登记结婚。", importance: 3},
      {id: "partner", text: "继续相伴，选择不登记", resultText: "你们保留这种关系，也要多解释几次。没有婚礼，不等于没有承诺。", effects: {autonomy: 6, happiness: 4, family: -3, stress: 3}, addTags: ["主动不婚", "不登记的伴侣", "已讨论婚姻"], removeTags: [], historyText: "我们选择继续相伴，但不登记结婚。", importance: 3},
      {id: "independent", text: "承认想要的不同，选择独自生活", resultText: "决定并不轻松。你没有拿一场婚礼替代分歧，双方也失去了一段熟悉的陪伴。", effects: {autonomy: 7, happiness: -6, family: -2, stress: -2}, stateChanges: {relationship: {status: "single"}}, addTags: ["主动不婚", "选择单身", "已讨论婚姻", "关系已结束"], removeTags: ["愿意谈未来", "不登记的伴侣"], historyText: "婚姻讨论中，我们决定分开，我选择独自生活。", importance: 3}
    ]
  },
  {
    id: "young_single_life", title: "一个人的生活，也要安排", category: "random", eventTags: ["自我", "朋友"],
    priority: 3, weight: 2, repeatable: true, cooldown: 2,
    conditions: {minAge: 25, maxAge: 35, states: {relationship: {status: "single"}}},
    description: "周末没有默认陪伴，你也不想把所有朋友都变成候选对象。一个人住在关系网里，和一个人扛完所有事并不一样。",
    choices: [
      {id: "own_circle", text: "经营朋友和自己的兴趣，保留单身", resultText: "有些夜晚仍然安静，但需要帮忙时你开始知道可以找谁。", effects: {money: -80, happiness: 5, stress: -3, autonomy: 3}, addTags: ["选择单身", "经营自己的关系网"], removeTags: [], historyText: "单身生活中，我把时间留给朋友和自己的兴趣。", importance: 2},
      {id: "open", text: "愿意认识新人，重新开放可能", resultText: "不保证会遇到谁。你只是给未来留了一扇门，也留一点可能失望的空间。", effects: {money: -100, happiness: 3, stress: 2}, addTags: [], removeTags: ["选择单身"], historyText: "单身生活中，我决定重新开放认识新人的可能。", importance: 2}
    ]
  },
  {
    id: "young_married_daily", title: "婚后的普通星期三", category: "random", eventTags: ["亲密关系", "日常"],
    priority: 3, weight: 2, repeatable: true, cooldown: 2,
    conditions: {minAge: 28, maxAge: 35, states: {relationship: {status: "married"}}},
    description: "两个人都累，水槽里还有碗。登记那天没写清这些小事，你们只好在一个普通星期三补上。",
    choices: [
      {id: "share", text: "一起重排家务和各自的时间", resultText: "谈得有点累，安排却具体了。陪伴不再只靠谁默默多做一点。", effects: {family: 4, happiness: 3, stress: 2, autonomy: 2}, addTags: ["协商共同生活"], removeTags: [], historyText: "婚后的一个星期三，我们重新商量了家务与时间。", importance: 2},
      {id: "outsource", text: "花一点钱，给两个人留一晚休息", resultText: "开销多了，争执暂时少了。你们知道明天仍要谈，今晚先喘口气。", effects: {money: -200, happiness: 5, stress: -4}, addTags: [], removeTags: [], historyText: "婚后疲惫的一晚，我们花钱换了一点共同休息。", importance: 1}
    ]
  },
  {
    id: "young_move_out", title: "要不要搬出去", category: "conditional", eventTags: ["居住", "独立"],
    priority: 15, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 24, maxAge: 35, states: {housing: {status: "with_family"}}},
    description: "家里问你几点回来，网上问你押几付几。妈妈说住家里能省钱，又帮你把看房要问的事写在纸上。",
    choices: [
      {id: "rent", text: "搬出去，自己安排日常", resultText: "你拿到钥匙，也拿到几笔新账单。报平安从被追问变成需要主动记得的事。", effects: {money: -800, autonomy: 8, happiness: 4, stress: 4}, stateChanges: {housing: {status: "renting"}}, addTags: ["第一次独立住"], removeTags: ["在家留缓冲"], historyText: "我决定搬出去租住，开始自己安排日常。", importance: 3},
      {id: "stay", text: "先留在家里，商量相处边界", resultText: "钱省下一点，空间仍要共享。你们试着把‘都是为你好’说成具体的约定。", effects: {money: 700, family: 3, autonomy: 3, stress: 2}, addTags: ["在家留缓冲"], removeTags: [], historyText: "我暂时与家人同住，并商量了相处边界。", importance: 3}
    ]
  },
  {
    id: "young_rent", title: "房租与生活半径", category: "random", eventTags: ["居住", "金钱"],
    priority: 6, weight: 2, repeatable: true, cooldown: 2,
    conditions: {minAge: 25, maxAge: 35, states: {housing: {status: "renting"}}},
    description: "租约又要续了。离工作近一点，房间就小一点；搬远一点，早晨就少一点。地图上的距离最后都落进生活里。",
    choices: [
      {id: "renew", text: "继续租近一点，把时间留住", resultText: "余额少了些，晚饭可以慢慢吃。你接受这是目前的安排，不急着给它盖终身的章。", effects: {money: -300, happiness: 4, stress: -2}, addTags: ["租住也有生活"], removeTags: [], historyText: "续租时，我选择保留较短通勤和自己的时间。", importance: 2},
      {id: "move_far", text: "换便宜一点的住处，留出缓冲", resultText: "搬家累了几天，预算松了一点。你开始在车上听完一整集节目。", effects: {money: 400, health: -2, stress: 3, autonomy: 3}, addTags: ["住房预算优先"], removeTags: [], historyText: "租房时，我换了更便宜的住处，留出预算缓冲。", importance: 2},
      {id: "reconsider", text: "继续租住，重新开放住房讨论", resultText: "你没有立刻买房。先前的决定可以重新考虑，只是现在仍要支付租金。", effects: {money: -150, stress: 2, autonomy: 3}, addTags: [], removeTags: ["已讨论住房"], historyText: "租房生活中，我重新开放了住房安排的讨论。", importance: 2}
    ]
  },
  {
    id: "young_housing_choice", title: "一处住址，几种未来", category: "conditional", eventTags: ["居住", "选择"],
    priority: 14, weight: 1, repeatable: true, cooldown: 3,
    conditions: {minAge: 29, maxAge: 35, statesNone: {housing: {status: "owns_home"}}, tagsNone: ["已讨论住房"], stats: {money: {min: 4000}}},
    description: "积蓄加上家里愿意提供的支持，可以凑一个小住处。你们谈到稳定，也谈到以后换城市时那把钥匙有多重。",
    choices: [
      {id: "buy", text: "买下小住处，接受新的牵挂", resultText: "住址稳定了，可支配的钱少了。房子没有替你完成关系和工作里的难题。", effects: {money: -4000, stress: 5, family: 4, autonomy: -2}, stateChanges: {housing: {status: "owns_home"}}, addTags: ["已讨论住房"], removeTags: ["租住也有生活", "在家留缓冲"], historyText: "讨论居住安排时，我决定买下一个小住处。", importance: 3},
      {id: "keep_renting", text: "继续租住，把资金留给别的可能", resultText: "你还要续租和可能搬家，也保留了更换方向的余地。家里未必立刻理解。", effects: {money: -200, autonomy: 7, family: -2, stress: 2}, stateChanges: {housing: {status: "renting"}}, addTags: ["已讨论住房", "租住也有生活"], removeTags: ["在家留缓冲"], historyText: "讨论居住安排时，我选择继续租住，保留资金和转向空间。", importance: 3}
    ]
  },
  {
    id: "young_home_care", title: "钥匙之后的修理清单", category: "random", eventTags: ["居住", "日常"],
    priority: 6, weight: 2, repeatable: true, cooldown: 2,
    conditions: {minAge: 30, maxAge: 35, states: {housing: {status: "owns_home"}}},
    description: "水管漏了，物业电话接了三遍。你终于有自己的住处，也有不能再转发给房东的问题。",
    choices: [
      {id: "repair", text: "花钱修好，让家里舒服一点", resultText: "开销是真实的，晚上不用听滴水声也是真实的。", effects: {money: -350, happiness: 4, stress: -3}, addTags: [], removeTags: [], historyText: "住处需要修理时，我花钱解决了问题。", importance: 1},
      {id: "sell_plan", text: "处理眼前问题，重新考虑租住", resultText: "你决定不让一把钥匙绑住全部安排。卖出和搬家有成本，换回的是一些流动空间。", effects: {money: 2000, stress: 4, autonomy: 6}, stateChanges: {housing: {status: "renting"}}, addTags: ["租住也有生活"], removeTags: [], historyText: "买房后的修理与牵挂，让我重新选择租住。", importance: 3}
    ]
  },
  {
    id: "young_salary_echo", title: "第一笔工资，谁来保管", category: "followup", eventTags: ["金钱", "家庭", "回声"],
    priority: 22, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 24, maxAge: 27, states: {work: {status: "employed"}}, historyEventIds: ["red_envelope", "first_job"]},
    description: "工资到账，你想起小时候那句‘我帮你保管’。父母这次问要不要帮你存一点，也问你最近吃得好不好。",
    choices: [
      {id: "share", text: "给家里一份心意，其余自己安排", resultText: "父母说不用，收下后又发来你爱吃的菜。你留下自己的预算，也接受了牵挂。", effects: {money: 2000, family: 6, stress: 2, autonomy: 3}, addTags: ["工资自己安排"], removeTags: ["钱交家里保管"], historyText: "想起压岁钱，我从工资里给家里一份心意，其余自己安排。", importance: 3},
      {id: "buffer", text: "先留作自己的缓冲，认真解释", resultText: "家里有一点失落，也开始知道你的生活到底要花多少钱。你没有把独立写成断绝关系。", effects: {money: 2800, family: -2, autonomy: 6, stress: 3}, addTags: ["工资自己安排", "向家人说明预算"], removeTags: ["钱交家里保管"], historyText: "想起压岁钱，我选择先把工资留作自己的生活缓冲。", importance: 3}
    ]
  },
  {
    id: "young_decision_echo", title: "这一次，谁来决定", category: "followup", eventTags: ["家庭", "独立", "回声"],
    priority: 17, weight: 1, repeatable: false, cooldown: 0,
    // 搬出最晚35岁，回声留到36岁，避免最后一年独立后立即失去后续窗口。
    conditions: {minAge: 25, maxAge: 36, statesNone: {housing: {status: "owns_home"}}, historyChoicesAll: [{eventId: "interest", choiceId: "math"}], historyEventIds: ["young_move_out"]},
    description: "父母又给居住安排提了建议。你想起十三岁收进抽屉的画本。这次他们说：你自己想好，我们只是怕你太累。",
    choices: [
      {id: "own_plan", text: "自己定下一步，也告诉他们理由", resultText: "你的预算变紧了，决定却清楚了一点。父母还会问，但开始把‘安排’换成‘建议’。", effects: {money: -400, autonomy: 7, family: 2, stress: 3}, stateChanges: {housing: {status: "renting"}}, addTags: ["成年自己作主"], removeTags: ["在家留缓冲"], historyText: "想起十三岁的取舍，我决定自己安排成年后的居住。", importance: 3},
      {id: "joint_plan", text: "接受一部分帮助，把边界说清楚", resultText: "你省下一些钱，也需要再花时间协商。接受帮助并没有抹掉决定权。", effects: {money: 600, family: 5, autonomy: 2, stress: 2}, addTags: ["共同商量边界"], removeTags: [], historyText: "想起十三岁的取舍，我选择接受帮助，同时说明边界。", importance: 3}
    ]
  },
  {
    id: "young_ranking_echo", title: "工位上的新榜单", category: "followup", eventTags: ["比较", "工作", "回声"],
    priority: 16, weight: 1, repeatable: false, cooldown: 0,
    conditions: {minAge: 26, maxAge: 30, states: {work: {status: "employed"}}, historyChoicesAll: [{eventId: "ranking", choiceId: "chase"}]},
    description: "绩效表让你想起学校走廊的排名。你给家里打电话，爸爸想说‘争口气’，停了停，问的是工作累不累。",
    choices: [
      {id: "compete", text: "争取更靠前的位置", resultText: "目标有了形状，比较也住进下班后的脑子。你准备把这份努力带去谈岗位。", effects: {money: 1200, stress: 6, happiness: -2}, addTags: ["争取晋升"], removeTags: ["暂缓晋升"], historyText: "想起年级排名，我决定争取更好的职场位置。", importance: 3},
      {id: "own_scale", text: "谈清职责，用自己的生活衡量", resultText: "排名未必漂亮，工作的边界清楚了一点。你需要承受一部分不同意见。", effects: {money: -300, autonomy: 6, stress: -5}, stateChanges: {work: {workStyle: "balanced"}}, addTags: ["暂缓晋升", "工作边界起步"], removeTags: ["争取晋升", "在意排名"], historyText: "想起年级排名，我决定用自己的生活衡量工作。", importance: 3}
    ]
  },
  {
    id: "young_holiday", title: "春节，回去还是留下", category: "random", eventTags: ["家庭", "朋友"],
    priority: 0, weight: 8, repeatable: true, cooldown: 2,
    conditions: {minAge: 25, maxAge: 35},
    description: "父母问你买票没有，问完说忙就别折腾。电话里背景有锅铲声，你这边也有人邀你一起过节。",
    choices: [
      {id: "home", text: "回去几天，留出相处时间", resultText: "路费和时间花掉了，饭桌上也不全是问题。有一顿饭你只负责吃。", effects: {money: -250, family: 5, happiness: 3, stress: 2}, addTags: [], removeTags: [], historyText: "这一年春节，我回家和父母待了几天。", importance: 1},
      {id: "stay", text: "留下过节，约好电话和下次见面", resultText: "有人失落，也有人替你松口气。你留下自己的安排，仍需要主动维系联系。", effects: {money: -60, family: -2, happiness: 4, autonomy: 3}, addTags: ["经营自己的关系网"], removeTags: [], historyText: "这一年春节，我留在自己的生活里，并和家里约好联系。", importance: 2}
    ]
  },
  {
    id: "young_parenthood_plan", title: "要不要成为父母", category: "conditional", eventTags: ["家庭", "选择"],
    priority: 13, weight: 1, repeatable: false, cooldown: 0,
    // 真实协商过共同生活之后才有讨论机会；结婚和年龄本身不等于生育意愿。
    conditions: {minAge: 28, maxAge: 35, states: {relationship: {status: "married"}, child: {hasChild: false}},
      tagsNone: ["主动不生育"], historyChoicesAll: [{eventId: "young_married_daily", choiceId: "share"}],
      historyChoicesNone: [{eventId: "young_parenthood_plan", choiceId: "no_child"}]},
    description: "父母问过，你们也谈起这个问题。钱、时间、身体和想不想，都没有被一句‘到时候就懂了’回答。",
    choices: [
      {id: "plan", text: "愿意考虑，先准备条件", resultText: "你们开始做安排，还没有孩子出生。期待也意味着给生活腾出空间。", effects: {money: -200, stress: 4, family: 3, autonomy: 2}, addTags: ["考虑成为父母"], removeTags: ["主动不生育"], historyText: "我们决定考虑成为父母，先准备条件。", importance: 3},
      {id: "no_child", text: "选择不生育，把生活安排说清楚", resultText: "亲人不一定立刻理解，你们也要建设自己的支持和陪伴。这是安排，不是结局判词。", effects: {family: -3, autonomy: 7, stress: 2, happiness: 3}, addTags: ["主动不生育", "经营自己的关系网"], removeTags: ["考虑成为父母"], historyText: "我们选择不生育，并开始商量自己的生活支持。", importance: 3}
    ]
  }
);
