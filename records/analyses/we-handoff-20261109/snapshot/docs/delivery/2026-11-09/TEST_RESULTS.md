# v0.6.1 最终打包：新测试结果（2026-11-09）

运行源码：`ea50c8075aeb2275897098baf356eff5312bb6e9`，`release/v0.6.1-settings`。本次只增加交付文档/工具/元数据与证据，未修改运行源码或任何物理算法。main仍v0.6.0，PR5仍draft；以最新发布过的v0.6.1打包，不冒称已合main。

环境：Linux，Node24.19.0、npm11.9.0、Python3.12.14、系统Chromium/SwiftShader。新测试与历史物理实验分开；没有重新运行100000年研究。

| 检查 | 新结果 | 原始证据（相对于本报告目录） |
|---|---|---|
| `npm ci` / 生产构建 | 依赖锁安装、`npm run build`成功 | `results/build.log` |
| `npm test` | 18/18测试文件通过 | `results/npm-test.log` |
| 展开TAP单测 | **152/152通过**，无跳过；是同一套测试，不与18叠加计数 | `results/tests-152.log` |
| 应用与资源完整性 | app.js/app.css/style.css/index.html与dist一致；资产输出SHA匹配原manifest；源码未修改 | `results/source-and-package-parity.json`、`MANIFEST.json` |
| 干净ZIP | 22个文件、35,114,417字节；CRC无错误；无研究/依赖/缓存/私有配置 | `results/archive.json`、`MANIFEST.json` |
| Stage离线浏览器 | 本地8K纹理、真实Worker/有限V2状态、185原生属性、无外网/缺资源/JS错误 | `results/staged-offline-r2/offline.json` |
| ZIP解压后离线浏览器 | 同样通过4组：启动/资源、WE暂停FPS音频、真实FLAC解码播放、16:9与21:9 | `results/extracted-offline/offline.json` |
| ZIP解压后设置回归 | **8/8流程通过**，220控件/17快捷/203分类，输入同步/存储、提示、搜索、中英导航 | `results/extracted-settings/browser.json`及截图 |
| 设置窄屏布局 | 1280/390/320px均滑条数值同行、占满、无水平溢出 | 同上 `layout` |

ZIP SHA256：`d76e7f5fe08fb63aaf1eac2bbd432f45402227249d338ae3ce788d0e33b06d68`。

测试脚本：`tools/delivery/verify-offline.mjs`、`tools/v061/settings-browser.mjs`、`tools/delivery/package-we.py`。离线浏览器阻断所有非127.0.0.1:4184的HTTP请求，实际结果外部请求/资源失败/页面错误均为空；并不是靠联网取回缺失资源。音乐通过真实用户点击后读取实际音频播放时间推进，未用随机频谱代替音频。

## 元数据适配

使用Web原生支持的类型，185个可操作属性保留；50个Scene分组/说明不进入原生属性列表。网页220项不变。添加版本标题、本地预览与RELEASE-INFO，去除原Workshop ID、`.openai`和构建用原Scene project JSON。全部运行纹理、音乐、字体保留。没有打入源代码树、研究数据、node_modules、开发缓存。

## 失败尝试、未验证项目与限制

- 最初在默认受限沙箱启动本机测试服务时，Node在listen等待处以未决顶层await退出（13）；输出保留 `results/staged-offline.log`。按云环境网络技能要求在获准环境重跑成功，保存r2和解压包结果，没有把失败记录删除。
- Chromium `file://` 导航被管理策略 `ERR_BLOCKED_BY_ADMINISTRATOR` 阻止，详见两份offline.json的fileURL字段；未绕过策略。HTTP离线检查通过不等于本地文件宿主实测。
- 没有Windows、Wallpaper Engine或Steam客户端，因此原生CEF、系统采集音频、多显示器、休眠唤醒、原生Workshop上传**尚未实测/执行**。本包具备编辑器导入/发布所需Web项目结构，但最终宿主需使用者验收。
- 本次使用软件渲染和QA低像素比，验证真实8192×4096纹理解码，不代表8K全屏性能或用户GPU帧率；未重跑8K全帧缓冲验收。
- 不宣称h8收敛已解决。最新既有研究 `CLOSED_BY_USER_PARTIAL_H8`：104/128匹配Seed，208/256期末结果，832/1024窗口；缺失部分没有补跑、没有填补。高精度仍 `NUMERICAL_REVIEW_REQUIRED`。引用见 `research-reference/`，本次新实验仅为上述工程验证。
- 默认deflect-v2/P5含明确人工干预与外部预算；P5可产生真实质心漂移。未改变这些规则，固定视图不是新物理错误已消除的证据。
- 资源非商用/音乐授权声明保留；技术验收不替代Workshop再发布权确认。

完整交接见仓库根 `HANDOFF.md`。归档检查结果另保存在 `records/maintenance/2026-11-09-handoff-delivery.json`及本次analysis record；最终文件SHA以Dropbox交付的SHA256SUMS为准。
