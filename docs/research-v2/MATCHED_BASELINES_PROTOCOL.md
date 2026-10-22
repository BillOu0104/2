# h4精度匹配的纯牛顿与旧牢笼基准

这是三种精度128匹配候选结果完成后追加的数值归因诊断，不是新增独立确认。依据H4_RESULTS.md；不修改原确认或h4候选成绩，不据新基准调控制参数。

固定V2-CONFIRM-20261021-0..127。两个profile为newton__h4（无控制）和legacy-cage__h4（原牢笼）；沿用原确认study.primaryProfiles的前两项，新增dt=.0001875、eta=.001875，除此无变化。每Seed相同原始四体初值，实际运行至100000显示年或真实恒星失败；不能把提前失败算完成100000年。

成熟窗口10000年后，P5行星重生、真实半径、失效、文明/纪元阈值和条件影子全部沿用冻结7f64a8a。旧牢笼开启不禁用独立恒星失效观察。全部失败、数值UNKNOWN、删失与行星/文明/控制账保留。恒星失败后的纪元按统一全窗分母计0，条件幸存者与全队列分开。

16批×8Seed×2，共256个计划结果。只用已有两CPU，两个native worker；结果按科学源/配置哈希隔离、完整状态恢复和完成键去重。每批审计原始/源码/配置/二进制/输入/状态/注册初值、Git checkpoint、records/check与push；UNKNOWN或哈希/初值异常停止评审。推送失败单列，不冒称远端已保存。

比较h4候选与h4基准时保留各自配置哈希，报告失败原因/时间、三星完整、混沌联合、各分母恒纪元、预算和置信区间；不能把相同Seed多个精度当独立样本。补测之后仍需控制事件移植验证、完整正式壁纸集成/功能/UI回归和浏览器性能。main替换待用户最终验收，当前不改main或私有网页。

恢复前按STATUS检查活跃锁/native及最近20分钟记录。无活跃且记录过期时运行：

```sh
python3 docs/research-v2/run-matched-baselines.py docs/research-v2/precision-baselines/study.json
```

results/precision-baselines.manifest.json冻结原确认、h4及其先前精度spec、新驱动/协议/配置和当时h4分析哈希。BASELINES_COMPLETE_REVIEW_REQUIRED只表示这个队列完成，整个研究仍未完成。旧三个数据队列已结束，不重复启动积分。
