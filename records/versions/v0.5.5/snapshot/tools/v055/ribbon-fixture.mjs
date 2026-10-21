import * as THREE from 'three';
import {TrailRibbon} from '../../src/trail-ribbon.js';
import {Line2} from 'three/addons/lines/Line2.js';
import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(600,200);renderer.setClearColor(0);document.body.append(renderer.domElement);
const camera=new THREE.OrthographicCamera(-2,2,2/3,-2/3,.1,10);camera.position.z=5;
const scene=new THREE.Scene();let previous;
window.ribbonFixture={draw(count,legacy=false){
 if(previous){scene.remove(previous);previous.geometry.dispose();previous.material.dispose();}
 const points=Array.from({length:count},(_,i)=>({x:-1+2*i/(count-1),y:0,z:0}));
 if(legacy){const geometry=new LineGeometry();geometry.setPositions(points.flatMap(p=>[p.x,p.y,p.z]));const material=new LineMaterial({color:0xffffff,linewidth:6,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending});material.resolution.set(600,200);previous=new Line2(geometry,material);}
 else{previous=new TrailRibbon();previous.material.resolution.set(600,200);previous.material.linewidth=6;previous.material.opacity=.6;previous.setPath(points,points.map(()=>1),new THREE.Color(1,1,1));}
 scene.add(previous);renderer.render(scene,camera);const gl=renderer.getContext(),pixels=new Uint8Array(600*200*4);gl.readPixels(0,0,600,200,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
 const values=Array.from({length:280},(_,i)=>pixels[(100*600+160+i)*4]);return{values,min:Math.min(...values),max:Math.max(...values)};
}};
