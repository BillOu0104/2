import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { colorRGB, seededRandom } from './settings.js';

const C = v => new THREE.Color(...colorRGB(v));
const sphere = new THREE.SphereGeometry(1, 48, 32);
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
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1;
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(50, 1, 0.01, 200);
    this.camera.position.set(0, 0.25, 5.2); this.camera.lookAt(0, 0, 0);
    this.world = new THREE.Group(); this.scene.add(this.world);
    this.compass = new THREE.Group(); this.world.add(this.compass);
    const ringGeometry = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 257 }, (_, i) => new THREE.Vector3(Math.cos(i / 256 * Math.PI * 2) * 1.42, Math.sin(i / 256 * Math.PI * 2) * 1.42, 0)));
    for (const [angle, opacity] of [[0, .18], [Math.PI / 2, .08]]) {
      const ring = new THREE.LineLoop(ringGeometry, new THREE.LineBasicMaterial({ color: 0x95c4eb, transparent: true, opacity })); ring.rotation.x = angle; this.compass.add(ring);
    }
    const ticks = [];
    for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2; const r = i % 10 ? 1.44 : 1.48; ticks.push(Math.cos(a) * 1.42, Math.sin(a) * 1.42, 0, Math.cos(a) * r, Math.sin(a) * r, 0); }
    this.compass.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(ticks, 3)), new THREE.LineBasicMaterial({ color: 0x94b7d9, transparent: true, opacity: .2 })));
    const textureLoader = new THREE.TextureLoader();
    const texture = name => { const t = textureLoader.load(`assets/original/${name}.webp`); t.colorSpace = THREE.SRGBColorSpace; return t; };
    this.starTexture = texture('0aun'); this.planetTexture = texture('0dq'); this.spikeTexture = roundGlow();
    this.bgTextures = { '1': texture('B8k'), '4': texture('st2') };
    for (const t of Object.values(this.bgTextures)) t.mapping = THREE.EquirectangularReflectionMapping;
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(90, 48, 24), new THREE.MeshBasicMaterial({ map: this.bgTextures['4'], side: THREE.BackSide, toneMapped: false, depthWrite: false }));
    this.world.add(this.sky);
    this.scene.add(new THREE.AmbientLight(0x8297b4, 0.35));
    this.nodes = []; this.trails = []; this.trailBuffers = [];
    for (let i = 0; i < 4; i++) {
      const group = new THREE.Group(); this.world.add(group);
      const material = i < 3 ? new THREE.MeshStandardMaterial({ map: this.starTexture, emissiveMap: this.starTexture, emissive: 0xffffff, emissiveIntensity: 3, roughness: 1 }) : new THREE.MeshStandardMaterial({ map: this.planetTexture, roughness: .83, emissive: 0x91c6ff, emissiveIntensity: .15 });
      const mesh = new THREE.Mesh(sphere, material); group.add(mesh);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.spikeTexture, color: 0xffcba8, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false })); group.add(glow);
      if (i === 3) glow.visible = false;
      const light = new THREE.PointLight(0xffe2c3, i < 3 ? 5 : 0, 12, 1.3); group.add(light);
      const label = document.createElement('div'); label.className = `body-label body-${i}`; label.innerHTML = `<span>${['α', 'β', 'γ', '○'][i]}</span><small></small>`; this.labels.append(label);
      this.nodes.push({ group, mesh, material, glow, light, label, target: new THREE.Vector3() });
      // Keep one fixed GPU capacity: Three caches an instanced geometry's first capacity.
      // Growing a one-segment LineGeometry later silently clips rendering to that segment.
      const geo = new LineGeometry(); geo.setPositions(new Float32Array(2000 * 3)); geo.setColors(new Float32Array(2000 * 3)); geo.instanceCount = 0;
      const line = new Line2(geo, new LineMaterial({ linewidth: 2.2, vertexColors: true, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false }));
      line.frustumCulled = false; this.world.add(line); this.trails.push(line); this.trailBuffers.push([]);
    }
    this.dustLayers = [];
    const rng = seededRandom('original-dust');
    for (let layer = 0; layer < 2; layer++) {
      const points = new Float32Array(1800 * 3); for (let i = 0; i < points.length; i++) points[i] = (rng() - .5) * 35;
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
      const dust = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xb2becd, size: layer ? .008 : .013, transparent: true, opacity: .38, depthWrite: false, sizeAttenuation: true }));
      this.world.add(dust); this.dustLayers.push(dust);
    }
    this.nebula = new THREE.Mesh(new THREE.SphereGeometry(70, 24, 16), new THREE.MeshBasicMaterial({ map: this.bgTextures['1'], side: THREE.BackSide, transparent: true, opacity: .35, color: 0x6e83a7, blending: THREE.AdditiveBlending, depthWrite: false })); this.world.add(this.nebula);
    this.composer = new EffectComposer(this.renderer); this.composer.addPass(new RenderPass(this.scene, this.camera));
    // Small bright spheres become square impulses in a downsampled bloom pyramid.
    // Explicit radial sprites provide the HDR halo without changing circular silhouettes.
    this.post = new ShaderPass(postShader); this.composer.addPass(this.post); this.composer.addPass(new OutputPass());
    this.mouse = { x: 0, y: 0, down: false, lastX: 0, lastY: 0 }; this.rot = { x: 0, y: 0, vx: 0, vy: 0 }; this.follow = { x: 0, y: 0 };
    canvas.addEventListener('pointerdown', e => { this.mouse.down = true; this.mouse.lastX = e.clientX; this.mouse.lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      this.mouse.x = e.clientX / innerWidth * 2 - 1; this.mouse.y = e.clientY / innerHeight * 2 - 1;
      if (this.mouse.down && +this.settings.newproperty61 === 0) {
        this.rot.vy += (e.clientX - this.mouse.lastX) / innerWidth * this.settings.y5 * 10;
        this.rot.x += (e.clientY - this.mouse.lastY) / innerHeight * this.settings.x5 * 2;
      }
      this.mouse.lastX = e.clientX; this.mouse.lastY = e.clientY;
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, () => { this.mouse.down = false; });
    this.updateSettings(settings); this.resize();
    this.onResize = () => this.resize(); addEventListener('resize', this.onResize);
  }
  resize() {
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.settings.pixelRatio));
    this.renderer.setSize(innerWidth, innerHeight, false); this.composer.setSize(innerWidth, innerHeight);
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
    const mode = String(s.newproperty17);
    this.scene.background = mode === '2' ? C(s.newproperty40).multiplyScalar(s.newproperty57) : C(s.schemecolor);
    this.sky.visible = mode !== '2' && (mode !== '3' || !!this.customBackground);
    this.sky.material.map = mode === '3' ? this.customBackground : this.bgTextures[mode] || this.bgTextures['4'];
    this.sky.material.color.copy(C(mode === '3' ? s.newproperty55 : s.backgroundcolor)).multiplyScalar(mode === '3' ? s.newproperty56 : s.newproperty9);
    this.sky.material.needsUpdate = true;
    this.camera.fov = s.newproperty71; this.camera.position.z = Math.max(1.4, 5.2 - s.distance * .65); this.camera.updateProjectionMatrix();
    this.compass.visible = s.compass; this.compass.children.forEach(n => n.material?.color.copy(C(s.datacolor)));
    this.nebula.visible = s.brfontcoloraaaaaabrnebularequirespostprocessingultrahighquality;
    for (const [u, key] of Object.entries({ grain: 'newproperty68', crt: 'newproperty3', blur: 'newproperty23', pulse: 'newproperty54' })) this.post.uniforms[u].value = s[key];
    const radii = [s._13, s._21, s._3, s.newproperty20];
    const colors = [s._14, s._22, s._31, '1 1 1']; const emissions = [s._15, s._23, s._32]; const spikeColors = [s._16, s._24, s._33];
    this.nodes.forEach((n, i) => {
      n.mesh.scale.setScalar(radii[i]); n.material.color.copy(C(colors[i]));
      if (i < 3) {
        n.material.emissive.copy(C(emissions[i])); n.material.emissiveIntensity = 1.5;
        n.glow.material.color.copy(C(spikeColors[i]));
        n.glow.scale.setScalar(radii[i] * (7 + s.newproperty49 * 5) * (1 + (s.newproperty2 ? s.hdr1 * .3 : 0)));
        n.glow.visible = s.newproperty18; n.light.color.copy(C(emissions[i]));
      }
      n.label.hidden = !s.newproperty65 || !s.bodyLabels;
      this.trails[i].visible = s.newproperty14;
    });
    this.dustLayers.forEach((d, i) => { d.visible = s.dust; d.geometry.setDrawRange(0, Math.round(1800 * Math.min(1, s[i ? '_2dust2quantity' : '_1dust1quantity']))); d.material.size = s[i ? '_2dust1size' : '_1dust1size'] * .1; });
    this.resize();
  }
  clearTrails() {
    this.trailBuffers.forEach(b => b.length = 0);
    this.trails.forEach(line => { line.geometry.instanceCount = 0; });
  }
  ingest(state) {
    if (this.snap && state.revision !== this.snap.revision) { this.clearTrails(); this.firstPosition = true; }
    if (!this.snap) this.firstPosition = true;
    this.snap = state;
    const keys = ['brfontcoloraaaaaatrail1color', 'brfontcoloraaaaaatrail2color', 'brfontcoloraaaaaatrail3color', 'brfontcoloraaaaaatrail4color'];
    state.bodies.forEach((b, i) => {
      const n = this.nodes[i]; const previous = n.target.clone(); n.target.set(b.x - state.com.x, b.y - state.com.y, b.z - state.com.z);
      if (this.firstPosition) n.group.position.copy(n.target);
      if (this.settings.newproperty14) {
        const trail = this.trailBuffers[i];
        const samples = this.firstPosition ? 1 : Math.max(1, Math.min(15, state.tick - (this.lastTrailTick || state.tick)));
        for (let j = 1; j <= samples; j++) trail.push((this.firstPosition ? n.target : previous).clone().lerp(n.target, j / samples));
        if (trail.length > this.settings.trailsLength) trail.splice(0, trail.length - this.settings.trailsLength);
        const geometry = this.trails[i].geometry, positions = geometry.attributes.instanceStart.data, colors = geometry.attributes.instanceColorStart.data;
        const color = C(this.settings[keys[i]]);
        for (let j = 0; j < trail.length - 1; j++) {
          const a = trail[j], b = trail[j + 1], offset = j * 6;
          positions.array.set([a.x,a.y,a.z,b.x,b.y,b.z],offset);
          const fadeA = Math.pow(j / (trail.length - 1),1.6), fadeB = Math.pow((j+1)/(trail.length-1),1.6);
          colors.array.set([color.r*fadeA,color.g*fadeA,color.b*fadeA,color.r*fadeB,color.g*fadeB,color.b*fadeB],offset);
        }
        positions.needsUpdate = colors.needsUpdate = true;
        geometry.instanceCount = Math.max(0,trail.length-1);
      }
    });
    this.lastTrailTick = state.tick;
    this.firstPosition = false;
    const t = state.temperature, color = new THREE.Color(1, 1, 1);
    if (t <= -100) color.setRGB(THREE.MathUtils.clamp((t + 210) / 110, 0, 1), THREE.MathUtils.clamp((t + 210) / 110, 0, 1), 1);
    else if (t >= 10) color.setRGB(1, Math.max(0, 1 - (t - 10) / 990), Math.max(0, 1 - (t - 10) / 990));
    this.nodes[3].material.emissive.copy(color);
  }
  render(dt, elapsed) {
    const s = this.settings;
    if (+s.newproperty61 === 1) {
      const a = Math.min(1, s.newproperty62 * dt * 60);
      this.follow.x += (this.mouse.x - this.follow.x) * a; this.follow.y += (this.mouse.y - this.follow.y) * a;
      this.rot.y = this.follow.x * s.x6 * Math.PI / 180 + (s.newproperty16 ? elapsed * s.newproperty51 * Math.PI / 180 : 0);
      this.rot.x = this.follow.y * s.y7 * Math.PI / 180;
    } else {
      this.rot.vy *= Math.pow(s.y6, dt * 60);
      this.rot.y += this.rot.vy * dt * 60 + (s.newproperty16 ? s.newproperty51 * dt * Math.PI / 180 : 0);
      this.rot.x = THREE.MathUtils.clamp(this.rot.x, -Math.PI / 6, Math.PI / 6);
    }
    this.world.rotation.set(this.rot.x + (s.newproperty16 ? Math.sin(elapsed * .1) * s.brfontcoloraaaaaaxspinangle * Math.PI / 180 : 0), this.rot.y, 0);
    this.nodes.forEach((n, i) => {
      n.group.position.lerp(n.target, 1 - Math.exp(-dt * 22)); n.mesh.rotation.y += dt * .1;
      if (i < 3) { n.glow.material.opacity = Math.min(1, .35 + s.newproperty49 * .3 + (s.newproperty2 ? s.hdr * .09 : 0) + this.audioLevel * .12); }
      vec.copy(n.group.position); this.world.localToWorld(vec); vec.project(this.camera);
      n.label.style.transform = `translate(${(vec.x * .5 + .5) * innerWidth + 15}px,${(-vec.y * .5 + .5) * innerHeight - 9}px)`;
      n.label.style.visibility = vec.z > 1 || vec.z < -1 ? 'hidden' : 'visible';
      if (this.snap) n.label.querySelector('small').textContent = `${n.group.position.x.toFixed(2)} / ${n.group.position.y.toFixed(2)}`;
    });
    this.dustLayers.forEach((d, i) => { d.rotation.y = elapsed * .002 * (i + 1); });
    this.post.uniforms.time.value = elapsed;
    if (s.newproperty2) this.composer.render(dt); else this.renderer.render(this.scene, this.camera);
  }
}
