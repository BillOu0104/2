// Rate changes schedule more/fewer complete simulation ticks, never larger physics steps.
export class PlaybackClock{
  constructor(){this.reset();}
  reset(){this.remainder=0;}
  accrue(elapsed,rate=1){this.remainder+=Math.max(0,Math.min(.25,elapsed))*rate;}
  takeStep(){if(this.remainder<1/60)return false;this.remainder-=1/60;return true;}
}
