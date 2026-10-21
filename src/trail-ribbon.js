import * as THREE from 'three';

// Adjacent segments share both edge vertices: no overlapping round caps or bright beads.
export class TrailRibbon extends THREE.Mesh{
  constructor(capacity=2000){
    const geometry=new THREE.BufferGeometry();
    for(const name of ['position','previous','next','color'])geometry.setAttribute(name,new THREE.BufferAttribute(new Float32Array(capacity*6),3).setUsage(THREE.DynamicDrawUsage));
    const side=new Float32Array(capacity*2),indices=[];
    for(let i=0;i<capacity;i++){side[i*2]=-1;side[i*2+1]=1;if(i<capacity-1){const a=i*2;indices.push(a,a+1,a+2,a+2,a+1,a+3);}}
    geometry.setAttribute('side',new THREE.BufferAttribute(side,1));geometry.setIndex(indices);geometry.setDrawRange(0,0);
    geometry.setAttribute('fade',new THREE.BufferAttribute(new Float32Array(capacity*2),1).setUsage(THREE.DynamicDrawUsage));
    const uniforms={resolution:{value:new THREE.Vector2(1,1)},linewidth:{value:2.2},opacity:{value:.8}};
    const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.NormalBlending,
      vertexShader:`attribute vec3 previous,next,color;attribute float side,fade;
        uniform vec2 resolution;uniform float linewidth;varying vec3 vColor;varying float vSide,vFade;
        vec2 screen(vec4 p){return p.xy/max(p.w,0.0001)*resolution;}
        void main(){
          vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);
          vec2 a=screen(projectionMatrix*modelViewMatrix*vec4(previous,1.)),b=screen(p),c=screen(projectionMatrix*modelViewMatrix*vec4(next,1.));
          vec2 d0=b-a,d1=c-b;float l0=length(d0),l1=length(d1);
          if(l0<0.00001)d0=d1;if(l1<0.00001)d1=d0;
          d0=normalize(d0+vec2(0.0000001,0.));d1=normalize(d1+vec2(0.0000001,0.));
          vec2 tangent=d0+d1;if(length(tangent)<0.001)tangent=d0;tangent=normalize(tangent);
          vec2 miter=vec2(-tangent.y,tangent.x),normal=vec2(-d0.y,d0.x);
          float scale=min(2.5,1./max(abs(dot(miter,normal)),0.4));
          p.xy+=miter*side*linewidth*scale/resolution*p.w;
          gl_Position=p;vColor=color;vSide=side;vFade=fade;
        }`,
      fragmentShader:`uniform float opacity;varying vec3 vColor;varying float vSide,vFade;
        void main(){float edge=1.-smoothstep(1.-fwidth(vSide),1.,abs(vSide));gl_FragColor=vec4(vColor,opacity*edge*vFade);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`});
    Object.defineProperties(material,{resolution:{get:()=>uniforms.resolution.value},linewidth:{get:()=>uniforms.linewidth.value,set:v=>uniforms.linewidth.value=v},opacity:{get:()=>uniforms.opacity.value,set:v=>uniforms.opacity.value=v}});
    super(geometry,material);this.capacity=capacity;this.frustumCulled=false;this.segmentCount=0;
  }
  setPath(points,fractions,color){
    const count=Math.min(points.length,this.capacity),attributes=this.geometry.attributes;
    for(let i=0;i<count;i++){
      const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(count-1,i+1)],fade=Math.pow(fractions[i]??0,1.4);
      for(let side=0;side<2;side++){
        const offset=i*6+side*3;
        attributes.position.array.set([p.x,p.y,p.z],offset);attributes.previous.array.set([a.x,a.y,a.z],offset);attributes.next.array.set([b.x,b.y,b.z],offset);
        attributes.color.array.set([color.r,color.g,color.b],offset);attributes.fade.array[i*2+side]=fade;
      }
    }
    for(const name of ['position','previous','next','color','fade'])attributes[name].needsUpdate=true;
    this.segmentCount=Math.max(0,count-1);this.geometry.setDrawRange(0,this.segmentCount*6);
  }
}
