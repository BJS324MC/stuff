class Animator{
  constructor(){
    this.animations=[];
  }
  addAnimation(fn,sequence,ms=2000,onFinish=()=>0){
    this.animations.push({
      fn:fn,
      sequence:sequence,
      start:Date.now(),
      end:Date.now()+ms,
      onFinish:onFinish
    });
  }
  refresh(){
    let now=Date.now();
    this.animations.forEach((a,i)=>{
      let seq=a.sequence,
          frames=Object.keys(seq).map(a=>Number(a)).sort((a,b)=>a-b),
      t=(now-a.start)/(a.end-a.start),//duration passed
      min,max;
      for(let f of frames){
        if(f<=t)min=f;
        else {max=f;break};
      };
      if(!max){a.fn(seq[min],t);a.onFinish(seq);this.animations.splice(i,1)}
      else {
        let t2 = (t - min) / (max - min),
            lerp = (1 - t2) * seq[min] + t2 * seq[max];
        a.fn(lerp,t2);
      };
    })
  }
}
/*[0.1,0.2,0.4,0.6]
t=0.3
min=0.2
max=0.4
*/