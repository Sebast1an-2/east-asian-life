// 增加剧情主要修改这里。年龄为闭区间；effects 是属性的增减值。
// category: milestone 必然节点 / followup 因果 / conditional 条件 / random 随机。
const EVENTS = [
  {
    id: "birth", title: "你好，小孩", category: "milestone", eventTags: ["家庭"],
    priority: 100, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 0, maxAge: 0 }, description: "你出生了。大人们围着你，说你以后一定有出息。你暂时只关心奶。",
    choices: [
      { id: "cry", text: "大声宣布自己的到来", resultText: "你哭得很有底气，家人松了一口气。", effects: { health: 5 }, addTags: ["响亮的开场"], removeTags: [], historyText: "我以一声响亮的啼哭来到世界。", importance: 2 },
      { id: "sleep", text: "先睡一觉", resultText: "人生的期待可以等一等，觉不能。", effects: { happiness: 5 }, addTags: ["天生松弛"], removeTags: [], historyText: "出生时，我安静地睡了一觉。", importance: 1 }
    ]
  },
  {
    id: "neighbor", title: "别人家的孩子", category: "conditional", eventTags: ["比较", "家庭"],
    priority: 10, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 5, maxAge: 7 }, description: "邻居家的小孩已经会背诗。父母看着正在玩泥巴的你，陷入了沉思。",
    choices: [
      { id: "learn", text: "我也开始背诗", resultText: "你赢得了夸奖，也第一次学会和别人比较。", effects: { study: 10, stress: 8 }, addTags: ["习惯比较"], removeTags: [], historyText: "因为别人家的孩子，我开始努力表现。", importance: 2 },
      { id: "mud", text: "继续完成泥巴城堡", resultText: "城堡很漂亮，大人似乎没注意到。", effects: { happiness: 8, autonomy: 8, family: -3 }, addTags: ["保留好奇心"], removeTags: [], historyText: "我选择把泥巴城堡搭完。", importance: 2 }
    ]
  },
  {
    id: "score95", title: "那 5 分去哪了？", category: "milestone", eventTags: ["成绩", "家庭"],
    priority: 100, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 8, maxAge: 8 }, description: "你考了 95 分，兴冲冲地回家。父母的第一句话是：那 5 分去哪了？",
    choices: [
      { id: "promise", text: "下次一定考满分", resultText: "试卷被收好了，那句话却留下来了。", effects: { study: 8, stress: 12, happiness: -8 }, addTags: ["那5分的记忆"], removeTags: [], historyText: "95 分那年，我承诺下次考满分。", importance: 3 },
      { id: "celebrate", text: "可是我已经很努力了", resultText: "屋里安静了一会儿。你仍然觉得 95 分值得开心。", effects: { autonomy: 10, happiness: 5, family: -5 }, addTags: ["那5分的记忆", "为自己说话"], removeTags: [], historyText: "95 分那年，我试着为自己的努力说话。", importance: 3 }
    ]
  },
  {
    id: "weekend", title: "快乐的周末", category: "random", eventTags: ["休闲"],
    priority: 0, weight: 3, repeatable: true, cooldown: 3,
    conditions: { minAge: 9, maxAge: 16 }, description: "这周末没有额外作业。窗外的阳光像在招手。",
    choices: [
      { id: "play", text: "出去玩一整天", resultText: "傍晚回来，鞋很脏，心情很好。", effects: { happiness: 10, health: 3, stress: -8 }, addTags: ["记得快乐"], removeTags: [], historyText: "我度过了一个快乐的周末。", importance: 1 },
      { id: "study", text: "提前学习下周的内容", resultText: "你领先了一点，周末也悄悄过去了。", effects: { study: 8, stress: 4, happiness: -3 }, addTags: [], removeTags: [], historyText: "我把周末交给了课本。", importance: 1 }
    ]
  },
  {
    id: "interest", title: "兴趣还是成绩", category: "milestone", eventTags: ["选择", "成绩"],
    priority: 100, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 13, maxAge: 13 }, description: "你想参加画画社团，父母觉得这段时间用来补数学更划算。",
    choices: [
      { id: "art", text: "留下画画的时间", resultText: "你开始有一件只属于自己的事。", effects: { happiness: 10, autonomy: 12, study: -3 }, addTags: ["喜欢画画"], removeTags: [], historyText: "我坚持参加了画画社团。", importance: 3 },
      { id: "math", text: "听安排，去补数学", resultText: "成绩有所进步，画本被放进了抽屉。", effects: { study: 12, stress: 8, autonomy: -5 }, addTags: ["成绩优先"], removeTags: ["喜欢画画"], historyText: "我选择补数学，暂时放下兴趣。", importance: 3 }
    ]
  },
  {
    id: "mock", title: "模拟考试", category: "milestone", eventTags: ["考试"],
    priority: 100, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 17, maxAge: 17 }, description: "模拟考结束。老师说这不是人生的全部，然后发了新的三套试卷。",
    choices: [
      { id: "push", text: "再拼一把", resultText: "台灯亮到深夜，分数和压力一起上涨。", effects: { study: 15, health: -8, stress: 15 }, addTags: ["备考到底"], removeTags: [], historyText: "模拟考试之后，我继续埋头备考。", importance: 2 },
      { id: "rest", text: "先睡好，再复习", resultText: "你发现睡醒以后，题目并没有变少，但脑子好用了一点。", effects: { health: 5, stress: -10, study: 5 }, addTags: ["照顾自己"], removeTags: [], historyText: "备考时，我试着照顾自己的身体。", importance: 2 }
    ]
  },
  {
    id: "major", title: "选择专业", category: "milestone", eventTags: ["选择"],
    priority: 100, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 19, maxAge: 19 }, description: "志愿表摆在眼前。有人说要选喜欢的，有人说要选好找工作的。",
    choices: [
      { id: "like", text: "选自己感兴趣的专业", resultText: "未来还不确定，但这个决定是你自己的。", effects: { autonomy: 15, happiness: 10, money: -2000 }, addTags: ["自主选专业"], removeTags: [], historyText: "进入大学时，我选择了感兴趣的专业。", importance: 3, identity: "大学生" },
      { id: "safe", text: "选家人推荐的稳妥专业", resultText: "家人放心了。你决定慢慢看看这条路。", effects: { family: 8, study: 5, autonomy: -5 }, addTags: ["稳妥专业"], removeTags: [], historyText: "我选择了家人推荐的大学专业。", importance: 3, identity: "大学生" }
    ]
  },
  {
    id: "home", title: "放假回家", category: "followup", eventTags: ["家庭", "记忆"],
    priority: 20, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 21, maxAge: 22, tagsAll: ["那5分的记忆"], historyEventIds: ["score95"] },
    description: "回家整理旧物，你翻到那张 95 分的试卷。原来纸会泛黄，那句话却还很清晰。",
    choices: [
      { id: "talk", text: "说说那时自己的感受", resultText: "父母说他们当时只是着急。话没有解决一切，但你终于说了出来。", effects: { family: 8, stress: -8, autonomy: 5 }, addTags: ["开始和解"], removeTags: [], historyText: "放假回家，我谈起了那张 95 分的试卷。", importance: 3 },
      { id: "keep", text: "把试卷收好，留给自己", resultText: "你在试卷背面写下：那时的我，已经很努力了。", effects: { happiness: 8, stress: -5 }, addTags: ["接纳自己"], removeTags: [], historyText: "我收好旧试卷，肯定了小时候的自己。", importance: 3 }
    ]
  }
];

// 第二批：只增加剧情数据，继续使用同一套引擎。
EVENTS.push(
  {
    id: "first_plan", title: "抓周：第一次被规划人生", category: "milestone", eventTags: ["家庭", "期待"],
    priority: 100, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 1, maxAge: 1 }, description: "桌上摆着笔、算盘和玩具。你还不会说话，亲戚已经替你开了职业规划会。妈妈偷偷把玩具推近了一点。",
    choices: [
      { id: "pen", text: "抓住笔，再咬一口", resultText: "大家宣布你有读书天分。爸爸拍完照，还得回去赶工。", effects: { family: 5, stress: 2 }, addTags: ["被寄予厚望"], removeTags: [], historyText: "抓周时抓了笔，大人开始期待我的未来。", importance: 2 },
      { id: "toy", text: "抱走最顺手的玩具", resultText: "有人说不算数，妈妈说孩子喜欢就好。合照里你笑得最响。", effects: { happiness: 6, autonomy: 3, family: -2 }, addTags: [], removeTags: [], historyText: "抓周时，我抱走了自己喜欢的玩具。", importance: 1 }
    ]
  },
  {
    id: "art_class", title: "兴趣班启蒙", category: "conditional", eventTags: ["兴趣", "家庭"],
    priority: 10, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 3, maxAge: 4 }, description: "画画试听课上，你把太阳涂成蓝色。父母翻着价目表，讨论时间和学费；老师说，先让孩子试试。",
    choices: [
      { id: "join", text: "想继续上课", resultText: "家里少了一次聚餐，你多了一盒颜料。周末也得按时起床了。", effects: { happiness: 7, study: 3, money: -600, stress: 3 }, addTags: ["旧画册", "喜欢画画"], removeTags: [], historyText: "我开始上画画课，画册里有一颗蓝色太阳。", importance: 2 },
      { id: "home", text: "把画册带回家，自己画", resultText: "不用赶课了，但想学的东西得自己摸索。父母把画册放进抽屉，没有扔。", effects: { autonomy: 5, happiness: 3, study: -2 }, addTags: ["旧画册"], removeTags: [], historyText: "画画试听后，我带着画册回家自己摸索。", importance: 2 }
    ]
  },
  {
    id: "parent_meeting", title: "家长会后的饭桌", category: "conditional", eventTags: ["学校", "家庭"],
    priority: 20, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 6, maxAge: 7 }, description: "妈妈请假去开家长会，回来时饭已经凉了。老师说你上课容易走神，她问：是听不懂，还是不开心？",
    choices: [
      { id: "tell", text: "说说自己跟不上哪一段", resultText: "她也不全会，陪你一起查了半天。今晚少了玩耍，多了一点理解。", effects: { study: 5, family: 6, stress: 3, happiness: -2 }, addTags: [], removeTags: [], historyText: "家长会后，我和妈妈一起弄懂了一道题。", importance: 1 },
      { id: "promise", text: "说没事，下次会认真", resultText: "饭桌安静下来，你保住了自由时间，也把难题留给了明天。", effects: { autonomy: 3, family: -3, stress: 4 }, addTags: [], removeTags: [], historyText: "家长会后，我承诺自己处理学习上的难题。", importance: 1 }
    ]
  },
  {
    id: "red_envelope", title: "压岁钱的保管权", category: "random", eventTags: ["金钱", "家庭"],
    priority: 0, weight: 3, repeatable: false, cooldown: 0,
    conditions: { minAge: 7, maxAge: 10 }, description: "红包还没捂热，父母就说帮你存起来。存折上写着你的名字，密码暂时不是你的知识范围。",
    choices: [
      { id: "entrust", text: "交给家里，问一句会存到哪里", resultText: "钱暂时不由你支配，父母认真给你看了记录。安心和掌控感不是同一件事。", effects: { family: 6, autonomy: -3, stress: -2 }, addTags: ["钱交家里保管"], removeTags: [], historyText: "我把压岁钱交给家里保管，并看了存钱记录。", importance: 2 },
      { id: "budget", text: "商量留三百元自己安排", resultText: "你有了第一笔预算，也答应不再每次都向家里补要零花钱。", effects: { money: 300, autonomy: 7, family: -2, stress: 3 }, addTags: ["练习自己管钱"], removeTags: [], historyText: "我从压岁钱里留下三百元，开始自己做预算。", importance: 2 }
    ]
  },
  {
    id: "relatives_child", title: "亲戚问答大会", category: "random", eventTags: ["亲戚", "期待"],
    priority: 0, weight: 4, repeatable: false, cooldown: 0,
    conditions: { minAge: 9, maxAge: 12 }, description: "一桌人轮流问成绩和长大想做什么。有人递来鸡腿，有人递来问题，爸爸正试着把话题转到天气。",
    choices: [
      { id: "perform", text: "挑几个让大家高兴的答案", resultText: "饭桌很和气。你说得越来越熟练，却不太确定那是不是自己的愿望。", effects: { family: 5, stress: 5, autonomy: -3 }, addTags: ["熟悉标准答案"], removeTags: [], historyText: "亲戚问未来时，我学会了让饭桌满意的回答。", importance: 2 },
      { id: "ask_back", text: "问问他们小时候想做什么", resultText: "有人讲了没实现的梦想，也有人觉得你在绕开问题。鸡腿终于能趁热吃了。", effects: { autonomy: 6, happiness: 4, family: -2 }, addTags: ["试着改写问答"], removeTags: [], historyText: "亲戚问未来时，我反问了他们小时候的梦想。", importance: 2 }
    ]
  },
  {
    id: "caught_gaming", title: "偷玩游戏被发现", category: "random", eventTags: ["休闲", "信任"],
    priority: 0, weight: 3, repeatable: false, cooldown: 0,
    conditions: { minAge: 10, maxAge: 12 }, description: "门开得比存档快。爸爸看见游戏画面，先叹气：我也想玩，但你明天还要早起。",
    choices: [
      { id: "agree", text: "坦白，再商量固定游戏时间", resultText: "今晚提前下线了。你们定了时间表，爸爸也得遵守不临时加码的约定。", effects: { family: 5, autonomy: 4, happiness: -3, stress: -2 }, addTags: ["协商休闲时间"], removeTags: [], historyText: "偷玩被发现后，我和爸爸商量了游戏时间。", importance: 2 },
      { id: "hide", text: "说只是打开看看", resultText: "你保住了这一局，之后开门声却变得格外响。", effects: { happiness: 5, family: -6, stress: 5 }, addTags: [], removeTags: [], historyText: "偷玩被发现时，我没有承认，继续了那一局。", importance: 1 }
    ]
  },
  {
    id: "ranking", title: "年级排名", category: "conditional", eventTags: ["比较", "学校"],
    priority: 10, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 11, maxAge: 12 }, description: "榜单贴在走廊。你的名字被压缩成一个数字，旁边的同学却还记得你借过他橡皮。",
    choices: [
      { id: "chase", text: "记下前面的名字，给自己定目标", resultText: "复习有了方向，路过榜单时也开始忍不住停下。", effects: { study: 8, stress: 7, happiness: -3 }, addTags: ["在意排名"], removeTags: [], historyText: "年级排名公布后，我给自己定了追赶目标。", importance: 2 },
      { id: "review", text: "只看错题，不抄排名", resultText: "你少了一个比较的尺子，也少了被数字推着走的劲头。", effects: { study: 4, autonomy: 5, stress: -4 }, addTags: [], removeTags: [], historyText: "排名公布后，我把注意力留给自己的错题。", importance: 1 }
    ]
  },
  {
    id: "phone_request", title: "申请手机", category: "conditional", eventTags: ["沟通", "边界"],
    priority: 20, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 12, maxAge: 14 }, description: "家人担心你晚归，也担心你沉迷。讨论半天，手机像一份小合同：方便联系，也要及时回复。",
    choices: [
      { id: "accept", text: "接受约定，拿一部旧手机", resultText: "朋友能联系上你了，家里的消息也开始随时抵达。", effects: { happiness: 5, family: 4, stress: 5, autonomy: -2 }, addTags: ["习惯随时回应"], removeTags: [], historyText: "我接受随时回复的约定，拿到了第一部手机。", importance: 3 },
      { id: "negotiate", text: "商量固定报平安时间，暂缓拿手机", resultText: "你保住了一点安静，但放学变动还得借同学的电话。", effects: { autonomy: 7, happiness: -3, family: -2, stress: -3 }, addTags: ["保留离线时间"], removeTags: [], historyText: "申请手机时，我选择先约定固定报平安时间。", importance: 3 }
    ]
  },
  {
    id: "best_friend", title: "最好的朋友", category: "random", eventTags: ["朋友", "成长"],
    priority: 0, weight: 5, repeatable: false, cooldown: 0,
    conditions: { minAge: 14, maxAge: 16 }, description: "最好的朋友要转学了。你们在校门口分掉最后一袋薯片，谁都没说以后可能越来越忙。",
    choices: [
      { id: "keep", text: "约定每个月联系一次", resultText: "联系需要挤出时间。有些月份只聊五分钟，但对方还在。", effects: { happiness: 6, study: -2, stress: 2 }, addTags: ["保持老友联系"], removeTags: [], historyText: "朋友转学时，我们约定每个月联系。", importance: 2 },
      { id: "goodbye", text: "认真告别，不许下固定约定", resultText: "你们少了一份承诺的压力，也可能慢慢走散。", effects: { autonomy: 4, stress: -3, happiness: -4 }, addTags: ["珍惜不强留"], removeTags: [], historyText: "朋友转学时，我认真告别，没有约定固定联系。", importance: 2 }
    ]
  },
  {
    id: "first_crush", title: "第一次喜欢一个人", category: "random", eventTags: ["感情", "自我"],
    priority: 0, weight: 4, repeatable: false, cooldown: 0,
    conditions: { minAge: 14, maxAge: 16 }, description: "你开始记得某个人借书的日子。成绩单上没有这一科，可你每天都在复习那句‘明天见’。",
    choices: [
      { id: "invite", text: "邀请对方一起去图书馆", resultText: "多了一次聊天，也多了一点紧张。对方的回应没有标准答案。", effects: { happiness: 6, autonomy: 5, stress: 5, study: -2 }, addTags: [], removeTags: [], historyText: "第一次喜欢一个人时，我试着发出了邀请。", importance: 2 },
      { id: "quiet", text: "把心事写下来，暂时不说", resultText: "日记很安全，猜测也住了进去。你仍能把注意力留给自己的生活。", effects: { study: 3, stress: -2, happiness: -3 }, addTags: [], removeTags: [], historyText: "第一次喜欢一个人时，我把心事留在日记里。", importance: 2 }
    ]
  },
  {
    id: "late_study", title: "凌晨学习", category: "conditional", eventTags: ["学习", "健康"],
    priority: 10, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 16, maxAge: 17, stats: { stress: { min: 25 } } }, description: "一点半，台灯还亮着。刚下夜班的妈妈放下一杯水，没有问你学了多少，只问明天几点起。",
    choices: [
      { id: "finish", text: "把这一页做完再睡", resultText: "题目少了一页，睡眠也少了一截。水杯旁留着她没说出口的担心。", effects: { study: 8, health: -6, stress: 5 }, addTags: [], removeTags: [], historyText: "压力大的那晚，我继续学到了凌晨。", importance: 1 },
      { id: "sleep", text: "停在这里，明早再看", resultText: "任务还欠着，身体先缓了一口气。你得重新安排明天。", effects: { health: 5, stress: -7, study: -2, autonomy: 3 }, addTags: ["照顾自己"], removeTags: [], historyText: "凌晨学习时，我决定先睡觉，把任务留到明早。", importance: 2 }
    ]
  },
  {
    id: "exam_eve", title: "重要考试前夜", category: "milestone", eventTags: ["考试", "关心"],
    priority: 100, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 18, maxAge: 18 }, description: "准考证在桌上，父母把闹钟检查了三遍。爸爸说考完吃什么都行，说完又怕给你压力，赶紧去洗碗。",
    choices: [
      { id: "review", text: "再翻一遍容易忘的地方", resultText: "你抓住几处知识点，也带着没看完的感觉入睡。", effects: { study: 6, stress: 6, health: -3 }, addTags: [], removeTags: [], historyText: "重要考试前夜，我又复习了一遍薄弱的地方。", importance: 2 },
      { id: "walk", text: "和家人走一小圈，再睡觉", resultText: "没有多记一道题。路上你发现，紧张的人不止自己。", effects: { family: 5, stress: -6, health: 3, study: -2 }, addTags: [], removeTags: [], historyText: "重要考试前夜，我和家人散步后早早休息。", importance: 2 }
    ]
  },
  {
    id: "graduation", title: "高中毕业", category: "random", eventTags: ["告别", "成长"],
    priority: 0, weight: 4, repeatable: false, cooldown: 0,
    conditions: { minAge: 18, maxAge: 20, historyEventIds: ["exam_eve"] }, description: "毕业后的聚会终于凑齐了人。曾经催你交作业的班长在催合照，粉笔灰已经变成过去式。",
    choices: [
      { id: "gather", text: "留下合照和联系方式", resultText: "你花了一晚和一点车费。以后也许只剩节日问候，但今天是真的。", effects: { happiness: 6, money: -100, stress: 2 }, addTags: [], removeTags: [], historyText: "毕业后的聚会上，我留下了合照和联系方式。", importance: 2 },
      { id: "leave", text: "告别后先回家，留一点独处时间", resultText: "你错过了后半场，也终于有空消化这段结束。", effects: { stress: -5, autonomy: 4, happiness: -2 }, addTags: [], removeTags: [], historyText: "毕业聚会上，我提前告别，留了时间给自己。", importance: 2 }
    ]
  },
  {
    id: "first_freedom", title: "大学第一次自由", category: "random", eventTags: ["自由", "金钱"],
    priority: 0, weight: 4, repeatable: false, cooldown: 0,
    conditions: { minAge: 20, maxAge: 22, lifeStages: ["university"], historyEventIds: ["major"] }, description: "没人问你周末去哪。城市很大，生活费余额很小；第一次，你要同时回答‘想不想’和‘付不付得起’。",
    choices: [
      { id: "explore", text: "拿出一点预算，去看看城市", resultText: "你认得了几条街，月底则要多吃几顿食堂。", effects: { happiness: 8, autonomy: 7, money: -200, stress: 3 }, addTags: ["练习自主安排"], removeTags: [], historyText: "大学里，我第一次自己安排预算去探索城市。", importance: 3 },
      { id: "save", text: "留在校园，把预算记下来", resultText: "账户安心了一点，远处的风景暂时留在地图上。", effects: { money: 100, autonomy: 4, happiness: -3, stress: -3 }, addTags: ["练习自己管钱"], removeTags: [], historyText: "大学的自由周末，我选择先学着安排预算。", importance: 3 }
    ]
  },
  {
    id: "dorm_life", title: "宿舍生活", category: "random", eventTags: ["同住", "边界"],
    priority: 0, weight: 4, repeatable: false, cooldown: 0,
    conditions: { minAge: 20, maxAge: 22, lifeStages: ["university"], historyEventIds: ["major"] }, description: "室友的夜聊刚开始，你的早课已经在倒计时。四个人的作息表拼在一起，比课表更难排。",
    choices: [
      { id: "talk", text: "一起商量安静时间", resultText: "谈得有点尴尬，大家也提了你的闹钟。睡眠改善了，约定需要一起守。", effects: { health: 5, autonomy: 5, happiness: -2, stress: 2 }, addTags: ["尝试表达边界"], removeTags: [], historyText: "宿舍作息冲突时，我和室友商量了安静时间。", importance: 2 },
      { id: "join", text: "今晚加入聊天，明天再调整", resultText: "你听到了室友的故事，也得带着困意去上课。", effects: { happiness: 7, health: -4, study: -2, stress: -2 }, addTags: [], removeTags: [], historyText: "宿舍夜聊时，我留下来听了室友们的故事。", importance: 1 }
    ]
  },
  {
    id: "relatives_adult", title: "大学后的亲戚问答", category: "followup", eventTags: ["亲戚", "回声"],
    priority: 10, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 24, maxAge: 27, historyEventIds: ["relatives_child", "major"] }, description: "同一张饭桌，问题升级成工作和对象。你想起小时候答过的‘长大以后’。姨妈问完，又小声说她也怕自己的孩子走弯路。",
    choices: [
      { id: "explain", text: "讲一点真实计划，也听听他们的担心", resultText: "饭吃得慢了，你保住了交流，也承担了一轮新建议。", effects: { family: 5, autonomy: 4, stress: 5 }, addTags: ["真实回答期待"], removeTags: ["熟悉标准答案"], historyText: "成年后的亲戚饭桌上，我讲了真实计划，也听了他们的担心。", importance: 3 },
      { id: "redirect", text: "简单回答，把话题转到他们最近的生活", resultText: "今晚轻松了一点，你的计划仍没有被理解。长辈倒聊起了自己的体检。", effects: { stress: -5, happiness: 3, family: -2 }, addTags: ["保留私人计划"], removeTags: [], historyText: "成年后的亲戚饭桌上，我留住自己的计划，问起他们的近况。", importance: 3 }
    ]
  },
  {
    id: "first_job", title: "第一份工作", category: "milestone", eventTags: ["工作", "选择"],
    priority: 100, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 23, maxAge: 23 }, description: "两份入职通知摆在屏幕上：一份稳定但路远，一份薪水略高、下班时间写着‘弹性’。父母说都行，又各问了三遍。",
    choices: [
      { id: "steady", text: "选节奏稳定的工作，接受通勤", resultText: "第一笔收入到账了。晚上大致属于你，早晨有一截属于公交车。", effects: { money: 3000, health: -2, stress: 3, family: 4 }, addTags: ["稳定工作起步"], removeTags: [], historyText: "第一份工作，我选择稳定节奏，接受较长通勤。", importance: 3, identity: "初入职场" },
      { id: "flexible", text: "选收入更高的岗位，试试弹性", resultText: "收入多了一点，你也开始理解‘弹性’可能向两边拉。", effects: { money: 4500, stress: 8, health: -4, autonomy: 4 }, addTags: ["高压工作起步"], removeTags: [], historyText: "第一份工作，我选择较高收入和不确定的下班时间。", importance: 3, identity: "初入职场" }
    ]
  },
  {
    id: "boss_message", title: "老板深夜发：睡了吗？", category: "followup", eventTags: ["工作", "回声", "边界"],
    priority: 30, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 24, maxAge: 28, historyEventIds: ["phone_request", "first_job"] }, description: "23:47，屏幕亮起：‘睡了吗？’你想起申请手机时那句‘方便联系’。老板紧接着说他也刚哄完孩子，客户明早要材料。",
    choices: [
      { id: "reply", text: "回复，今晚帮忙处理", resultText: "材料赶上了，你被认真道谢。睡眠少了，随时在线也可能变成下一次的期待。", effects: { money: 200, stress: 8, health: -5, happiness: -2 }, addTags: ["工作随时在线"], removeTags: ["保留离线时间"], historyText: "老板深夜发消息时，我接下了临时任务。", importance: 3 },
      { id: "morning", text: "说明明早能处理的部分，先休息", resultText: "你保住了睡眠，明早却需要解释进度。老板没再回复，原因你还不知道。", effects: { autonomy: 7, health: 3, stress: 3, money: -100 }, addTags: ["工作边界起步"], removeTags: ["习惯随时回应"], historyText: "老板深夜发消息时，我约定明早处理，先休息。", importance: 3 }
    ]
  },
  {
    id: "spring_home", title: "春节回家", category: "followup", eventTags: ["家庭", "金钱", "成长"],
    priority: 20, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 26, maxAge: 30, historyEventIds: ["red_envelope", "first_job"] }, description: "小时候等红包，现在你在挑给家里的礼物。父母说别乱花钱，又把你带来的袋子摆在最显眼处。你想起当年的压岁钱。",
    choices: [
      { id: "gift", text: "买份像样的礼物，让他们放心", resultText: "家里很高兴，你的小预算瘦了一圈。你发现表达心意也会沾上‘够不够好’。", effects: { money: -800, family: 8, stress: 3 }, addTags: ["用礼物表达关心"], removeTags: [], historyText: "工作后春节回家，我花钱给父母准备了一份礼物。", importance: 2 },
      { id: "cook", text: "说明自己的预算，一起买菜做饭", resultText: "礼物小了点，相处多了点。父母仍有些担心你的收入，但听到了你的安排。", effects: { money: -200, family: 4, autonomy: 5, stress: 2 }, addTags: ["向家人说明预算"], removeTags: ["钱交家里保管"], historyText: "工作后春节回家，我说明预算，和父母一起做饭。", importance: 2 }
    ]
  },
  {
    id: "old_album", title: "抽屉里的旧画册", category: "followup", eventTags: ["兴趣", "回声", "自我"],
    priority: 20, weight: 1, repeatable: false, cooldown: 0,
    conditions: { minAge: 28, maxAge: 32, tagsAll: ["旧画册"], historyEventIds: ["art_class", "interest"] }, description: "整理旧物时，你找到那颗蓝色太阳。你想起十三岁那次兴趣和成绩的选择。父母居然替你搬了几次家，都没扔掉这本画册。",
    choices: [
      { id: "draw", text: "买一小盒颜料，重新画一会儿", resultText: "画得生疏，也有点开心。没有考级通知，只有你要为这段时间腾出的位置。", effects: { money: -150, happiness: 8, autonomy: 6, stress: 2 }, addTags: ["重新拾起画画"], removeTags: ["成绩优先"], historyText: "成年后找到旧画册，我重新拿起了画笔。", importance: 3 },
      { id: "keep", text: "和父母翻一遍，收好留念", resultText: "你没有重新开始，也没有否定小时候的喜欢。忙碌里留下了一格抽屉。", effects: { family: 6, happiness: 4, stress: -3, autonomy: -2 }, addTags: ["珍藏旧兴趣"], removeTags: [], historyText: "成年后，我和父母翻看旧画册，再把它珍藏起来。", importance: 3 }
    ]
  }
);
