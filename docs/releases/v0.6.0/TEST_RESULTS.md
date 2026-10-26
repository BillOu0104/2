# v0.6.0 集成验收记录

环境：Linux，Node v24.19.0、Python3.12、Chromium154、Three.js0.180.0、esbuild0.25.11；依赖版本未增加。基线/研究源见 INTEGRATION.md。本轮是实现回归和短窗一致性检查，没有重新跑128Seed×100000年统计。

## 最终结果

| 检查 | 结果与原始证据 |
|---|---|
| 原研究集成测试 | 未改研究源，17文件139项通过：`results/frozen-integration-all-tests.log`。含研究专用观察器/h8适配器检查，未将这些工具引入生产。 |
| 原正式壁纸回退 | 原124项断言全部保留；13个旧测试文件通过显式off适配器运行，不再把旧默认当成新版默认。`results/compatibility-tests-r2.log`。 |
| 最终全部自动化 | `npm test` 17/17文件通过，`results/formal-tests-final.log`；展开150/150项断言：`results/formal-tests-all-assertions.log`（Node24 `--test-isolation=none`）。无跳过。 |
| 原生一致性 | 5个20显示年/1200完整帧：natural、deflection、内部reflect兜底、行星接触/P5、capture。末态每分量差<1e-7、接受步/控制计数/P5次数/文明/纪元帧一致、成本归一差<1e-7。夹具保留原输入/输出SHA，未携带原生执行程序或大量事件日志。 |
| 种子与设置 | 旧物理/Seed重放、UI偏好迁移、旧profile回退、手动初值、算法边界、无效研究配置报错、完整RNG检查点、旧P5预算不完整标记通过。 |
| 行星与文明 | 真实吞噬→缺席→至少5年后P5重生、同宇宙/新文明、同帧终止不漏死亡档案、没有缺席恒纪元或假发展状态通过。 |
| 数值失败 | 精度下限/非法状态/步数预算仍UNKNOWN；实际浏览器奇异初值报错，修正配置后恢复。恒星物理失效与数值错误分开。 |
| 生产构建 | `npm run build` 成功：`results/build-r10.log`。输出离线Web/WE项目；不是用开发源代替构建产物做浏览器验证。 |
| Chromium/WebGL/Worker/UI | 13组实际流程通过：`results/browser-final.log`、`results/browser-final/browser.json`和三张截图。1280×900、SwiftShader、隔离存储、真实Blob Worker，实际操作WE暂停回调。预期注入错误单列，非预期错误0。 |
| 基础性能 | 3个预定Seed各200年，trace+紧凑快照开启，全部完成，恒星失效0/UNKNOWN0；`results/performance.json`、`performance.log`。共享CPU短窗计算时延，不代表GPU/Windows实际帧率。 |
| 高精度状态 | `results/h8-remote-status.json`：h8远端13/256端点、2/64个100000年结果，未完成/未作通过结论。没有重复或打断研究队列。 |
| 版本档案 | 归档前检查按预期报告当前源码尚未capture，见 `results/records-before-capture.log`。先提交源码，再capture v0.6.0；最终check与main推送记录在records/maintenance，不覆盖此失败记录。 |

## 发现并修复的问题与失败保留

- `prototype-port-tests.log`：先在显式旧默认下确认最小端口134项通过（124项原回归加10项V2集成/检查点）。
- `default-migration-initial-tests.log`：V2改默认导致23项旧默认假设失败，保留原输出；旧合同移到off测试，新默认另外直测，没有删旧断言。
- `compatibility-tests-r1.log`：两个历史审计工具仍隐式取新默认；改为显式旧模式后r2通过。
- `build-initial.log`：新播放速度缺少设置说明，补齐后构建通过。
- `browser-r1.log`：真实UI步长舍入不一致，修复输入schema。
- `browser-r2.log`：用“观察到缺席的时刻”推算5年，取样已滞后；改查真实毁灭/重生事件年份间隔，不改P5规则。
- `browser-r3.log`：算法标题先变、旧物理状态仍被发布；添加initializing状态与Worker完整帧发布规则，并新增回归。
- `browser-r4.log`：恢复固定参考系后，动画尚未刷新时诊断仍留COM显示微小残值；固定原点在updateSettings即时生效，暂停时也正确。
- `browser-r5.log`：测试构造完整初值配置时给了默认UI设置，自己覆盖了偏好；夹具改成在当前保存配置上叠加初值。此为测试构造问题，没有更改产品迁移来迎合断言。
- `browser-r6.log` 和最终独立重跑通过；前期failure JSON保留。r2截图/JSON在后续复制时已与r3重复，r2原始失败以独立日志为准，不能将其副本当作r2截屏。多余失败截图去重/裁减说明见 `results/evidence-image-inventory.json`；JSON与原始失败日志不删。最终保留缺席、重生和界面实际截图。

## 重现

```sh
npm ci
npm test
npm run build
PORT=4180 npm start
# 在另一终端，使用新的输出目录，勿覆盖已归档证据：
V2_RESULT_DIR=/tmp/v2-new-browser-check node tools/release-v2/browser-check.mjs
V2_RESULT_DIR=/tmp/v2-new-performance-check node tools/release-v2/performance.mjs
```

Chromium路径可用CHROMIUM_PATH指定，服务地址可用V2_TEST_URL指定。浏览器夹具包括手动碰撞和奇异初值，它们不是随机长寿性能证据。真实Wallpaper Engine宿主、全GPU性能、完整h8配对收敛统计仍未验证。既有研究低成绩、混沌不足和精度敏感性不会因本轮回归通过而消失。
