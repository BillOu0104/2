// One viewport-aware tooltip portal keeps explanations out of the scrolling form.
export class SettingHelp{
 constructor(){
  this.tip=document.createElement('div');this.tip.id='settings-help-tooltip';this.tip.className='settings-help-tooltip';this.tip.role='tooltip';this.tip.hidden=true;document.body.append(this.tip);
  this.tip.addEventListener('pointerenter',()=>clearTimeout(this.timer));this.tip.addEventListener('pointerleave',()=>this.scheduleHide());
  document.addEventListener('pointerdown',e=>{if(!this.owner?.contains(e.target)&&!this.tip.contains(e.target))this.hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!this.tip.hidden){this.hide();e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
  addEventListener('resize',()=>this.hide());document.querySelector('#settings-content').addEventListener('scroll',()=>this.hide(),{passive:true});
 }
 bind(button,getText){
  button.addEventListener('pointerenter',()=>{clearTimeout(this.timer);this.timer=setTimeout(()=>this.show(button,getText()),140);});
  button.addEventListener('pointerleave',()=>this.scheduleHide());button.addEventListener('focus',()=>this.show(button,getText()));
  button.addEventListener('blur',()=>this.scheduleHide());button.addEventListener('click',()=>this.show(button,getText()));
 }
 scheduleHide(){clearTimeout(this.timer);this.timer=setTimeout(()=>this.hide(),130);}
 hide(){clearTimeout(this.timer);this.tip.hidden=true;this.owner?.setAttribute('aria-expanded','false');this.owner=null;}
 show(button,text){
  this.hide();this.owner=button;button.setAttribute('aria-expanded','true');this.tip.textContent=text;this.tip.hidden=false;
  const r=button.getBoundingClientRect(),w=this.tip.offsetWidth,h=this.tip.offsetHeight;
  this.tip.style.left=`${Math.max(12,Math.min(innerWidth-w-12,r.left-10))}px`;
  this.tip.style.top=`${Math.max(12,Math.min(innerHeight-h-12,r.bottom+h+10<=innerHeight?r.bottom+9:r.top-h-9))}px`;
 }
}

export function sliderStep(def){return def.fraction===false||def.integer?1:def.step||(def.max-def.min>1e5?1000:.001);}
export function paintSlider(input,number){
 const span=Number(input.max)-Number(input.min),p=span>0?(Number(input.value)-Number(input.min))/span:0;
 input.style.setProperty('--range-fill',`${Math.max(0,Math.min(100,p*100))}%`);
 number.style.setProperty('--number-ch',Math.max(3,Math.min(13,number.value.length+.8)));
}
