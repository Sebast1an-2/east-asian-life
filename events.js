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
