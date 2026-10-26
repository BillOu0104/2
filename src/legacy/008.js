import {GravityIntegrator} from '../physics/gravity.js';
// Adapted from supplied SYKM SceneScript. See docs/SOURCE-AUDIT.md.
export default function createLegacy(ctx) {
const {shared,engine,input,thisScene,Vec3,createScriptProperties,Math} = ctx;
'use strict';

var scriptProperties = createScriptProperties()
    //------------------ 约束系统------------------//
    .addCheckbox({
        name: 'constraint_En',
        label: '引力牢笼',
        value: false
    })
    .addCheckbox({  // 新增硬牢笼选项
        name: 'hardConstraint',
        label: '硬牢笼',
        value: false
    })
    .addSlider({
        name: 'constraint_M',
        label: 'Mc引力牢笼场等效质量',
        value: 5e6,
        min: 1e5,
        max: 1e10,
        integer: false
    })
    .addSlider({
        name: 'constraint_k1',
        label: 'k1内区斥力强度',
        value: 0,
        min: 0,
        max: 1.0,
        integer: false
    })
    .addSlider({
        name: 'constraint_re',
        label: 're斥力作用半径',
        value: 0.1,
        min: 0.01,
        max: 0.2,
        integer: false
    })
    .addSlider({
        name: 'constraint_k2',
        label: 'k2外区约束强度',
        value: 0.5,
        min: 0.1,
        max: 10,
        integer: false
    })
    .addSlider({
        name: 'constraint_rc',
        label: 'rc约束作用半径',
        value: 0.2,
        min: 0.2,
        max: 10.0,
        integer: false
    })
    .addSlider({  // 新增Rc属性
        name: 'constraint_Rc',
        label: 'Rc约束上限半径',
        value: 2.1,
        min: 2.1,
        max: 20.0,
        integer: false
    })
    .addSlider({
        name: 'constraint_n',
        label: 'exc外区约束指数',
        value: 2,
        min: 1,
        max: 10,
        integer: true
    })
    //----------------视角控制----------------- //
    .addCheckbox({
        name: 'lenR_en',
        label: '启用自旋',
        value: true
    })
    .addSlider({
        name: 'lenc_mode',
        label: '视角模式',
        value: 0,
        min: 0,
        max: 2,
        integer: true
    })
    //跟随
    .addSlider({
        name: 'lenV',
        label: '鼠标跟随速度',
        value: 0.1,
        min: 0.01,
        max: 0.2,
        integer: false
    })
    .addSlider({
        name: 'lenAX',
        label: 'X跟随角度',
        value: 90,
        min: 0,
        max: 180,
        integer: false
    })
    .addSlider({
        name: 'lenAY',
        label: 'y跟随角度',
        value: 30,
        min: 0,
        max: 30,
        integer: false
    })
    //自旋
    .addSlider({
        name: 'zizhuanY',// 屏幕y轴自转角度
        label: 'y轴自转',
        value: 3,
        min: -6,
        max: 6,
        integer: false
    })
    .addSlider({
        name: 'zizhuanX',// 屏幕x轴自转角度
        label: 'x轴自转',
        value: 3,
        min: -6,
        max: 6,
        integer: false
    })
    //拖动
    .addSlider({
        name: 'senx',// 旋转灵敏度
        label: 'senx',
        value: 1,
        min: 0,
        max: 10,
        integer: false
    })
    .addSlider({
        name: 'seny',// 旋转灵敏度
        label: 'seny',
        value: 1,
        min: 0,
        max: 10,
        integer: false
    })
    .addSlider({
        name: 'damp',// 阻尼
        label: 'damp',
        value: 0.985,
        min: 0.98,
        max: 1,
        integer: false
    })
    //----------------文明种子----------------- //
    .addCheckbox({
        name: 'cus_en',
        label: '启用自定义初始条件',
        value: false
    })
    // 天体1自定义初始条件
    .addSlider({
        name: 'body1_x',
        label: '天体1 X位置',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body1_y',
        label: '天体1 Y位置',
        value: 1,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body1_z',
        label: '天体1 Z位置',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body1_vx',
        label: '天体1 X速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body1_vy',
        label: '天体1 Y速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body1_vz',
        label: '天体1 Z速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    // 天体2自定义初始条件
    .addSlider({
        name: 'body2_x',
        label: '天体2 X位置',
        value: -0.866,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body2_y',
        label: '天体2 Y位置',
        value: -0.5,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body2_z',
        label: '天体2 Z位置',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body2_vx',
        label: '天体2 X速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body2_vy',
        label: '天体2 Y速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body2_vz',
        label: '天体2 Z速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    // 天体3自定义初始条件
    .addSlider({
        name: 'body3_x',
        label: '天体3 X位置',
        value: 0.866,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body3_y',
        label: '天体3 Y位置',
        value: -0.5,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body3_z',
        label: '天体3 Z位置',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body3_vx',
        label: '天体3 X速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body3_vy',
        label: '天体3 Y速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body3_vz',
        label: '天体3 Z速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    // 第四天体自定义初始条件
    .addSlider({
        name: 'body4_x',
        label: '第四天体 X位置',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body4_y',
        label: '第四天体 Y位置',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body4_z',
        label: '第四天体 Z位置',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body4_vx',
        label: '第四天体 X速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body4_vy',
        label: '第四天体 Y速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'body4_vz',
        label: '第四天体 Z速度',
        value: 0,
        min: -2,
        max: 2,
        integer: false
    })

    // 天体参数
    .addSlider({
        name: 'vcvc',
        label: '随机速度范围vcvc',
        value: 1,
        min: 0,
        max: 4,
        integer: false
    })
    .addSlider({
        name: 'xcxc',
        label: '随机位置范围xcxc',
        value: 1.5,
        min: 0,
        max: 4,
        integer: false
    })
    .addCheckbox({
        name: 'rxz',
        label: 'rxz',
        value: false
    })
    .addSlider({
        name: 'kg',
        label: '引力倍数',
        value: 1000,
        min: 1,
        max: 1000000
    })
    .addSlider({
        name: 'step',
        label: '步长',
        value: 0.75,
        min: 0.01,
        max: 10
    })
    .addSlider({
        name: 'mass1',
        label: '天体1质量',
        value: 5e6,
        min: 0,
        max: 1e10
    })
    .addSlider({
        name: 'mass2',
        label: '天体2质量',
        value: 5e6,
        min: 0,
        max: 1e10
    })
    .addSlider({
        name: 'mass3',
        label: '天体3质量',
        value: 5e6,
        min: 0,
        max: 1e10
    })
    .addSlider({
        name: 'fourthMass',
        label: '第四天体质量',
        value: 1e3,
        min: 0,
        max: 1e5
    })
    .addColor({
        name: 'color1',
        label: '天体1颜色',
        value: new Vec3(0.9,0.9,0.9)
    })
    .addColor({
        name: 'color2',
        label: '天体2颜色',
        value: new Vec3(0.9,0.9,0.9)
    })
    .addColor({
        name: 'color3',
        label: '天体3颜色',
        value: new Vec3(0.9,0.9,0.9)
    })
    .addColor({
        name: 'color4',
        label: '第四天体颜色',
        value: new Vec3(0.5,0.6,0.7)
    })
    //----------------引力软化----------------- //
    .addSlider({
        name: 'ras',
        label: '引力软化距离',
        value: 0.1,
        min: 0.01,
        max: 0.5
    })
    .addSlider({
        name: 'kSoft',
        label: '引力软化倍数',
        value: 2.8,
        min: 1.5,
        max: 5.0
    })
    //----------------轨迹----------------- //
    .addCheckbox({
        name: 'trailen',
        label: '轨迹显示',
        value: true
    })
    .addSlider({
        name: 'trailLength',
        label: '轨迹长度',
        value: 400,
        min: 50,
        max: 400,//重要勿改T^T：TMD大于400会报错，WE有最大2048图层限制，麻了
        integer: true
    })
    .addSlider({
        name: 'trailStartSize',
        label: '轨迹起点大小',
        value: 0.00013,
        min: 0.00001,
        max: 0.01
    })
    .addSlider({
        name: 'trailEndSize',
        label: '轨迹终点大小',
        value: 0.0002,
        min: 0.0002,
        max: 0.001
    })
    //----------------逃逸重启距离----------------- //
    .addSlider({
        name: 'DD',
        label: '质心距离阈值',
        value: 4.5,
        min: 4,
        max: 20.0,
        integer: false
    })
    //----------------时间加速----------------- //
    .addSlider({
        name: 'ktime',
        label: '时间加速',
        value: 1,
        min: 0.1,
        max: 3,
        integer: false
    })
    .finish();

//----------------微缩系统控制----------------- //
const r_sim=1;
const r_real=1e12;
const m_sim=5e6;
const m_real=1e30;
const t_sim=1;
let lamR;
let lamM;
let lamT;
let kv;
let G;
//////////////////////////////////////////////////////

const FIXED_TIMESTEP = scriptProperties.step/1000; // 固定物理时间步长

// Yoshida1990
const w1 = 1.35120719196;
const w0 = -1.70241438392;
const c1 = w1/2;
const c2 = (w0 + w1)/2;
const c3 = (w0 + w1)/2;
const c4 = w1/2;
const d1 = w1;
const d2 = w0;
const d3 = w1;

// 初始化天体数组
let bodies = [];
let gravity = null;
let physicsMonitor = null;

let frameCount = 0;
let lastTrailenState = scriptProperties.trailen;
let trailPointsPool = [];
let needsReset = true; // 初始时需要重置

// 物理时间管理变量
let lastPhysicsTime = 0;
let accumulatedTime = 0;
let physicsCom = {x: 0, y: 0, z: 0}; // 物理计算中的质心

// 初始化旋转角度和速度
if (typeof shared.rotX === 'undefined') shared.rotX = 0;
if (typeof shared.rotY === 'undefined') shared.rotY = 0;
if (typeof shared.rotVelX === 'undefined') shared.rotVelX = 0;
if (typeof shared.rotVelY === 'undefined') shared.rotVelY = 0;
if (typeof shared.lastMouseX === 'undefined') shared.lastMouseX = 0;
if (typeof shared.lastMouseY === 'undefined') shared.lastMouseY = 0;
if (typeof shared.last_time === 'undefined') shared.last_time = 0;

// 处理用户属性变化
function applyUserProperties(changedUserProperties) {
    // 所有需要重置系统的属性
    const resetProps = [
        'cus_en', 
        'body1_x', 'body1_y', 'body1_z', 'body1_vx', 'body1_vy', 'body1_vz',
        'body2_x', 'body2_y', 'body2_z', 'body2_vx', 'body2_vy', 'body2_vz',
        'body3_x', 'body3_y', 'body3_z', 'body3_vx', 'body3_vy', 'body3_vz',
        'body4_x', 'body4_y', 'body4_z', 'body4_vx', 'body4_vy', 'body4_vz',
        'mass1', 'mass2', 'mass3', 'fourthMass',
        'color1', 'color2', 'color3', 'color4',
        'vcvc', 'kg', 'step', 'ras', 'kSoft',
        'trailen', 'trailLength', 'trailStartSize', 'trailEndSize',
        'constraint_En', 'constraint_M', 'constraint_k1', 'constraint_re',
        'constraint_k2', 'constraint_rc', 'constraint_n',
        'hardConstraint', 'constraint_Rc','ktime'  // 添加新属性
    ];
    
    let shouldReset = false;
    
    for (const prop of resetProps) {
        if (changedUserProperties.hasOwnProperty(prop)) {
            shouldReset = true;
            break;
        }
    }
    
    if (shouldReset) {
        needsReset = true;
    }
}

function vecLength(x, y, z) {
    return Math.sqrt(x*x + y*y + z*z);
}

function vecNormalize(x, y, z) {
    const len = vecLength(x, y, z);
    return len > 0 ? {x: x/len, y: y/len, z: z/len} : {x: 0, y: 0, z: 0};
}

// 旋转函数（使用鼠标控制的角度）
function applyRotation(x, y, z) {
    if (!scriptProperties.rxz) {
        return { x, y, z };
    }

    // 使用共享变量中的旋转角度
    const angleX = -shared.rotX * Math.PI / 180;
    const angleY = shared.rotY * Math.PI / 180;
    
    // X轴旋转
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    
    // Y轴旋转
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    
    return { x: x2, y: y1, z: z2 };
}

// 计算约束加速度（扩展硬牢笼功能）
function computeConstraintAcceleration(body, com) {
    //
    if (!scriptProperties.constraint_En || body.mass<=0) {
        return {x: 0, y: 0, z: 0};
    }
    
    const dx = body.x - com.x;
    const dy = body.y - com.y;
    const dz = body.z - com.z;
    const r = vecLength(dx, dy, dz);
    
    const M = scriptProperties.constraint_M;
    const k1 = scriptProperties.constraint_k1;
    const re = scriptProperties.constraint_re;
    const k2 = scriptProperties.constraint_k2;
    const rc = scriptProperties.constraint_rc;
    const Rc = scriptProperties.constraint_Rc; // 新增Rc属性
    const n = scriptProperties.constraint_n;
    
    let accelerationMagnitude = 0;
    
    // 根据硬牢笼开关选择不同的约束方式
    if (scriptProperties.hardConstraint) {
        // 硬牢笼模式
        if (r <= re) {
            // 内区约束：防坍缩
            const ratio = r / re;
            accelerationMagnitude = -k1 * G * M * Math.pow(1 - ratio * ratio, 2);
        } else if (r > re && r <= rc) {
            // 中性区：无约束力
            accelerationMagnitude = 0;
        } else if (r > rc && r < Rc) {
            // 外区约束：防止逃逸
            const delta = r - rc;
            const denominator = Math.sqrt(Math.max(Rc * Rc - delta * delta, 1e-5)); // 防止分母为零
            accelerationMagnitude = k2 * G * M * delta / denominator;
        } else {
            // 当r >= Rc时，使用强大约束力防止逃逸
            accelerationMagnitude = 100 * k2 * G * M; // 非常大的力
        }
    } else {
        // 软牢笼模式（原有逻辑）
        if (r <= re) {
            const ratio = r / re;
            accelerationMagnitude = -k1 * G * M * Math.pow(1 - ratio * ratio, 2);
        } else if (r > rc) {
            const delta = r - rc;
            accelerationMagnitude = k2 * G * M * Math.pow(delta, n);
        } else {
            return {x: 0, y: 0, z: 0};
        }
    }
    
    // 计算方向向量（指向质心）
    const dir = vecNormalize(-dx, -dy, -dz);
    
    return {
        x: accelerationMagnitude * dir.x,
        y: accelerationMagnitude * dir.y,
        z: accelerationMagnitude * dir.z
    };
}

// Aarseth//这个软化方法真好用啊，斥力项显得歪门邪道了
function computeAcceleration(b1, b2) {

    if (b1.mass<=0) {
        return {x: 0, y: 0, z: 0};
    }
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const dz = b2.z - b1.z;
    
    const distance = Math.max(vecLength(dx, dy, dz), 1e-5);
    const dir = vecNormalize(dx, dy, dz);
    
    const ras = scriptProperties.ras;
    const k = scriptProperties.kSoft;
    const k_ras = k * ras;
    
    const beta = 3 / (k - 1);
    const alpha = 1 - beta;
    
    let accelMagnitude;
    
    if (distance <= ras) {
        accelMagnitude = G * b2.mass * distance / Math.pow(ras, 3);
    } else if (distance < k_ras) {
        const factor = alpha + beta * (distance / ras);
        accelMagnitude = factor * G * b2.mass / (distance * distance);
    } else {
        accelMagnitude = G * b2.mass / (distance * distance);
    }
    
    return {
        x: accelMagnitude * dir.x,
        y: accelMagnitude * dir.y,
        z: accelMagnitude * dir.z
    };
}

// 计算加速度
function computeAccelerations(com) {
    const accelerations = [];
    for (let i = 0; i < bodies.length; i++) {
        accelerations.push({x: 0, y: 0, z: 0});
    }
    
    // 计算天体间的引力加速度
    for (let i = 0; i < bodies.length; i++) {
        for (let j = 0; j < bodies.length; j++) {
            if (i !== j) {
                const accel = computeAcceleration(bodies[i], bodies[j]);
                accelerations[i].x += accel.x;
                accelerations[i].y += accel.y;
                accelerations[i].z += accel.z;
            }
        }
    }
    
    // 添加约束加速度
    if (scriptProperties.constraint_En) {
        for (let i = 0; i < bodies.length; i++) {
            const constraintAccel = computeConstraintAcceleration(bodies[i], com);
            accelerations[i].x += constraintAccel.x;
            accelerations[i].y += constraintAccel.y;
            accelerations[i].z += constraintAccel.z;
        }
    }
    
    return accelerations;
}

// 对象池 - 创建轨迹点
function getTrailPoint() {
    if (trailPointsPool.length > 0) {
        return trailPointsPool.pop();
    }
    
    const zOffset = typeof shared.gjz !== 'undefined' ? shared.gjz : 0;
    return thisScene.createLayer({
        "castshadow": false,
        "image": "models/ta.json",
        "origin": new Vec3(0, 0, -zOffset),
        "color": new Vec3(1, 1, 1),
        "alpha": 0, 
        "scale": new Vec3(scriptProperties.trailStartSize, scriptProperties.trailStartSize, scriptProperties.trailStartSize),
        "visible": false,
    });
}

//创建轨迹点
function createTrailPoint(relX, relY, relZ, color) {
    const point = getTrailPoint();
    if (!point) return null;
    
    point.color = color;
    point.alpha = 0;
    point.scale = new Vec3(scriptProperties.trailStartSize, scriptProperties.trailStartSize, scriptProperties.trailStartSize);
    point.visible = true;
    return point;
    
}
// 千万别用.destroyLayer方法，开发者能不能救一救啊？
// 安全回收轨迹点//.shift()
function recycleTrailPoint(point) {
    if (!point) return;
    
    point.visible = false;
    trailPointsPool.push(point);
}

// 更新轨迹点外观
function updateTrailAppearance(body) {
    const totalPoints = body.trailPositions.length;
    if (totalPoints === 0) return;
    
    for (let i = 0; i < totalPoints; i++) {
        if (!body.trail[i]) continue;
        
        const positionInTrail = i / (totalPoints - 1);
        const alpha = positionInTrail;
        const size = scriptProperties.trailStartSize + 
                    (scriptProperties.trailEndSize - scriptProperties.trailStartSize) * positionInTrail;
        
        body.trail[i].alpha = alpha;
        body.trail[i].scale = new Vec3(size, size, size);
    }
}

// 更新轨迹点位置
function updateAllTrailPositions() {
    const zOffset = typeof shared.gjz !== 'undefined' ? shared.gjz : 0;
    
    for (const body of bodies) {
        for (let i = 0; i < body.trail.length; i++) {
            if (!body.trail[i] || !body.trailPositions[i]) continue;
            
            const relPos = body.trailPositions[i];
            const rotated = applyRotation(relPos.x, relPos.y, relPos.z);
            
            body.trail[i].origin = new Vec3(
                rotated.x,
                rotated.y,
                rotated.z + zOffset
            );
        }
    }
}

// 重置轨迹
function resetTrails(com) {
    for (const body of bodies) {
        // 回收所有轨迹点
        for (const point of body.trail) {
            recycleTrailPoint(point);
        }
        
        // 重置轨迹数组
        body.trail = [];
        body.trailPositions = [];
        
        // 初始化新轨迹
        const relX = body.x - com.x;
        const relY = body.y - com.y;
        const relZ = body.z - com.z;
        
        const point = createTrailPoint(relX, relY, relZ, body.color);
        if (point) {
            body.trail.push(point);
            body.trailPositions.push({x: relX, y: relY, z: relZ});
        }
    }
}

// 添加轨迹点 //注意安全限制
function addTrailPoint(body, com) {
    const relX = body.x - com.x;
    const relY = body.y - com.y;
    const relZ = body.z - com.z;
    
    const point = createTrailPoint(relX, relY, relZ, body.color);
    if (!point) return;
    
    body.trail.push(point);
    body.trailPositions.push({x: relX, y: relY, z: relZ});
    
    // 检查是否超出最大长度 
    if (body.trail.length > scriptProperties.trailLength) {
        // 移除最旧的点
        const oldPoint = body.trail.shift();
        recycleTrailPoint(oldPoint);
        body.trailPositions.shift();
    }
}

// 隐藏所有轨迹
function hideAllTrails() {
    for (const body of bodies) {
        for (const point of body.trail) {
            if (point) {
                point.alpha = 0;
                point.visible = false;
            }
        }
    }
}

// 清除所有轨迹
function clearAllTrails() {
    for (const body of bodies) {
        for (const point of body.trail) {
            recycleTrailPoint(point);
        }
        body.trail = [];
        body.trailPositions = [];
    }
    frameCount = 0;
}

// 质心计算
function computeCenterOfMass() {
    let totalMass = 0, comX = 0, comY = 0, comZ = 0;
    
    for (const body of bodies) {
        totalMass += body.mass;
        comX += body.mass * body.x;
        comY += body.mass * body.y;
        comZ += body.mass * body.z;
    }
    
    return totalMass > 0 ? { 
        x: comX / totalMass, 
        y: comY / totalMass, 
        z: comZ / totalMass 
    } : { x: 0, y: 0, z: 0 };
}

// 重置物理状态
function resetPhysicsState() {
    lastPhysicsTime = engine.runtime;
    accumulatedTime = 0;
    physicsCom = {x: 0, y: 0, z: 0};
    frameCount = 0;
}

// 重置系统
function resetSystem() {
    // 先清除所有轨迹
    clearAllTrails();
    
    
    //const v_sim=v_real*lamT/lamR
    bodies = [
        { 
            x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, 
            mass: scriptProperties.mass1, 
            trail: [],
            trailPositions: [],
            color: scriptProperties.color1,
            prevX: 0, prevY: 0, prevZ: 0
        },
        { 
            x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, 
            mass: scriptProperties.mass2, 
            trail: [],
            trailPositions: [],
            color: scriptProperties.color2,
            prevX: 0, prevY: 0, prevZ: 0
        },
        { 
            x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0,
            mass: scriptProperties.mass3,
            trail: [],
            trailPositions: [],
            color: scriptProperties.color3,
            prevX: 0, prevY: 0, prevZ: 0
        },
        { 
            x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, 
            mass: scriptProperties.fourthMass,
            trail: [],
            trailPositions: [],
            color: scriptProperties.color4,
            prevX: 0, prevY: 0, prevZ: 0
        }
    ];

    // 根据自定义开关决定使用哪种初始条件
    if (scriptProperties.cus_en) {
        // 使用自定义初始位置和速度
        bodies[0].x = scriptProperties.body1_x;
        bodies[0].y = scriptProperties.body1_y;
        bodies[0].z = scriptProperties.body1_z;
        bodies[0].vx = scriptProperties.body1_vx//*kv;
        bodies[0].vy = scriptProperties.body1_vy//*kv;
        bodies[0].vz = scriptProperties.body1_vz//*kv;
        
        bodies[1].x = scriptProperties.body2_x;
        bodies[1].y = scriptProperties.body2_y;
        bodies[1].z = scriptProperties.body2_z;
        bodies[1].vx = scriptProperties.body2_vx//*kv;
        bodies[1].vy = scriptProperties.body2_vy//*kv;
        bodies[1].vz = scriptProperties.body2_vz//*kv;
        
        bodies[2].x = scriptProperties.body3_x;
        bodies[2].y = scriptProperties.body3_y;
        bodies[2].z = scriptProperties.body3_z;
        bodies[2].vx = scriptProperties.body3_vx//*kv;
        bodies[2].vy = scriptProperties.body3_vy//*kv;
        bodies[2].vz = scriptProperties.body3_vz//*kv;
        
        bodies[3].x = scriptProperties.body4_x;
        bodies[3].y = scriptProperties.body4_y;
        bodies[3].z = scriptProperties.body4_z;
        bodies[3].vx = scriptProperties.body4_vx//*kv;
        bodies[3].vy = scriptProperties.body4_vy//*kv;
        bodies[3].vz = scriptProperties.body4_vz//*kv;
        
    } else {
        // 使用原有初始条件
//        bodies[0].x = 0; bodies[0].y = 1; bodies[0].z = 0;
//        bodies[1].x = -0.866; bodies[1].y = -0.5; bodies[1].z = 0;
//        bodies[2].x = 0.866; bodies[2].y = -0.5; bodies[2].z = 0;
//        bodies[3].x = 0.1; bodies[3].y = 0.1; bodies[3].z = 0.1;

        // 可惜了，三角形多好看啊，为了eto妥协了^-^
        // xcxc随机位置
        const xc = scriptProperties.xcxc;
        for (let i = 0; i < bodies.length; i++) {
            bodies[i].x = (Math.random() - 0.5) * xc;
            bodies[i].y = (Math.random() - 0.5) * xc;
            bodies[i].z = (Math.random() - 0.5) * xc;
        }
        // vcvc随机速度
        const vc = scriptProperties.vcvc;
        for (let i = 0; i < bodies.length; i++) {
            bodies[i].vx = (Math.random() - 0.5) * vc//*kv;
            bodies[i].vy = (Math.random() - 0.5) * vc//*kv;
            bodies[i].vz = (Math.random() - 0.5) * vc//*kv;
        }
    }
    
    if (!scriptProperties.cus_en) ctx.prepareInitialBodies?.(bodies, G, scriptProperties);
    else ctx.prepareManualBodies?.(bodies,G,scriptProperties);
    // 初始化前一个位置
    for (let i = 0; i < bodies.length; i++) {
        bodies[i].prevX = bodies[i].x;
        bodies[i].prevY = bodies[i].y;
        bodies[i].prevZ = bodies[i].z;
    }
    const config=ctx.getPhysicsSettings?.();
    physicsMonitor=config?new GravityIntegrator(bodies,G,{model:config.gravityModel,softening:scriptProperties.ras,kSoft:scriptProperties.kSoft,
        cageAcceleration:scriptProperties.constraint_En?body=>computeConstraintAcceleration(body,computeCenterOfMass()):null,
        radii:()=>{const c=ctx.getPhysicsSettings();return [c._13,c._21,c._3,c.newproperty20].map((r,i)=>i<3?r*(c.stellarBreathing?1+.08*Math.sin(engine.runtime/120+i*2):1):r);}}):null;
    gravity=config?.gravityModel!=='legacy'?physicsMonitor:null;
    ctx.onInitialize?.(bodies.map(b => ({ x:b.x, y:b.y, z:b.z, vx:b.vx, vy:b.vy, vz:b.vz, mass:b.mass })));
}

function init(value) {
    // 初始化共享变量
    if (typeof shared.gjz === 'undefined') shared.gjz = -9;
    if (typeof shared.rst === 'undefined') shared.rst = 0;
    if (typeof shared.cfw === 'undefined') shared.cfw = 0;
    
    // 初始化旋转相关变量
    if (typeof shared.rotVelX === 'undefined') shared.rotVelX = 0;
    if (typeof shared.rotVelY === 'undefined') shared.rotVelY = 0;
    if (typeof shared.lastMouseX === 'undefined') shared.lastMouseX = 0;
    if (typeof shared.lastMouseY === 'undefined') shared.lastMouseY = 0;
    if (typeof shared.last_time === 'undefined') shared.last_time = engine.runtime;
    

    // 计算初始微缩参数
    lamR = r_real / r_sim;
    lamM = m_real / m_sim;
    // 初始时不需要重置（等待applyUserProperties处理）
    needsReset = true;
}

// Also used by the offline benchmark to execute the unchanged legacy solver.
function initializePhysics(){
    lamT=60*60*24*365/t_sim;
    G=(scriptProperties.kg/1000)*6.67430e-11*lamM*Math.pow(lamT,2)/Math.pow(lamR,3);
    kv=scriptProperties.ktime;
    resetSystem();resetPhysicsState();physicsCom={...computeCenterOfMass()};resetTrails(physicsCom);needsReset=false;
}

// 物理更新函数
function updatePhysics(timeStep) {
    if(gravity){
        for(const body of bodies){body.prevX=body.x;body.prevY=body.y;body.prevZ=body.z;}
        const config=ctx.getPhysicsSettings();
        const start=gravity.time,duration=kv*kv*timeStep;
        gravity.advance(duration,{maxStep:FIXED_TIMESTEP,eta:config.encounterAccuracy,onAcceptedStep:ctx.observePhysicalStep?(sample,time)=>ctx.observePhysicalStep(sample,engine.runtime-1/60+(time-start)/duration/60):null});
        physicsCom=computeCenterOfMass();frameCount++;return;
    }


    //const k = scriptProperties.ktime;
    const dtimeStep = kv * kv * timeStep
    physicsMonitor?.save();
    // 保存当前位置作为前一个位置（用于插值）
    for (const body of bodies) {
        body.prevX = body.x;
        body.prevY = body.y;
        body.prevZ = body.z;
    }
    
    // 1p
    for (const body of bodies) {
        body.x += c1 * dtimeStep * body.vx;
        body.y += c1 * dtimeStep * body.vy;
        body.z += c1 * dtimeStep * body.vz;
    }
    
    // 更新物理质心（用于约束力计算）
    physicsCom = computeCenterOfMass();
    
    // 2v
    const accels1 = computeAccelerations(physicsCom);
    for (let i = 0; i < bodies.length; i++) {
        bodies[i].vx += d1 * dtimeStep * accels1[i].x;
        bodies[i].vy += d1 * dtimeStep * accels1[i].y;
        bodies[i].vz += d1 * dtimeStep * accels1[i].z;
    }
    
    // 3p
    for (const body of bodies) {
        body.x += c2 * dtimeStep * body.vx;
        body.y += c2 * dtimeStep * body.vy;
        body.z += c2 * dtimeStep * body.vz;
    }
    
    // 更新物理质心
    physicsCom = computeCenterOfMass();
    
    // 4v
    const accels2 = computeAccelerations(physicsCom);
    for (let i = 0; i < bodies.length; i++) {
        bodies[i].vx += d2 * dtimeStep * accels2[i].x;
        bodies[i].vy += d2 * dtimeStep * accels2[i].y;
        bodies[i].vz += d2 * dtimeStep * accels2[i].z;
    }
    
    // 5p
    for (const body of bodies) {
        body.x += c3 * dtimeStep * body.vx;
        body.y += c3 * dtimeStep * body.vy;
        body.z += c3 * dtimeStep * body.vz;
    }
    
    // 更新物理质心
    physicsCom = computeCenterOfMass();
    
    // 6v
    const accels3 = computeAccelerations(physicsCom);
    for (let i = 0; i < bodies.length; i++) {
        bodies[i].vx += d3 * dtimeStep * accels3[i].x;
        bodies[i].vy += d3 * dtimeStep * accels3[i].y;
        bodies[i].vz += d3 * dtimeStep * accels3[i].z;
    }
    
    // 7p
    for (const body of bodies) {
        body.x += c4 * dtimeStep * body.vx;
        body.y += c4 * dtimeStep * body.vy;
        body.z += c4 * dtimeStep * body.vz;
    }
    
    // 更新物理质心
    physicsCom = computeCenterOfMass();
    
    if(physicsMonitor){physicsMonitor.time+=dtimeStep;physicsMonitor.steps++;physicsMonitor.detectContacts(dtimeStep);}
    frameCount++;
}

shared.num=0;
let cx=0;
let cy=0;
//-----------------------------------------------------------------------------------------------------------------------------main
function update(value) {
    //---------------微缩系统参数计算-----------------------------------//
    // 每次更新时重新计算微缩参数
    const t_real = 60*60*24*365 //* scriptProperties.ktime;
    lamT = t_real / t_sim;
    G = (scriptProperties.kg/1000) * 6.67430e-11 * lamM * Math.pow(lamT, 2) / Math.pow(lamR, 3);
    kv = scriptProperties.ktime;
    //const v_sim=v_real*lamT/lamR
    //console.log(G)
    shared.ktime=scriptProperties.ktime;
    //----------------------------------------------------------------//
    shared.ylll=scriptProperties.constraint_En;
    shared.kg = scriptProperties.kg;
    // 处理系统重置
    if (needsReset) {
        resetSystem();
        resetPhysicsState();
        
        // 计算初始质心
        const initCom = computeCenterOfMass();
        physicsCom = {...initCom};
        resetTrails(initCom);
        
        needsReset = false;
    }
    
    // 处理手动重置
    if (shared.rst === 1) {
        shared.num++;//冲吧皮卡丘，靠你了
        shared.rst = 0;
    }
    if (shared.num>0 && shared.num<=400)//400帧
    {
        shared.num++;
    }
    else
    {
        shared.num=0;
    }
    if (shared.num===120)//60fps - 2s//延时重启
    {
        resetSystem();
        resetPhysicsState();
        
        // 计算初始质心
        const initCom = computeCenterOfMass();
        physicsCom = {...initCom};
        resetTrails(initCom);
    }
    
    // 更新共享变量
    shared.rxz = scriptProperties.rxz;
    
    // 使用engine.runtime计算时间差
    const currentTime = engine.runtime;
    const deltaTime = currentTime - lastPhysicsTime;
    lastPhysicsTime = currentTime;
    
    // 累积时间
    accumulatedTime += deltaTime;
    // 鼠标模式
    const lenc_mode = scriptProperties.lenc_mode;
    // 鼠标控制旋转视角（带惯性效果）
    const sensitivityx = scriptProperties.senx * 5; // 灵敏度系数
    const sensitivityy = scriptProperties.seny * 100; // 灵敏度系数
    const damping = scriptProperties.damp; // 阻尼系数（惯性衰减）
    const minVelocity = 0.001; // 最小速度阈值
    const lenrk = scriptProperties.lenR_en?1:0;//屏幕自旋使能系数
    // 鼠标跟随
    const lenV = scriptProperties.lenV;
    const lenAX = scriptProperties.lenAX;
    const lenAY = scriptProperties.lenAY;

    // 计算归一化鼠标位置
    const normalizedX = (input.cursorScreenPosition.x - engine.screenResolution.x/2) / (engine.screenResolution.x/2);
    const normalizedY = (input.cursorScreenPosition.y - engine.screenResolution.y/2) / (engine.screenResolution.y/2);
    
    // 钳位到[-1,1]范围
    const currentMouseX = Math.max(-1, Math.min(1, normalizedX));
    const currentMouseY = Math.max(-1, Math.min(1, normalizedY));

    if (lenc_mode==0)
    {
        if (shared.c_down) 
        {
            // 计算差值
            const deltaX = currentMouseX - shared.lastMouseX;
            // 更新旋转速度
            shared.rotVelY += deltaX * sensitivityx;
            shared.rotX += sensitivityy * (currentMouseY - shared.lastMouseY);
        } else {
            // 阻尼（惯性效果）
            shared.rotVelY *= damping;
            // 当速度低于阈值时停止
            if (Math.abs(shared.rotVelY) < minVelocity) shared.rotVelY = 0;
        }
        
        // 更新旋转角度
        shared.rotY += (shared.rotVelY + deltaTime * lenrk * scriptProperties.zizhuanY);
        // 限制X轴旋转范围（-30到30度）
        shared.rotX = Math.max(-30, Math.min(30, shared.rotX ));
        shared.rotX += scriptProperties.zizhuanX * lenrk * deltaTime * Math.cos(0.1*engine.runtime);
        // cos效果没有想象中的平滑
        // 保存当前鼠标位置用于下一帧计算
        shared.lastMouseX = currentMouseX;
        shared.lastMouseY = currentMouseY;
    }
    else if (lenc_mode==1)
    {
        if(cx<currentMouseX)
            {
                cx+=lenV*(currentMouseX-cx)*1000*engine.frametime/60;//engine.frametime凑合用吧
            }
            else if(cx>currentMouseX)
            {
                cx-=lenV*(cx-currentMouseX)*1000*engine.frametime/60;
            }

            if(cy<currentMouseY)
            {
                cy+=lenV*(currentMouseY-cy)*1000*engine.frametime/60;
            }
            else if(cy>currentMouseY)
            {
                cy-=lenV*(cy-currentMouseY)*1000*engine.frametime/60;
            }
        shared.rotY=cx*lenAX+currentTime * lenrk * scriptProperties.zizhuanY;//+自旋
        shared.rotX=-cy*lenAY;
    }




    
    // 物理系统更新 - 使用固定时间步长
    const MAX_PHYSICS_STEPS = 10; // 防止螺旋死亡
    let steps = 0;
    
    if(gravity){
        updatePhysics(ctx.getPhysicsSettings().physicsMode==='realtime'?1/60:.0075);
        accumulatedTime=0;
    }
    while (!gravity && accumulatedTime >= FIXED_TIMESTEP && steps < MAX_PHYSICS_STEPS) {
        // 执行固定步长的物理更新
        updatePhysics(FIXED_TIMESTEP);
        
        accumulatedTime -= FIXED_TIMESTEP;
        steps++;
    }
    
    // 计算插值因子 (0-1)
    const alpha = Math.min(1.0, accumulatedTime / FIXED_TIMESTEP);
    
    const DD = scriptProperties.DD;
    shared.tj = bodies.some(body => {
        const dx = body.x - physicsCom.x;
        const dy = body.y - physicsCom.y;
        const dz = body.z - physicsCom.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz) > DD;
    }) ? 1 : 0;

    if (scriptProperties.trailen && !lastTrailenState) {
        resetTrails(physicsCom);
    }
    lastTrailenState = scriptProperties.trailen;
    shared.gj = scriptProperties.trailen ? 1 : 0;
    
    // 轨迹处理 - 使用物理位置
    if (scriptProperties.trailen) {
        // 添加新轨迹点
        for (const body of bodies) {
            addTrailPoint(body, physicsCom);
        }
        
        // 更新所有轨迹点的外观
        for (const body of bodies) {
            updateTrailAppearance(body);
        }
    } else {
        hideAllTrails();
    }
    
    // 渲染位置插值
    const zOffset = typeof shared.gjz !== 'undefined' ? shared.gjz : 0;
    
    // 更新天体位置（考虑插值和旋转）
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        
        // 计算插值后的位置
        const renderX = body.prevX + alpha * (body.x - body.prevX);
        const renderY = body.prevY + alpha * (body.y - body.prevY);
        const renderZ = body.prevZ + alpha * (body.z - body.prevZ);
        
        // 计算相对于质心的位置
        const relX = renderX - physicsCom.x;
        const relY = renderY - physicsCom.y;
        const relZ = renderZ - physicsCom.z;
        
        const rotated = applyRotation(relX, relY, relZ);
        
        if (i === 0) {
            shared.xx1 = rotated.x;
            shared.yy1 = rotated.y;
            shared.zz1 = rotated.z + zOffset;
        } else if (i === 1) {
            shared.xx2 = rotated.x;
            shared.yy2 = rotated.y;
            shared.zz2 = rotated.z + zOffset;
        } else if (i === 2) {
            shared.xx3 = rotated.x;
            shared.yy3 = rotated.y;
            shared.zz3 = rotated.z + zOffset;
        } else if (i === 3) {
            shared.xx4 = rotated.x;
            shared.yy4 = rotated.y;
            shared.zz4 = rotated.z + zOffset;
        }
    }
    
    // 更新共享的质心位置（使用物理位置）
    shared.zxx = physicsCom.x;
    shared.zxy = physicsCom.y;
    shared.zxz = physicsCom.z;
    
    // 更新所有轨迹点位置
    updateAllTrailPositions();
    //console.log(G);
    shared.last_time = engine.runtime;
    return value;
}

function state() { return { bodies: bodies.map(b => ({x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,mass:b.mass,color:b.color,trail:b.trailPositions})), com:physicsCom, G, step:FIXED_TIMESTEP, diagnostics:physicsMonitor?.diagnostics()??null, contacts:physicsMonitor?.contacts??[] }; }
function directStep(dt) { updatePhysics(dt); }

return {update,scriptProperties,init,applyUserProperties,state,directStep,initializePhysics};
}
