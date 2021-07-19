class Ball {
  constructor(x, y, angle = 0, speed = 0, mass = 1, radius = 15) {
    this.x = x;
    this.y = y;
    this.respawnX = x;
    this.respawnY = y;
    this.respawnable = false;
    this.angle = angle;
    this.speed = speed;
    this.espeed = 0;
    this.fric = 0.05;
    this.radius = radius;
    this.rad = Math.PI / 180;
    this.deg = 180 / Math.PI;
    this.polygon = new SAT.Circle(new SAT.Vector(x, y), this.radius);
    this.mass = mass;
    this.falling = false;
    this.collided = false;
    this.canFall=true;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  move(spd = this.speed) {
    this.x += Math.cos(this.angle * this.rad) * spd;
    this.y += Math.sin(this.angle * this.rad) * spd;
    if (this.speed > this.fric) this.speed -= this.fric;
    else {
      this.speed = 0;
      if (!this.falling && this.canFall) {
        this.respawnX = this.x;
        this.respawnY = this.y
      }
    };
    this.updatePolygon();
  }
  velVector() {
    return new SAT.Vector(Math.cos(this.angle * this.rad) * this.speed,
      Math.sin(this.angle * this.rad) * this.speed)
  }
  updatePolygon() {
    let pos = this.polygon.pos;
    pos.x = this.x;
    pos.y = this.y;
  }
  onDrag(e, ctx) {
    if (this.speed > 0 || this.falling) return false;
    let ex = e.touches[0].clientX,
      ey = e.touches[0].clientY,
      disX = innerWidth / 2 - ex,
      disY = innerHeight / 2 - ey;
    let mn = Math.min(innerWidth, innerHeight) / 4;
    disX = Math.min(mn, Math.max(disX, -mn));
    disY = Math.min(mn, Math.max(disY, -mn));
    this.espeed = [disX * 2, disY * 2];
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    if (Math.abs(this.espeed[0]) + Math.abs(this.espeed[1]) < 50) {
      ctx.strokeStyle = "rgba(255,0,0,0.5)";
      this.espeed = [0, 0];
    }
    ctx.beginPath();
    ctx.lineWidth = this.radius;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + disX * 2, this.y + disY * 2);
    ctx.stroke();
  }
  onDrop() {
    if (this.speed > 0 || this.espeed[0] === 0 || this.espeed[1] === 0)
      return false;
    this.speed = Math.hypot(...this.espeed) / 40;
    this.angle = Math.atan2(this.espeed[1], this.espeed[0]) * this.deg;
    shots++;
  }
  fallOff() {
    if (this.falling || !this.canFall) return false;
    this.falling = true;
    animator.addAnimation(x => this.radius = x, { 0: this.radius, 1: 0 }, 500,
      f => {
        if (!this.respawnable) { return this.out = true };
        this.x = this.respawnX;
        this.y = this.respawnY;
        this.radius = f[0];
        this.falling = false;
        this.speed = 0
      });
  }
  fallIn() {
    this.speed = 0;
    this.fallOff();
  }
  goInHole() {
    if (this.falling) return false;
    this.falling = true;
    this.speed = 0;
    animator.addAnimation(x => {this.radius = x}, { 0: this.radius, 0.2: 0 , 1:0}, 2000,
      f => {
        if (!this.respawnable) { return this.out = true };
        this.respawnX=0;
        this.respawnY=0;
        this.x = this.respawnX;
        this.y = this.respawnY;
        this.radius = f[0];
        this.falling = false;
        this.speed = 0;
        shots=0;
      });
    animator.addAnimation(x => {
      ctx.fillStyle = "yellow";
      ctx.textAlign = "center";
      ctx.font = x + "px Bebas Neue";
      if(shots===1) return ctx.fillText("HOLE IN ONE", innerWidth / 2, innerHeight / 2);
      let s = shots - par;
      if (s > 3) s = 3;
      else if (s < -3) s = -3;
      ctx.fillText(SHOT_NAMES[s], innerWidth / 2, innerHeight / 2);
    }, { 0: 0, 0.2: 100, 0.8: 100, 1: 0 }, 2000);
  }
  bounceUp(){
    if(!this.onAir)animator.addAnimation(x=>this.radius=x,
    {0:this.radius,0.1:this.radius*1.8,0.7:this.radius*1.3,1:this.radius},1000,f=>{this.canFall=true;this.onAir=false});
    this.onAir=true;
  }
  vecMul(b, v) {
    return v.map(a => b * a);
  }
  addVec(a, b) {
    return a.map((e, i) => b[i] + e);
  }
  collideTile() {
    if(this.falling)return;
    this.fric = 0.05;
    let ab = this.polygon.getAABBAsBox(),
      cd = e => Math.floor((e + game.tileWidth / 2) / game.tileWidth),
      fg = h => Math.ceil((h + game.tileWidth / 2) / game.tileWidth),
      l = false,
      m = false,
      n = true;
    for (let i = cd(ab.pos.x); i < fg(ab.pos.x + ab.w); i++)
      for (let j = cd(ab.pos.y); j < fg(ab.pos.y + ab.h); j++) {
        let k = game.getTile(i, j);
        if (k && !k.activated) {
          if (k.block) this.blockTile(k.polygon);
          if (!k.hole) n = false;
          k.action(this);
          k.activated = true;
          if (!k.fallable) l = true;
          else m = true;
        };
      };
    if(!this.canFall)return this.bounceUp();
    if (!l) m ? this.fallIn() : this.fallOff();
    else if (n) this.goInHole();
  }
  blockTile(rect) {
    var cx = this.x,
      cy = this.y,
      cvel = this.velVector(),
      nearestX = Math.max(rect.pos.x, Math.min(cx, rect.pos.x + rect.w)),
      nearestY = Math.max(rect.pos.y, Math.min(cy, rect.pos.y + rect.h)),
      dist = new SAT.Vector(cx - nearestX, cy - nearestY);
    if (cvel.dot(dist) < 0) {
      var normal_angle = Math.atan2(-dist.x, dist.y),
        incoming_angle = Math.atan2(cvel.y, cvel.x),
        theta = normal_angle - incoming_angle;
      cvel = cvel.rotate(2 * theta);
      this.speed = cvel.len();
      this.angle = Math.atan2(cvel.y, cvel.x) * this.deg;
    }
    /*var penetrationDepth = (this.radius - dist.len());
    var penetrationVector = dist.normalize();
    this.x-=penetrationVector.x*penetrationDepth;
    this.y-=penetrationVector.y*penetrationDepth;*/
    while (this.hasCollision(rect)) {
      this.x += this.direction(false);
      this.y += this.direction(true);
    };
  }
  direction(f) {
    return f ? ((this.angle < 45 && this.angle >= 0 && this.angle >= 315) ? 1 : (this.angle >= 135 && this.angle < 225) ? -1 : 0) :
      ((this.angle >= 45 && this.angle < 135) ? 1 : (this.angle >= 225 && this.angle < 315) ? -1 : 0);
  }
  hasCollision(rect) {
    return (
      this.x + this.radius / 2 > rect.x - rect.tileWidth / 2 &&
      this.x - this.radius / 2 < rect.x + rect.tileWidth / 2 &&
      this.y + this.radius / 2 > rect.y - rect.tileWidth / 2 &&
      this.y - this.radius / 2 < rect.y + rect.tileWidth / 2
    );
  }
  reflect() {
    let v = [Math.cos(this.angle * this.rad), Math.sin(this.angle * this.rad)];
    if (this.x <= this.radius && v[0] < 0) {
      this.x = this.radius;
      v[0] = -v[0];
    }
    else if (this.x + this.radius >= innerWidth && v[0] > 0) {
      this.x = innerWidth - this.radius;
      v[0] = -v[0];
    }
    if (this.y <= this.radius && v[1] < 0) {
      this.y = this.radius;
      v[1] = -v[1];
    }
    else if (this.y + this.radius >= innerHeight && v[1] > 0) {
      this.y = innerHeight - this.radius;
      v[1] = -v[1];
    }
    this.angle = Math.atan2(v[1], v[0]) * this.deg;
  }
  bounce(ball) {
    if (this.collided) return;
    let dn = this.mass + ball.mass,
      v1 = [Math.cos(this.angle * this.rad) * this.speed, Math.sin(this.angle * this.rad) * this.speed],
      v2 = [Math.cos(ball.angle * ball.rad) * ball.speed, Math.sin(ball.angle * ball.rad) * ball.speed],
      a1 = this.addVec(this.vecMul((this.mass - ball.mass) / dn, v1), this.vecMul((2 * ball.mass) / dn, v2)),
      a2 = this.addVec(this.vecMul((ball.mass - this.mass) / dn, v2), this.vecMul((2 * this.mass) / dn, v1));
    this.angle = Math.atan2(a1[1], a1[0]) * this.deg;
    ball.angle = Math.atan2(a2[1], a2[0]) * this.deg;
    this.speed = Math.hypot(...a1);
    ball.speed = Math.hypot(...a2);
    this.collided = true;
    ball.collided = true;

  }
}