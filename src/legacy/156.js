// Adapted from supplied SYKM SceneScript. See docs/SOURCE-AUDIT.md.
export default function createLegacy(ctx) {
const {shared,engine,input,thisScene,Vec3,createScriptProperties,Math} = ctx;
'use strict';

var scriptProperties = createScriptProperties()
	.addCheckbox({
		name: 'en_enw',
		label: 'en_enw',
		value: false
	})
	.finish();

// 初始化变量
let frameCount = 0;
let universeCount = 0; // 宇宙构建次数计数器
let prevNum = 0;      // 记录上一次的shared.num值
let typingFrameCount = 0; // 打字效果帧计数器
let currentLine = 0; // 当前正在显示的行索引
let startFrame = 0; // 记录宇宙构建开始时的帧数
let typingSpeed = 1; // 每2帧显示一个字符

// 中英文文本定义
const chineseTexts = [
    "<1>.文明等级评估完成 / 宇宙摧毁已完成 / 文明档案已存档。",
    "<2>.天体质量、位置、速度……加载完成 / 天体外观构建完成，天体初始化成功！",
    "<3>.粒子生成完毕 / 引力构建成功/物理模拟测试通过！",
    "<4>.文明种子提取完成/文明正在载入，宇宙加载中……"
];

const englishTexts = [
    "<1>.Civilization level evaluation completed.Civilization archive saved.",
    "<2>.Celestial body mass, position, velocity... loaded;Celestial body initialized successfully!",
    "<3>.Gravity construction successful. Physics simulation test passed!",
    "<4>.Civilization seed extraction completed. Civilization is loading. Universe"
];

// 初始化共享变量
shared.lot1 = "";
shared.lot2 = "";
shared.lot3 = "";
shared.lot4 = "";
shared.lot5 = "";
shared.lot6 = "";

function update(value) {
    
    frameCount++;
    shared.en_en=scriptProperties.en_enw;
    // 1. 检测shared.num从0到非0的跳变
    if (prevNum === 0 && shared.num !== 0) {
        universeCount++;
        startFrame = frameCount; // 记录宇宙构建开始时的帧数
        
        // 重置文本显示状态
        currentLine = 0;
        shared.lot3 = "";
        shared.lot4 = "";
        shared.lot5 = "";
        shared.lot6 = "";
        typingFrameCount = 0;
    }
    prevNum = shared.num;
    shared.universeCount=universeCount+1;
    // 2. 设置第1行文本
    if (shared.en_en) {
        shared.lot1 = `Universe[${universeCount + 1}] is being constructed`;
    } else {
        shared.lot1 = `第[${universeCount + 1}]号宇宙正在构建中`;
    }
    
    // 3. 设置第2行文本 - 生成进度
    if (universeCount > 0) {
        // 计算从宇宙构建开始后的帧数
        const elapsedFrames = frameCount - startFrame;
        // 240帧达到100%
        const progress = Math.min(100, (elapsedFrames / 240) * 100);
        
        if (shared.en_en) {
            shared.lot2 = `${progress.toFixed(2)}%`;
        } else {
            shared.lot2 = `${progress.toFixed(2)}%`;
        }
    } else {
        // 尚未开始构建宇宙
        if (shared.en_en) {
            shared.lot2 = `Generation progress: 0.00%`;
        } else {
            shared.lot2 = `生成进度：0.00%`;
        }
    }
    
    // 4. 设置第3-6行文本 - 打字机效果（逐行显示）
    if (universeCount > 0) {
        typingFrameCount++;
        
        const texts = shared.en_en ? englishTexts : chineseTexts;
        
        // 每typingSpeed帧更新一次字符索引
        if (typingFrameCount >= typingSpeed && currentLine < texts.length) {
            typingFrameCount = 0;
            
            // 获取当前行文本
            const currentText = texts[currentLine];
            
            // 计算当前行已显示的字符数
            const currentLineVar = `lot${currentLine + 3}`;
            const currentLineLength = shared[currentLineVar]?.length || 0;
            
            if (currentLineLength < currentText.length) {
                // 当前行尚未显示完，显示下一个字符
                shared[currentLineVar] = currentText.substring(0, currentLineLength + 1);
            } else {
                // 当前行已显示完，移动到下一行
                currentLine++;
                if (currentLine < texts.length) {
                    // 初始化下一行文本（只显示第一个字符）
                    const nextLineVar = `lot${currentLine + 3}`;
                    shared[nextLineVar] = texts[currentLine].substring(0, 1);
                }
            }
        }
    }
    
    return value;
}

return {update,scriptProperties};
}
