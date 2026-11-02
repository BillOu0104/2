# V2长期研究已按用户要求结案

状态：CLOSED_BY_USER_PARTIAL_H8（2026-11-02，北京时间）。用户终止剩余h8复测，不再自动恢复或启动worker。

最终报告见[docs/integration-v2/FINAL_REPORT_20261102.md](docs/integration-v2/FINAL_REPORT_20261102.md)，完整入口见[集成STATUS](docs/integration-v2/STATUS.md)。h8已归档104/128匹配Seed、208/256长期结局；剩余24Seed的远端证据缺失，不当作物理失败或成功。数值收敛仍未通过，研究结案不等于正式产品验收。

原自动恢复任务已暂停；旧环境后台进程及未上传检查点状态未知，取回后先核查保存并安全停止。全部历史数据保留，计算源码/main不改，不发布网页。以下为历史入口，禁止据此自动重启。

---

# 当前研究恢复入口

进行中的任务是V2最小干预混沌三星控制研究。读 [docs/research-v2/STATUS.md](docs/research-v2/STATUS.md)。

分支research/minimal-chaos-control-v2；实际产品基准fix/v0.5.5@8a8eb34。main仍c7a53a0，未修改、未合并。上一轮报告仍在根FINAL_REPORT.md，V1状态与完整结果在research/newtonian-survival@c198020及records/analyses/newtonian-survival。

恢复须核对源/配置哈希与既有结果，不依赖聊天上下文，不混合调试版和canonical结果，不将数值停止记为物理死亡。

2026-10-22：128新Seed独立确认数据已完整结束并重审计；研究仍在进行，因恒纪元精度敏感性需继续precision-extension。唯一当前恢复命令见docs/research-v2/STATUS.md最上方，不再启动已完成confirmation/series队列。main及私有网页未修改。

2026-10-22后续：precision-extension的256条已完成并重审计，当前任务改为补齐剩余96Seed×两候选的h4；恢复run-h4-extension，完整命令见V2 STATUS最上方。原确认与精度复测全部保留，研究未完成、main未改。

h4补齐192条已完成并重审计；当前唯一队列改为h4同精度牛顿/旧牢笼基准run-matched-baselines，见V2 STATUS最上方。所有三精度候选各128个Seed，研究仍未完成，main未改。
