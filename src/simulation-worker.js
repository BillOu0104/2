import {Simulation} from './simulation.js';
import {PlaybackClock} from './playback-clock.js';
let simulation,paused=false,failed=false,lastTime=performance.now(),lastPost=0,sentEvent=0;
const clock=new PlaybackClock();
function sendState(executionError=null){
 const state=simulation.snapshot({afterEvent:sentEvent,compact:true});
 if(state.initializing&&!executionError)return;
 if(state.events.length)sentEvent=state.events.at(-1).id;
 state.trailSamples=simulation.orbitTrace.drain();
 state.playback={rate:simulation.settings.playbackRate,queuedSeconds:clock.remainder};
 if(executionError)state.executionError=executionError;
 self.postMessage({type:'state',state});
}
function fail(error){failed=true;try{if(simulation)sendState({code:error.code??'simulation-error',message:error.message});}catch{}self.postMessage({type:'error',message:error.message,stack:error.stack});}
self.onmessage=({data})=>{
 try{
  if(data.type==='init'){simulation=new Simulation(data.settings,data.statistics,{trace:true});simulation.tick();failed=false;clock.reset();lastTime=performance.now();sendState();}
  if(data.type==='settings'){const generation=simulation?.generation;simulation?.configure(data.patch);if(generation!==simulation?.generation){clock.reset();lastTime=performance.now();}if(!simulation?.controlled?.numericalUnknown)failed=false;}
  if(data.type==='restart'){simulation?.restart();simulation?.tick();failed=false;clock.reset();lastTime=performance.now();if(simulation)sendState();}
  if(data.type==='pause'){paused=!!data.value;clock.reset();lastTime=performance.now();}
 }catch(error){fail(error);}
};
setInterval(()=>{
 const now=performance.now();
 if(!simulation||paused||failed){lastTime=now;return;}
 clock.accrue((now-lastTime)/1000,simulation.settings.playbackRate??1);lastTime=now;
 try{
  const start=performance.now();
  while(performance.now()-start<12&&clock.takeStep())simulation.tick();
  if(now-lastPost>30){sendState();lastPost=now;}
 }catch(error){fail(error);}
},8);
