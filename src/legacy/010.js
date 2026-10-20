// Adapted from supplied SYKM SceneScript. See docs/SOURCE-AUDIT.md.
export default function createLegacy(ctx) {
const {shared,engine,input,thisScene,Vec3,createScriptProperties,Math} = ctx;
'use strict';

var scriptProperties = createScriptProperties()
	.addSlider({
		name: 'kt',
		label: 'kt',
		value: 10,
		min: 0.01,
		max: 100,
		integer: false
	})
	.finish()

const TIME_PER_FRAME = 1;
let xntime = Number(shared.xntime) || 0;

function update(value) {
    shared.kt= scriptProperties.kt;
    
    // 初始化累积时间
    if (typeof shared.xntime === 'undefined') {
        xntime = 0;
    }
    
    // 计算每帧增加的时间量
    const frameTime = TIME_PER_FRAME * Math.pow(shared.kt / 10 * shared.ktime, 2) / 60;
    
    // 累积时间
    xntime += frameTime;
    //shared.xntime = 2.422209 * Math.sqrt(shared.kg/1000) * xntime / 60;
    shared.xntime = xntime; // Keep elapsed years continuous when time factors change.
    // 根据数值大小选择显示格式
    let displayTime;
    if (shared.xntime < 1e8) {  // 小于100,000,000
        displayTime = shared.xntime.toFixed(2);  // 保留两位小数
    } else {
        displayTime = shared.xntime.toExponential(2);  // 科学计数法保留两位小数
    }
    
    return displayTime + ' Years';
}

return {update,scriptProperties};
}
