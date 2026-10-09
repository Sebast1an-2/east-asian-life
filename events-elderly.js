// 12个晚年候选 + 3个跨成年/晚年的属性阈值候选。
// 退休不由年龄自动覆盖；子女、伴侣和特殊职业回声都读取真实状态/经历。
EVENTS.push(
{
  "id": "late_retirement",
  "title": "把工牌放到桌上",
  "category": "followup",
  "eventTags": [
    "晚年",
    "退休"
  ],
  "priority": 80,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 60,
    "maxAge": 75,
    "states": {
      "work": {
        "status": "employed"
      }
    }
  },
  "description": "有人问退休后的计划。你发现，离开一份工作不是立刻学会怎样度过每一个早晨。",
  "choices": [
    {
      "id": "retire",
      "text": "正式离开工作，重新安排生活",
      "resultText": "你办理了退休，把常用联系方式留好。简化退休生活收入每月1800元，新的时间安排需要慢慢找。",
      "effects": {
        "stress": -8,
        "happiness": 3
      },
      "addTags": [
        "正式退休"
      ],
      "removeTags": [
        "特殊职业在岗"
      ],
      "historyText": "你办理了退休，把常用的联系方式留好。时间多了，新的安排需要慢慢找。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "retired"
        }
      },
      "identity": "退休者"
    },
    {
      "id": "gradual",
      "text": "减少工作，先把任务交接出去",
      "resultText": "你暂时保留工作，减少忙碌。不必在一夜之间从所有事情里消失。",
      "effects": {
        "stress": -5,
        "health": 2
      },
      "addTags": [
        "逐渐离开工作"
      ],
      "removeTags": [],
      "historyText": "你暂时保留工作，减少忙碌。不必在一夜之间从所有事情里消失。",
      "importance": 2,
      "stateChanges": {
        "work": {
          "workStyle": "balanced"
        }
      },
      "monthlyIncome": 2400
    }
  ],
  "isMajorNode": true
},
{
  "id": "late_work",
  "title": "经验还在，工时可以商量",
  "category": "random",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 3,
  "conditions": {
    "minAge": 60,
    "maxAge": 110,
    "states": {
      "work": {
        "status": "employed"
      }
    }
  },
  "description": "有人还愿意请你帮忙。报价和时间可以重新谈，你也可以选择让工作正式结束。",
  "choices": [
    {
      "id": "part",
      "text": "保留少量工作，限定时间",
      "resultText": "经验换来一些报酬，你也留出自己的安排。工作不必重新占满一周。",
      "effects": {
        "stress": 2,
        "autonomy": 3
      },
      "addTags": [
        "晚年限定工时"
      ],
      "removeTags": [],
      "historyText": "经验换来一些报酬，你也留出自己的安排。工作不必重新占满一周。",
      "importance": 2,
      "stateChanges": {
        "work": {
          "workStyle": "balanced"
        }
      },
      "monthlyIncome": 2000
    },
    {
      "id": "finish",
      "text": "完成交接，正式退休",
      "resultText": "你留下说明，然后把新消息交给接手的人。后来仍可以关心，但不用随时回应。",
      "effects": {
        "stress": -5,
        "happiness": 3
      },
      "addTags": [
        "正式退休"
      ],
      "removeTags": [
        "特殊职业在岗"
      ],
      "historyText": "你留下说明，然后把新消息交给接手的人。后来仍可以关心，但不用随时回应。",
      "importance": 3,
      "stateChanges": {
        "work": {
          "status": "retired"
        }
      },
      "identity": "退休者"
    }
  ]
},
{
  "id": "late_new_days",
  "title": "没有打卡的第一个星期",
  "category": "followup",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 25,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 60,
    "maxAge": 110,
    "states": {
      "work": {
        "status": "retired"
      }
    }
  },
  "description": "早上醒来，手机没有提醒你赶路。自由有点陌生，你差点给自己做一张退休绩效表。",
  "choices": [
    {
      "id": "routine",
      "text": "安排活动，也留几天空白",
      "resultText": "你给散步和学习留位置，也允许某天没有成果。",
      "effects": {
        "health": 3,
        "happiness": 4,
        "stress": -3
      },
      "addTags": [
        "晚年有留白"
      ],
      "removeTags": [],
      "historyText": "你给散步和学习留位置，也允许某天没有成果。",
      "importance": 2
    },
    {
      "id": "meet",
      "text": "和人约定一起做一点事",
      "resultText": "有了赴约的理由，也要配合别人的时间。生活重新长出一些轻松的牵挂。",
      "effects": {
        "happiness": 5,
        "money": -60,
        "family": 2
      },
      "addTags": [
        "晚年有约"
      ],
      "removeTags": [],
      "historyText": "有了赴约的理由，也要配合别人的时间。生活重新长出一些轻松的牵挂。",
      "importance": 2,
      "cashReason": "一起活动的费用"
    }
  ]
},
{
  "id": "late_daily",
  "title": "今天也可以重新安排",
  "category": "random",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 0,
  "weight": 5,
  "repeatable": true,
  "cooldown": 1,
  "conditions": {
    "minAge": 60,
    "maxAge": 110
  },
  "description": "早餐以后，日程没有自动填满。一个普通的下午，可以去社区，也可以在家慢慢把一件小事做完。",
  "choices": [
    {
      "id": "outside",
      "text": "出门认识新朋友，参加一次活动",
      "resultText": "你听到一些新名字，也花了一点路费。聊不来的人仍可以礼貌告别。",
      "effects": {
        "happiness": 4,
        "health": 2,
        "money": -40
      },
      "addTags": [
        "晚年新的往来"
      ],
      "removeTags": [],
      "historyText": "你听到一些新名字，也花了一点路费。聊不来的人仍可以礼貌告别。",
      "importance": 2,
      "cashReason": "社区活动与路费"
    },
    {
      "id": "own",
      "text": "留在自己的节奏里",
      "resultText": "你把一件想做的小事做完，没有给它评等级。安静不是空白。",
      "effects": {
        "happiness": 3,
        "stress": -3,
        "autonomy": 2
      },
      "addTags": [
        "晚年保留自己"
      ],
      "removeTags": [],
      "historyText": "你把一件想做的小事做完，没有给它评等级。安静不是空白。",
      "importance": 2
    }
  ]
},
{
  "id": "late_body",
  "title": "脚步有了新的速度",
  "category": "random",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 2,
  "conditions": {
    "minAge": 60,
    "maxAge": 110
  },
  "description": "从前一口气走完的路，现在多了一张可以坐下的长椅。调整路线不等于取消出门。",
  "choices": [
    {
      "id": "adjust",
      "text": "换舒适的安排，保持适合的活动",
      "resultText": "你花钱调整用品，也承认休息是日程的一部分。今天还可以走到想去的地方。",
      "effects": {
        "money": -100,
        "health": 5,
        "stress": -3
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "你花钱调整用品，也承认休息是日程的一部分。今天还可以走到想去的地方。",
      "importance": 2,
      "cashReason": "舒适用品与活动安排"
    },
    {
      "id": "accompany",
      "text": "请人一起走，慢慢到达",
      "resultText": "速度放缓了，也多听到一段别人的故事。你们约好累了就坐下。",
      "effects": {
        "health": 2,
        "happiness": 4,
        "family": 2,
        "money": -30
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "速度放缓了，也多听到一段别人的故事。你们约好累了就坐下。",
      "importance": 2,
      "cashReason": "同行路费"
    }
  ],
  "weightModifiers": [
    {
      "stats": {
        "health": {
          "max": 45
        }
      },
      "multiplier": 4,
      "reason": "当前健康状况较低"
    }
  ]
},
{
  "id": "late_interest",
  "title": "重新当一次初学者",
  "category": "random",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 3,
  "conditions": {
    "minAge": 60,
    "maxAge": 110
  },
  "description": "活动室的报名表没问年龄。你可以继续熟悉的兴趣，也可以选一个以前没有空学的东西。",
  "choices": [
    {
      "id": "learn",
      "text": "给兴趣留时间，允许从头学",
      "resultText": "你学得慢一点，也笑得真实。喜欢一件事不用附带一个成功证明。",
      "effects": {
        "money": -100,
        "happiness": 5,
        "study": 2,
        "autonomy": 2
      },
      "addTags": [
        "晚年仍在学习"
      ],
      "removeTags": [],
      "historyText": "你学得慢一点，也笑得真实。喜欢一件事不用附带一个成功证明。",
      "importance": 2,
      "cashReason": "兴趣学习费用"
    },
    {
      "id": "watch",
      "text": "先旁听，把时间留得松一点",
      "resultText": "你认识了几个人，没有急着给自己加练习任务。好奇心也可以慢慢来。",
      "effects": {
        "happiness": 3,
        "stress": -2
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "你认识了几个人，没有急着给自己加练习任务。好奇心也可以慢慢来。",
      "importance": 2
    }
  ],
  "descriptionDetails": [
    {
      "conditions": {
        "historyChoicesAny": [
          {
            "eventId": "interest",
            "choiceId": "art"
          },
          {
            "eventId": "mid_interest_echo",
            "choiceId": "practice"
          }
        ]
      },
      "text": "你记得曾为画画留过时间，这次不用再和成绩单争。"
    },
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "interest",
            "choiceId": "math"
          },
          {
            "eventId": "mid_interest_echo",
            "choiceId": "practice"
          }
        ]
      },
      "text": "年轻时放下的画笔，中年曾经重新拿起，如今还可以接着画。"
    }
  ],
  "weightModifiers": [
    {
      "stats": {
        "happiness": {
          "min": 65
        }
      },
      "multiplier": 2,
      "reason": "目前愿意尝试新的生活体验"
    }
  ]
},
{
  "id": "late_friend",
  "title": "朋友的近况，不只有体检",
  "category": "random",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 3,
  "conditions": {
    "minAge": 60,
    "maxAge": 110
  },
  "description": "认识的人约见面，有人带了新照片，有人讲最近学会的菜。身体的话题聊过，饭还是得趁热吃。",
  "choices": [
    {
      "id": "meet",
      "text": "约见面，把聊天留到饭后",
      "resultText": "有的人仍联系，有的人新近认识。你们不需要每次都证明年轻时有多厉害。",
      "effects": {
        "happiness": 5,
        "money": -80,
        "stress": -2
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "有的人仍联系，有的人新近认识。你们不需要每次都证明年轻时有多厉害。",
      "importance": 2,
      "cashReason": "朋友见面开销"
    },
    {
      "id": "call",
      "text": "换成通话，约一个合适的时间",
      "resultText": "见面的路暂时省了，惦记没有省。下次是否见面还可以再约。",
      "effects": {
        "happiness": 3,
        "autonomy": 2
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "见面的路暂时省了，惦记没有省。下次是否见面还可以再约。",
      "importance": 2
    }
  ],
  "descriptionDetails": [
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "best_friend",
            "choiceId": "keep"
          }
        ]
      },
      "text": "那次转学时你答应保持联系。有没有按月做到，历史没替你记下，但这份约定你还认得。"
    },
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "best_friend",
            "choiceId": "goodbye"
          }
        ]
      },
      "text": "当年没有约定固定联系，也不妨碍如今再问一句近况。"
    }
  ]
},
{
  "id": "late_partner",
  "title": "相伴以后，还要商量",
  "category": "random",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 3,
  "conditions": {
    "minAge": 60,
    "maxAge": 110,
    "statesNone": {
      "relationship": {
        "status": "single"
      }
    }
  },
  "description": "在一起久了，日程也不会自动一致。你们一个想出门，一个想在家，需要重新谈怎样一起过，也怎样各自过。",
  "choices": [
    {
      "id": "together",
      "text": "一起安排共同的时间",
      "resultText": "你们各让出一点安排，找到了一个都能接受的下午。",
      "effects": {
        "family": 4,
        "happiness": 3,
        "money": -60
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "你们各让出一点安排，找到了一个都能接受的下午。",
      "importance": 2,
      "cashReason": "共同活动费用"
    },
    {
      "id": "space",
      "text": "各做喜欢的事，再约一顿饭",
      "resultText": "分开活动没有取消相伴。晚上有了新的事情可以讲。",
      "effects": {
        "autonomy": 4,
        "happiness": 3,
        "family": 1
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "分开活动没有取消相伴。晚上有了新的事情可以讲。",
      "importance": 2
    }
  ]
},
{
  "id": "late_children",
  "title": "这次等谁的消息",
  "category": "random",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 3,
  "conditions": {
    "minAge": 60,
    "maxAge": 110,
    "states": {
      "child": {
        "hasChild": true
      }
    },
    "childAge": {
      "min": 18
    }
  },
  "description": "孩子有自己的安排。你看着未读消息，想起自己当年也曾忙到不知道怎么回答家里的问候。",
  "choices": [
    {
      "id": "invite",
      "text": "问方便的时间，不替他们填日程",
      "resultText": "你们约了一次联系。关心可以认真说，也不必总追着结果走。",
      "effects": {
        "family": 5,
        "happiness": 3,
        "autonomy": 2
      },
      "addTags": [
        "晚年联系有余地"
      ],
      "removeTags": [],
      "historyText": "你们约了一次联系。关心可以认真说，也不必总追着结果走。",
      "importance": 2
    },
    {
      "id": "tell",
      "text": "说清自己的需要，一起商量",
      "resultText": "你说明想有人陪着办的事，也接受对方不是随时有空。",
      "effects": {
        "family": 4,
        "stress": -2,
        "money": -50
      },
      "addTags": [
        "晚年会提出需要"
      ],
      "removeTags": [],
      "historyText": "你说明想有人陪着办的事，也接受对方不是随时有空。",
      "importance": 2,
      "cashReason": "办事与联系开销"
    }
  ],
  "weightModifiers": [
    {
      "stats": {
        "family": {
          "max": 40
        }
      },
      "multiplier": 3,
      "reason": "目前家庭关系需要重新沟通"
    }
  ]
},
{
  "id": "late_esports_echo",
  "title": "年轻人的比赛还在继续",
  "category": "followup",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 22,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 60,
    "maxAge": 110,
    "historyChoicesAll": [
      {
        "eventId": "esports_trial",
        "choiceId": "join"
      }
    ]
  },
  "description": "比赛转播换了新人。看见他们坐到设备前，你想起自己确实在那里度过了一段职业人生。",
  "choices": [
    {
      "id": "watch",
      "text": "和人看一场，讲讲当年的细节",
      "resultText": "讲完战术，你们也讲了当年那顿赛后的饭。不是只有冠军才能有故事。",
      "effects": {
        "happiness": 5,
        "study": 2
      },
      "addTags": [
        "晚年赛场回声"
      ],
      "removeTags": [],
      "historyText": "讲完战术，你们也讲了当年那顿赛后的饭。不是只有冠军才能有故事。",
      "importance": 2
    },
    {
      "id": "play",
      "text": "让手再放到键盘上，玩一小局",
      "resultText": "反应慢了，熟悉的声音还在。今天这局没有合同和名单要证明。",
      "effects": {
        "happiness": 4,
        "autonomy": 3
      },
      "addTags": [
        "晚年游戏仍属于自己"
      ],
      "removeTags": [],
      "historyText": "反应慢了，熟悉的声音还在。今天这局没有合同和名单要证明。",
      "importance": 2
    }
  ],
  "descriptionDetails": [
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "esports_transition",
            "choiceId": "coach"
          }
        ]
      },
      "text": "退役后你把复盘经验教给过别人，那也是赛场之外的工作。"
    },
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "esports_transition",
            "choiceId": "stream"
          }
        ]
      },
      "text": "退役后你曾把比赛的理解带进直播，镜头是另一段开始。"
    },
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "esports_season",
            "choiceId": "leave"
          }
        ]
      },
      "text": "你曾主动结束比赛合同，后来的人生没有被那次离开取消。"
    }
  ]
},
{
  "id": "late_stream_echo",
  "title": "旧录像下面的新留言",
  "category": "followup",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 21,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 60,
    "maxAge": 110,
    "historyChoicesAny": [
      {
        "eventId": "stream_first",
        "choiceId": "continue"
      },
      {
        "eventId": "stream_first",
        "choiceId": "stop"
      },
      {
        "eventId": "esports_transition",
        "choiceId": "stream"
      }
    ]
  },
  "description": "旧内容下面出现新留言。曾经对着镜头说过的话，现在仍能被一个陌生人碰见。",
  "choices": [
    {
      "id": "reply",
      "text": "回复一句近况，不承诺恢复更新",
      "resultText": "你告诉对方如今的生活。回应可以是一句感谢，不需要变成下一次排期。",
      "effects": {
        "happiness": 4,
        "autonomy": 3
      },
      "addTags": [
        "晚年镜头回声"
      ],
      "removeTags": [],
      "historyText": "你告诉对方如今的生活。回应可以是一句感谢，不需要变成下一次排期。",
      "importance": 2
    },
    {
      "id": "private",
      "text": "保存下来，给自己看看",
      "resultText": "你关掉公开页面，把那段声音留给自己。观看次数不是它的全部意义。",
      "effects": {
        "happiness": 3,
        "stress": -2
      },
      "addTags": [
        "保存创作片段"
      ],
      "removeTags": [],
      "historyText": "你关掉公开页面，把那段声音留给自己。观看次数不是它的全部意义。",
      "importance": 2
    }
  ],
  "descriptionDetails": [
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "stream_fulltime",
            "choiceId": "fulltime"
          }
        ]
      },
      "text": "你曾让内容承担收入，也知道自由和持续在线可以同时出现。"
    },
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "stream_fulltime",
            "choiceId": "parttime"
          }
        ]
      },
      "text": "你曾选择把创作留作副业，那份取舍也留下了作品。"
    }
  ]
},
{
  "id": "late_band_echo",
  "title": "那首歌，还能从头一起开始",
  "category": "followup",
  "eventTags": [
    "晚年",
    "生活"
  ],
  "priority": 20,
  "weight": 3,
  "repeatable": false,
  "cooldown": 0,
  "conditions": {
    "minAge": 60,
    "maxAge": 110,
    "historyChoicesAll": [
      {
        "eventId": "band_rehearsal",
        "choiceId": "join"
      }
    ]
  },
  "description": "旧群聊突然有人发来一个和弦。有人想见面，有人只能远程；音乐还能找到新的相聚方式。",
  "choices": [
    {
      "id": "reunion",
      "text": "见面或远程，再合奏一次",
      "resultText": "你们节奏没有完全对齐，笑声倒是一致。没有宣布复出，只认真玩了一首歌。",
      "effects": {
        "money": -100,
        "happiness": 6
      },
      "addTags": [
        "晚年又有合奏"
      ],
      "removeTags": [],
      "historyText": "你们节奏没有完全对齐，笑声倒是一致。没有宣布复出，只认真玩了一首歌。",
      "importance": 2,
      "cashReason": "再合奏的路费与准备费用"
    },
    {
      "id": "send",
      "text": "录一小段回应，各自继续生活",
      "resultText": "合奏不必只有一间排练室。发出声音，也把自己的安排留住了。",
      "effects": {
        "happiness": 4,
        "autonomy": 3
      },
      "addTags": [
        "晚年音乐回应"
      ],
      "removeTags": [],
      "historyText": "合奏不必只有一间排练室。发出声音，也把自己的安排留住了。",
      "importance": 2
    }
  ],
  "descriptionDetails": [
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "band_direction",
            "choiceId": "career"
          }
        ]
      },
      "text": "曾经靠音乐工作，后来怎样转向，都没有擦掉那段演出。"
    },
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "band_direction",
            "choiceId": "side"
          }
        ]
      },
      "text": "你们曾把乐队留作副业，音乐和别的工作一起存在过。"
    },
    {
      "conditions": {
        "historyChoicesAll": [
          {
            "eventId": "band_changes",
            "choiceId": "end"
          }
        ]
      },
      "text": "曾经认真告别，也不妨碍现在回应一个和弦。"
    }
  ]
},
{
  "id": "stats_stress",
  "title": "疲惫没有自动结清",
  "category": "random",
  "eventTags": [
    "健康",
    "边界"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 3,
  "conditions": {
    "minAge": 23,
    "maxAge": 110,
    "stats": {
      "stress": {
        "min": 60
      }
    }
  },
  "statReasons": {
    "stress": "当前压力较高"
  },
  "description": "休息日也在反复想着下一件事。日程看起来还撑得住，你却很难真正停下来。",
  "choices": [
    {
      "id": "rest",
      "text": "减少一个安排，给休息付出实际时间",
      "resultText": "你推迟了一件事，花一点钱安排真正的休息。休息终于不只是待办事项的最后一行。",
      "effects": {
        "stress": -12,
        "health": 4,
        "money": -100
      },
      "addTags": [
        "为休息让出时间"
      ],
      "removeTags": [],
      "historyText": "你推迟了一件事，也少赚一点。休息终于不只是待办事项的最后一行。",
      "importance": 2,
      "cashReason": "休息活动费用"
    },
    {
      "id": "support",
      "text": "找人商量，把任务拆开",
      "resultText": "你花时间说明压力，不保证别人立刻懂。至少事情不再只有一个人知道。",
      "effects": {
        "stress": -8,
        "family": 3,
        "happiness": 2
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "你花时间说明压力，不保证别人立刻懂。至少事情不再只有一个人知道。",
      "importance": 2
    }
  ]
},
{
  "id": "stats_health",
  "title": "身体要求你换一种安排",
  "category": "random",
  "eventTags": [
    "健康",
    "自我"
  ],
  "priority": 0,
  "weight": 4,
  "repeatable": true,
  "cooldown": 3,
  "conditions": {
    "minAge": 36,
    "maxAge": 110,
    "stats": {
      "health": {
        "max": 45
      }
    }
  },
  "statReasons": {
    "health": "当前健康状况较低"
  },
  "description": "一些普通安排做起来比以前费力。你需要认真调整，而不是只把提醒框关掉。这里没有诊断，只有今天的身体感受。",
  "choices": [
    {
      "id": "care",
      "text": "安排检查与休息，调整活动",
      "resultText": "你花钱和时间照顾自己，没有立刻恢复所有精力。新的节奏需要持续。",
      "effects": {
        "money": -200,
        "health": 7,
        "stress": -4
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "你花钱和时间照顾自己，没有立刻恢复所有精力。新的节奏需要持续。",
      "importance": 2,
      "cashReason": "检查与休息安排费用"
    },
    {
      "id": "reduce",
      "text": "先减少负担，请人一起安排",
      "resultText": "你让出一部分事情，承认现在需要帮助。健康变化可以被照顾，不等于立刻走到终点。",
      "effects": {
        "health": 4,
        "family": 2,
        "autonomy": 2
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "你让出一部分事情，承认现在需要帮助。健康变化可以被照顾，不等于立刻走到终点。",
      "importance": 2
    }
  ]
},
{
  "id": "stats_family",
  "title": "没说清楚的话，还在消息里",
  "category": "random",
  "eventTags": [
    "家庭",
    "边界"
  ],
  "priority": 0,
  "weight": 3,
  "repeatable": true,
  "cooldown": 4,
  "conditions": {
    "minAge": 23,
    "maxAge": 110,
    "stats": {
      "family": {
        "max": 40
      }
    }
  },
  "statReasons": {
    "family": "目前家庭关系比较紧张"
  },
  "description": "联系还在，话却常常绕着真正的问题走。你可以尝试靠近，也可以把相处的边界先说明白。",
  "choices": [
    {
      "id": "talk",
      "text": "约一段时间，听完也说清楚",
      "resultText": "这次谈话没有解决全部分歧，但少了一点猜测。你们仍需要时间。",
      "effects": {
        "family": 7,
        "stress": 3,
        "autonomy": 2
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "这次谈话没有解决全部分歧，但少了一点猜测。你们仍需要时间。",
      "importance": 2
    },
    {
      "id": "boundary",
      "text": "保持适当距离，说明能做到的事",
      "resultText": "距离给了你空间，关系的修复也会慢一点。关心不一定要用全天在线证明。",
      "effects": {
        "family": 3,
        "autonomy": 5,
        "stress": -3
      },
      "addTags": [],
      "removeTags": [],
      "historyText": "距离给了你空间，关系的修复也会慢一点。关心不一定要用全天在线证明。",
      "importance": 2
    }
  ]
}
);
