// Adapted from supplied SYKM SceneScript. See docs/SOURCE-AUDIT.md.
export default function createLegacy(ctx) {
const {shared,engine,input,thisScene,Vec3,createScriptProperties,Math} = ctx;
'use strict';

var scriptProperties = createScriptProperties()
    .addCheckbox({
        name: 'cTe',
        label: 'cTe',
        value: false
    })
    .addSlider({
        name: 'logInterval',
        label: '日志记录间隔(年)',
        value: 5,
        min: 1,
        max: 100,
        integer: true
    })
    .addSlider({
        name: 'survivalThreshold',
        label: '文明生存确认次数',
        value: 50,
        min: 1,
        max: 1000,
        integer: true
    })
    .addSlider({
        name: 'lingkongDistance',
        label: '凌空距离阈值',
        value: 0.3,
        min: 0.02,
        max: 0.7,
    })
    .addSlider({
        name: 'feixingDistance',
        label: '飞星距离阈值',
        value: 2.0,
        min: 1.0,
        max: 4.0,
    })
    .addSlider({
        name: 'feixingTemp',
        label: '飞星温度阈值',
        value: -60,
        min: -273,
        max: 0,
    })
    .addSlider({
        name: 'collisionDistance',
        label: '相撞距离阈值',
        value: 0.2,
        min: 0.05,
        max: 0.5,
    })
    .addSlider({
        name: 'rocheLimit',
        label: '大撕裂距离阈值',
        value: 0.05,
        min: 0.01,
        max: 0.1,
        step: 0.001
    })
    .addSlider({
        name: 'lowTempDestruction',
        label: '低温毁灭阈值',
        value: -100,
        min: -273,
        max: 0,
    })
    .addSlider({
        name: 'highTempDestruction',
        label: '高温毁灭阈值',
        value: 400,
        min: 100,
        max: 1000,
    })
    .finish();

// 初始化共享对象
if (typeof shared.logEntries === 'undefined') {
    shared.logEntries = []; // 存储日志条目
    shared.civilizationCount = 1; // 当前文明计数
    shared.lastLogYear = 0; // 上次记录日志的时间
    shared.suitablePeriodCount = 0; // 连续适宜期计数
    shared.civilizationAlive = false; // 当前是否有文明存在
    shared.lastStates = { // 保存上一次的状态
        lingkong: "",
        feixing: "",
        planetCollision: "",
        starCollision: "",
        rocheLimit: "",
        destruction: "",
        civilizationStart: false
    };
    shared.civilizationStartTime = 0; // 当前文明启动时间
    shared.lastCivilizationLifespan = 0; // 上一个文明的寿命
    shared.civilizationRecords = []; // 存储所有文明的记录
    shared.lastRst = 0; // 记录上一次的rst值
}

// 辅助函数：将年份转换为字符串，超过1亿年时使用科学计数法
function formatYear(year) {
    if (year === 0) return "0";
    
    // 超过1亿年使用科学计数法
    if (year >= 1e8) {
        const formatted = year.toExponential(2);
        return formatted.replace('e+', '×10⁺').replace('e-', '×10⁻');
    }
    
    return year.toString();
}

// 辅助函数：格式化数值，整数显示整数，小数保留两位
function formatValue(value) {
    if (Number.isInteger(value)) {
        return value.toString();
    } else {
        return value.toFixed(2);
    }
}

// 翻译函数
function tr(key, isEnglish, params = {}) {
    const translations = {
        '三日凌空': {en: 'Three Suns Overhead'},
        '双日凌空': {en: 'Double Suns Overhead'},
        '巨日凌空': {en: 'Giant Sun Overhead'},
        '三飞星': {en: 'Three Flying Stars'},
        '双飞星': {en: 'Double Flying Stars'},
        '飞星': {en: 'Flying Star'},
        '恒星1': {en: 'Star 1'},
        '恒星2': {en: 'Star 2'},
        '恒星3': {en: 'Star 3'},
        '行星与{{stars}}相撞': {en: 'Planet collided with {{stars}}'},
        '{{stars}}': {en: '{{stars}}'},
        '低温': {en: 'Low Temperature'},
        '高温': {en: 'High Temperature'},
        '未知原因': {en: 'Unknown Cause'},
        '天体逃逸': {en: 'Celestial Escape'},
        '大撕裂{{stars}}': {en: 'Great Tear by {{stars}}'},
        '第{{number}}号文明启动': {en: 'Civilization {{number}} started'},
        '第{{number}}号文明毁灭于{{cause}}': {en: 'Civilization {{number}} destroyed by {{cause}}'},
        '第{{number}}号文明正在运行': {en: 'Civilization {{number}} active'},
        '文明无法生存': {en: 'Civilization cannot survive'},
        '文明已存活': {en: 'Civilization survived'},
        '上个文明寿命': {en: 'Last civilization lifespan'},
        '年': {en: ' years'},
        '第{{number}}号文明，存活{{lifespan}}年，毁灭于{{cause}}': 
            {en: 'Civilization {{number}}, survived {{lifespan}} years, destroyed by {{cause}}'},
        '文明存活时间排行榜': {en: 'Civilization Longevity Ranking'},
        '第{{year}}年，{{event}}': {en: 'Year {{year}}, {{event}}'},
        '、': {en: ', '},
        '，': {en: ', '}
    };

    if (isEnglish && translations[key] && translations[key].en) {
        let result = translations[key].en;
        for (const [param, value] of Object.entries(params)) {
            result = result.replace(`{{${param}}}`, value);
        }
        return result;
    }
    
    let result = key;
    for (const [param, value] of Object.entries(params)) {
        result = result.replace(`{{${param}}}`, value);
    }
    return result;
}

function update(value) {
    // Optional climate resilience policy. Null keeps the supplied original rules intact.
    const habitability = ctx.getHabitability?.();
    const currentYear = Math.floor(shared.xntime);
    const logInterval = scriptProperties.logInterval;
    const survivalThreshold = scriptProperties.survivalThreshold;
    const isEnglish = scriptProperties.cTe;
    
    // 使用配置参数
    const lingkongDistance = scriptProperties.lingkongDistance;
    const feixingDistance = scriptProperties.feixingDistance;
    const feixingTemp = scriptProperties.feixingTemp;
    const collisionDistance = scriptProperties.collisionDistance;
    const rocheLimit = scriptProperties.rocheLimit;
    const lowTempDestruction = scriptProperties.lowTempDestruction;
    const highTempDestruction = scriptProperties.highTempDestruction;
    
    // 构建用户属性字符串
    const userSetParts = [
        `Ht:${formatValue(highTempDestruction)} Lt:${formatValue(lowTempDestruction)}`,
        `O:${formatValue(lingkongDistance)} F:${formatValue(feixingDistance)} Ft:${formatValue(feixingTemp)}`,
        `Ro:${formatValue(rocheLimit)} Cd:${formatValue(collisionDistance)}`,
        `dt:${formatValue(logInterval)} n:${formatValue(survivalThreshold)}`
    ];
    
    // 添加KT值（如果存在）
    if (typeof shared.kt !== 'undefined') {
        userSetParts.push(`KT:${formatValue(shared.kt)}`);
    } else {
        userSetParts.push(`KT:0`); // 默认值
    }
    
    shared.userset = userSetParts.join(" / ");
    
    // 检查rst跳变（0->1）
    let rstJump = false;
    if (shared.lastRst === 0 && shared.rst === 1) {
        rstJump = true;
    }
    shared.lastRst = shared.rst;
    
    // 检查是否处于适宜温度范围
    const isSuitable = habitability ? habitability.canGrow : (shared.tem >= lowTempDestruction) && (shared.tem <= highTempDestruction);
    
    // 文明生存状态检测
    let civilizationStateChanged = false;
    let civilizationStarted = false;
    let destructionEvent = ""; // 记录毁灭事件
    
    // 处理rst跳变导致的文明毁灭 - 改为天体逃逸
    if (rstJump && shared.civilizationAlive) {
        destructionEvent = tr('天体逃逸', isEnglish);
        shared.civilizationAlive = false;
        shared.lastCivilizationLifespan = currentYear - shared.civilizationStartTime;
        
        shared.civilizationRecords.push({
            number: shared.civilizationCount,
            lifespan: shared.lastCivilizationLifespan,
            destructionEvent: destructionEvent,
            text: shared.text
        });
        
        shared.civilizationCount++;
        civilizationStateChanged = true;
        shared.suitablePeriodCount = 0;
    }
    
    if (isSuitable && !rstJump) {
        shared.suitablePeriodCount += habitability ? habitability.growth : 1;
        
        if (!shared.civilizationAlive && shared.suitablePeriodCount >= survivalThreshold) {
            shared.civilizationAlive = true;
            shared.suitablePeriodCount = 0;
            civilizationStateChanged = true;
            civilizationStarted = true;
            shared.civilizationStartTime = currentYear;
        }
    } else if (!rstJump) {
        shared.suitablePeriodCount = habitability ? Math.max(0, shared.suitablePeriodCount - 1) : 0;
    }
    
    // 计算当前状态
    let currentStates = {
        lingkong: "",
        feixing: "",
        planetCollision: "",
        starCollision: "",
        rocheLimit: "",
        destruction: ""
    };
    
    // 0. 检查大撕裂（洛希极限） - 立即毁灭
    const rocheEvents = [];
    if (shared.d14 < rocheLimit) rocheEvents.push(tr('恒星1', isEnglish));
    if (shared.d24 < rocheLimit) rocheEvents.push(tr('恒星2', isEnglish));
    if (shared.d34 < rocheLimit) rocheEvents.push(tr('恒星3', isEnglish));
    
    if (rocheEvents.length > 0) {
        currentStates.rocheLimit = tr('大撕裂{{stars}}', isEnglish, {
            stars: rocheEvents.join(tr('、', isEnglish))
        });
        
        // 大撕裂立即导致文明毁灭
        if (shared.civilizationAlive) {
            destructionEvent = currentStates.rocheLimit;
            shared.civilizationAlive = false;
            shared.lastCivilizationLifespan = currentYear - shared.civilizationStartTime;
            
            shared.civilizationRecords.push({
                number: shared.civilizationCount,
                lifespan: shared.lastCivilizationLifespan,
                destructionEvent: destructionEvent,
                text: shared.text
            });
            
            shared.civilizationCount++;
            civilizationStateChanged = true;
        }
    }
    
    // 1. 检查行星与恒星相撞 - 立即毁灭
    const collisionEvents = [];
    if (shared.d14 < collisionDistance) collisionEvents.push(tr('恒星1', isEnglish));
    if (shared.d24 < collisionDistance) collisionEvents.push(tr('恒星2', isEnglish));
    if (shared.d34 < collisionDistance) collisionEvents.push(tr('恒星3', isEnglish));
    
    if (collisionEvents.length > 0 && !destructionEvent) {
        currentStates.planetCollision = tr('行星与{{stars}}相撞', isEnglish, {
            stars: collisionEvents.join(tr('、', isEnglish))
        });
        
        // 行星相撞立即导致文明毁灭
        if (shared.civilizationAlive) {
            destructionEvent = currentStates.planetCollision;
            shared.civilizationAlive = false;
            shared.lastCivilizationLifespan = currentYear - shared.civilizationStartTime;
            
            shared.civilizationRecords.push({
                number: shared.civilizationCount,
                lifespan: shared.lastCivilizationLifespan,
                destructionEvent: destructionEvent,
                text: shared.text
            });
            
            shared.civilizationCount++;
            civilizationStateChanged = true;
        }
    }
    
    // 2. 检查凌空现象 - 不会立即毁灭，但影响温度
    const lingkongCount = [shared.d14, shared.d24, shared.d34].filter(d => d < lingkongDistance).length;
    if (lingkongCount > 0 && !destructionEvent) {
        if (lingkongCount === 3) currentStates.lingkong = tr('三日凌空', isEnglish);
        else if (lingkongCount === 2) currentStates.lingkong = tr('双日凌空', isEnglish);
        else currentStates.lingkong = tr('巨日凌空', isEnglish);
    }
    
    // 3. 检查飞星现象 - 不会立即毁灭，但影响温度
    const feixingCount = (shared.tem < feixingTemp) ? 
        [shared.d14, shared.d24, shared.d34].filter(d => d > feixingDistance).length : 0;
        
    if (feixingCount > 0 && !destructionEvent) {
        if (feixingCount === 3) currentStates.feixing = tr('三飞星', isEnglish);
        else if (feixingCount === 2) currentStates.feixing = tr('双飞星', isEnglish);
        else currentStates.feixing = tr('飞星', isEnglish);
    }
    
    // 4. 检查恒星相撞 - 立即毁灭
    const starCollisions = [];
    if (shared.d12 < collisionDistance) starCollisions.push(tr('恒星1与恒星2', isEnglish));
    if (shared.d13 < collisionDistance) starCollisions.push(tr('恒星1与恒星3', isEnglish));
    if (shared.d23 < collisionDistance) starCollisions.push(tr('恒星2与恒星3', isEnglish));
    
    if (starCollisions.length > 0 && !destructionEvent) {
        currentStates.starCollision = starCollisions.join(tr('，', isEnglish));
        
        // 恒星相撞立即导致文明毁灭
        if (shared.civilizationAlive && !habitability) {
            destructionEvent = currentStates.starCollision;
            shared.civilizationAlive = false;
            shared.lastCivilizationLifespan = currentYear - shared.civilizationStartTime;
            
            shared.civilizationRecords.push({
                number: shared.civilizationCount,
                lifespan: shared.lastCivilizationLifespan,
                destructionEvent: destructionEvent,
                text: shared.text
            });
            
            shared.civilizationCount++;
            civilizationStateChanged = true;
        }
    }
    
    // 5. 检查温度毁灭 - 只有在没有其他毁灭事件时才触发
    if (!rstJump && shared.civilizationAlive && !destructionEvent && 
        (habitability ? habitability.thermalFatal : (shared.tem < lowTempDestruction || shared.tem > highTempDestruction))) {
        
        shared.civilizationAlive = false;
        shared.lastCivilizationLifespan = currentYear - shared.civilizationStartTime;
        
        // 确定温度毁灭原因
        let tempDestruction = "";
        if (shared.tem < lowTempDestruction) {
            tempDestruction = tr('低温', isEnglish);
        } else if (shared.tem > highTempDestruction) {
            tempDestruction = tr('高温', isEnglish);
        }
        
        // 如果有凌空或飞星事件，优先使用作为毁灭原因
        if (currentStates.lingkong) {
            destructionEvent = currentStates.lingkong;
        } else if (currentStates.feixing) {
            destructionEvent = currentStates.feixing;
        } else {
            destructionEvent = tempDestruction;
        }
        
        shared.civilizationRecords.push({
            number: shared.civilizationCount,
            lifespan: shared.lastCivilizationLifespan,
            destructionEvent: destructionEvent,
            text: shared.text
        });
        
        shared.civilizationCount++;
        civilizationStateChanged = true;
    }
    
    if (habitability && civilizationStateChanged && !shared.civilizationAlive) shared.suitablePeriodCount = 0;

    // 检查是否需要记录新事件
    if (currentYear >= shared.lastLogYear + logInterval || civilizationStateChanged) {
        let shouldLog = false;
        const stateChanges = [];
        
        // 记录状态变化
        if (shared.civilizationAlive || civilizationStateChanged) {
            if (currentStates.rocheLimit !== shared.lastStates.rocheLimit) {
                if (currentStates.rocheLimit) stateChanges.push(currentStates.rocheLimit);
                shared.lastStates.rocheLimit = currentStates.rocheLimit;
                shouldLog = true;
            }
            
            if (currentStates.lingkong !== shared.lastStates.lingkong) {
                if (currentStates.lingkong) stateChanges.push(currentStates.lingkong);
                shared.lastStates.lingkong = currentStates.lingkong;
                shouldLog = true;
            }
            
            if (currentStates.feixing !== shared.lastStates.feixing) {
                if (currentStates.feixing) stateChanges.push(currentStates.feixing);
                shared.lastStates.feixing = currentStates.feixing;
                shouldLog = true;
            }
            
            if (currentStates.planetCollision !== shared.lastStates.planetCollision) {
                if (currentStates.planetCollision) stateChanges.push(currentStates.planetCollision);
                shared.lastStates.planetCollision = currentStates.planetCollision;
                shouldLog = true;
            }
            
            if (currentStates.starCollision !== shared.lastStates.starCollision) {
                if (currentStates.starCollision) stateChanges.push(currentStates.starCollision);
                shared.lastStates.starCollision = currentStates.starCollision;
                shouldLog = true;
            }
        }
        
        // 记录文明状态变化
        if (civilizationStateChanged) {
            if (civilizationStarted) {
                stateChanges.push(tr('第{{number}}号文明启动', isEnglish, {
                    number: shared.civilizationCount
                }));
            } else {
                stateChanges.push(tr('第{{number}}号文明毁灭于{{cause}}', isEnglish, {
                    number: shared.civilizationCount-1,
                    cause: destructionEvent || tr('未知原因', isEnglish)
                }));
            }
            shouldLog = true;
        }
        
        // 如果有状态变化，添加到日志
        if (shouldLog && stateChanges.length > 0) {
            const formattedYear = formatYear(currentYear);
            const eventText = stateChanges.join(tr('，', isEnglish));
            
            const logEntry = tr('第{{year}}年，{{event}}', isEnglish, {
                year: formattedYear,
                event: eventText
            });
            
            shared.logEntries.unshift(logEntry);
            
            if (shared.logEntries.length > 5) {
                shared.logEntries.pop();
            }
        }
        
        shared.lastLogYear = currentYear;
    }
    
    // 更新当前文明的存活时间
    if (shared.civilizationAlive) {
        const currentRecord = shared.civilizationRecords.find(
            record => record.number === shared.civilizationCount
        );
        
        if (currentRecord) {
            currentRecord.lifespan = currentYear - shared.civilizationStartTime;
        }
    }
    
    // 构建输出文本
    let output = "";
    if (shared.civilizationAlive) {
        output = tr('第{{number}}号文明正在运行', isEnglish, {
            number: shared.civilizationCount
        }) + '\n';
    } else {
        output = tr('文明无法生存', isEnglish) + '\n';
    }
    
    shared.logEntries.forEach(entry => {
        output += entry + '\n';
    });
    
    // 将文本分割为行并存储到共享变量
    const lines = output.split('\n');
    for (let i = 0; i < 6; i++) {
        shared[`txt${i+1}`] = lines[i] || '';
    }
    
    // 添加第七行：文明存活时间
    if (shared.civilizationAlive) {
        const lifespan = currentYear - shared.civilizationStartTime;
        const formattedLifespan = formatYear(lifespan);
        shared.txt7 = tr('文明已存活', isEnglish) + ": " + formattedLifespan + tr('年', isEnglish);
    } else {
        const formattedLifespan = formatYear(shared.lastCivilizationLifespan);
        shared.txt7 = tr('上个文明寿命', isEnglish) + ": " + formattedLifespan + tr('年', isEnglish);
    }
    
    // 添加第八至十三行：文明存活时间排行榜
    const leaderboard = [...shared.civilizationRecords]
        .filter(record => record.destructionEvent)
        .sort((a, b) => b.lifespan - a.lifespan)
        .slice(0, 6);
    
    shared.txt8 = tr('文明存活时间排行榜', isEnglish);
    
    for (let i = 0; i < 6; i++) {
        if (i < leaderboard.length) {
            const record = leaderboard[i];
            const formattedLifespan = formatYear(record.lifespan);
            
            shared[`txt${9+i}`] = tr('第{{number}}号文明，存活{{lifespan}}年，毁灭于{{cause}}', isEnglish, {
                number: record.number,
                lifespan: formattedLifespan,
                cause: record.destructionEvent
            }) + " " + (record.text || "");
        } else {
            shared[`txt${9+i}`] = '';
        }
    }
    
    return output;
}

return {update,scriptProperties};
}
