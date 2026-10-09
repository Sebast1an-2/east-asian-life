// 三条特殊路线共17个候选；不用职业树，只复用work、真实选择和标签。
// 特殊职业在岗用于保护普通职场剧情；退出时删除，过去的职业由History保留。
EVENTS.push(
{
  "id": "esports_amateur",
  "title": "课本旁的比赛报名表",
  "category": "followup",
  "eventTags": [
    "特殊路线",
    "游戏"
  ],
  "priority": 38,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 14,
    "maxAge": 18,
    "historyChoicesAny": [
      {
        "eventId": "caught_gaming",
        "choiceId": "agree"
      },
      {
        "eventId": "caught_gaming",
        "choiceId": "hide"
      }
    ]
  },
  "description": "你喜欢的游戏办了一场业余赛。队友说练习也要排时间，父母问：这次是不是又叫‘最后一局’？",
  "choices": [
    {
      "id": "practice",
      "text": "安排固定训练，试一次业余赛",
      "resultText": "你把训练和作业分开排。喜欢玩和愿意反复练同一件事，原来有些区别。",
      "effects": {
        "study": 4,
        "stress": 5,
        "happiness": 4
      },
      "addTags": [
        "持续练习游戏"
      ],
      "removeTags": [],
      "historyText": "你把训练和作业分开排。喜欢玩和愿意反复练同一件事，原来有些区别。",
      "importance": 2
    },
    {
      "id": "hobby",
      "text": "只参加体验，保留休闲",
      "resultText": "输了也能回家吃饭。你想让游戏继续是一件不用交成绩的事。",
      "effects": {
        "happiness": 5,
        "autonomy": 3
      },
      "addTags": [
        "游戏留作休闲"
      ],
      "removeTags": [],
      "historyText": "输了也能回家吃饭。你想让游戏继续是一件不用交成绩的事。",
      "importance": 2
    }
  ]
},
{
  "id": "esports_trial",
  "title": "试训不只是打游戏",
  "category": "followup",
  "eventTags": [
    "特殊路线",
    "游戏"
  ],
  "priority": 42,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 19,
    "maxAge": 24,
    "historyChoicesAll": [
      {
        "eventId": "esports_amateur",
        "choiceId": "practice"
      }
    ],
    "stats": {
      "health": {
        "min": 55
      },
      "stress": {
        "max": 75
      }
    },
    "statesNone": {
      "work": {
        "status": "retired"
      }
    }
  },
  "description": "业余赛的录像带来一次试训。合同写着训练、复盘和淘汰；家人担心的不是你喜欢游戏，而是这条路能走多久。",
  "choices": [
    {
      "id": "join",
      "text": "接受有限期限的试训合同",
      "resultText": "你进入职业队伍的训练名单，开始靠比赛工作。名额不是冠军保证，也需要给转向留预算。",
      "effects": {
        "money": 1800,
        "health": -3,
        "stress": 8
      },
      "addTags": [
        "特殊职业在岗",
        "职业选手经历"
      ],
      "removeTags": [],
      "historyText": "你进入职业队伍的训练名单，开始靠比赛工作。名额不是冠军保证，也需要给转向留预算。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "employed",
          "careerType": "esports",
          "level": 1,
          "workStyle": "high_pressure"
        }
      },
      "identity": "职业选手"
    },
    {
      "id": "decline",
      "text": "把比赛经验留着，继续其他方向",
      "resultText": "你没有签合同，仍保留游戏和队友。没走这条路，不等于那些练习不算数。",
      "effects": {
        "autonomy": 4,
        "happiness": 2
      },
      "addTags": [
        "游戏留作休闲"
      ],
      "removeTags": [],
      "historyText": "你没有签合同，仍保留游戏和队友。没走这条路，不等于那些练习不算数。",
      "importance": 2
    }
  ]
},
{
  "id": "esports_season",
  "title": "输赢之外的复盘",
  "category": "random",
  "eventTags": [
    "特殊路线",
    "游戏"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 2,
  "conditions": {
    "minAge": 20,
    "maxAge": 35,
    "states": {
      "work": {
        "status": "employed",
        "careerType": "esports"
      }
    },
    "historyChoicesAll": [
      {
        "eventId": "esports_trial",
        "choiceId": "join"
      }
    ]
  },
  "description": "这一轮有赢有输。赛后评价比比赛还长，队友在复盘室里问：下一轮怎么安排？",
  "choices": [
    {
      "id": "push",
      "text": "争取首发，把训练再加一点",
      "resultText": "你得到一次更好的上场机会和奖金，也开始发现状态不会只听训练时长指挥。",
      "effects": {
        "money": 1600,
        "stress": 7,
        "health": -4
      },
      "addTags": [
        "电竞争取首发"
      ],
      "removeTags": [],
      "historyText": "你得到一次更好的上场机会和奖金，也开始发现状态不会只听训练时长指挥。",
      "importance": 2
    },
    {
      "id": "adjust",
      "text": "调整训练，接受暂时轮换",
      "resultText": "上场少了，收入也少了。你把复盘写清楚，留了一晚真正的休息。",
      "effects": {
        "money": -300,
        "study": 5,
        "health": 3,
        "stress": -5
      },
      "addTags": [
        "电竞调整训练"
      ],
      "removeTags": [],
      "historyText": "上场少了，收入也少了。你把复盘写清楚，留了一晚真正的休息。",
      "importance": 2
    },
    {
      "id": "leave",
      "text": "结束合同，先重新找方向",
      "resultText": "你离开了比赛名单。告别有点难，但这段职业经历不会从简历和记忆里消失。",
      "effects": {
        "money": 600,
        "autonomy": 5,
        "stress": -6
      },
      "addTags": [
        "电竞已退役"
      ],
      "removeTags": [
        "特殊职业在岗"
      ],
      "historyText": "你离开了比赛名单。告别有点难，但这段职业经历不会从简历和记忆里消失。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "unemployed"
        }
      },
      "identity": "待业者"
    }
  ],
  "weightModifiers": [
    {
      "stats": {
        "study": {
          "min": 60
        }
      },
      "multiplier": 2,
      "reason": "复盘与学习积累较扎实"
    }
  ]
},
{
  "id": "esports_analysis",
  "title": "复盘笔记被借走",
  "category": "conditional",
  "eventTags": [
    "特殊路线",
    "游戏"
  ],
  "priority": 12,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 22,
    "maxAge": 35,
    "historyChoicesAll": [
      {
        "eventId": "esports_trial",
        "choiceId": "join"
      }
    ],
    "states": {
      "work": {
        "status": "employed",
        "careerType": "esports"
      }
    },
    "stats": {
      "study": {
        "min": 55
      }
    }
  },
  "description": "新人问能不能借你的复盘笔记。你发现，过去愿意弄懂一个问题的习惯，现在也能帮人看懂一场比赛。",
  "choices": [
    {
      "id": "teach",
      "text": "留一点时间和新人一起分析",
      "resultText": "你帮新人找到一个细节，也少练了几局。以后退役时，经验还有可以传下去的地方。",
      "effects": {
        "study": 3,
        "stress": 2,
        "happiness": 3
      },
      "addTags": [
        "愿意传递电竞经验"
      ],
      "removeTags": [],
      "historyText": "你帮新人找到一个细节，也少练了几局。以后退役时，经验还有可以传下去的地方。",
      "importance": 2
    },
    {
      "id": "focus",
      "text": "解释重点，继续准备自己的比赛",
      "resultText": "你分享了方法，也守住自己的训练时间。帮助别人和照顾自己需要分配。",
      "effects": {
        "autonomy": 3,
        "study": 2
      },
      "addTags": [
        "电竞专注赛场"
      ],
      "removeTags": [],
      "historyText": "你分享了方法，也守住自己的训练时间。帮助别人和照顾自己需要分配。",
      "importance": 2
    }
  ],
  "statReasons": {
    "study": "学习与复盘能力已有积累"
  }
},
{
  "id": "esports_transition",
  "title": "赛场之外的第二份简历",
  "category": "followup",
  "eventTags": [
    "特殊路线",
    "游戏"
  ],
  "priority": 90,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 28,
    "maxAge": 40,
    "states": {
      "work": {
        "status": "employed",
        "careerType": "esports"
      }
    },
    "historyChoicesAll": [
      {
        "eventId": "esports_trial",
        "choiceId": "join"
      }
    ]
  },
  "description": "队伍开始讨论下一阶段的名单。你不必把余生都押在反应速度上，现在可以认真选择赛场之后的工作。",
  "choices": [
    {
      "id": "coach",
      "text": "转向简化的训练指导岗位",
      "resultText": "你离开选手名单，开始讲解复盘。工作换了形式，经验没有按退役日期清零。",
      "effects": {
        "money": 800,
        "stress": -4,
        "study": 3
      },
      "addTags": [
        "电竞已退役",
        "电竞经验传递"
      ],
      "removeTags": [
        "特殊职业在岗"
      ],
      "historyText": "你离开选手名单，开始讲解复盘。工作换了形式，经验没有按退役日期清零。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "employed",
          "careerType": "esports_coach",
          "level": 1,
          "workStyle": "balanced"
        }
      },
      "identity": "电竞训练指导"
    },
    {
      "id": "stream",
      "text": "试着靠直播与内容工作",
      "resultText": "你离开比赛名单，把解释比赛的经验带到镜头前。自由排班，也得面对不稳定的收入。",
      "effects": {
        "money": 200,
        "stress": -2,
        "autonomy": 4
      },
      "addTags": [
        "电竞已退役",
        "主播职业经历",
        "特殊职业在岗"
      ],
      "removeTags": [],
      "historyText": "你离开比赛名单，把解释比赛的经验带到镜头前。自由排班，也得面对不稳定的收入。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "employed",
          "careerType": "streamer",
          "level": 1,
          "workStyle": "flexible"
        }
      },
      "identity": "主播"
    },
    {
      "id": "ordinary",
      "text": "进入普通岗位，保留游戏",
      "resultText": "你离开职业赛场，在新岗位重新自我介绍。下班可以只打一局，不需要证明自己。",
      "effects": {
        "money": 600,
        "stress": -5,
        "autonomy": 3
      },
      "addTags": [
        "电竞已退役"
      ],
      "removeTags": [
        "特殊职业在岗"
      ],
      "historyText": "你离开职业赛场，在新岗位重新自我介绍。下班可以只打一局，不需要证明自己。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "employed",
          "careerType": "general",
          "level": 1,
          "workStyle": "balanced"
        }
      },
      "identity": "普通工作者"
    }
  ],
  "isMajorNode": true
},
{
  "id": "esports_second_life",
  "title": "名字旁边不再是战绩",
  "category": "random",
  "eventTags": [
    "特殊路线",
    "游戏"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 4,
  "conditions": {
    "minAge": 30,
    "maxAge": 59,
    "historyChoicesAll": [
      {
        "eventId": "esports_trial",
        "choiceId": "join"
      }
    ],
    "statesNone": {
      "work": {
        "careerType": "esports"
      }
    }
  },
  "description": "有人认出你曾经打过职业。你介绍现在的生活，才发现一句自我介绍可以同时装下很多段人生。",
  "choices": [
    {
      "id": "share",
      "text": "把经验分享给业余队伍",
      "resultText": "你花了一个周末，收到一顿饭和一些认真提问。过去的比赛在新的地方有了用处。",
      "effects": {
        "happiness": 4,
        "money": -80,
        "study": 2
      },
      "addTags": [
        "电竞经验传递"
      ],
      "removeTags": [],
      "historyText": "你花了一个周末，收到一顿饭和一些认真提问。过去的比赛在新的地方有了用处。",
      "importance": 2
    },
    {
      "id": "own",
      "text": "保留这段记忆，安排自己的生活",
      "resultText": "你不必每次都讲那段经历。键盘可以留着，也可以让今天有别的内容。",
      "effects": {
        "autonomy": 4,
        "stress": -3
      },
      "addTags": [
        "赛场之外有生活"
      ],
      "removeTags": [],
      "historyText": "你不必每次都讲那段经历。键盘可以留着，也可以让今天有别的内容。",
      "importance": 2
    }
  ]
},
{
  "id": "stream_first",
  "title": "第一次面对空直播间",
  "category": "conditional",
  "eventTags": [
    "特殊路线",
    "创作"
  ],
  "priority": 24,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 20,
    "maxAge": 45,
    "historyChoicesAny": [
      {
        "eventId": "caught_gaming",
        "choiceId": "agree"
      },
      {
        "eventId": "caught_gaming",
        "choiceId": "hide"
      },
      {
        "eventId": "interest",
        "choiceId": "art"
      },
      {
        "eventId": "major",
        "choiceId": "like"
      },
      {
        "eventId": "band_stage",
        "choiceId": "play"
      },
      {
        "eventId": "esports_transition",
        "choiceId": "stream"
      }
    ],
    "stats": {
      "autonomy": {
        "min": 45
      }
    },
    "statesNone": {
      "work": {
        "status": "retired"
      }
    }
  },
  "description": "你试着讲解、演奏或聊聊自己的作品。在线人数像电梯楼层，开场白讲完，还没到二。",
  "choices": [
    {
      "id": "continue",
      "text": "给创作留固定时间，继续试",
      "resultText": "你认真安排下次内容。观众还少，也有人问了一句具体的问题。",
      "effects": {
        "money": -120,
        "happiness": 3,
        "stress": 3
      },
      "addTags": [
        "持续内容创作"
      ],
      "removeTags": [],
      "historyText": "你认真安排下次内容。观众还少，也有人问了一句具体的问题。",
      "importance": 2
    },
    {
      "id": "stop",
      "text": "留下一段录像，暂时不继续",
      "resultText": "镜头关掉了，尝试仍然属于你。你把时间留给别的安排。",
      "effects": {
        "autonomy": 3,
        "stress": -2
      },
      "addTags": [
        "试过直播"
      ],
      "removeTags": [],
      "historyText": "镜头关掉了，尝试仍然属于你。你把时间留给别的安排。",
      "importance": 2
    }
  ]
},
{
  "id": "stream_fulltime",
  "title": "观众增长以后",
  "category": "followup",
  "eventTags": [
    "特殊路线",
    "创作"
  ],
  "priority": 32,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 22,
    "maxAge": 48,
    "historyChoicesAll": [
      {
        "eventId": "stream_first",
        "choiceId": "continue"
      }
    ],
    "stats": {
      "money": {
        "min": 1000
      }
    },
    "statesNone": {
      "work": {
        "careerType": "streamer"
      }
    }
  },
  "description": "几次内容有了稳定回应，收入还没有。你算过一段缓冲预算，决定要不要把更多时间交给镜头。",
  "choices": [
    {
      "id": "fulltime",
      "text": "用有限预算试一段全职创作",
      "resultText": "你给尝试定了期限。收入有高有低，时间自由了，也开始需要自己管理停止工作的时刻。",
      "effects": {
        "money": -800,
        "autonomy": 5,
        "stress": 6
      },
      "addTags": [
        "特殊职业在岗",
        "主播职业经历"
      ],
      "removeTags": [],
      "historyText": "你给尝试定了期限。收入有高有低，时间自由了，也开始需要自己管理停止工作的时刻。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "employed",
          "careerType": "streamer",
          "level": 1,
          "workStyle": "flexible"
        }
      },
      "identity": "主播"
    },
    {
      "id": "parttime",
      "text": "继续做副业，保留另一份生活",
      "resultText": "更新慢一点，生活却有另一根支撑。创作不用一次变成全部收入。",
      "effects": {
        "money": 150,
        "happiness": 3
      },
      "addTags": [
        "内容作为副业"
      ],
      "removeTags": [],
      "historyText": "更新慢一点，生活却有另一根支撑。创作不用一次变成全部收入。",
      "importance": 2
    }
  ],
  "statReasons": {
    "money": "目前有一段试错预算"
  }
},
{
  "id": "stream_business",
  "title": "镜头前的合作邀请",
  "category": "random",
  "eventTags": [
    "特殊路线",
    "创作"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 3,
  "conditions": {
    "minAge": 24,
    "maxAge": 59,
    "states": {
      "work": {
        "status": "employed",
        "careerType": "streamer"
      }
    }
  },
  "description": "一份商业合作能补上淡季收入。对方给了话术，也给了比话术更长的修改意见。",
  "choices": [
    {
      "id": "accept",
      "text": "接受合作，说明广告边界",
      "resultText": "你得到一笔收入，也必须交付安排。观众的信任不能只靠一句‘家人们’。",
      "effects": {
        "money": 1400,
        "stress": 5,
        "family": -1
      },
      "addTags": [
        "创作接受合作"
      ],
      "removeTags": [],
      "historyText": "你得到一笔收入，也必须交付安排。观众的信任不能只靠一句‘家人们’。",
      "importance": 2
    },
    {
      "id": "decline",
      "text": "婉拒，继续自己的内容",
      "resultText": "你少了一笔收入，保留了表达的方向。自由仍需要支付本月的账单。",
      "effects": {
        "money": -150,
        "autonomy": 5,
        "happiness": 3
      },
      "addTags": [
        "创作保留方向"
      ],
      "removeTags": [],
      "historyText": "你少了一笔收入，保留了表达的方向。自由仍需要支付本月的账单。",
      "importance": 2
    }
  ]
},
{
  "id": "stream_online",
  "title": "自由职业也会忘记下线",
  "category": "random",
  "eventTags": [
    "特殊路线",
    "创作"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 2,
  "conditions": {
    "minAge": 24,
    "maxAge": 59,
    "states": {
      "work": {
        "status": "employed",
        "careerType": "streamer"
      }
    }
  },
  "description": "平台提醒你最近更新变少。弹幕意见很多，你却越来越难分清什么是反馈，什么只是刚好路过的声音。",
  "choices": [
    {
      "id": "schedule",
      "text": "缩短在线时间，公开更新节奏",
      "resultText": "收入少了一点，你有了不需要对着镜头解释的晚上。",
      "effects": {
        "money": -250,
        "health": 3,
        "stress": -7,
        "autonomy": 3
      },
      "addTags": [
        "创作有下线时间"
      ],
      "removeTags": [],
      "historyText": "收入少了一点，你有了不需要对着镜头解释的晚上。",
      "importance": 2
    },
    {
      "id": "chase",
      "text": "增加更新，先撑过这次波动",
      "resultText": "流量和报酬回暖，你的睡眠却没有跟着刷新。你仍能在下次重新谈节奏。",
      "effects": {
        "money": 900,
        "stress": 7,
        "health": -4
      },
      "addTags": [
        "创作持续在线"
      ],
      "removeTags": [],
      "historyText": "流量和报酬回暖，你的睡眠却没有跟着刷新。你仍能在下次重新谈节奏。",
      "importance": 2
    }
  ],
  "weightModifiers": [
    {
      "stats": {
        "stress": {
          "min": 60
        }
      },
      "multiplier": 3,
      "reason": "当前压力较高"
    }
  ]
},
{
  "id": "stream_midlife",
  "title": "还要不要继续按下开播",
  "category": "followup",
  "eventTags": [
    "特殊路线",
    "创作"
  ],
  "priority": 28,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 40,
    "maxAge": 59,
    "historyChoicesAny": [
      {
        "eventId": "stream_fulltime",
        "choiceId": "fulltime"
      },
      {
        "eventId": "esports_transition",
        "choiceId": "stream"
      }
    ],
    "states": {
      "work": {
        "status": "employed",
        "careerType": "streamer"
      }
    }
  },
  "description": "熟悉的镜头还在，生活里的时间已经换过几次用途。你不是只能在停播和拼命之间二选一。",
  "choices": [
    {
      "id": "slow",
      "text": "减少更新，继续靠内容工作",
      "resultText": "收入缩小，表达没有消失。你把持续创作改成可以长期承受的节奏。",
      "effects": {
        "money": -300,
        "stress": -6,
        "health": 3
      },
      "addTags": [
        "创作慢下来"
      ],
      "removeTags": [],
      "historyText": "收入缩小，表达没有消失。你把持续创作改成可以长期承受的节奏。",
      "importance": 2,
      "stateChanges": {
        "work": {
          "workStyle": "balanced"
        }
      }
    },
    {
      "id": "change",
      "text": "换普通岗位，让创作回到副业",
      "resultText": "你在新工作里重新适应，镜头不再负责每个月的全部收入。",
      "effects": {
        "money": 400,
        "autonomy": 5,
        "stress": -4
      },
      "addTags": [
        "内容作为副业"
      ],
      "removeTags": [
        "特殊职业在岗"
      ],
      "historyText": "你在新工作里重新适应，镜头不再负责每个月的全部收入。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "employed",
          "careerType": "general",
          "level": 1,
          "workStyle": "balanced"
        }
      },
      "identity": "普通工作者"
    }
  ]
},
{
  "id": "band_instrument",
  "title": "隔壁教室传来的和弦",
  "category": "conditional",
  "eventTags": [
    "特殊路线",
    "音乐"
  ],
  "priority": 15,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 14,
    "maxAge": 20,
    "historyChoicesAny": [
      {
        "eventId": "interest",
        "choiceId": "art"
      },
      {
        "eventId": "art_class",
        "choiceId": "join"
      },
      {
        "eventId": "art_class",
        "choiceId": "home"
      },
      {
        "eventId": "major",
        "choiceId": "like"
      }
    ]
  },
  "description": "有人借你一把旧吉他，先教三个和弦。兴趣不必只有一种，但练到手疼也不是电影里的蒙太奇。",
  "choices": [
    {
      "id": "learn",
      "text": "留一段时间学乐器",
      "resultText": "你慢慢能把一首歌连起来。课业和休息需要重新排，乐器也开始留下手的温度。",
      "effects": {
        "money": -180,
        "study": -2,
        "happiness": 5,
        "autonomy": 3
      },
      "addTags": [
        "学过乐器"
      ],
      "removeTags": [],
      "historyText": "你慢慢能把一首歌连起来。课业和休息需要重新排，乐器也开始留下手的温度。",
      "importance": 2
    },
    {
      "id": "listen",
      "text": "喜欢听歌，暂时不学",
      "resultText": "你留下歌单，把时间给眼前的安排。喜欢音乐并不需要先通过演奏考试。",
      "effects": {
        "happiness": 3,
        "study": 2
      },
      "addTags": [
        "收藏歌单"
      ],
      "removeTags": [],
      "historyText": "你留下歌单，把时间给眼前的安排。喜欢音乐并不需要先通过演奏考试。",
      "importance": 2
    }
  ]
},
{
  "id": "band_rehearsal",
  "title": "四个人和一间排练室",
  "category": "followup",
  "eventTags": [
    "特殊路线",
    "音乐"
  ],
  "priority": 35,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 18,
    "maxAge": 25,
    "historyChoicesAll": [
      {
        "eventId": "band_instrument",
        "choiceId": "learn"
      }
    ]
  },
  "description": "认识的几个人约着玩音乐。第一次排练，大家对‘从头再来’理解一致，对‘头在哪’理解不同。",
  "choices": [
    {
      "id": "join",
      "text": "定期一起排练",
      "resultText": "你们凑钱租了房间。没人知道会走到哪里，但下周有了一件想赴的约。",
      "effects": {
        "money": -150,
        "happiness": 5,
        "stress": 3
      },
      "addTags": [
        "认真玩过乐队"
      ],
      "removeTags": [],
      "historyText": "你们凑钱租了房间。没人知道会走到哪里，但下周有了一件想赴的约。",
      "importance": 2
    },
    {
      "id": "solo",
      "text": "自己继续练，暂时不加入",
      "resultText": "你保住时间上的自由，也少了合奏和商量的机会。",
      "effects": {
        "autonomy": 4,
        "happiness": 2
      },
      "addTags": [
        "独自练乐器"
      ],
      "removeTags": [],
      "historyText": "你保住时间上的自由，也少了合奏和商量的机会。",
      "importance": 2
    }
  ]
},
{
  "id": "band_stage",
  "title": "第一次演出，没有返场要求",
  "category": "followup",
  "eventTags": [
    "特殊路线",
    "音乐"
  ],
  "priority": 34,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 19,
    "maxAge": 28,
    "historyChoicesAll": [
      {
        "eventId": "band_rehearsal",
        "choiceId": "join"
      }
    ]
  },
  "description": "演出场地很小，熟人比售票系统勤快。台下有人跟着打拍子，那个瞬间不需要先变成事业。",
  "choices": [
    {
      "id": "play",
      "text": "演完这场，继续约下一次",
      "resultText": "出场费刚够路费。你们终于知道，台上的紧张和排练室的不一样。",
      "effects": {
        "money": 100,
        "happiness": 6,
        "stress": 4
      },
      "addTags": [
        "有过舞台"
      ],
      "removeTags": [],
      "historyText": "出场费刚够路费。你们终于知道，台上的紧张和排练室的不一样。",
      "importance": 2
    },
    {
      "id": "pause",
      "text": "演完告别，保留这段合奏",
      "resultText": "安排开始撞期。你们拍了合照，没有把暂停说成谁背叛了梦想。",
      "effects": {
        "happiness": 2,
        "autonomy": 4
      },
      "addTags": [
        "乐队暂别"
      ],
      "removeTags": [
        "认真玩过乐队"
      ],
      "historyText": "安排开始撞期。你们拍了合照，没有把暂停说成谁背叛了梦想。",
      "importance": 2
    }
  ]
},
{
  "id": "band_direction",
  "title": "毕业以后，谁还能来排练",
  "category": "followup",
  "eventTags": [
    "特殊路线",
    "音乐"
  ],
  "priority": 33,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 23,
    "maxAge": 32,
    "historyChoicesAll": [
      {
        "eventId": "band_stage",
        "choiceId": "play"
      }
    ],
    "tagsAll": [
      "认真玩过乐队"
    ],
    "stats": {
      "money": {
        "min": 600
      }
    }
  },
  "description": "成员陆续找工作。新的邀请能带来一些收入，也意味着不稳定的日程和共同承担的开销。",
  "choices": [
    {
      "id": "career",
      "text": "用一段预算试音乐工作",
      "resultText": "你开始靠演出与音乐工作谋生。作品不只属于下班后，收入也不总在约定的日期抵达。",
      "effects": {
        "money": -500,
        "autonomy": 5,
        "stress": 5
      },
      "addTags": [
        "特殊职业在岗",
        "音乐职业经历"
      ],
      "removeTags": [],
      "historyText": "你开始靠演出与音乐工作谋生。作品不只属于下班后，收入也不总在约定的日期抵达。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "employed",
          "careerType": "musician",
          "level": 1,
          "workStyle": "flexible"
        }
      },
      "identity": "音乐工作者"
    },
    {
      "id": "side",
      "text": "把乐队留作副业，商量固定排练",
      "resultText": "你们减少场次，保留相聚。稳定收入和音乐可以在同一个人生里存在。",
      "effects": {
        "money": -100,
        "happiness": 4,
        "stress": 1
      },
      "addTags": [
        "乐队作为副业"
      ],
      "removeTags": [],
      "historyText": "你们减少场次，保留相聚。稳定收入和音乐可以在同一个人生里存在。",
      "importance": 2
    }
  ],
  "statReasons": {
    "money": "有一小段音乐试错预算"
  }
},
{
  "id": "band_changes",
  "title": "凑不齐的排练时间",
  "category": "random",
  "eventTags": [
    "特殊路线",
    "音乐"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 4,
  "conditions": {
    "minAge": 28,
    "maxAge": 49,
    "historyChoicesAll": [
      {
        "eventId": "band_rehearsal",
        "choiceId": "join"
      }
    ],
    "tagsAll": [
      "认真玩过乐队"
    ]
  },
  "description": "群聊里的日程越来越难重合。没人变坏，几个人的生活只是长出了不同的安排。",
  "choices": [
    {
      "id": "adapt",
      "text": "减少演出，保留偶尔合奏",
      "resultText": "你们不再每周见面，仍保留一首能一起开始的歌。音乐不需要靠频率证明发生过。",
      "effects": {
        "money": -80,
        "happiness": 3,
        "stress": -3
      },
      "addTags": [
        "乐队偶尔相聚"
      ],
      "removeTags": [],
      "historyText": "你们不再每周见面，仍保留一首能一起开始的歌。音乐不需要靠频率证明发生过。",
      "importance": 2
    },
    {
      "id": "end",
      "text": "认真结束这一段，让工作换方向",
      "resultText": "大家说好不用把告别叫失败。你进入普通岗位，乐器可以留在家里。",
      "effects": {
        "money": 400,
        "autonomy": 4,
        "stress": -4
      },
      "addTags": [
        "乐队暂别"
      ],
      "removeTags": [
        "认真玩过乐队",
        "特殊职业在岗"
      ],
      "historyText": "大家说好不用把告别叫失败。你进入普通岗位，乐器可以留在家里。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "employed",
          "careerType": "general",
          "level": 1,
          "workStyle": "balanced"
        }
      },
      "identity": "普通工作者"
    }
  ]
},
{
  "id": "band_return",
  "title": "箱子里那把旧乐器",
  "category": "followup",
  "eventTags": [
    "特殊路线",
    "音乐"
  ],
  "priority": 18,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 40,
    "maxAge": 59,
    "historyChoicesAll": [
      {
        "eventId": "band_instrument",
        "choiceId": "learn"
      }
    ]
  },
  "description": "打开箱子时，一根弦松了。你能记得几个和弦，也记得当年是哪几个晚上把它们练熟的。",
  "choices": [
    {
      "id": "again",
      "text": "约人或自己，重新练一首歌",
      "resultText": "手指不如以前快，声音却还是从自己手里出来。你给今天留了一个位置。",
      "effects": {
        "money": -100,
        "happiness": 5,
        "stress": -3
      },
      "addTags": [
        "中年重新弹奏"
      ],
      "removeTags": [],
      "historyText": "手指不如以前快，声音却还是从自己手里出来。你给今天留了一个位置。",
      "importance": 2
    },
    {
      "id": "keep",
      "text": "修好收着，不为现在加任务",
      "resultText": "你照顾这件旧物，没有给自己再添一张进度表。那段音乐仍然存在。",
      "effects": {
        "money": -50,
        "happiness": 2,
        "autonomy": 3
      },
      "addTags": [
        "保存那段音乐"
      ],
      "removeTags": [],
      "historyText": "你照顾这件旧物，没有给自己再添一张进度表。那段音乐仍然存在。",
      "importance": 2
    }
  ]
}
);
