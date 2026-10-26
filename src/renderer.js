import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { colorRGB, seededRandom } from './settings.js';
import { fadeMotion } from './motion-visuals.js';
import {FixedDisplayFrame} from './fixed-display-frame.js';
import {TrailRibbon} from './trail-ribbon.js';
import { ViewMotion } from './view-motion.js';
import { TrailHistory, trailComplexity, selectTrail } from './adaptive-trails.js';

const C = v => new THREE.Color(...colorRGB(v));
const sphere = new THREE.SphereGeometry(1, 96, 64);
const vec = new THREE.Vector3();
function roundGlow() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255,255,255,.95)'); gradient.addColorStop(.12, 'rgba(255,255,255,.55)');
  gradient.addColorStop(.35, 'rgba(255,255,255,.12)'); gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient; context.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}
function crispParticle(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');
  c.fillStyle='#fff';c.beginPath();c.arc(32,32,29,0,Math.PI*2);c.fill();return new THREE.CanvasTexture(canvas);
}
const postShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, grain: { value: 0.15 }, crt: { value: 0.03 }, blur: { value: 0 }, pulse: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time,grain,crt,blur,pulse; varying vec2 vUv;
    float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time)*43758.5453);}
    void main(){vec2 p=vUv-.5;vec2 uv=vUv+p*dot(p,p)*crt*.08;vec3 col=texture2D(tDiffuse,uv).rgb;
      if(blur>.001){vec3 sum=col;for(int i=1;i<6;i++){sum+=texture2D(tDiffuse,uv-p*float(i)*.005*blur).rgb;}col=sum/6.;}
      col*=1.-crt*.25*(.5+.5*sin(vUv.y*1500.));col*=1.+pulse*.12*sin(time*2.5);
      col+=(hash(gl_FragCoord.xy)-.5)*grain*.055;col*=1.-.22*dot(p,p);gl_FragColor=vec4(col,1.);}`
};

export class SpaceRenderer {
  constructor(canvas, labelRoot, settings) {
    this.canvas = canvas; this.labels = labelRoot; this.settings = settings; this.snap = null; this.audioLevel = 0;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: settings.renderQuality !== '8k', powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1;
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(50, 1, 0.01, 200);
    this.camera.position.set(0, 0.25, 5.2); this.camera.lookAt(0, 0, 0);
    this.world = new THREE.Group(); this.scene.add(this.world);this.system=new THREE.Group();this.world.add(this.system);this.fixedFrame=new FixedDisplayFrame();this.renderTime=0;
    this.compass = new THREE.Group(); this.world.add(this.compass);this.compass.scale.setScalar(.3);this.compass.visible=false;this.compassFade=0;this.compassTarget=false;
    const ringGeometry = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 257 }, (_, i) => new THREE.Vector3(Math.cos(i / 256 * Math.PI * 2) * 1.42, Math.sin(i / 256 * Math.PI * 2) * 1.42, 0)));
    for (const [angle, opacity] of [[0, 0], [Math.PI / 2, 0]]) {
      const ring = new THREE.LineLoop(ringGeometry, new THREE.LineBasicMaterial({ color: 0x95c4eb, transparent: true, opacity, depthWrite:false })); ring.rotation.x = angle; this.compass.add(ring);
    }
    const ticks = [];
    for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2; const r = i % 10 ? 1.44 : 1.48; ticks.push(Math.cos(a) * 1.42, Math.sin(a) * 1.42, 0, Math.cos(a) * r, Math.sin(a) * r, 0); }
    this.compass.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(ticks, 3)), new THREE.LineBasicMaterial({ color: 0x94b7d9, transparent: true, opacity: 0, depthWrite:false })));
    const textureLoader = new THREE.TextureLoader();
    const texture = name => { const t = textureLoader.load(`assets/original/${name}.webp`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy=Math.min(16,this.renderer.capabilities.getMaxAnisotropy()); return t; };
    this.starTexture = texture('0aun'); this.planetTexture = texture('0dq'); this.spikeTexture = roundGlow();
    this.bgTextures = { '1': texture('B8k'), '4': texture('st2') };
    for (const t of Object.values(this.bgTextures)) t.mapping = THREE.EquirectangularReflectionMapping;
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(90, 48, 24), new THREE.MeshBasicMaterial({ map: this.bgTextures['4'], side: THREE.BackSide, toneMapped: false, depthWrite: false }));
    // The broad bright patch in the original st2 panorama, measured on a blurred thumbnail.
    const u=.4580078125,v=.486328125,theta=v*Math.PI,phi=u*Math.PI*2;
    this.galaxyDirection=new THREE.Vector3(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta));
    this.camera.updateMatrixWorld();this.sky.quaternion.setFromUnitVectors(this.galaxyDirection,this.camera.getWorldDirection(new THREE.Vector3()));
    this.world.add(this.sky);
    this.scene.add(new THREE.AmbientLight(0x8297b4, 0.35));
    this.nodes = []; this.trails = []; this.trailBuffers = [];
    for (let i = 0; i < 4; i++) {
      const group = new THREE.Group(); this.system.add(group);
      const material = i < 3 ? new THREE.MeshStandardMaterial({ map: this.starTexture, emissiveMap: this.starTexture, emissive: 0xffffff, emissiveIntensity: 3, roughness: 1 }) : new THREE.MeshStandardMaterial({ map: this.planetTexture, roughness: .83, emissive: 0x91c6ff, emissiveIntensity: .15 });
      const mesh = new THREE.Mesh(sphere, material); group.add(mesh);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.spikeTexture, color: 0xffcba8, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false })); group.add(glow);
      if (i === 3) glow.visible = false;
      const light = new THREE.PointLight(0xffe2c3, i < 3 ? 5 : 0, 12, 1.3); group.add(light);
      const label = document.createElement('div'); label.className = `body-label body-${i}`; label.innerHTML = `<span>${['α', 'β', 'γ', '○'][i]}</span><small></small>`; this.labels.append(label);
      this.nodes.push({ group, mesh, material, glow, light, label, target: new THREE.Vector3() });
      const line = new TrailRibbon();
      line.frustumCulled = false; this.system.add(line); this.trails.push(line); this.trailBuffers.push(new TrailHistory());
    }
    this.dustLayers = [];this.dustTexture=crispParticle();
    const rng = seededRandom('original-dust');
    for (let layer = 0; layer < 2; layer++) {
      const capacity=layer?3600:1800,points=new Float32Array(capacity*3);
      for(let i=0;i<capacity;i++){points[i*3]=(rng()-.5)*(layer?32:18);points[i*3+1]=(rng()-.5)*(layer?20:12);points[i*3+2]=layer?-2-rng()*12:3.6-rng()*6;}
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(points,3));
      const dust=new THREE.Points(geometry,new THREE.PointsMaterial({map:this.dustTexture,color:0xc5d5e7,size:.04,transparent:true,opacity:layer?.42:.5,blending:THREE.NormalBlending,alphaTest:.1,depthWrite:false,sizeAttenuation:true}));
      // Keep near-camera points tiny; the size uniform already includes the render pixel ratio.
      dust.material.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <logdepthbuf_vertex>','gl_PointSize = min(gl_PointSize, size * 100.0);\n#include <logdepthbuf_vertex>');};
      dust.material.customProgramCacheKey=()=> 'crisp-dust-v05';
      this.world.add(dust);this.dustLayers.push(dust);
    }
    this.nebula = new THREE.Mesh(new THREE.SphereGeometry(70, 24, 16), new THREE.MeshBasicMaterial({ map: this.bgTextures['1'], side: THREE.BackSide, transparent: true, opacity: .35, color: 0x6e83a7, blending: THREE.AdditiveBlending, depthWrite: false })); this.nebula.quaternion.copy(this.sky.quaternion);this.world.add(this.nebula);
    this.composer = null;
    // Small bright spheres become square impulses in a downsampled bloom pyramid.
    // Explicit radial sprites provide the HDR halo without changing circular silhouettes.
    this.post = new ShaderPass(postShader);
    this.mouse = { x: 0, y: 0, down: false, dragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0, lastInput: -Infinity, inside:false }; this.rot = new ViewMotion();this.autoAngle=0;this.returning=false;this.hoverBase={x:0,y:0};this.releaseCoasting=false;
    canvas.addEventListener('pointerdown', e => { if(e.button!==0)return; this.mouse.down = true; this.mouse.lastInput=performance.now();this.mouse.dragging=false; this.mouse.startX=this.mouse.lastX = e.clientX; this.mouse.startY=this.mouse.lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      const moved=Math.hypot(e.clientX-this.mouse.lastX,e.clientY-this.mouse.lastY)>.1;
      // Rebase at the coasted position only when genuine hover input resumes.
      // A stationary pointer after release must not act as a spring to the release point.
      if(moved&&!this.mouse.down&&this.releaseCoasting){
        this.hoverBase.x=this.rot.x-this.mouse.y*this.settings.y7*this.settings.x5*this.settings.viewSensitivity*Math.PI/180;
        this.hoverBase.y=this.rot.y-this.mouse.x*this.settings.x6*this.settings.y5*this.settings.viewSensitivity*Math.PI/180;
        this.releaseCoasting=false;
      }
      this.mouse.inside=true;if(moved&&this.settings.viewSensitivity>0&&(+this.settings.newproperty61===1||this.mouse.down))this.mouse.lastInput=performance.now();
      this.mouse.x = e.clientX / innerWidth * 2 - 1; this.mouse.y = e.clientY / innerHeight * 2 - 1;
      if (this.settings.viewSensitivity>0 && this.mouse.down && +this.settings.newproperty61 !== 2) {
        if(Math.hypot(e.clientX-this.mouse.startX,e.clientY-this.mouse.startY)>3)this.mouse.dragging=true;
        this.rot.drag((e.clientX-this.mouse.lastX)/innerWidth,(e.clientY-this.mouse.lastY)/innerHeight,this.settings.x5*this.settings.viewSensitivity/.12*this.settings.dragSensitivity,this.settings.y5*this.settings.viewSensitivity/.12*this.settings.dragSensitivity);
      }
      this.mouse.lastX = e.clientX; this.mouse.lastY = e.clientY;
    });
    canvas.addEventListener('pointerleave',()=>{this.mouse.inside=false;});
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, () => { if(this.mouse.down){this.releaseCoasting=true;this.mouse.lastInput=performance.now();}this.mouse.down = false; this.mouse.dragging=false; });
    this.updateSettings(settings); this.resize();
    this.onResize = () => this.resize(); addEventListener('resize', this.onResize);
  }
  resize() {
    const gl=this.renderer.getContext(),limit=Math.min(this.renderer.capabilities.maxTextureSize,gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
    const requested=this.settings.renderQuality==='8k'?Math.min(7680/innerWidth,4320/innerHeight):Math.min(devicePixelRatio||1,this.settings.pixelRatio);
    const ratio=Math.min(requested,limit/innerWidth,limit/innerHeight);
    if(this.drawWidth!==innerWidth||this.drawHeight!==innerHeight||this.drawRatio!==ratio){
      this.renderer.setPixelRatio(ratio);this.renderer.setSize(innerWidth,innerHeight,false);
      this.drawWidth=innerWidth;this.drawHeight=innerHeight;this.drawRatio=ratio;
    }
    if(this.settings.newproperty2&&!this.composer){
      const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.UnsignedByteType});
      this.composer=new EffectComposer(this.renderer,target);this.composer.addPass(new RenderPass(this.scene,this.camera));this.composer.addPass(this.post);this.composer.addPass(new OutputPass());
    }
    if(this.composer){this.composer.setPixelRatio(ratio);this.composer.setSize(innerWidth,innerHeight);}

    this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix();
    this.trails.forEach(line => line.material.resolution.set(innerWidth, innerHeight));
  }
  setCustomBackground(url) {
    if (!url) { this.customBackground?.dispose(); this.customBackground = null; this.updateSettings(this.settings); return; }
    new THREE.TextureLoader().load(url, t => { this.customBackground?.dispose(); t.colorSpace = THREE.SRGBColorSpace; t.mapping = THREE.EquirectangularReflectionMapping; this.customBackground = t; this.updateSettings(this.settings); });
  }
  updateSettings(s) {
    if (this.settings?.newproperty14 !== s.newproperty14) this.clearTrails();
    this.settings = s;
    // Reference selection must apply even while animation is paused/throttled.
    if(s.displayReference!=='barycentric')this.system.position.set(0,0,0);
    this.spaceScale=['chaotic','research'].includes(s.orbitalInitialization)?Math.max(1,s.brfontcoloraaaaaarandomposrange/2):1;
    const mode = String(s.newproperty17);
    this.scene.background = mode === '2' ? C(s.newproperty40).multiplyScalar(s.newproperty57) : C(s.schemecolor);
    this.sky.visible = mode !== '2' && (mode !== '3' || !!this.customBackground);
    this.sky.material.map = mode === '3' ? this.customBackground : this.bgTextures[mode] || this.bgTextures['4'];
    this.sky.material.color.copy(C(mode === '3' ? s.newproperty55 : s.backgroundcolor)).multiplyScalar(mode === '3' ? s.newproperty56 : s.newproperty9);
    this.sky.material.needsUpdate = true;
    this.camera.fov = s.newproperty71; this.camera.position.z = Math.max(1.4, 5.2 - s.distance * .65); this.camera.updateProjectionMatrix();
    this.compass.children.forEach(n => n.material?.color.copy(C(s.datacolor)));
    this.nebula.visible = s.brfontcoloraaaaaabrnebularequirespostprocessingultrahighquality;
    for (const [u, key] of Object.entries({ grain: 'newproperty68', crt: 'newproperty3', blur: 'newproperty23', pulse: 'newproperty54' })) this.post.uniforms[u].value = s[key];
    const radii = [s._13, s._21, s._3, s.newproperty20];
    const colors = [s._14, s._22, s._31, '1 1 1']; const emissions = [s._15, s._23, s._32]; const spikeColors = [s._16, s._24, s._33];
    this.nodes.forEach((n, i) => {
      n.mesh.scale.setScalar(radii[i]/this.spaceScale); n.material.color.copy(C(colors[i]));
      if (i < 3) {
        n.material.emissive.copy(C(emissions[i])); n.material.emissiveIntensity = 1.5;
        n.glow.material.color.copy(C(spikeColors[i]));
        n.glow.scale.setScalar(radii[i]/this.spaceScale * (7 + s.newproperty49 * 5) * (1 + (s.newproperty2 ? s.hdr1 * .3 : 0)));
        n.glow.visible = s.newproperty18; n.light.color.copy(C(emissions[i]));
      }
      n.label.hidden = !s.newproperty65 || !s.bodyLabels;
      this.trails[i].visible = s.newproperty14&&this.snap?.bodies[i]?.mass!==0;
    });
    this.dustLayers.forEach((d,i)=>{d.visible=s.dust&&s[i?'_2dust2quantity':'_1dust1quantity']>0&&s[i?'_2dust1size':'_1dust1size']>0;d.geometry.setDrawRange(0,Math.round(900*s[i?'_2dust2quantity':'_1dust1quantity']));d.material.size=s[i?'_2dust1size':'_1dust1size']*(i?.6:.35);});
    this.resize();
  }
  clearTrails() {
    this.trailBuffers.forEach(b => b.clear());
    this.trailComplexity=0;this.trailMetrics=[];
    this.trails.forEach(line => { line.segmentCount=0;line.geometry.setDrawRange(0,0); });
  }
  ingest(state) {
    if (this.snap && state.revision !== this.snap.revision) { this.clearTrails(); this.firstPosition = true; }
    if (!this.snap) this.firstPosition = true;
    const rate=state.playback?.rate??1;
    if(this.firstPosition){this.fixedFrame.reset(state.initialBodies);this.renderTime=Math.max(0,state.runtime-.05*rate);}
    const previousState=this.snap;
    this.snap = state;
    if(state.runtime-this.renderTime>.15*rate)this.renderTime=state.runtime-.05*rate;
    state.bodies.forEach((b, i) => {
      if(b.mass<=0){this.nodes[i].group.visible=false;this.trails[i].visible=false;this.trailBuffers[i].clear();this.trails[i].setPath([],[],C('1 1 1'));return;}
      this.nodes[i].group.visible=true;this.trails[i].visible=!!this.settings.newproperty14;
      if(i===3&&previousState?.bodies[3]?.mass===0)this.trailBuffers[i].clear();
      const n = this.nodes[i],position=this.fixedFrame.position(b,this.spaceScale);n.target.set(position.x,position.y,position.z);
      if (this.firstPosition) n.group.position.copy(n.target);
      const samples=state.trailSamples?.[i];
      if(samples?.length)for(const p of samples){if(p.break)this.trailBuffers[i].clear();this.trailBuffers[i].push(this.fixedFrame.position(p,this.spaceScale),p.time);}
      else this.trailBuffers[i].push(n.target,state.runtime);
    });
    this.lastTrailTick = state.tick;
    this.firstPosition = false;
    const t = state.temperature, color = new THREE.Color(1, 1, 1);
    if (t <= -100) color.setRGB(THREE.MathUtils.clamp((t + 210) / 110, 0, 1), THREE.MathUtils.clamp((t + 210) / 110, 0, 1), 1);
    else if (t >= 10) color.setRGB(1, Math.max(0, 1 - (t - 10) / 990), Math.max(0, 1 - (t - 10) / 990));
    this.nodes[3].material.emissive.copy(color);
    this.nodes[3].group.visible=state.bodies[3].mass>0&&!state.world?.planet.terminal;
    this.nodes[3].label.hidden=!this.settings.newproperty65||!this.settings.bodyLabels||!!state.world?.planet.terminal;
    this.nodes.slice(0,3).forEach((n,i)=>{const radius=state.world?.stars[i]?.radius;if(radius)n.mesh.scale.setScalar(radius/this.spaceScale);});
  }
  updateTrails(dt) {
    this.system.updateWorldMatrix(true,false);this.camera.updateMatrixWorld();
    const project=point=>{
      vec.set(point.x,point.y,point.z).applyMatrix4(this.system.matrixWorld).project(this.camera);
      return{x:(vec.x*.5+.5)*innerWidth,y:(-.5*vec.y+.5)*innerHeight,z:vec.z};
    };
    const raw=trailComplexity(this.trailBuffers,project,this.renderTime);
    this.trailComplexity=(this.trailComplexity||0)+(raw-(this.trailComplexity||0))*(1-Math.exp(-dt/.7));
    const keys=['brfontcoloraaaaaatrail1color','brfontcoloraaaaaatrail2color','brfontcoloraaaaaatrail3color','brfontcoloraaaaaatrail4color'];
    this.trailMetrics=this.trailBuffers.map((history,i)=>{
      const selection=selectTrail(history,project,{now:this.renderTime,viewport:Math.min(innerWidth,innerHeight),baseLength:this.settings.trailsLength,complexity:this.trailComplexity,dt});
      const {points,fractions}=selection;this.trails[i].setPath(points,fractions,C(this.settings[keys[i]]));
      this.trails[i].material.opacity=.8-.25*this.trailComplexity;
      this.trails[i].material.linewidth=2.2-.5*this.trailComplexity;
      return{arcPixels:selection.arcPixels,seconds:selection.seconds,budget:selection.budget,segments:this.trails[i].segmentCount};
    });
  }
  render(dt, elapsed, motionDt=dt) {
    const s = this.settings;
    const idle=(performance.now()-this.mouse.lastInput)/1000;
    this.returning=!!s.newproperty16&&+s.newproperty61!==2&&!this.mouse.down&&idle>=2&&s.newproperty51>0;
    if(this.returning){
      // Return owns the motion during idle; coasting must not fight it.
      this.rot.returnToOrigin(motionDt,s.newproperty51);
      this.hoverBase.x=this.rot.x-this.mouse.y*s.y7*s.x5*s.viewSensitivity*Math.PI/180;
      this.hoverBase.y=this.rot.y-this.mouse.x*s.x6*s.y5*s.viewSensitivity*Math.PI/180;
    }else if(s.viewSensitivity>0&&+s.newproperty61===1&&!this.mouse.down&&!this.releaseCoasting&&this.mouse.inside&&idle<2){
      for(let remaining=motionDt;remaining>1e-8;){const step=Math.min(1/60,remaining);this.rot.follow(this.hoverBase.x+this.mouse.y*s.y7*s.x5*s.viewSensitivity*Math.PI/180,this.hoverBase.y+this.mouse.x*s.x6*s.y5*s.viewSensitivity*Math.PI/180,step,Math.max(.25,s.newproperty62*12));remaining-=step;}
    }else if(+s.newproperty61!==2)this.rot.coast(motionDt,-Math.log(Math.min(.999,s.y6))*120);
    this.compassTarget=!!s.compass&&!this.returning&&+s.newproperty61!==2&&(this.mouse.dragging||(idle<2&&Math.hypot(this.rot.vx,this.rot.vy)>.0005));
    this.compassFade=fadeMotion(this.compassFade,this.compassTarget,motionDt);this.compass.visible=this.compassFade>.002&&s.compassOpacity>0;
    for(const child of this.compass.children)child.material.opacity=s.compassOpacity*this.compassFade;
    this.world.rotation.set(this.rot.x,this.rot.y,0);
    if(this.snap)this.renderTime=Math.min(this.snap.runtime,this.renderTime+dt*(this.snap.playback?.rate??1));
    const displayed=this.trailBuffers.map(h=>h.atTime(this.renderTime));
    if(this.snap&&s.displayReference==='barycentric'){
      const mass=this.snap.bodies.reduce((sum,b)=>sum+b.mass,0),center=[0,0,0];
      this.snap.bodies.forEach((b,i)=>{const p=displayed[i]??this.nodes[i].group.position;for(const [k,key]of ['x','y','z'].entries())center[k]+=b.mass*p[key]/mass;});
      this.system.position.set(-center[0],-center[1],-center[2]);
    }else this.system.position.set(0,0,0);
    this.nodes.forEach((n, i) => {
      const p=displayed[i];if(p)n.group.position.set(p.x,p.y,p.z);n.mesh.rotation.y += dt * .1;
      if (i < 3) { n.glow.material.opacity = Math.min(1, .35 + s.newproperty49 * .3 + (s.newproperty2 ? s.hdr * .09 : 0) + this.audioLevel * .12); }
      n.group.getWorldPosition(vec);vec.project(this.camera);
      n.label.style.transform = `translate(${(vec.x * .5 + .5) * innerWidth + 15}px,${(-vec.y * .5 + .5) * innerHeight - 9}px)`;
      n.label.style.visibility = vec.z > 1 || vec.z < -1 ? 'hidden' : 'visible';
      if (this.snap) n.label.querySelector('small').textContent = `${n.group.position.x.toFixed(2)} / ${n.group.position.y.toFixed(2)}`;
    });
    if(s.newproperty14&&this.snap){
      this.updateTrails(dt);
    }
    this.dustLayers.forEach((d, i) => { d.rotation.y = elapsed * .002 * (i + 1);d.position.x=Math.sin(elapsed*.06+i)*.12;d.position.y=Math.cos(elapsed*.04+i)*.08; });
    this.post.uniforms.time.value = elapsed;
    if (s.newproperty2) this.composer.render(dt); else this.renderer.render(this.scene, this.camera);
  }
}
