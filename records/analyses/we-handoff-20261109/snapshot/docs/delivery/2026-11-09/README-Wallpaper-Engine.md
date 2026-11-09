# 三体 · 实时演算 v0.6.1：导入与发布

交付日期2026-11-09，源码基线 `ea50c8075aeb2275897098baf356eff5312bb6e9`，仓库 https://github.com/BillOu0104/2 。使用已发布的v0.6.1设置界面，物理沿用v0.6.0的deflect-v2/h4/P5。main当前仍0.6.0，PR #5尚未合并；本包没有修改物理或自动发布任何站点。

## 导入 Wallpaper Engine

1. 下载 `three-body-v0.6.1-wallpaper-engine.zip`，解压到一个新的独立文件夹。根目录应直接看到 `index.html`、`project.json`、`app.js`、`style.css`、`preview.jpg`、`assets/`；不要只复制HTML。`app.css`是构建同时保留的CSS副本。
2. 打开 Wallpaper Engine 的壁纸编辑器，选择“创建壁纸”，打开或拖入该文件夹中的 `index.html`，选择 Web 类型。编辑器会把文件及子目录复制到自己的项目目录。
3. 检查根入口为 `index.html`、类型为Web、预览使用随包的 `preview.jpg`。若创建流程重新生成了 `project.json`，可在关闭编辑器后通过“在资源管理器中打开”把提供的元数据恢复到**新建项目**，再打开；不要覆盖其他作品。
4. 另一种方式是关闭编辑器，将完整文件夹放到 `<Steam>/steamapps/common/wallpaper_engine/projects/myprojects/Trisolaris-v0.6.1/`（路径依实际安装位置），再从编辑器打开该本地项目。
5. 先设为本地壁纸，检查动画、声音、设置和暂停恢复，再考虑发布。

包内保留所有运行脚本、Three.js、内嵌Blob Worker、银河/天体纹理、字体与FLAC音乐。最终使用无需Node、npm或网络。185项Web原生可操作属性保留；Scene专用分组/说明不放入原生属性元数据，网页齿轮面板仍有全部220项。

## 使用与保存

- 右下角齿轮打开设置：17项快捷，其余按七类分组；名称旁圈叹号悬停显示解释。滑条/数字同排可直接编辑。
- 鼠标默认悬停转动，左键也可拖拽，灵敏度与拖拽倍率可调；闲置缓慢回到银河亮部。
- 本地音乐需要主动打开，普通网页受浏览器自动播放限制。WE系统频谱使用宿主提供的128通道回调。
- 设置、排行与档案保存在本地浏览器存储；网页和WE未必共享存储。迁移前导出档案/Seed。
- “新宇宙”保留历史；“完全重置历史”删除过去宇宙/文明记录和排行，请先导出需要的内容。
- 默认固定初始显示中心。P5会记录外部动量注入，长期天体可能漂移；可选全系统质心显示只变显示参考系，不代表物理修复。

## 普通网页离线查看

在解压文件夹中运行：

```sh
python -m http.server 4173
```

打开 `http://localhost:4173`。不建议在普通受管理浏览器中直接双击HTML；当前测试环境的 `file://` 被策略拦截，不代表WE自己的本地宿主不可用，但也不能当作已经验证原生CEF。

## 创意工坊发布前

本包是完整的编辑器项目，已提供本地预览图和Web元数据，**没有执行Steam上传**。在Windows原生WE实测后，通过编辑器的准备/分享/发布界面填写作品介绍、标签、可见性、适龄与预览资料，再由Steam完成提交。不同语言版本菜单名称可能不同。

正式发布前建议检查：

- 实际显卡WebGL2、16:9/21:9、多显示器、睡眠/暂停恢复。
- 原生属性修改是否同步、齿轮设置保存、Blob Worker是否正常。
- 音乐、系统音频采集，以及无网络情况下完整启动。
- 高分辨率显存/帧率。硬件较弱先降低像素比、尘埃、后处理；不要降低h4物理精度。

原版作者 **SYKM**，来源Workshop `3509243656`；音乐 **Melodysheep — Ether**。请阅读包内许可证/来源声明。资源含原非商用限制，公开再发布前须核实原图、音频及衍生作品授权。包内未设置原Workshop ID，不会有意更新原作者条目。技术上可导入不构成再发布授权。

## 检查与已知边界

本次152项自动测试、生产构建、真实Chromium/WebGL/Worker离线检查、FLAC播放、WE回调适配、解压包8组设置回归通过。见 `TEST_RESULTS.md`。Linux环境没有Windows/WE/Steam；原生宿主和Workshop提交尚待实机验收。

原生8K背景纹理8192×4096已实际解码；本次未重跑8K全帧缓冲性能。高精度长期研究仍有 `NUMERICAL_REVIEW_REQUIRED` 风险，h8按用户要求停止于104/128种子，不宣称已完成收敛。

`MANIFEST.json`列出每个包内文件的SHA256；`SHA256SUMS.txt`校验整包和文档。Windows可使用 `Get-FileHash -Algorithm SHA256 <文件>`；Linux/macOS可使用 `sha256sum -c SHA256SUMS.txt`（macOS亦可逐项 `shasum -a 256`）。不要改动包内文件后继续声称匹配原校验值。

开发交接看 `HANDOFF.md`，所有源码/研究/历史记录以GitHub对应分支和提交为准。本包不带node_modules、研究数据、开发缓存或私有站点配置。

官方参考：

- https://docs.wallpaperengine.io/en/web/first/gettingstarted.html
- https://docs.wallpaperengine.io/en/web/customization/properties.html
- https://docs.wallpaperengine.io/en/web/audio/visualizer.html
- https://docs.wallpaperengine.io/en/scene/first/publishing.html
