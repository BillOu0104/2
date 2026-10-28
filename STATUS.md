# 当前研究恢复入口

进行中的任务是V2最小干预混沌三星控制研究。读 [docs/research-v2/STATUS.md](docs/research-v2/STATUS.md)。

分支research/minimal-chaos-control-v2；实际产品基准fix/v0.5.5@8a8eb34。main仍c7a53a0，未修改、未合并。上一轮报告仍在根FINAL_REPORT.md，V1状态与完整结果在research/newtonian-survival@c198020及records/analyses/newtonian-survival。

恢复须核对源/配置哈希与既有结果，不依赖聊天上下文，不混合调试版和canonical结果，不将数值停止记为物理死亡。

2026-10-22：128新Seed独立确认数据已完整结束并重审计；研究仍在进行，因恒纪元精度敏感性需继续precision-extension。唯一当前恢复命令见docs/research-v2/STATUS.md最上方，不再启动已完成confirmation/series队列。main及私有网页未修改。

2026-10-22后续：precision-extension的256条已完成并重审计，当前任务改为补齐剩余96Seed×两候选的h4；恢复run-h4-extension，完整命令见V2 STATUS最上方。原确认与精度复测全部保留，研究未完成、main未改。

h4补齐192条已完成并重审计；当前唯一队列改为h4同精度牛顿/旧牢笼基准run-matched-baselines，见V2 STATUS最上方。所有三精度候选各128个Seed，研究仍未完成，main未改。

同h4精度两基准256条全完成并审计；当前转入/workspace/2-integration的独立集成分支，研究与原型仍未完成。恢复前看V2 STATUS最上方及集成STATUS；全部旧批处理已结束，勿重复启动。main未改。

当前唯一恢复队列已转至独立集成工作树的冻结JS诊断：1000/10000/30000年、完整物理状态续算；具体命令和活跃/近20分钟守卫见V2 STATUS最上方。原生科研完整数据与SCIENTIFIC_REPORT均保留，研究未完成，main未改。

JS逐级诊断24窗口已完成并审计，30k小样本成熟恒纪元偏低。当前队列改为集成工作树tools/v2/matched-native30.py，同4初值/原h4参数/30000年独立原生对照；以V2 STATUS最上方为准，旧队列不重复积分。

同4初值原生30k对照亦已完成。当前唯一恢复改为集成工作树tools/v2/run-js-confirmation.py，JS全新128Seed、两候选、h4/条件影子、100000年正式确认；具体协议/哈希/守卫和命令见V2 STATUS最上方，旧队列不重启。

2026-10-26：JS全新128Seed×两候选正式100000年确认已全256长期/1024窗口完成，UNKNOWN0、完整各128/128，混沌联合118/124，成熟恒纪元33.99%/19.08%。全量SHA及事件账审计PASS，完整报告在集成工作树docs/integration-v2/JS_CONFIRMATION_RESULTS.md。研究未结案，当前唯一恢复队列已转同前32初值h8数值诊断tools/v2/run-js-precision.py，具体见V2 STATUS最上方；旧确认不重复积分，main未改。

2026-10-28：前32匹配h8已64长期/256窗口实测完成，重审计PASS、UNKNOWN0；固定±5百分点恒纪元诊断未通过，不宣称收敛。当前唯一恢复转为集成工作树tools/v2/run-js-precision-extension.py，补齐原确认Seed32..127的同h8匹配复测，原计算src/控制不改、旧32不重算。完整报告JS_H8_RESULTS.md及新协议/哈希/命令见V2 STATUS最上方；不增加独立确认样本，main未改。
