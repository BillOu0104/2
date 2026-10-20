# 研究恢复入口

状态：本轮研究已完成，最终报告在 FINAL_REPORT.md。正式源码基线 c7a53a01def5f9d60389ee20ec0f8bac5210ed69，分支 research/newtonian-survival，未合并main。
恢复时先读本文件、FINAL_REPORT.md、docs/research/LOG.md和results/DATA_AUDIT.json，不依赖聊天上下文。

## 已验证结论

- 完成2440条主试验，另有影子诊断、独立DOP853参考、全队列精细复算和长窗扩展；队列、源哈希、无重复/漏种审计通过。
- 无牢笼、正确牛顿力+宿主相对逆向低偏心轨道+Q1，可改善有限窗口。128新种子1000年：原始0/128幸存、均寿146.22、恒纪元2.90%；候选6/128、244.37、21.20%。
- 同128精细候选仍6/128，均寿244.98；个别轨迹损失时刻可相差273年，因此不声称逐轨迹长期精确。
- 10000年候选和精细候选均1/128；这支持少数长寿，不是普遍高比例目标成功。
- 近8字族1%扰动的64新种子1000年64/64完整存活，但有效区间敏感性更接近规则对照；原32队列10000年0/32联合幸存。5%更敏感但长期完整性更差。
- 真实恒星做功可让行星由负能变正能，总能误差约1e-13。守恒好不保证行星不逃逸。
- 原随机32行星并非普遍初始未束缚，均至少对一星负能；最近宿主偏心率中位数.818，位置/角动量/扰动环境共同影响。

## 数据纠错与适用边界

- results/extended-10000.jsonl中的两条原预算中断不是物理死亡；最终只用extended-10000-v2.jsonl，两条重算后都存活。
- geometry-extended-10000有一条在已知正能逃逸、随后恒星接触后中断，主损失结局已知，后续点质量动力学未验证。
- 原产品没有恒星接触并合模型。几何代理/影子敏感性不等于严格Lyapunov谱。默认质量半径光度未做真实天体一致标定。
- 所有种子及首次损失都保留；扩展继承吸收结局，不能把仅剩幸存者当新筛种组。
- 研究不能证明所有纯牛顿初值都不可能；也没有证明必须加牢笼。强混沌+高长期存活的联合要求仍缺充分证据。

## 恢复与下一轮命令

本轮已无未完成的注册主试验，无后台实验需要接续。先验证已有数据，不重复已完成积分：

```sh
python3 docs/research/audit_results.py
python3 docs/research/analyze_holdout.py
node docs/research/run.mjs docs/research/phase3.json
node docs/research/run.mjs docs/research/geometry-confirm.json
node docs/research/cohort_extend.mjs docs/research/fine-extend.json
node docs/research/cohort_extend.mjs docs/research/geometry-extend.json
```

Node命令应跳过已有键；若哈希变化或JSONL尾部截断，先检查，禁止混写。全部阶段命令见docs/research/README.md。
下一轮科学问题：先明确真实天体标定、恒星接触后的模型适用性和强混沌可检验指标，再注册新的初值族及独立长窗队列；不要围绕已知幸存种子预筛邻域冒充修复。

## 保存与权限

研究资料、原始结果、配置、图、报告与checkpoint均在本分支。生产src/tests/package/部署配置无修改；不合并main。
已实际推送研究分支。环境永久保留、自动定时唤醒仍未承诺；新环境需重新验证Node、Python科学依赖和网络。
