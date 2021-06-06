const hasCollided=(obj1,obj2)=>{if(obj1.x<(obj2.x+obj2.width) && (obj1.x+obj1.width)>obj2.x && obj1.y < (obj2.y+obj2.height) && (obj1.y+obj1.height)>obj2.y){return true}else{return false}};const blockIn = (n,box) => {if(n.x >= (box.x+box.width-n.width)){n.x = (box.x+box.width-n.width)}else if(n.y >= (box.y+box.height-n.height)){n.y = (box.y+box.height-n.height)}else if(n.x <= box.x){n.x = box.x}else if(n.y <= box.y){n.y = box.y}};const range=n=>{let Num=[];for(let i=0;i<n;i++){Num.push(i)};return Num};const getDeviceType = () => {const ua = navigator.userAgent;if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {return "tablet";}if (/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {return "mobile";}return "desktop";};
const angleOff=(ia,sa)=>(sa*2-ia)>=360 ? (sa*2-ia)-360:(sa*2-ia)<0 ? (sa*2-ia)+360:(sa*2-ia);const setSector=obj=>{obj.angle=obj.angle<0 ? 360+obj.angle:obj.angle>360 ? obj.angle-360:obj.angle;if(obj.angle >= 0 && obj.angle <= 90){return 0;}else if(obj.angle > 90 && obj.angle <= 180){return 1;}else if(obj.angle > 180 && obj.angle <= 270){return 2;}else if (obj.angle > 270 && obj.angle <= 360) {return 3;};};
Math.toRad=n=>n*(Math.PI/180);Math.toDeg=n=>n*(180/Math.PI);

var FPS = 100,
    keys=new Set(),
    game,
    co=0,
    timeout,
    tuX=(window.innerWidth*4)/5,tX=tuX,
    tuY=(window.innerHeight*4)/5,tY=tuY,
    tAngle=0,dAngle=0,
    isTouching=false,
    isTouchScreen=false,
    tDis=0,dDis=100,sDis=0,maxDis=55;
if(getDeviceType()=='mobile'||getDeviceType()=='tablet'){isTouchScreen=true};
    
class Agent{
    constructor(width,height,x,y){
        this.width=width;
        this.height=height;
        this.x=x;
        this.y=y;
        
        this.alive=true;
        this.angle=0;
        this.lives=3;
        this.timeProtected=0;
        this.score=0;
        this.speed=0;
        this.initspeed=0;
        this.toX=0;
        this.toY=0;
        this.dashingTime=0;
        this.cooldown=50;
        this.dash=1;
        this.isShifting=false;
    };
    update(){
        this.initspeed=this.speed*this.dash;
        if(this.dashingTime>0){this.dashingTime--;this.dash=5}else{this.dash=1};
        this.x+=this.toX*this.initspeed;
        this.y-=this.toY*this.initspeed;
        this.timeProtected-=(this.timeProtected>0) ? 1:0;
    };
};
class Bullet{
    constructor(width,height,x,y){
        this.width=width;
        this.height=height;
        this.x=x;
        this.y=y;
        
        this.alive=true;
        this.speed=10;
        this.angle=90*(Math.PI/180);
    };
    update(){
        this.x+=Math.cos(this.angle)*this.speed;
        this.y+=Math.sin(this.angle)*this.speed;
    };
};
class Line{
    constructor(width,height,x,y){
        this.width=width;
        this.height=height;
        this.x=x;
        this.y=y;
        
        this.alive=true;
        this.speed=0;
        this.direction=0;
    };
    update(){
        if(this.direction==0){
            this.x+=this.speed;
        }else if(this.direction==1){
            this.y+=this.speed
        };
    };
};
class HealLine extends Line{
    constructor(width,height,x,y){
        super(width,height,x,y);
        this.alive=true;
        this.speed=0;
        this.direction=0;
        this.heal=1;
    };
}
class Homer{
    constructor(width,height,x,y){
        this.width=width;
        this.height=height;
        this.x=x;
        this.y=y;
        
        this.alive=true;
        this.speed=1;
        this.angle=0;
        this.moveAngle=1;
        this.timer=350;
    };
    update(){
        if(Math.abs(this.angle)>=360){this.angle=0;};
        let arr = [-1,0,1];
        let agent=game.agents[0];
        let checkarr=arr.map((a)=>Math.hypot(agent.x-(this.x+Math.cos(Math.PI/180*a+this.angle)),agent.y-(this.y+(Math.sin((Math.PI/180)*a+this.angle)))));
        let copy=checkarr.slice();
        copy.sort((a,b)=>a-b);
        this.moveAngle=arr[checkarr.indexOf(copy[0])];
        this.angle+=Math.PI/180*this.moveAngle;
        this.x+=Math.cos(this.angle)*this.speed;
        this.y+=Math.sin(this.angle)*this.speed;
    };
};
class Bomb{
    constructor(width,height,x,y){
        this.width=width;
        this.height=height;
        this.x=x;
        this.y=y;
        
        this.alive=true;
        this.timer=1000;
        this.onExplode=()=>{f(this,this.x,this.y)};
        this.maxSize=10;
        this.spdtimer=5;
        this.speed=10;
        this.angle=0;
        this.rotate=0;
        this.ivl=0;
    };
    update(){
        this.x+=Math.cos(this.angle)*this.speed;
        this.y+=Math.sin(this.angle)*this.speed;
        this.width+=this.maxSize/(this.timer+1);
        this.height+=this.maxSize/(this.timer+1);
        this.rotate+=(Math.PI*2)/(this.timer+1);
    };
};
class Crusher{
    constructor(width,height,x,y){
        this.width=width;
        this.height=height;
        this.x=x;
        this.y=y;
        
        this.alive=true;
        this.timed=false;
        this.backUp=true;
        this.speed=0;
        this.initspd=0;
        this.direction=0;
        this.opacity=0;this.opacityAdd=true;
        this.outTimer=200;
        this.crushTimer=200;
        this.shake=2;
        this.done1=false;this.done2=false;
        this.ivl=0;
    };
    update(){
        if(this.direction==0){
            this.x+=this.speed;
        }else if(this.direction==1){
            this.y+=this.speed
        };
        this.opacity+=(this.opacityAdd) ? 0.1-this.crushTimer/2000:-0.1+this.crushTimer/2000;
    };
};
class Ball{
    constructor(width,height,x,y){
        this.width=width;
        this.height=height;
        this.x=x;
        this.y=y;
        
        this.alive=true;
        this.speed=5;
        this.angle=0;
        this.bounces=10;
        this.start=false;
    };
    update(){
        this.x+=Math.cos(Math.toRad(this.angle))*this.speed;
        this.y+=Math.sin(Math.toRad(this.angle))*this.speed;
    };
};
class Game{
    constructor(x,y,width,height){
        this.canvas=document.getElementById('bullethell');
        this.ctx=this.canvas.getContext("2d");
        
        this.width=width;
        this.height=height;
        this.canvas.width=this.width;
        this.canvas.height=this.height;
        this.x=x;
        this.y=y;
        this.My=y;
        
        this.interval=0;
        this.highScore=0;
    };
    start(){
        this.interval=1;
        this.score=0;
        this.agents=[];
        this.bullets=[];
        this.lines=[];
        this.homers=[];
        this.bombs=[];
        this.crushers=[];
        this.balls=[];
        this.heallines=[];
        clearTimeout(timeout);
        
        let A = new Agent(20,20,this.width/2,this.height/2);
        this.agents.push(A);
    };
    update(){
       blockIn(this.agents[0],this);
       if(!(this.agents[0].alive)){this.start()}else{this.agents[0].cooldown--;this.agents[0].update()};
       for(let n of this.lines){
           if((n.x<this.x && n.speed==-1 && n.direction==0) || (n.x>this.x+this.width && n.speed==1 && n.direction==0) || (n.y<this.y && n.speed==-1 && n.direction==1) || (n.y>this.y+this.height && n.speed==1 && n.direction==1)){
               n.alive=false;
               this.lines.splice(this.lines.indexOf(n),1);
           };
           if(hasCollided(this.agents[0],n) && this.agents[0].dashingTime<=0 && this.agents[0].timeProtected<=0){
               if(this.agents[0].lives>1){this.agents[0].timeProtected=100;this.agents[0].lives--;}else{this.agents[0].alive=false;};
           };
           n.update();
       };
       for(let n of this.bullets){
           if(((n.x<this.x && (n.sector==1||n.sector==2)) || (n.x>this.x+this.width && (n.sector==0||n.sector==3)) || (n.y<this.y && (n.sector==2||n.sector==3)) || (n.y>this.y+this.height && (n.sector==0||n.sector==1)))){
               n.alive=false;
               this.bullets.splice(this.bullets.indexOf(n),1);n=undefined;
           }else{
               if(hasCollided(this.agents[0],n) && this.agents[0].dashingTime<=0 && this.agents[0].timeProtected<=0){
                   if(this.agents[0].lives>1){this.agents[0].timeProtected=100;this.agents[0].lives--;}else{this.agents[0].alive=false;};
               };
               n.update();
           };
       };
       for(let n of this.homers){
           if(n.timer<=0){
               n.alive=false;
               this.homers.splice(this.homers.indexOf(n),1);
           }else{n.timer--;};
           if(hasCollided(n,this.agents[0]) && this.agents[0].dashingTime<=0 && this.agents[0].timeProtected<=0){
               if(this.agents[0].lives>1){this.agents[0].timeProtected=100;this.agents[0].lives--;}else{this.agents[0].alive=false;};
           };
           n.update();
       };
       for(let n of this.bombs){
           if(n.spdtimer<=0&&n.speed>=0){
               n.speed-=0.2;
           }else{n.spdtimer--};
           if(n.timer<=0){
               n.onExplode();
               n.alive=false;
               this.bombs.splice(this.bombs.indexOf(n),1);
           }else{n.timer--};
           if(hasCollided(n,this.agents[0]) && this.agents[0].dashingTime<=0 && this.agents[0].timeProtected<=0){
               if(this.agents[0].lives>1){this.agents[0].timeProtected=100;this.agents[0].lives--;}else{this.agents[0].alive=false;};
           };
           n.update();
       };
       for(let n of this.crushers){
           if(n.backUp){
               if((n.x+n.initspd<this.x && n.speed<=0 && n.direction==0)){
                   n.x=this.x;n.timed=true;n.speed=0;
               }else if((n.x+n.initspd+n.width>this.x+this.width && n.speed>0 && n.direction==0)){
                   n.x=this.x;n.timed=true;n.speed=0;
               }else if((n.y+n.initspd<this.y && n.speed<=0 && n.direction==1)){
                   n.y=this.y;n.timed=true;n.speed=0;
               }else if((n.y+n.initspd+n.height>this.y+this.height && n.speed>0 && n.direction==1)){
                   n.y=this.y;n.timed=true;n.speed=0;
               };
           };
           if(!n.timed){
               if(n.crushTimer<=0){
                       n.speed = n.initspd>=0 ? 100:-100;n.initspd=n.speed;
                   };
                   if(n.crushTimer>0){
                       n.crushTimer--;
                   };
           }else{n.outTimer--;n.shakeTime--};
           if(n.shakeTime==0){n.done1=true;};
           if(n.shakeTime==n.shake-1){n.done2=true;};
           if(n.outTimer<=0){
               n.alive=false;
               this.crushers.splice(this.crushers.indexOf(n),1);
           }else if(n.outTimer<=20 && n.backUp){
              n.backUp=false;n.speed=n.initspd*-1;
           };
           if(hasCollided(n,this.agents[0]) && this.agents[0].dashingTime<=0 && this.agents[0].timeProtected<=0){
               if(this.agents[0].lives>1){this.agents[0].timeProtected=100;this.agents[0].lives--;}else{this.agents[0].alive=false;};
           };
           n.update();
       };
       for(let n of this.balls){
           n.update();
           if(hasCollided(this.agents[0],n) && this.agents[0].dashingTime<=0 && this.agents[0].timeProtected<=0){
               if(this.agents[0].lives>1){this.agents[0].timeProtected=100;this.agents[0].lives--;}else{this.agents[0].alive=false;};
           };
           if(n.bounces>0){
               if(n.start && (n.x-(n.width/2)<this.x||n.x-(n.width/2)>this.x+this.width)){n.angle=180-n.angle;n.bounces--;n.sector=setSector(n);};
               if(n.start && (n.y-(n.height/2)<this.y||n.y-(n.height/2)>this.y+this.height)){n.angle=360-n.angle;n.bounces--;n.sector=setSector(n);};
               if(!(n.y-(n.height/2)<this.y||n.y-(n.height/2)>this.y+this.height)){n.start=true;};
           }else if(((n.x-(n.width/2)<this.x && (n.sector==1||n.sector==2)) || (n.x-(n.width/2)>this.x+this.width && (n.sector==0||n.sector==3)) || (n.y-(n.height/2)<this.y && (n.sector==2||n.sector==3)) || (n.y-(n.height/2)>this.y+this.height && (n.sector==0||n.sector==1)))){
               n.alive=false;
               this.balls.splice(this.balls.indexOf(n),1);n=undefined;
           };
       };
       for(let n of this.heallines){
           if((n.x<this.x && n.speed==-1 && n.direction==0) || (n.x>this.x+this.width && n.speed==1 && n.direction==0) || (n.y<this.y && n.speed==-1 && n.direction==1) || (n.y>this.y+this.height && n.speed==1 && n.direction==1)){
               n.alive=false;this.heallines.splice(this.heallines.indexOf(n),1);
           };
           if(hasCollided(this.agents[0],n)){
               this.agents[0].lives+=n.heal;n.alive=false;this.heallines.splice(this.heallines.indexOf(n),1);
           };
           n.update();
       };
       if(FPS==0){setTimeout(()=>this.update(),0)}else{setTimeout(()=>this.update(),1000/FPS)};
        
       requestAnimationFrame(()=>this.display());
       this.score++;
       this.highScore=(this.highScore>this.score) ? this.highScore:this.score;
    };
spawnEntity(entity = ['Bullet', 'Line', 'Homer','Bomb','Crusher','Ball'][Math.floor(Math.random() * 3)], x, y, randomAngle = Math.random() * 360) {
    switch (entity) {
        case 'Bullet':
            let b,ax,ay;
            if(x===undefined || y===undefined){
                if (randomAngle > 0 && randomAngle <= 90) {
                    ax = -5;
                    ay = -5;
                } else if (randomAngle > 90 && randomAngle <= 180) {
                    ax = this.width * Math.random();
                    ay = -5;
                } else if (randomAngle > 180 && randomAngle <= 270) {
                    ax = this.width + 5;
                    ay = this.height + 5;
                } else if (randomAngle > 270 && randomAngle <= 360) {
                    ax = -5;
                    ay = this.height + 5;
                };
            }else{
                randomAngle%=360;ax=x;ay=y;
            };
            b = new Bullet(5,5, ax, ay);
            b.angle = randomAngle * (Math.PI / 180);
            b.sector = setSector(b);
            this.bullets.push(b);
            return b;
        case 'Line':
            let w = (Math.random() < 0.5) ? 1 : this.width,
                h = (w == this.width) ? 1 : this.height,
                bx, by;
            if (w == this.width) {
                bx = (typeof x === "undefined") ? (Math.random() * w)  : x;
                by = (typeof y === "undefined") ? (Math.random() < 0.5) ? -5 : this.height + 5 : y;
            } else if (h == this.height) {
                by = (typeof y === "undefined") ? (Math.random() * h)  : y;
                bx = (typeof x === "undefined") ? (Math.random() < 0.5) ? -5 : this.width + 5 : x;
            };
            let l = new Line(w, h, bx, by);
            l.speed = (bx == -5 || by == -5) ? 5 : -5;
            l.direction = (w == 1) ? 0 : 1;
            this.lines.push(l);
            return l;
        case 'Homer':
            let r1 = (Math.random() < 0.5) ? Math.random() * this.width : -20,
                r2 = (r1 == -20) ? Math.random() * this.height : -20,
                r3 = (Math.random() < 0.5) ? Math.random() * this.width : this.width + 20,
                r4 = (r3 == this.width + 20) ? Math.random() * this.height : this.height + 20,
                rx = (Math.random() < 0.5) ? r3 : r1,
                ry = (Math.random() < 0.5) ? r4 : r2;
            if(rx == r1 && ry == r4){
                ry = (r1 == -20) ? Math.random() * this.height : this.height + 20;
            }else if (rx == r3 && ry == r2) {
                ry = (r3 == this.width + 20) ? Math.random() * this.height : -20;
            };
            if(x!==undefined && y!==undefined){rx=x;ry=y;};
            let H = new Homer(20, 20, rx, ry);
            this.homers.push(H);
            return H;
        case 'Bomb':
            let cx=0,cy=0;
            if (randomAngle > 0 && randomAngle <= 90) {
                cx = (typeof x === "undefined") ? -5 : x;
                cy = (typeof y === "undefined") ? -5 : y;
            } else if (randomAngle > 90 && randomAngle <= 180) {
                cx = (typeof x === "undefined") ? this.width + 5 : x;
                cy = (typeof y === "undefined") ? -5 : y;
            } else if (randomAngle > 180 && randomAngle <= 270) {
                cx = (typeof x === "undefined") ? this.width + 5 : x;
                cy = (typeof y === "undefined") ? this.height + 5 : y;
            } else if (randomAngle > 270 && randomAngle <= 360) {
                cx = (typeof x === "undefined") ? -5 : x;
                cy = (typeof y === "undefined") ? this.height + 5 : y;
            };
            let tb = new Bomb(10, 10, cx, cy);
            tb.angle = randomAngle * (Math.PI / 180);
            tb.sector = setSector(tb);
            this.bombs.push(tb);
            return tb;
        case 'Crusher':
            let cw = 0,ch = 0,qx = (Math.random() < 0.5) ? 3 : 1,qy = (Math.random() < 0.5) ? 4 : 2;
            if (qx == 1 && qy == 2){//top left
                qx = (Math.random() < 0.5) ? Math.random()*(this.width-100) + 100 : -this.width;
                qy = (qx == -this.width) ? Math.random()*(this.height-100) + 100 : -this.height;
            }else if (qx == 3 && qy == 4){//bottom right
                qx = (Math.random() < 0.5) ? Math.random()*(this.width-100) + 100: this.width;
                qy = (qx == this.width) ? Math.random()*(this.height-100) + 100 : this.height;
            }else if(qx == 1 && qy == 4){//bottom left 
                qx = (Math.random() < 0.5) ? Math.random()*(this.width-100) + 100 : -this.width;
                qy = (qx == -this.width) ? Math.random()*(this.height-100) + 100 : this.height;
            }else if (qx == 3 && qy == 2){//top right
                qx = (Math.random() < 0.5) ? Math.random()*(this.width-100) + 100: this.width;
                qy = (qx == this.width) ? Math.random()*(this.height-100) + 100 : -this.height;
            };
            cw=(Math.abs(qx)==this.width) ? this.width:100; ch=(cw==this.width) ? 100:this.height;
            if(x!==undefined && y!==undefined){qx=x;qy=y;};
            let C = new Crusher(cw, ch, qx, qy);
            C.speed=(qx==-this.width||qy==-this.height) ? 0.2:-0.2;
            C.initspd=C.speed;
            C.direction=(cw==this.width||ch==100) ? 0:1;
            C.shakeTime=C.shake;
            this.crushers.push(C);
            return C;
        case 'Ball':
            let ox,oy,wd=50;
            if(x===undefined || y===undefined){
                if (randomAngle > 0 && randomAngle <= 180) {
                    ox = Math.random() * this.width;
                    oy = -wd;
                } else if (randomAngle > 90 && randomAngle <= 270) {
                    ox = this.width+wd;
                    oy = Math.random() * this.height;
                } else if (randomAngle > 180 && randomAngle < 360) {
                    ox = Math.random() * this.width;
                    oy = this.height + wd;
                } else if (randomAngle > 270 || randomAngle <= 90) {
                    ox = -wd;
                    oy = this.height * this.height;
                };
            }else{
                randomAngle%=360;ox=x;oy=y;
            };
            let B = new Ball(wd, wd, ox, oy);
            B.angle = randomAngle;
            B.sector=setSector(B);
            this.balls.push(B);
            return B;
        case 'HealLine':
            let wi = (Math.random() < 0.5) ? 10 : this.width,he = (wi == this.width) ? 10 : this.height,xa, ya;
            if (wi == this.width) {
                xa = 0;ya = (Math.random() < 0.5) ? -15 : this.height + 15;
            }else if (he == this.height) {
                ya = 0;xa = (Math.random() < 0.5) ? -15 : this.width + 15;
            };if(x!=undefined){xa=x;}else if(y!=undefined){ya=y;};
            let hl = new HealLine(wi, he, xa, ya);hl.speed = (xa == -15 || ya == -15) ? 15 : -15;hl.direction = (wi == 10) ? 0 : 1;this.heallines.push(hl);return hl;
    };
};
    functionTimer(arr1=[],arr2=[]){
        if(this.interval>(((arr1.slice()).sort((a,b)=>b-a))[0])){this.interval=1;return};
        arr1.forEach((d,i)=>{if(this.interval%d==0){arr2[i]()}});
        this.interval++;
    };
    display(){
        this.ctx.fillStyle='black';
        this.ctx.fillRect(0,0,this.width,this.height);
        for(let e of this.homers.concat(this.bullets,this.bombs,this.balls)){
            if(e.alive){
                this.ctx.save();
                if(this.bombs.includes(e)){
                    this.ctx.fillStyle=(e.timer%5==0) ? 'white':'#e20040';
                    this.ctx.beginPath();
                    this.ctx.arc(e.x,e.y,e.width,0,2*Math.PI);
                    this.ctx.fill();
                    this.ctx.translate(e.x,e.y);
                    this.ctx.rotate(e.rotate);
                    this.ctx.fillRect((e.width*1.75)/-2,(e.height*1.75)/-2,(e.width*1.75),(e.height*1.75));
                    this.ctx.rotate(Math.PI/4);
                    this.ctx.fillRect((e.width*1.75)/-2,(e.height*1.75)/-2,(e.width*1.75),(e.height*1.75));
                }else{
                    this.ctx.translate(e.x,e.y);
                    this.ctx.rotate(e.angle);
                    this.ctx.fillStyle='#e20040';
                    if(this.balls.includes(e)){
                        this.ctx.beginPath();
                        this.ctx.arc(e.width/-2,e.height/-2,e.width,0,2*Math.PI);
                        this.ctx.fill();
                    }else{
                        this.ctx.fillRect(e.width/-2,e.height/-2,e.width,e.height);
                        this.ctx.strokeStyle='#ff3399';
                        this.ctx.lineWidth=0.3;
                        this.ctx.strokeRect(e.width/-2,e.height/-2,e.width,e.height);
                    };
                };
                this.ctx.restore();
            };
        };
        for(let l of this.lines.concat(this.agents,this.crushers,this.heallines)){
            if(this.crushers.includes(l) && !l.timed){
                if(l.opacity<=0.1){l.opacityAdd=true}else if(l.opacity>=0.2){l.opacityAdd=false};
                this.ctx.fillStyle='rgba(255,35,82,'+l.opacity+')';
                if(Math.abs(l.width)==this.width){
                    this.ctx.fillRect(this.x,l.y,this.width,l.height);
                }else if(Math.abs(l.height)==this.height){
                    this.ctx.fillRect(l.x,this.y,l.width,this.height);
                };
            };
            if(l.done2 && l.crushTimer<=0){this.ctx.translate(0,-25);l.done2=false;l.shake*=2;}else if(l.done1 && l.crushTimer<=0){this.ctx.translate(0,25);l.done1=false;l.shake*=2;};
            if(l.alive){
                this.ctx.fillStyle=(this.agents.includes(l)) ? (l.dashingTime>0) ? '#00eeff': (l.timeProtected>0) ? '#e00040':'#0099ff' :(this.heallines.includes(l)) ? '#66ffcc':'#e20040';
                this.ctx.fillRect(l.x,l.y,l.width,l.height);
                this.ctx.lineWidth=0.3;
                if(l.lives<3 && this.agents.includes(l)){
                    this.ctx.strokeStyle='white';
                    this.ctx.strokeRect(l.x,l.y,l.width,l.height);
                    this.ctx.beginPath();
                    if(l.lives<=2){
                        this.ctx.moveTo(l.x,l.y);
                        this.ctx.lineTo(l.x,l.y+l.height/3);
                        this.ctx.lineTo(l.x+(l.width/2),l.y+(l.height/2));
                        this.ctx.lineTo(l.x+l.width,l.y+l.height/3);
                        this.ctx.lineTo(l.x+l.width,l.y);
                        this.ctx.closePath();
                        this.ctx.fillStyle='black';
                        this.ctx.fill();
                    };
                    if(l.lives==1){
                        this.ctx.moveTo(l.x+(l.width/2),l.y+(l.height/2));
                        this.ctx.lineTo(l.x+l.width,l.y+l.height/3);
                        this.ctx.lineTo(l.x+l.width,l.y+l.height);
                        this.ctx.lineTo(l.x+(l.width/2),l.y+l.height);
                        this.ctx.closePath();
                        this.ctx.fillStyle='black';
                        this.ctx.fill();
                    };
                };
            };
        };
        this.ctx.fillStyle='white';
        this.ctx.font="40px Montserrat";
        this.ctx.fillText("Score : "+ this.score,this.width/2-95, 70);
        this.ctx.font="20px Montserrat";
        this.ctx.fillText("Max-score : "+ this.highScore,this.width/2-70, 100);
        this.ctx.fillStyle='grey';
        
        if(isTouchScreen){
            this.ctx.fillText("Joystick - Move around in 8 different directions",this.width/3.2, 150);
            this.ctx.fillText("Button - Dash through obstacles",this.width/2.65, 200);
            this.ctx.beginPath();
            this.ctx.fillStyle='rgba(255,51,153,0.2)';
            this.ctx.arc(tX,tY,25,0,Math.PI*2);
            this.ctx.fill();
            this.ctx.fillStyle='rgba(255,102,204,0.13)';
            this.ctx.arc(tuX,tuY,50,0,Math.PI*2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.fillStyle='rgba(255,102,255,0.3)';
            this.ctx.arc(this.width/4.5,this.height/1.2,50,0,Math.PI*2);
            this.ctx.fill();
            this.ctx.fillStyle='white';
            this.ctx.save();
            this.ctx.translate(this.width/4.3,this.height/1.23);
            this.ctx.rotate(45);
            this.ctx.fillRect(20/-2,20/-2,20,20);
            this.ctx.restore();
            this.ctx.strokeStyle='white';
            this.ctx.beginPath();
            this.ctx.moveTo(this.width/4.6,this.height/1.22)
            this.ctx.lineTo(this.width/5,this.height/1.187);
            this.ctx.moveTo(this.width/4.5,this.height/1.21)
            this.ctx.lineTo(this.width/4.9,this.height/1.175);
            this.ctx.moveTo(this.width/4.44,this.height/1.198)
            this.ctx.lineTo(this.width/4.8,this.height/1.166);
            this.ctx.stroke();
        }else{
            this.ctx.fillText("W,A,S,D - Move up,left,right and down respectively",this.width/3.2, 150);
            this.ctx.fillText("Shift - Dash through obstacles",this.width/2.65, 200);
        };
    };
};
const CONTROLS = new Map([['w',1],['d',10],['s',-1],['a',-10],['arrowup',1],['arrowright',10],['arrowdown',-1],['arrowleft',-10]]);
let movespd=5;
class Controller{
    static presskey(pressedKey){
        pressedKey.preventDefault();
        if(pressedKey.key=='Shift' && game.agents[0].dashingTime<=0 && game.agents[0].cooldown<=0 && !game.agents[0].isShifting ){
            game.agents[0].isShifting=true;
            game.agents[0].dashingTime=20;
            game.agents[0].dash=2;
            game.agents[0].cooldown=50;
        };
        if(CONTROLS.has(pressedKey.key.toLowerCase())){
            game.agents[0].toAngle = CONTROLS.get(pressedKey.key.toLowerCase());
            if(Math.abs(game.agents[0].toAngle)/10==1){game.agents[0].toX=game.agents[0].toAngle/10}else{game.agents[0].toY=game.agents[0].toAngle};
            game.agents[0].speed=movespd;
            game.agents[0].moveAngle=10;
        };
    };
    static starttouch(touched){
        let t = [touched.touches[0].clientX,touched.touches[0].clientY],t2=[1,1];
        if(touched.touches.length>1){
            t2 = [touched.touches[1].clientX,touched.touches[1].clientY];
            dDis = Math.hypot((game.width/4.5)-t2[0],(game.height/1.2)-t2[1]);
        };
        sDis = Math.hypot(tuX-t[0],tuY-t[1]);
        if(sDis>maxDis){isTouching=false}else{isTouching=true};
        if(dDis<=50 && game.agents[0].cooldown<=0){game.agents[0].dashingTime=20;game.agents[0].dash=2;game.agents[0].cooldown=50;};
    }
    static touch(touched){
        let t = [touched.touches[0].clientX,touched.touches[0].clientY];
        tAngle = Math.atan2(tuY-t[1],tuX-t[0]);
        tDis = Math.hypot(tuX-t[0],tuY-t[1]);
        let vx=0,vy=0;
        if(tDis>55){tDis=55};
        vx = Math.sin(-tAngle-Math.PI/2)*tDis,
        vy = Math.cos(-tAngle-Math.PI/2)*tDis;
        if(isTouching){
            tX=tuX+vx;
            tY=tuY+vy;
            maxDis=1000;
            dAngle=tAngle*(180/Math.PI);
            dAngle=(dAngle+360)%360;
            if(dAngle>=337.5 || dAngle<22.5){
                game.agents[0].speed=movespd;game.agents[0].toX=-1;game.agents[0].toY=0;
            }else if(dAngle>=22.5 && dAngle<67.5){
                game.agents[0].speed=movespd;game.agents[0].toY=1;game.agents[0].toX=-1;
            }else if(dAngle>=67.5 && dAngle<112.5){
                game.agents[0].speed=movespd;game.agents[0].toY=1;game.agents[0].toX=0;
            }else if(dAngle>=112.5 && dAngle<157.5){
                game.agents[0].speed=movespd;game.agents[0].toY=1;game.agents[0].toX=1;
            }else if(dAngle>=157.5 && dAngle<202.5){
                game.agents[0].speed=movespd;game.agents[0].toY=0;game.agents[0].toX=1;
            }else if(dAngle>=202.5 && dAngle<247.5){
                game.agents[0].speed=movespd;game.agents[0].toY=-1;game.agents[0].toX=1;
            }else if(dAngle>=247.5 && dAngle<292.5){
                game.agents[0].speed=movespd;game.agents[0].toY=-1;game.agents[0].toX=0;
            }else if(dAngle>=292.5 && dAngle<337.5){
                game.agents[0].speed=movespd;game.agents[0].toY=-1;game.agents[0].toX=-1;
            };   
        };
    };
    static upkey(keyout){
        if(['w','s','arrowup','arrowdown'].includes(keyout.key.toLowerCase())){
            game.agents[0].speed=0;game.agents[0].toY=0;
        }else if(['a','d','arrowleft','arrowright'].includes(keyout.key.toLowerCase())){
            game.agents[0].speed=0;game.agents[0].toX=0;
        }else if(keyout.key=='Shift'){
            game.agents[0].dash=1;game.agents[0].dashingTime=0;game.agents[0].isShifting=false;
        };
    };
    static touchstop(touched){
        if(touched.touches.length==0){
            game.agents[0].speed=movespd;game.agents[0].toX=0;game.agents[0].toY=0;tX=tuX;tY=tuY;maxDis=55;
        };
    };
};
window.addEventListener('keydown',()=>Controller.presskey(event));
window.addEventListener('keyup',()=>Controller.upkey(event));
window.addEventListener('touchstart',()=>Controller.starttouch(event));
window.addEventListener('touchmove',()=>Controller.touch(event));
window.addEventListener('touchend',()=>Controller.touchstop(event));
const startNewGame = () =>{
    game = new Game(0,0,window.innerWidth,window.innerHeight);
    game.start();
    if(FPS==0){setTimeout(()=>{game.update()},0)}else{setTimeout(()=>{game.update()},1000/FPS)};
};
const pat=(x=0,y=0,type='Bullet',angles=1,add=0)=>{
    for(let i in range(angles)){
        game.spawnEntity(type,x,y,add+(i*(360/(angles))));
    };
};
const f=(cls,xd,yd)=>{
    if(cls.ivl<=360){
        cls.ivl+=10;
        pat(xd,yd,'Bullet',4,cls.ivl);
        timeout=setTimeout(()=>{f(cls,xd,yd)},1);
    }else{cls.ivl=0};
};
const pat2=(xds,yds,sss,x=Math.random()*360)=>{
    let pop=game.spawnEntity(sss,xds,yds,x);
    if(sss=='Bomb'){pop.onExplode=()=>pat(pop.x,pop.y,'Bullet',8);pop.timer=100;};
};
