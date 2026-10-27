# v0.6.1 测试记录

环境见 `results/environment.log`。测试脚本默认写入新 `/tmp` 目录；归档时用新的 `V061_RESULT_DIR`，勿覆盖历史证据。

| 实际检查 | 原始结果 |
|---|---|
| 原150项自动化 | `tests-before-new-catalog-checks.log`：150/150，无跳过 |
| 加入分类完整性和无副作用可用性检查 | `tests-final.log`：152/152，18文件，无跳过 |
| 首轮构建/后续产物 | `build-first.log`、`build-r1.log`、`build-final.log`、`build-r3.log`、`build-r4.log`；均成功 |
| 浏览器r1 | 7组脚本通过；后续目视发现旧导航翻译映射仍只有3栏，截图保留；不能因脚本通过就认定四栏标题正确 |
| 浏览器第二轮 | `browser-final.log`、`browser-final/browser.json`：补齐真实四栏标题及中英文检查，8组通过 |
| 浏览器r3失败 | `browser-r3.log`、`browser-r3/failure.json`：误删除仍被排行使用的propertySchema导入，出现ReferenceError；另一个断言把outline:none时浏览器报告的medium宽度误当作可见外框。已恢复原导入，并将数字聚焦outline明确设为0，保留失败输出 |
| 浏览器r4最终 | `browser-r4.log`、`browser-r4/browser.json`：8组全部通过，非预期错误0。补充真实鼠标点击滑条、聚焦数字的无外框检查、手机点击说明的视口边界检查 |
| 核心功能未变化 | `source-parity.json`：36个已有核心文件及场景/HUD样式前缀与基线字节一致 |

编辑样式时也检查并修正了选择器定位：原样式前部存在组合选择器，替换范围改为明确的面板position规则。最终证明场景/HUD样式前缀完整保留，未把这个编辑中问题当作物理或渲染算法修复。

最终浏览器流程实际包括：

1. 旧存储启动，220项与完整文档目录匹配，17项常用设置无重复，没有常驻小字提示段落。
2. 非整步小数原样保留；真实数字输入、键盘滑条、鼠标滑条互相同步并保存。数字聚焦无边框/外框，背景透明。
3. 悬停和焦点打开圆形感叹号说明，移出关闭；Escape先关闭说明，不直接丢失整个设置面板。
4. 在快捷页搜索高级k2选项，V2固定项禁用但仍可阅读解释；清空搜索恢复归类。
5. 七类完整目录，窗口位置修改保存；自定义初值开关正确控制初值输入可用性。
6. 三种视口下，快捷7个及其余146个滑条均同行铺满，无遮蔽或横向溢出；手机提示浮层边界合法。
7. 文明档案、项目说明与刷新后偏好/布局保留。
8. 中文与英文四栏导航文字映射正确。

前几轮中间图片按 `image-inventory.json` 裁减；每轮文本日志、JSON、代表性问题截图及最终四张截图保留。这些是UI回归，不是新的随机存活或h8精度实验。

```sh
npm test
npm run build
PORT=4181 npm start
# 另一终端：
V061_RESULT_DIR=/tmp/v061-new-qa node tools/v061/settings-browser.mjs
```

使用Node24展开全部子检查：`node --test --test-isolation=none --test-reporter=tap tests/*.test.js`。浏览器可用 `V061_TEST_URL` / `CHROMIUM_PATH` 指定地址/程序路径。
