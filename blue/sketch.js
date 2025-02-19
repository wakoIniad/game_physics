const tips = [];
const targets = [];
function setup() {
  createCanvas(400, 400);
  strokeWeight(5);
  noFill();

  for(let i = 0;i < 2000;i++) {
    const size_ = 2+Math.random()*10
    const stat = 
      new Stat(size_,1,size_,8/size_,size_*2,50);
    const tip = new Tip(
      new Pos(200+(Math.random()-0.5)*30,200+(Math.random()-0.5)*30), stat,
      async function(value){
        
        if(value.type == 'target') {
          this.attack();
            this.save('counter',0);
            this.save('phase','attack');
        } else
        if(value.type == 'attacked') {
          if(this.get('phase') === 'move_to_taget'||
           this.get('phase') === 'attack'
             ) {
            this.attack();
            this.save('counter',0);
            this.save('phase','attack');
          } else {
            //this.save('pos', this.myPos());
            this.share({type: 'goto', value: this.myPos()});
            this.save('phase', 'finded');
            this.attack();
            this.clearDestinate();
            this.goto(
              190+Math.random()*20,
              190+Math.random()*20
            );
          }
        } else if(value.type == 'goto') {
          const t = value.value;
          const list = this.get('killedpos')||[];
          const already = list.map(p=>((t.x-p.x)**2+(t.y-p.y)**2)**0.5)
          .filter(d=>d < 10);
          if(already.length) {
            this.share({type:'reset', value: already[0]});
          } else
          if(this.get('phase') === 'explore') {
            this.clearDestinate();
            this.goto(
              value.value.x +
                0*(Math.random()-0.5),
              value.value.y + 
                0*(Math.random()-0.5),
            );
            this.save('phase', 'move_to_taget');
            this.share(value);
          }
        } else if(value.type == 'success') {
          this.share('success');
          this.save(
            'killedpos', 
            [
              this.myPos(),
              ...(this.get('killedpos')||[])
            ]
          );
          this.save('phase','explore');
          this.clearDestinate();
            this.goto(
              175+Math.random()*50,
              175+Math.random()*50
            );
        } else if(value.type == 'reset'){
          const t = this.get('pos');
          if(t) {
            this.save('pos',undefined);
            this.get('phase','explore');
            //const p = value.value;
            //if(((t.x-p.x)**2+(t.y-p.y)**2)**0.5 < 20) {
            //  this.save('pos',null);
            //  this.phase('explore');
            //}
          }
          this.share(value);
        } else if(this.type === 'heart') {
          this.share({type:'__'});
          this.goto(200,200);
        } else {
          //this.share({type:'_'});
          if(
            this.get('phase') === 'explore' || 
            !this.get('phase')
          ) {    
            this.save('phase', 'explore');
            this.move(
              ((size_+1)/4)**2*Math.sign(Math.random()-0.5),
              ((size_+1)/4)**2*Math.sign(Math.random()-0.5)
            );
          this.share({type:'__'});
          } else if(this.get('phase') === 'finded') {
            const t = this.get('pos');
            if(t)this.share({type: 'goto', value: t});
          } else if(this.get('phase') === 'attack'){
            this.save('counter', this.get('counter')+1);
            if(this.get('counter') > 5) {
              this.save('phase','explore');
              this.share({type:'success'})
            }
              this.share({type:'__'});
          } else if(this.get('phase') === 'move_to_taget'){
            this.save('counter', (this.get('counter')||0)+1);
            if(this.get('counter') > 20) {
              this.save('phase','explore');
              this.share({type:'success'})
            }
            this.share({type:'__'});
          }
        }
      }
    );
    tips.push(tip);
  }
  targets.push(new Target(new Pos(50, 50)));
  targets.push(new Target(new Pos(250, 250)));
  targets.push(new Target(new Pos(300, 50)));
}

function draw() {
  background(0,128);
  for(const tip of tips) {
    //if(frameCount%30 == 0)tip.event('air');
    if(frameCount%50==0) {
      tip.hp += 1;
    }
    if(tip.hp <= 0) {
      stroke(128,128,0);
    } else {
      stroke(0,175,191,32);
    }
    strokeWeight(tip.stat.size);
    point(tip.pos.x, tip.pos.y);
    tip.everyframe();
  }
  for(const target of targets) {
    if(target.dead) {
      stroke(100,100,100);
    } else {    
      stroke(255,0,0);
    }
    strokeWeight(10);
    point(target.pos.x, target.pos.y);
    strokeWeight(5);
    line(target.pos.x, target.pos.y - 30,
        target.pos.x+target.hp/2000*100,
         target.pos.y - 30)
    target.everyframe();
  }
  if(frameCount%100 == 0) {
    tips[1].event({type:'heart'});
    tips[2].event({type:'heart'});
    tips[3].event({type:'heart'});
    tips[4].event({type:'heart'});
    tips[5].event({type:'heart'});
  }
  if(frameCount%200 == 0) {
    
  targets.push(new Target(
    new Pos(
      Math.random()*400, 
      Math.random()*400
    )
  ));
  }
}

class Stat {
  constructor(size, power, defence, speed, transmission, memory) {
    this.size = size;
    this.power = power;
    this.defence = defence;
    this.speed = speed;
    this.transmission = transmission;
    this.memory = memory;
  }
}
class Pos {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
  dist(pos) {
    return ((this.x-pos.x)**2+(this.y-pos.y)**2)**0.5;
  }
}

class TipEvent{
  constructor(tip, id) {
    this.tip = tip;
    this.id = id || Math.random();
  }
  myPos() {
    return {x:this.tip.pos.x, y:this.tip.pos.y};
  }
  async share(value) {
    strokeWeight(this.tip.stat.size)
    stroke(255,255,255);
    point(this.tip.pos.x, this.tip.pos.y);
    return new Promise((resolve,reject)=>{
      setTimeout(()=>{
        for(const tip of tips.filter(
          tip => tip.pos.dist(this.tip.pos) < this.tip.stat.transmission
        )) {
          
          tip.stimulated.call(tip, this.id, value);
        }
        resolve();
      },100);
    });
  }
  clearDestinate() {
    this.tip.destinate = [];
  }
  async move(x, y) {
    if(!this.tip.destinate.length){
      this.tip.destinate.push(
        new Pos(this.tip.pos.x + x, this.tip.pos.y + y)
      );
    } else {
      this.tip.destinate[0].x += x;
      this.tip.destinate[0].y += y;
    }
  }
  async goto(x, y) {
    this.tip.destinate.push(
      new Pos(x,y)
    );
  }
  async attack() {
    return new Promise((resolve, reject)=>{
      for(const target of targets.filter(
          target => target.pos.dist(this.tip.pos) < this.tip.stat.transmission
      )) {
          target.attacked(this.tip.stat.power);
      };
    });
  }
  save(key, value) {
    this.tip.variables[key] = value;
  }
  get(key) {
    return this.tip.variables[key];
  }
}

class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Tip {
  constructor(pos, stat, func) {
    this.pos = pos;
    this.stat = stat;
    this.func = func;
    this.received_id = [];
    this.destinate = [];
    this.variables = {};
    this.hp = stat.size;
  }
  attacked(damage) {
    this.event({type:'attacked'});
    this.hp -= damage;
  }
  stimulated(event_id, value) {
    if(this.hp <= 0)return;
    if(! this.received_id.includes(event_id) ) {
      this.received_id.push(event_id);
      this.func.call(
        new TipEvent(this, event_id),
        value
      );
    }
  }
  event(value) {
    if(this.hp <= 0)return;
    this.stimulated(new TipEvent(this).id, value);
  }
  everyframe() {
    if(this.hp <= 0)return;
    
    if(!this.destinate.length)return;
    const dx = this.destinate[0].x - this.pos.x;
    const dy = this.destinate[0].y - this.pos.y;
    const distance = (dx**2)+(dy**2);
    if(
      distance**0.5 > 
      this.stat.speed
    ) {
      const n =
        ( (this.stat.speed**2)/
         distance
        )**0.5;
      this.pos.x += n * dx;
      this.pos.y += n * dy;
    } else {
      this.pos.x = this.destinate[0].x;
      this.pos.y = this.destinate[0].y;
      this.destinate.shift();
    }
  }
}

class Target {
  constructor(pos) {
    this.pos = pos;
    this.hp = 4000;
    this.dead = false;
  }
  everyframe() {
    if(this.dead)return;
    for(const tip of tips.filter(
          tip => tip.pos.dist(this.pos) < tip.stat.transmission
        )) {
      tip.event({type: 'target'});
    }
    let counter = 0;
    for(const tip of tips.filter(
          tip => tip.pos.dist(this.pos) < 20 && tip.hp > 0
        )) {
      counter ++;
      if(counter < 10) {
        tip.attacked(3);
      }
    }
  }
  attacked(damage) {
    if(this.dead)return;
    this.hp -= damage;
    if(this.hp <= 0) {
      this.dead = true;
      console.log('!!!')
    }
  }
}
