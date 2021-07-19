let canvas = document.getElementById("golf"),
  ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
count=0;
shots=0;
par=2;
score=0;
const SHOT_NAMES={
  0:"PAR",
  1:"BIRDIE",
  2:"EAGLE",
  3:"ALBATROSS",
  "-1":"BOGEY",
  "-2":"DOUBLE BOGEY",
  "-3":"TRIPLE BOGEY"
};
let cam=[0,0],
    track=cam.slice();

let images=[
      "imgs/grass.jpeg",
      "imgs/water.jpeg",
      "imgs/start.png",
      "imgs/stone.png",
      "imgs/boost.jpeg",
      "imgs/sand.png",
      "imgs/hole.png",
      "imgs/spring.png"
    ];
var animator=new Animator(),
game=new Golf();
images.forEach((a,i)=>{
  let src=a;
  images[i]=new Image();
  images[i].onload=img=>{
    count++;
    if (count === images.length) {
      /*fill(-2,-4,18,6,2)
      fill(-1,-3,17,5,0)
      fill(-1,-3,2,5,0)
      fill(6,-1,8,3,2)
      fill(2, -3, 17, -2, 1)
      fill(2, 4, 17, 5, 1)
      fill(5,0,10,2,3)
      game.createTile(5,-1,5);
      game.createTile(5,2,5);
      game.createTile(16,0,6);*/
      /*fill(-10,-10,10,10,0);
      fill(-8,-8,8,8);
      fill(-3,-3,3,3,0)
      fill(-1,-1,1,8,0)
      fill(1,7,8,10)
      fill(-10,-1,-8,1,4)
      fill(-10,-10,-8,-4,3)
      fill(-7,-10,10,-9,1)
      game.createTile(3,0,5);
      game.createTile(8,9,6);
      game.createTile(9,9,6);*/
      /*fill(-6,-9,4,-6,2)
      fill(-6,-8,4,-4,0)
      fill(-6,-4,-4,1,3)
      fill(-2,-6,2,-5,4)
      fill(-2,-5,2,-4,5)
      fill(-2,-2,2,1,5);
      fill(-1,-2,2,1,0);
      fill(5,1,10,6,2);
      fill(6,1,9,5,0);
      game.createTile(7,3,6);*/
    };
  };
  images[i].src=src;
})
function fill(x,y,w,h,v){
  for(let i=x;i<w;i++)for(let j=y;j<h;j++)game.createTile(i,j,v);
}
let dragged = false,
  prevD = false,
  ev;
let balls = [new Ball(0, 0, 145, 0, 200,10)];
balls[0].respawnable=true;
//for (let i = 30; i < 40; i++)for (let j = 0; j < 20; j++) balls.push(new Ball(20 * (i + 1), 20 * (j) + 100, 0, 0, 1,10))
var grd = ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, Math.max(innerWidth, innerHeight),
  innerWidth / 2, innerHeight / 2, Math.min(innerWidth, innerHeight) / 4);
grd.addColorStop(0, "#0099ff");
grd.addColorStop(1, "#66ccff");
function loop() {
  ctx.save();
  track=[balls[0].x,balls[0].y];
  cam=[0.95*cam[0]+0.05*track[0],0.95*cam[1]+0.05*track[1]];
  ctx.translate(innerWidth/2-cam[0],innerHeight/2-cam[1]);
  ctx.fillStyle = grd;
  ctx.fillRect(-innerWidth*2, -innerHeight*2, innerWidth*4, innerHeight*4);
  if(count===images.length)game.drawAll(ctx);
  if (dragged) balls[0].onDrag(ev, ctx);
  else if (prevD) balls[0].onDrop();
  prevD = dragged;
  balls.forEach((a,i) => {
    if(a.out)return balls.splice(i,1);
    let p1 = JSON.parse(JSON.stringify(a.polygon.pos));
    a.move();
    let p2 = JSON.parse(JSON.stringify(a.polygon.pos));
    for (let b of balls) {
      if (b.x === a.x && b.y === a.y) continue;
      let response = new SAT.Response(),
        collided = SAT.testCircleCircle(a.polygon, b.polygon, response);
      if (collided && !b.collided) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (a.radius + b.radius >= dist) { // the balls overlap
          // normalise the vector between them
          const nx = dx / dist;
          const ny = dy / dist;
        
          const touchDistFroma = (dist * (a.radius / (a.radius + b.radius)))
          const contactX = a.x + nx * touchDistFroma;
          const contactY = a.y + ny * touchDistFroma;
        
          a.x = contactX - nx * a.radius;
          a.y = contactY - ny * a.radius;
        
          b.x = contactX + nx * b.radius;
          b.y = contactY + ny * b.radius;
        }
        a.bounce(b);
        break
      }
      else {
        a.collided = false;
        b.collided = false;
      }
    }
    if(count === images.length)a.collideTile();
    //a.reflect();
    a.draw(ctx);
  })
  ctx.restore();
  ctx.fillStyle="white"
  ctx.font="50px Bebas Neue";
  ctx.textAlign="right";
  ctx.fillText("Shots: "+shots,innerWidth-10,innerHeight-10);
  animator.refresh();
  requestAnimationFrame(loop);
}
addEventListener("touchstart", e => {
  dragged = true;
  ev = e
});
addEventListener("touchmove", e => {
  dragged = true;
  ev = e
});
addEventListener("touchend", e => dragged = false);
loop();