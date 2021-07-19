class Golf {
  constructor() {
    this.world = {};
    this.tileWidth = 50;
    this.classes = {
      0: Grass,
      1: Water,
      2: Stone,
      3: Sand,
      4: Boost,
      5: Spring,
      6: Hole
    }
  }
  createTile(x, y, v) {
    if (!this.world[x]) this.world[x] = {};
    this.world[x][y] = v;
  }
  getTile(x,y){
    let tile = this.world[x];
    if(tile && typeof tile[y]!=="undefined")tile=tile[y];
    else return false;
    let t = this.classes[tile] ? new this.classes[tile](x, y, this.tileWidth) : tile;
    return t
  }
  drawTile(ctx, x, y) {
    let t=this.getTile(x,y);
    if(t)t.draw(ctx);
  }
  drawAll(ctx) {
    for (let i in this.world)
      for (let j in this.world[i]) this.drawTile(ctx, i, j);
  }
}
class Tile {
  constructor(x, y, tileWidth = 50) {
    this.x = x;
    this.y = y;
    this.tileWidth = tileWidth;
    this.polygon = new SAT.Box(new SAT.Vector(this.x*tileWidth-tileWidth/2, this.y*tileWidth-tileWidth/2), tileWidth, tileWidth);
    this.placable = false;
    this.block = false;
    this.activated=false;
  }
  action(ball){
    return ball;
  }
}
class Start extends Tile {
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth)
    this.placable = true;
    this.image = images[2];
  }
  draw(ctx) {
    let pol = this.polygon;
    ctx.drawImage(this.image, this.x*this.tileWidth - pol.w / 2, this.y*this.tileWidth - pol.h / 2, pol.w, pol.h);
  }
};
class Hole extends Tile {
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth);
    this.image=images[6];
    this.hole=true;
  }
  draw(ctx) {
    let pol = this.polygon;
    ctx.drawImage(this.image, this.x * this.tileWidth - pol.w / 2, this.y * this.tileWidth - pol.h / 2, pol.w, pol.h);
  }
};
class Grass extends Tile {
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth);
    this.image = images[0];
  }
  draw(ctx) {
    let pol = this.polygon;
    ctx.drawImage(this.image, this.x * this.tileWidth - pol.w / 2, this.y * this.tileWidth - pol.h / 2, pol.w, pol.h);
  }
}
class Water extends Tile {
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth);
    this.image = images[1];
    this.fallable=true;
  }
  draw(ctx) {
    let pol = this.polygon;
    ctx.drawImage(this.image, this.x * this.tileWidth - pol.w / 2, this.y * this.tileWidth - pol.h / 2, pol.w, pol.h);
  }
};
class Stone extends Tile {
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth)
    this.image = images[3];
    this.block = true;
  }
  draw(ctx) {
    let pol = this.polygon;
    ctx.drawImage(this.image, this.x * this.tileWidth - pol.w / 2, this.y * this.tileWidth - pol.h / 2, pol.w, pol.h);
  }
};
class Wall extends Tile {
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth);
    this.block = true;
  }
};
class Arrow extends Tile {
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth);
    this.angle = 0;
  }
  action(ball) {
    
  }
};
class Teleporter extends Tile{
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth);
    this.p
  }
  action(ball) {
    
  }
}
class Portal extends Tile{
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth);
  
  }
  action(ball) {
  
  }
}
class Sand extends Tile {
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth);
    this.image=images[5];
  }
  action(ball) {
    ball.fric = 0.2;
  }
  draw(ctx) {
    let pol = this.polygon;
    ctx.drawImage(this.image, this.x * this.tileWidth - pol.w / 2, this.y * this.tileWidth - pol.h / 2, pol.w, pol.h);
  }
};
class Spring extends Tile {
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth);
    this.airTime = 2;
    this.image=images[7];
  }
  action(ball) {
    if(!ball.canFall)return false;
    ball.canFall=false;
  }
  draw(ctx) {
    let pol = this.polygon;
    ctx.drawImage(this.image, this.x * this.tileWidth - pol.w / 2, this.y * this.tileWidth - pol.h / 2, pol.w, pol.h);
  }
};
class Boost extends Tile {
  constructor(x, y, tileWidth) {
    super(x, y, tileWidth);
    this.image=images[4];
  }
  action(ball) {
    ball.speed += 0.3;
  }
  draw(ctx) {
    let pol = this.polygon;
    ctx.drawImage(this.image, this.x * this.tileWidth - pol.w / 2, this.y * this.tileWidth - pol.h / 2, pol.w, pol.h);
  }
};

function interceptOnCircle(p1, p2, c, r) {
  var p3 = { x: p1.x - c.x, y: p1.y - c.y } //shifted line points
  var p4 = { x: p2.x - c.x, y: p2.y - c.y }

  var m = p4.x === p3.x ? 0 : (p4.y - p3.y) / (p4.x - p3.x); //slope of the line
  var b = p3.y - m * p3.x; //y-intercept of line

  var mm = Math.pow(m, 2);

  var underRadical = Math.pow(r, 2) * (mm + 1) - Math.pow(b, 2); //the value under the square root sign 
  if (underRadical < 0) {
    //line completely missed
    return false;
  } else {
    var rd = Math.sqrt(underRadical);
    var t1 = (-2 * m * b + 2 * rd) / (2 * mm + 2); //one of the intercept x's
    var t2 = (-2 * m * b - 2 * rd) / (2 * mm + 2); //other intercept's x
    var i1 = { x: t1 + c.x, y: m * t1 + b + c.y } //intercept point 1
    var i2 = { x: t2 + c.x, y: m * t2 + b + c.y } //intercept point 2
    var id1 = Math.pow(p1[0] - i1[0], 2) + Math.pow(p1[1] - i1[1], 2);
    var id2 = Math.pow(p1[0] - i2[0], 2) + Math.pow(p1[1] - i2[1], 2);
    if (id1 > id2) return [i2, i1]
    return [i1, i2];
  }
}

function movePointByDistance(p1, p2, dt) {
  let d = Math.hypot(p2.x - p1.x, p2.y - p1.y)
  t = dt / d;
  return { x: (1 - t) * p1.x + t * p2.x, y: (1 - t) * p1.y + t * p2.y };
}
/*
TO DO:
1.
*/