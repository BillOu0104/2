# 研究资料与复现

结论：[FINAL_REPORT.md](../../FINAL_REPORT.md)。恢复入口：[STATUS.md](../../STATUS.md)。

产品源码基线固定为c7a53a01def5f9d60389ee20ec0f8bac5210ed69。研究不改src、测试、依赖清单或部署配置。
Node批处理仅使用项目已有模块与Node内置库；汇总/独立参考/画图需要NumPy、SciPy、Matplotlib（本环境已安装）。

## 阶段索引

|配置|完整主试验条数|说明|
|---|---:|---|
|phase1.json|448|32匹配种子，14组，200年|
|phase2.json|576|32新种子，18组，400年或匹配动力学窗口|
|numerics.json|264|24种子，11积分/力模型控制|
|ablation.json|128|32种子，4位置/速度消融|
|phase3.json|512|128新种子，4组，1000年|
|candidate-convergence.json + candidate-convergence-rest.json|128|同128候选种子全部精细复算，分段结果无重复|
|geometry.json|192|32种子，6构型组|
|geometry-confirm.json|192|64新种子，3组|

合计2440条主试验，不把继承的长窗吸收结局重复计为新模拟。影子诊断分别32/48条记录，每条含参考和微扰两次积分。长窗脚本记录本阶段是否实际重算。

## 复现命令

在仓库根目录执行，已完成配置会跳过已有键：

```sh
node docs/research/validate.mjs
python3 docs/research/independent_reference.py
node docs/research/run.mjs docs/research/phase1.json
node docs/research/run.mjs docs/research/phase2.json
node docs/research/run.mjs docs/research/numerics.json
node docs/research/run.mjs docs/research/ablation.json
node docs/research/run.mjs docs/research/phase3.json
node docs/research/run.mjs docs/research/candidate-convergence.json
node docs/research/run.mjs docs/research/candidate-convergence-rest.json
node docs/research/run.mjs docs/research/geometry.json
node docs/research/run.mjs docs/research/geometry-confirm.json
node docs/research/extend.mjs
node docs/research/repair_long.mjs
node docs/research/cohort_extend.mjs docs/research/fine-extend.json
node docs/research/cohort_extend.mjs docs/research/geometry-extend.json
node docs/research/chaos.mjs docs/research/chaos.json
node docs/research/geometry_shadow.mjs
python3 docs/research/audit_results.py
python3 docs/research/summarize.py docs/research/results/phase3.jsonl
python3 docs/research/summarize.py docs/research/results/extended-10000-v2.jsonl
python3 docs/research/analyze_holdout.py
XDG_CACHE_HOME=/tmp/research-cache MPLCONFIGDIR=/tmp/research-mpl python3 docs/research/plot_results.py
XDG_CACHE_HOME=/tmp/research-cache MPLCONFIGDIR=/tmp/research-mpl python3 docs/research/plot_geometry.py
```

`candidate-fine-all.jsonl` 是前16与后112文件的完整拼接，provenance文件注明来源。不得把只余存活者作为新种子组。
如需全新重算，保留归档后使用新的output路径/完整新副本，不能删除失败记录再把结果混写。

## 文件含义

- PLAN / SOURCE_AUDIT / PHASE1 / PHASE2 / PHASE3 / ABLATION / NUMERICS / GEOMETRY：事前假设、结果和方向更新。
- engine.mjs / engine-v2 / v3 / v4：冻结版本；后者依次增加诊断、几何控制和更高计算预算。未改变主比较的判定阈值。
- results/*.jsonl：逐种子初值、结局、守恒量、事件、完整队列；*.manifest.json：配置和程序哈希。
- results/*.summary.json：种子级bootstrap、Wilson区间、失败类型。0/全成功时bootstrap可能退化，报告使用Wilson区间。
- results/extended-10000.jsonl：保留的原预算中断记录，**不是最终物理结论**。最终引用extended-10000-v2.jsonl。
- results/geometry-extended-10000.jsonl：一次数值中断发生在已知正能逃逸后；主结局已知，后续点质量动力学未验证。
- results/chaos.jsonl：早期影子探索包含接触后点质量运动，只是诊断；正式几何敏感性结论用geometry-shadow中首次接触前的部分。
- results/DATA_AUDIT.json：2440主试验队列完整性、重复键、源哈希、长窗吸收结局的实际审计。
- figures/：静态科学图，可独立导出；绘图文本使用英文以避免字体依赖。

平台永久保留和定时唤醒未在本研究中承诺。Git checkpoint和推送提供恢复路径；需要新环境时仍须重新验证运行依赖和网络。
