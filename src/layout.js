export const layoutWidgets={left:'#era-widget',right:'#distance-widget',clock:'#clock-widget',logs:'#civilization-widget',years:'.simulation-time'};
export function clampWindow(x,y,width,height,viewportWidth,viewportHeight){return{x:Math.max(4,Math.min(Math.max(4,viewportWidth-width-4),x)),y:Math.max(4,Math.min(Math.max(4,viewportHeight-height-4),y))};}
export function widgetPosition(id){const r=document.querySelector(layoutWidgets[id]).getBoundingClientRect();return{x:r.x/innerWidth*100,y:r.y/innerHeight*100};}
export function clearLayoutStyles(){for(const selector of Object.values(layoutWidgets)){const el=document.querySelector(selector);for(const key of ['left','right','top','bottom','transform','transform-origin','margin-top','margin-bottom'])el.style.removeProperty(key);}}
export function applyLayout(layout={}){
  for(const [id,position]of Object.entries(layout)){const el=document.querySelector(layoutWidgets[id]);if(!el||!position)continue;
    const scale=parseFloat(el.style.scale)||1,p=clampWindow(position.x/100*innerWidth,position.y/100*innerHeight,el.offsetWidth*scale,el.offsetHeight*scale,innerWidth,innerHeight);
    Object.assign(el.style,{left:`${p.x}px`,top:`${p.y}px`,right:'auto',bottom:'auto',transform:'none',transformOrigin:'top left',marginTop:'0px',marginBottom:'0px'});
  }
}
export function installLayoutEditor({getSettings,save,setPanel,updateControls}){
  let editing=false,drag=null;
  const setEditing=value=>{editing=value;document.body.classList.toggle('layout-editing',value);document.querySelector('#layout-toolbar').hidden=!value;if(value)setPanel(false);};
  document.querySelector('#layout-edit').onclick=()=>setEditing(true);
  document.querySelector('#layout-done').onclick=()=>setEditing(false);
  for(const id of ['layout-reset','layout-reset-dock'])document.querySelector(`#${id}`).onclick=()=>save({layout:{}});
  for(const [id,selector]of Object.entries(layoutWidgets)){
    const el=document.querySelector(selector);el.dataset.layoutWidget=id;
    el.addEventListener('pointerdown',e=>{if(!editing||e.button!==0)return;e.stopPropagation();e.preventDefault();const r=el.getBoundingClientRect();drag={id,el,x:e.clientX,y:e.clientY,left:r.x,top:r.y,width:r.width,height:r.height};el.setPointerCapture(e.pointerId);});
    el.addEventListener('pointermove',e=>{if(!drag||drag.el!==el)return;e.stopPropagation();const p=clampWindow(drag.left+e.clientX-drag.x,drag.top+e.clientY-drag.y,drag.width,drag.height,innerWidth,innerHeight);Object.assign(el.style,{left:`${p.x}px`,top:`${p.y}px`,right:'auto',bottom:'auto',transform:'none',transformOrigin:'top left',marginTop:'0px',marginBottom:'0px'});});
    const finish=()=>{if(!drag||drag.el!==el)return;const position=widgetPosition(id);drag=null;save({layout:{...getSettings().layout,[id]:position}});updateControls();};
    el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&editing)setEditing(false);});
  return{get editing(){return editing;}};
}
