// Adapted from supplied SYKM SceneScript. See docs/SOURCE-AUDIT.md.
export default function createLegacy(ctx) {
const {shared,engine,input,thisScene,Vec3,createScriptProperties,Math} = ctx;
'use strict';

var scriptProperties = createScriptProperties()
	.addSlider({
		name: 'k_temp_dist',
		label: 'k_temp_dist',
		value: 10,
		min: 1,
		max: 100,
		integer: false
	})
	.addSlider({
		name: 'sL1',
		label: 'sL1',
		value: 1.5,
		min: 0.001,
		max: 10,
		integer: false
	})
    .addSlider({
		name: 'sL2',
		label: 'sL2',
		value: 0.5,
		min: 0.001,
		max: 10,
		integer: false
	})
    .addSlider({
		name: 'sL3',
		label: 'sL3',
		value: 0.1,
		min: 0.001,
		max: 10,
		integer: false
	})
	.finish();


/**
 * @param {String} value - for property 'text'
 * @return {String} - update current property value
 */
function update(value) {
    shared.k_temp_dist=scriptProperties.k_temp_dist;
    // 物理常数定义
    const SIGMA = 5.67e-8;          // 斯特藩-玻尔兹曼常数 [W/m²K⁴]
    const SOLAR_CONSTANT = 1361;     // 地球太阳常数 [W/m²]
    const BASE_ALBEDO = 0.3;         // 基础反照率（地球值）
    const AU = 1.496e11;             // 1天文单位(m)
    
    // 恒星参数 - 每颗恒星可以有不同的光度（太阳光度倍数）
    // 可以调整为不同的值（例如：0.2, 0.4, 0.3）
    const STAR_LUMINOSITY = {
        star1: scriptProperties.sL1,  // 恒星1的光度（太阳光度的30%）
        star2: scriptProperties.sL2,  // 恒星2的光度
        star3: scriptProperties.sL3   // 恒星3的光度
    };
    
    // 将距离单位转换为天文单位(AU)
    // 1单位距离 = 1e12 m → 转换为AU
    const toAU = (distance) => {
        // 添加最小距离保护，避免除零错误
        const minDistance = 0.01;
        const safeDistance = Math.max(distance, minDistance);
        return safeDistance * (1e12/ scriptProperties.k_temp_dist / AU);
    };
    
    // 计算每颗恒星的辐射通量（平方反比定律）
    const fluxFromStar = (distance, luminosity) => {
        const dAU = toAU(distance);
        return SOLAR_CONSTANT * luminosity / (dAU * dAU);
    };
    
    // 计算三颗恒星的总辐射通量
    let totalFlux = fluxFromStar(shared.d14, STAR_LUMINOSITY.star1) + 
                   fluxFromStar(shared.d24, STAR_LUMINOSITY.star2) + 
                   fluxFromStar(shared.d34, STAR_LUMINOSITY.star3);
    
    // 动态反照率（温度越低反照率越高 - 冰雪反馈）
    let dynamicAlbedo = BASE_ALBEDO;
    if (totalFlux > 0) {
        // 先计算基础温度（用于反照率反馈）
        let baseTemp = Math.pow(totalFlux * (1 - BASE_ALBEDO) / (4 * SIGMA), 0.25) - 273.15;
        
        // 温度低于0°C时增加反照率（冰雪增加）
        if (baseTemp < 0) {
            const snowCover = Math.min(1, -baseTemp / 20); // 0到1之间
            dynamicAlbedo = BASE_ALBEDO + (0.6 - BASE_ALBEDO) * snowCover;
        }
    }
    
    // 应用反照率校正
    let absorbedFlux = totalFlux * (1 - dynamicAlbedo);
    
    // 计算平衡温度 (斯特藩-玻尔兹曼定律)
    let tempKelvin = Math.pow(absorbedFlux / (4 * SIGMA), 0.25);
    
    // 添加振荡效果（±10K合理范围）
    let oscillation = 10 * Math.sin(engine.runtime);
    
    // 转换为摄氏度
    let tempCelsius = tempKelvin - 273.15 + oscillation;
    
    // 设置合理温度边界（宇宙背景辐射~恒星表面温度）
    if (tempCelsius < -270) tempCelsius = -270;   // 接近宇宙微波背景辐射
    if (tempCelsius > 1500) tempCelsius = 1500;   // 低于恒星表面温度
    
    // 更新共享变量和返回值
    shared.tem = tempCelsius.toFixed(2);
    return shared.tem + '°C';
}

return {update,scriptProperties};
}
