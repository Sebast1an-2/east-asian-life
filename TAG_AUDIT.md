# V0.2 阶段6：标签用途审计

History记过去，State记现在，Tags记持续特征。这次先清理展示，不冒险改写所有事件条件。

共140个原始标签：A持续倾向31、B重复状态6、C历史事实95、D流程标记8。27个原始标签参与事件条件。

- A：真正的倾向，但未必都适合显示。例如主动不婚/不育保留作选择保护，不给玩家贴价值标签。
- B：现实状态应由work / relationship / child / housing决定；旧重复标签保留兼容，玩家界面隐藏。
- C：可从History查出的事实。后续新事件优先写具体历史条件，旧依赖本轮不统一重写。
- D：控制候选或事件链。继续内部使用，不显示。

玩家界面使用tags.js的白名单，归并为19类，按最近一次相关选择排序，最多8条。未知标签默认隐藏；拥有“成就有自己的尺度”时不再显示旧的“习惯比较”。旧存档标签不删除、不重命名。

| 可见倾向 | 内部来源 |
|---|---|
| 保留好奇心 | 保留好奇心 |
| 愿意为自己说话 | 为自己说话、尝试表达边界 |
| 喜欢画画 | 喜欢画画 |
| 重视成绩 | 成绩优先、熟悉标准答案 |
| 习惯比较 | 习惯比较、在意排名 |
| 照顾自己 | 照顾自己、为休息让出时间 |
| 接纳自己 | 接纳自己 |
| 保留离线时间 | 保留离线时间、创作有下线时间 |
| 珍惜，不强留 | 珍惜不强留 |
| 给生活留时间 | 给生活留时间 |
| 经营关系 | 经营自己的关系网 |
| 关心也有边界 | 照顾有边界 |
| 用自己的尺度生活 | 成就有自己的尺度 |
| 愿意重新商量 | 代际约定可以重谈 |
| 重视兑现约定 | 代际约定重在兑现 |
| 游戏也是休闲 | 游戏留作休闲 |
| 愿意持续创作 | 持续内容创作、创作保留方向 |
| 喜欢音乐 | 收藏歌单、独自练乐器 |
| 保留私人空间 | 保留私人计划 |

以下为完整逐项清单。分类按当前实际用途；某些标签可能同时含有历史含义，不能仅凭名称判断。

| 原始标签 | 分类 | 产生/移除的选择 | 事件资格中的引用 |
|---|---|---|---|
| 保留好奇心 | A 持续倾向 | neighbor/mud | 无 |
| 为自己说话 | A 持续倾向 | score95/celebrate | 无 |
| 尝试表达边界 | A 持续倾向 | dorm_life/talk | 无 |
| 喜欢画画 | A 持续倾向 | interest/art、art_class/join; 移除：interest/math | 无 |
| 成绩优先 | A 持续倾向 | interest/math; 移除：old_album/draw | 无 |
| 熟悉标准答案 | A 持续倾向 | relatives_child/perform; 移除：relatives_adult/explain | 无 |
| 习惯比较 | A 持续倾向 | neighbor/learn | 无 |
| 在意排名 | A 持续倾向 | ranking/chase; 移除：young_ranking_echo/own_scale | 无 |
| 照顾自己 | A 持续倾向 | mock/rest、late_study/sleep | 无 |
| 为休息让出时间 | A 持续倾向 | stats_stress/rest | 无 |
| 接纳自己 | A 持续倾向 | home/keep | 无 |
| 保留离线时间 | A 持续倾向 | phone_request/negotiate; 移除：boss_message/reply | 无 |
| 创作有下线时间 | A 持续倾向 | stream_online/schedule | 无 |
| 珍惜不强留 | A 持续倾向 | best_friend/goodbye | 无 |
| 给生活留时间 | A 持续倾向 | young_free_evening/keep_time、mid_daily/own_time; 移除：young_job_change/higher_pay | 无 |
| 经营自己的关系网 | A 持续倾向 | young_single_life/own_circle、young_holiday/stay、young_parenthood_plan/no_child、mid_parenthood/no_child、mid_daily/connect | 无 |
| 照顾有边界 | A 持续倾向 | mid_parents_help/boundary; 移除：mid_parents_help/do_together | 无 |
| 成就有自己的尺度 | A 持续倾向 | mid_comparison_echo/own_scale; 移除：mid_comparison_echo/measure | mid_daily |
| 代际约定可以重谈 | A 持续倾向 | mid_response/review | 无 |
| 代际约定重在兑现 | A 持续倾向 | mid_response/keep | 无 |
| 游戏留作休闲 | A 持续倾向 | esports_amateur/hobby、esports_trial/decline | 无 |
| 持续内容创作 | A 持续倾向 | stream_first/continue | 无 |
| 创作保留方向 | A 持续倾向 | stream_business/decline | 无 |
| 收藏歌单 | A 持续倾向 | band_instrument/listen | 无 |
| 独自练乐器 | A 持续倾向 | band_rehearsal/solo | 无 |
| 保留私人计划 | A 持续倾向 | relatives_adult/redirect | 无 |
| 天生松弛 | A 持续倾向 | birth/sleep | 无 |
| 习惯随时回应 | A 持续倾向 | phone_request/accept; 移除：boss_message/morning | 无 |
| 持续练习游戏 | A 持续倾向 | esports_amateur/practice | 无 |
| 主动不婚 | A 持续倾向 | young_commitment/partner、young_commitment/independent; 移除：young_values/register、young_commitment/marry | young_commitment |
| 主动不生育 | A 持续倾向 | young_parenthood_plan/no_child、mid_parenthood/no_child; 移除：young_parenthood_plan/plan | young_parenthood_plan、mid_parenthood |
| 求职中 | B 当前状态 | young_direction/pause、young_career_crisis/leave、young_job_search/wait、mid_restart/prepare; 移除：young_job_search/restart、mid_restart/restart | 无 |
| 关系已结束 | B 当前状态 | young_values/breakup、young_commitment/independent; 移除：young_meet/date | 无 |
| 不登记的伴侣 | B 当前状态 | young_commitment/partner; 移除：young_values/breakup、young_values/register、young_commitment/marry、young_commitment/independent | 无 |
| 开始养育 | B 当前状态 | mid_parenthood/begin | 无 |
| 特殊职业在岗 | B 当前状态 | esports_trial/join、esports_transition/stream、stream_fulltime/fulltime、band_direction/career; 移除：esports_season/leave、esports_transition/coach、esports_transition/ordinary、stream_midlife/change、band_changes/end、late_retirement/retire、late_work/finish | boss_message、young_fast_track、young_free_evening、young_promotion、young_job_change、young_burnout、young_career_crisis、mid_work_pressure、mid_work_balance |
| 正式退休 | B 当前状态 | late_retirement/retire、late_work/finish | 无 |
| 暂缓进入职场 | D 内部流程 | young_direction/pause; 移除：young_job_search/restart | first_job |
| 争取晋升 | D 内部流程 | young_fast_track/take、young_free_evening/extra、young_job_change/higher_pay、young_burnout/push、young_ranking_echo/compete; 移除：young_fast_track/step_back、young_promotion/accept、young_promotion/decline、young_job_change/clear_hours、young_burnout/change、young_career_crisis/leave、young_career_crisis/transfer、young_job_search/restart、young_ranking_echo/own_scale、mid_work_pressure/ease、mid_restart/restart | young_promotion |
| 选择单身 | D 内部流程 | young_meet/single、young_values/breakup、young_commitment/independent、young_single_life/own_circle; 移除：young_meet/date、young_single_life/open | young_meet |
| 愿意谈未来 | D 内部流程 | young_values/align; 移除：young_meet/date、young_values/breakup、young_values/register、young_commitment/independent | young_commitment |
| 已讨论婚姻 | D 内部流程 | young_values/register、young_commitment/marry、young_commitment/partner、young_commitment/independent | 无 |
| 已讨论住房 | D 内部流程 | young_housing_choice/buy、young_housing_choice/keep_renting; 移除：young_rent/reconsider | young_housing_choice |
| 考虑成为父母 | D 内部流程 | young_parenthood_plan/plan; 移除：young_parenthood_plan/no_child、mid_parenthood/begin、mid_parenthood/pause、mid_parenthood/no_child | mid_parenthood |
| 认真玩过乐队 | D 内部流程 | band_rehearsal/join; 移除：band_stage/pause、band_changes/end | band_direction、band_changes |
| 响亮的开场 | C 历史事实 | birth/cry | 无 |
| 那5分的记忆 | C 历史事实 | score95/promise、score95/celebrate | home |
| 记得快乐 | C 历史事实 | weekend/play | 无 |
| 备考到底 | C 历史事实 | mock/push | 无 |
| 自主选专业 | C 历史事实 | major/like | 无 |
| 稳妥专业 | C 历史事实 | major/safe | 无 |
| 开始和解 | C 历史事实 | home/talk | 无 |
| 被寄予厚望 | C 历史事实 | first_plan/pen | 无 |
| 旧画册 | C 历史事实 | art_class/join、art_class/home | old_album |
| 钱交家里保管 | C 历史事实 | red_envelope/entrust; 移除：spring_home/cook、young_salary_echo/share、young_salary_echo/buffer | 无 |
| 练习自己管钱 | C 历史事实 | red_envelope/budget、first_freedom/save | 无 |
| 试着改写问答 | C 历史事实 | relatives_child/ask_back | 无 |
| 协商休闲时间 | C 历史事实 | caught_gaming/agree | 无 |
| 保持老友联系 | C 历史事实 | best_friend/keep | 无 |
| 练习自主安排 | C 历史事实 | first_freedom/explore | 无 |
| 真实回答期待 | C 历史事实 | relatives_adult/explain | 无 |
| 稳定工作起步 | C 历史事实 | first_job/steady | 无 |
| 高压工作起步 | C 历史事实 | first_job/flexible | 无 |
| 工作随时在线 | C 历史事实 | boss_message/reply; 移除：young_fast_track/step_back、young_promotion/decline、young_job_change/clear_hours、young_burnout/change、young_career_crisis/leave、mid_work_pressure/ease | 无 |
| 工作边界起步 | C 历史事实 | boss_message/morning、young_fast_track/step_back、young_job_change/clear_hours、young_burnout/change、young_job_search/restart、young_ranking_echo/own_scale | 无 |
| 用礼物表达关心 | C 历史事实 | spring_home/gift | 无 |
| 向家人说明预算 | C 历史事实 | spring_home/cook、young_salary_echo/buffer | 无 |
| 重新拾起画画 | C 历史事实 | old_album/draw | 无 |
| 珍藏旧兴趣 | C 历史事实 | old_album/keep | 无 |
| 先进入职场 | C 历史事实 | young_direction/apply | 无 |
| 暂缓晋升 | C 历史事实 | young_fast_track/step_back、young_promotion/decline、young_job_change/clear_hours、young_burnout/change、young_career_crisis/transfer、young_ranking_echo/own_scale; 移除：young_fast_track/take、young_free_evening/extra、young_job_change/higher_pay、young_ranking_echo/compete | 无 |
| 带团队起步 | C 历史事实 | young_promotion/accept | 无 |
| 协商共同生活 | C 历史事实 | young_married_daily/share | 无 |
| 第一次独立住 | C 历史事实 | young_move_out/rent | 无 |
| 在家留缓冲 | C 历史事实 | young_move_out/stay; 移除：young_move_out/rent、young_housing_choice/buy、young_housing_choice/keep_renting、young_decision_echo/own_plan | 无 |
| 租住也有生活 | C 历史事实 | young_rent/renew、young_housing_choice/keep_renting、young_home_care/sell_plan; 移除：young_housing_choice/buy | 无 |
| 住房预算优先 | C 历史事实 | young_rent/move_far | 无 |
| 工资自己安排 | C 历史事实 | young_salary_echo/share、young_salary_echo/buffer | 无 |
| 成年自己作主 | C 历史事实 | young_decision_echo/own_plan | 无 |
| 共同商量边界 | C 历史事实 | young_decision_echo/joint_plan | 无 |
| 暂缓育儿 | C 历史事实 | mid_parenthood/pause | 无 |
| 中年继续争取 | C 历史事实 | mid_work_pressure/lead、mid_work_balance/try_lead; 移除：mid_work_pressure/ease | 无 |
| 中年调整节奏 | C 历史事实 | mid_work_pressure/ease; 移除：mid_work_pressure/lead、mid_work_balance/try_lead | 无 |
| 团队保护离线 | C 历史事实 | mid_boundary_echo/wait; 移除：mid_boundary_echo/send | mid_work_pressure、mid_work_balance |
| 团队允许临时急件 | C 历史事实 | mid_boundary_echo/send; 移除：mid_boundary_echo/wait | mid_work_pressure |
| 专业岗位深耕 | C 历史事实 | mid_work_balance/expert | 无 |
| 中年重新开始 | C 历史事实 | mid_restart/restart | 无 |
| 陪父母学新事 | C 历史事实 | mid_parents_help/do_together; 移除：mid_parents_help/boundary | 无 |
| 晚辈自己决定 | C 历史事实 | mid_decision_echo/space; 移除：mid_decision_echo/guide | mid_parents_help、mid_response |
| 中年为画画留时间 | C 历史事实 | mid_interest_echo/practice; 移除：mid_interest_echo/keep | mid_daily |
| 中年老友重逢 | C 历史事实 | mid_friend_echo/meet; 移除：mid_friend_echo/message | mid_daily |
| 中年仍用指标规划 | C 历史事实 | mid_comparison_echo/measure; 移除：mid_comparison_echo/own_scale | mid_daily |
| 团圆可以另约 | C 历史事实 | mid_holiday_echo/flexible; 移除：mid_holiday_echo/gather | mid_daily |
| 代际继续追五分 | C 历史事实 | mid_score_echo/check; 移除：mid_score_echo/listen | mid_response |
| 代际先听努力 | C 历史事实 | mid_score_echo/listen; 移除：mid_score_echo/check | mid_response |
| 中年收藏兴趣 | C 历史事实 | mid_interest_echo/keep; 移除：mid_interest_echo/practice | 无 |
| 代管钱也说清去向 | C 历史事实 | mid_money_echo/hold; 移除：mid_money_echo/budget | mid_response |
| 给晚辈管钱空间 | C 历史事实 | mid_money_echo/budget; 移除：mid_money_echo/hold | mid_response |
| 饭桌仍问规划 | C 历史事实 | mid_table_echo/ask; 移除：mid_table_echo/privacy | mid_response |
| 饭桌保留隐私 | C 历史事实 | mid_table_echo/privacy; 移除：mid_table_echo/ask | mid_response |
| 给晚辈稳妥建议 | C 历史事实 | mid_decision_echo/guide; 移除：mid_decision_echo/space | mid_response |
| 中年各自珍重 | C 历史事实 | mid_friend_echo/message; 移除：mid_friend_echo/meet | 无 |
| 团圆有邀请无欠条 | C 历史事实 | mid_holiday_echo/gather; 移除：mid_holiday_echo/flexible | 无 |
| 职业选手经历 | C 历史事实 | esports_trial/join | 无 |
| 电竞争取首发 | C 历史事实 | esports_season/push | 无 |
| 电竞调整训练 | C 历史事实 | esports_season/adjust | 无 |
| 电竞已退役 | C 历史事实 | esports_season/leave、esports_transition/coach、esports_transition/stream、esports_transition/ordinary | 无 |
| 愿意传递电竞经验 | C 历史事实 | esports_analysis/teach | 无 |
| 电竞专注赛场 | C 历史事实 | esports_analysis/focus | 无 |
| 电竞经验传递 | C 历史事实 | esports_transition/coach、esports_second_life/share | 无 |
| 主播职业经历 | C 历史事实 | esports_transition/stream、stream_fulltime/fulltime | 无 |
| 赛场之外有生活 | C 历史事实 | esports_second_life/own | 无 |
| 试过直播 | C 历史事实 | stream_first/stop | 无 |
| 内容作为副业 | C 历史事实 | stream_fulltime/parttime、stream_midlife/change | 无 |
| 创作接受合作 | C 历史事实 | stream_business/accept | 无 |
| 创作持续在线 | C 历史事实 | stream_online/chase | 无 |
| 创作慢下来 | C 历史事实 | stream_midlife/slow | 无 |
| 学过乐器 | C 历史事实 | band_instrument/learn | 无 |
| 有过舞台 | C 历史事实 | band_stage/play | 无 |
| 乐队暂别 | C 历史事实 | band_stage/pause、band_changes/end | 无 |
| 音乐职业经历 | C 历史事实 | band_direction/career | 无 |
| 乐队作为副业 | C 历史事实 | band_direction/side | 无 |
| 乐队偶尔相聚 | C 历史事实 | band_changes/adapt | 无 |
| 中年重新弹奏 | C 历史事实 | band_return/again | 无 |
| 保存那段音乐 | C 历史事实 | band_return/keep | 无 |
| 逐渐离开工作 | C 历史事实 | late_retirement/gradual | 无 |
| 晚年限定工时 | C 历史事实 | late_work/part | 无 |
| 晚年有留白 | C 历史事实 | late_new_days/routine | 无 |
| 晚年有约 | C 历史事实 | late_new_days/meet | 无 |
| 晚年新的往来 | C 历史事实 | late_daily/outside | 无 |
| 晚年保留自己 | C 历史事实 | late_daily/own | 无 |
| 晚年仍在学习 | C 历史事实 | late_interest/learn | 无 |
| 晚年联系有余地 | C 历史事实 | late_children/invite | 无 |
| 晚年会提出需要 | C 历史事实 | late_children/tell | 无 |
| 晚年赛场回声 | C 历史事实 | late_esports_echo/watch | 无 |
| 晚年游戏仍属于自己 | C 历史事实 | late_esports_echo/play | 无 |
| 晚年镜头回声 | C 历史事实 | late_stream_echo/reply | 无 |
| 保存创作片段 | C 历史事实 | late_stream_echo/private | 无 |
| 晚年又有合奏 | C 历史事实 | late_band_echo/reunion | 无 |
| 晚年音乐回应 | C 历史事实 | late_band_echo/send | 无 |
