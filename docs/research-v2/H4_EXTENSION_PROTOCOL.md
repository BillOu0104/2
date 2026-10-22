# 固定补齐h4到128：确认后数值诊断

2026-10-22，在精度扩展256条结束并重审计后制定。不是新的独立确认，不对控制器调参，不改变先前确认/精度协议及成绩。触发依据见PRECISION_EXTENSION_RESULTS.md和results/precision-extension/precision-review.json。转向128配对h2-default成熟恒纪元仍有+8.23个百分点差值；h4仅32样本，不足以拆分长期混沌方差和数值偏差。

固定计划：V2-CONFIRM-20261021-32..127，两候选deflect4-trigger8__h4、reflect-trigger8__h4，参数与已完成前32个h4逐项相同，dt=.0001875、eta=.001875。12批×8Seed×2，共192条新模拟。每条实际积分100000显示年/45000求解器单位/至少2.4亿名义步；成熟期固定10000年之后。

科学源7f64a8a、二进制cf2117ac290bea83d6cfbdb07f98888412d594024e295887bc537bce5132f091、初始化、真实半径、三星失败/P5重生/纪元/文明/条件影子、控制触发和参数均不改。不从h4中筛选成功Seed，不将h4变成主确认，不用不同Seed的1000/10000年片段拼成100000年。

只用现有两CPU、两worker，无付费资源。每批流式保留全部原始事件/失败/UNKNOWN、每Seed所有预算和完整恢复状态，核对配置/科学源/二进制/原始/index/状态/输入/初值SHA，无重复完成键。UNKNOWN、哈希和原始初值异常停下评审，不冒充死亡或成功。每批Git/records/check和push，失败推送单独记录。

完成后合并已有前32的h4和新增96，仅组成数值比较的128个h4；保留每行不同批次configHash，绝不假造统一配置。bootstrap20000次、随机种子20261022，配对比较三种精度的同一128Seed、分布、混沌联合及控制成本。全部不足样本保留，相关性和诊断翻转可作探索性分析。无预设最终等价界限，不把不显著当作等价，不自动进入正式替换；仍敏感时要继续报告限制并分析机制。

## 恢复

先按STATUS核对活跃锁、native worker和最近20分钟记录。没有活跃任务且研究记录过期后运行：

```sh
python3 docs/research-v2/run-h4-extension.py docs/research-v2/precision-h4/study.json
```

results/precision-h4.manifest.json冻结原确认spec、已完成精度扩展spec、新驱动/协议/配置及当时的精度分析哈希。结果results/precision-h4/按科学源和配置哈希分目录。state保存完成批次/原始提交/push状态，恢复只跳过已审计完成键并重审计，不重置宇宙。H4_COMPLETE_REVIEW_REQUIRED只是这批完成，研究仍未完成；旧confirmation/series/precision-extension均已完成，不重复启动。main和私有网页不改，未来正式替换等待用户最终验收。
