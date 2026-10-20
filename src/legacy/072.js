// Adapted from supplied SYKM SceneScript. See docs/SOURCE-AUDIT.md.
export default function createLegacy(ctx) {
const {shared,engine,input,thisScene,Vec3,createScriptProperties,Math} = ctx;
'use strict';

var scriptProperties = createScriptProperties()
    .addCheckbox({
        name: 'mL1EN',
        label: '中文/English',
        value: false
    })
    // 凌空条件
    .addSlider({
        name: 'lingkongDistance',
        label: '凌空距离阈值',
        value: 0.3,
        min: 0.02,
        max: 0.7,
    })
    // 飞星条件
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
    // 恒纪元条件
    .addSlider({
        name: 'stableLowTemp',
        label: '恒纪元低温阈值',
        value: -50,
        min: -273,
        max: 0,
    })
    .addSlider({
        name: 'stableHighTemp',
        label: '恒纪元高温阈值',
        value: 70,
        min: 40,
        max: 100,
    })
    .finish();

/**
 * @param {String} value - for property 'text'
 * @return {String} - update current property value
 */
function update(value) {
    // 获取配置参数
    const useChinese = !scriptProperties.mL1EN;
    const lingkongDistance = scriptProperties.lingkongDistance;
    const feixingDistance = scriptProperties.feixingDistance;
    const feixingTemp = scriptProperties.feixingTemp;
    const stableLowTemp = scriptProperties.stableLowTemp;
    const stableHighTemp = scriptProperties.stableHighTemp;
    
    let state = '';
    
    // 1. 检查凌空现象（优先显示）
    const lingkongCount = [shared.d14, shared.d24, shared.d34].filter(d => d < lingkongDistance).length;
    if (lingkongCount > 0) {
        if (lingkongCount === 3) {
            state = useChinese ? '三日凌空' : 'Tri-Solar Day';
        } else if (lingkongCount === 2) {
            state = useChinese ? '双日凌空' : 'Dual-Solar Day';
        } else {
            state = useChinese ? '巨日凌空' : 'Giant Solar Day';
        }
    }
    
    // 2. 如果没有凌空，检查飞星现象
    if (!state) {
        const feixingCount = (shared.tem < feixingTemp) ? 
            [shared.d14, shared.d24, shared.d34].filter(d => d > feixingDistance).length : 0;
            
        if (feixingCount > 0) {
            if (feixingCount === 3) {
                state = useChinese ? '三飞星' : 'Three Flying Stars';
            } else if (feixingCount === 2) {
                state = useChinese ? '双飞星' : 'Dual Flying Stars';
            } else {
                state = useChinese ? '飞星' : 'Flying Star';
            }
        }
    }
    
    // 3. 如果没有凌空或飞星，检查恒纪元条件
    if (!state) {
        if (shared.tem >= stableLowTemp && shared.tem <= stableHighTemp) {
            state = useChinese ? '恒纪元' : 'Stable Era';
        } else {
            state = useChinese ? '乱纪元' : 'Chaotic Era';
        }
    }
    
    return state;
}

return {update,scriptProperties};
}
