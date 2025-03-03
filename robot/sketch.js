let cols, rows;
let grid = [];
let prevGrid = [];
let nextGrid = [];

let resolution = 2; // セルの大きさ

//discreat param
var dx = 0.1;
var dt = 0.0001;
let time = 0;
let lambda = .3;//0.3と3
let testAmp = 1;//いったんここ１で固定する
let calcCount = Math.max(1,0.01/dt);
const defaultDamping = 0; // 減衰率
const defaultWaveSpeed = 50;  
const defaultTransmission = 1; // 透過率 
const defaultMaterialType = "none";

let damping = [];
let waveSpeed = [];
let transmission = []; //反射率+透過率 = 1
let materialType = [];


let materialAbsorption = {
  //周波数ごとの減衰率
  /**<-low high-> */
  "none": [0, 0, 0],
  //→現在のフィルターの設定だと、振幅の変化が小さい設定の場合に
  // 低・高のフィルターどちらかかってしまう
  //→異や反射してるのが原因みたい？
  "test3": [0,0,0],
  "water": [0,  0.0, 0.5],
  "glass": [0.5, 0.0, 0],
};
let absw = 8;
function makeSettingABSW(key,template) {
  console.log('-- -- --')
  for(let i = 1;i <= absw;i++) {
    //const c = (i/absw)**3;
    //const c = (1/64)**((absw-i)/absw);
    const c = (1/1.5)**(absw-i);
    materialAbsorption[`test${key}-${i}`] = template.map(a=>a*c);
    console.log(`test${key}-${i}`,template.map(a=>a*c));
  }
}
makeSettingABSW(1,[0, 0, 0.1]);
makeSettingABSW(2,[0.1, 0, 0]);


function test2(x,y,dx,dy,material,tr=1) {
  let xx = x - dx;
  let yy = y - dy;
  const M = Math.max(Math.abs(xx),Math.abs(yy));
  for(let i = 0;i < M;i++) {
    materialType[~~(dx+xx*(i/M))][~~(dy+yy*(i/M))] = material;
    transmission[~~(dx+xx*(i/M))][~~(dy+yy*(i/M))] = tr
  }
}

function setup() {
  frameRate(60);
  createCanvas(400, 40);
  cols = width / resolution;
  rows = height / resolution;

  // グリッド初期化
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    prevGrid[i] = [];
    nextGrid[i] = [];

    damping[i] = [];
    waveSpeed[i] = [];
    transmission[i] = [];

    materialType[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
      prevGrid[i][j] = 0;
      nextGrid[i][j] = 0;
      
      damping[i][j] = defaultDamping;
      waveSpeed[i][j] = defaultWaveSpeed;
      transmission[i][j] = defaultTransmission;

      materialType[i][j] = defaultMaterialType;
    }
  }
  function test(posX,posY,material,speed) {
  //テスト用の障害物
    for(let i = 0;i < 2*Math.PI;i+=0.01) {
      let x = ~~(Math.sin(i)*20) + cols/2 + posX
      let y = ~~(Math.cos(i)*20) + rows/2 + posY


      materialType[x][y]   = material;
      //damping[x][y] = 1;
    }
    for(let r = 0;r < 50;r++) {
      for(let i = 0;i < 2*Math.PI;i+=0.05) {
        let x = ~~(Math.sin(i)*r) + cols/2 + posX
        let y = ~~(Math.cos(i)*r) + rows/2 + posY

        waveSpeed[x][y]   = speed;
        waveSpeed[x][y+1] = speed;
        waveSpeed[x][y-1] = speed;
        waveSpeed[x+1][y] = speed;
        waveSpeed[x-1][y] = speed;
      }
    }
  }
  function t2(x,t) {
    test2(x+0,rows/2-5,x+40,0,"test1",1);
    test2(x+0,rows/2+5,x+40,rows,"test2",1);
  }
  for(var i = 0;i < cols/40-1; i++) {
    //t2(i*40)
  }

  
  for(let i = 1;i < rows -1;i++) {
    //点で放出しないようにする
    damping[0][i] = 1;
    damping[1][i] = 0.5;
    damping[2][i] = 0.25;
    damping[3][i] = 0.125;
  }
  for(let px = 0;px < 1;px++ ){
    const x = ~~(cols*1/4+px);
    for(let i = 1;i <= absw; i++) {
      test2(x-i,0,x-i,rows,`test2-${i}`,defaultTransmission);
    }
  }
  
  for(let px = 0;px < 1;px++ ){
    const x = ~~(cols*3/4+px);
    for(let i = 1;i <= absw; i++) {
      test2(x+i,0,x+i,rows,`test1-${i}`,defaultTransmission);
    }
  }
}

function lowPassFilter(currentValue, previousFilteredValue, a) {
  return a * currentValue + (1 - a) * previousFilteredValue;
}

function highPassFilter(currentValue, previousInputValue, previousLowPassValue, b) {
  let lowPassValue = lowPassFilter(previousInputValue, previousLowPassValue, b);
  return currentValue - lowPassValue;
}
let sum_damage = 0;
function draw() {
  if(keyIsPressed) {
    attack();
  }
  for(var i = 0;i < calcCount;i++) {
    drawF();
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
    
      let c = map(Math.abs(grid[i][j]), 0, testAmp, 0, 255);
      let ct = map(1-transmission[i][j], -1, 1, 0, 255);
      let cw = map(waveSpeed[i][j], 0, 1, 0, 255);
      const ab = materialAbsorption[materialType[i][j]]
      fill(c, c, -1);
      if(materialType[i][j].startsWith("test")) {
      fill(...ab.map(a=>a*255     *5    +c))
      //} else {
      //  //fill(c, cw, c);
      //  fill(c)
      }
      noStroke();
      rect(i * resolution, j * resolution, resolution, resolution);
    }
  }
  
  // 波を発生させる（クリック時）
  if (mouseIsPressed) {
    let x = floor(mouseX / resolution);
    let y = floor(mouseY / resolution);
    if (x > 0 && x < cols - 1 && y > 0 && y < rows - 1) {
      console.log(x,y)
      grid[x][y] = 2;
    }
  }
  if(keyIsPressed) {
    let x = floor(mouseX / resolution);
    let y = floor(mouseY / resolution);
    if (x > 0 && x < cols - 1 && y > 0 && y < rows - 1) {
      transmission[x][y]   = 1;
      transmission[x][y+1] = 1;
      transmission[x][y-1] = 1;
      transmission[x+1][y] = 1;
      transmission[x-1][y] = 1;

      
      materialType[x][y]   = "test1";
      materialType[x][y+1] = "test1";
      materialType[x][y-1] = "test1";
      materialType[x+1][y] = "test1";
      materialType[x-1][y] = "test1";
    }
  }
  console.log(sum_damage)
}
let rnd = Math.random()*1;
let rnd2 = 1;
function attack() {
  //点で放出しないようにする
  for(let i = 1;i < rows -1;i++) {
    grid[cols-1][i] = rnd;
    
  }
}
function drawF() {

  for(let i = 1;i < rows -1;i++) {
   prevGrid[cols/2][i] =  testAmp*Math.sin(2 * Math.PI * (-dt)/(lambda/defaultWaveSpeed));
   grid[cols/2][i] =      testAmp*Math.sin(2 * Math.PI * time/(lambda/defaultWaveSpeed));
   
  }

  //grid[cols-4][22] = 1;

  
  background(0,200);

  // 波の更新
  for (let i = 2; i < cols - 2; i++) {
    for (let j = 2; j < rows - 2; j++) {
      
      const gamma2 = Math.pow(waveSpeed[i][j]*dt/dx, 2);
      // 波動方程式の離散化（差分法）
      nextGrid[i][j] = 
        2 * grid[i][j] - prevGrid[i][j] +
        gamma2 * (
          grid[i+1][j] * transmission[i+1][j] + 
          grid[i-1][j] * transmission[i-1][j] +
          grid[i][j+1] * transmission[i][j+1] +
          grid[i][j-1] * transmission[i][j-1]
          
          //+(grid[i+1][j+1] * transmission[i+1][j+1] + 
          //grid[i-1][j-1] * transmission[i-1][j-1] +
          //grid[i-1][j+1] * transmission[i-1][j+1] +
          //grid[i+1][j-1] * transmission[i+1][j-1] ) * 2 ** 0.5
          - grid[i][j] * (
            transmission[i+1][j] + transmission[i-1][j] +
            transmission[i][j+1] + transmission[i][j-1]
            //+ (transmission[i+1][j+1] + transmission[i-1][j-1] + 
            //transmission[i-1][j+1] + transmission[i+1][j-1]) * 2 ** 0.5
          )
        ) ;


      // 減衰を適用
      const velocity = nextGrid[i][j] - grid[i][j];
      if(i <= 3) {
        sum_damage += Math.abs(damping[i][j] * (velocity));
      }
      nextGrid[i][j] -= damping[i][j] * (velocity);


      // 各セルの素材を取得
      let material = materialType[i][j];
      let absorption = materialAbsorption[material];
    //  const smoothingFactor = absorption[0];
     // nextGrid[i][j] = (1 - smoothingFactor) * nextGrid[i][j] + smoothingFactor * grid[i][j];

//if(velocity)      console.log(velocity)
      //let d = 1.0 - absorption[2] * Math.abs(velocity);
     // let d2 = absorption[2] * velocity;
      //nextGrid[i][j] = nextGrid[i][j] * d;
     // nextGrid[i][j] = nextGrid[i][j] - d2;
     /**
      * 
      let lowFreq = lowPassFilter(x, z, 0.5);
      let highFreq = (x - y)**(0.1);
      let midFreq = (y - lowFreq); // 中周波（補間成分）

      
      let lowFreq = lowPassFilter(x, z, 0.5);
      let highFreq = (x - y)**(0.1);
      let midFreq = (x - (high+lowFreq)); // high と lowの中間部分を求めるため、lowとhighの設定が大事
      
      
      let lowFreq = lowPassFilter(x, z, 0.5);
      let highFreq = (x - y)**(0.1);
      let midFreq = ((x+y)/2 - (y+z)/2); // high と lowの中間部分を求めるため、lowとhighの設定が大事
      // mid: x/2+y/2-y/2-z/2 = x/2-z/2
      
      let lowFreq = lowPassFilter(x, z, 0.5);
      let highFreq = (x - y);
      let midFreq = ((x+y)/2 - (y+z)/2); // high と lowの中間部分を求めるため、lowとhighの設定が大事
      // low: x/2 + z/2
      // high: x-y
      // mid: x/2+y/2-y/2-z/2 = x/2-z/2
      // sum = 2x - y

      
      let lowFreq = (x+y)/2;
      let highFreq = (x - y);
      let midFreq = ((x+y)/2 - (y+z)/2); // high と lowの中間部分を求めるため、lowとhighの設定が大事

      // sum = x + y + x - y - y/2 - z/2 = 2x -y/2 - z/2
      
      0, 0.5 1
      l 0.75
      m 0.5
      h 0.5

      0, 0.25 0.5
      l 0.375
      m 0.25
      h 0.25

      0, 0.1 0.2
      l 0.15
      m 0.1
      h 0.1

      ------
      0, 0.5 1
      l 0.75 
      m 0.25 
      h 0.5  

      0, 0.25 0.5
      l 0.375 
      m 0.125 
      h 0.25  

      0, 0.1 0.2
      l 0.15 
      m 0.05 
      h 0.1  

      y=sin(x) 0 1 0 -1 -> yの値の変化は 一周期当たり4 dyの総和はこれに等しいので、
      dyの平均は4/(2PI/dx) .....であってる..??
      
      highの平均値(?): 4/(2PI/dx) = 4/(2・(PI/dx)) = 2/(PI/dx) = 2/PI * dx

      lowの平均値(?): 2/PI
       
      let lowFreq = (y+z)/2;
      let highFreq = (x - y);
      let midFreq = ((x+y)/2 - (y+z)/2); // high と lowの中間部分を求めるため、lowとhighの設定が大事

      //1.5x - y/2

      */
     //変化が小さくなる→ローパスに良く反応する
      // 周波数成分を分解
      let lowFreq = lowPassFilter(nextGrid[i][j], prevGrid[i][j], 0.5)*0.1//(nextGrid[i][j] + prevGrid[i][j]) / 2;
      let highFreq = ((nextGrid[i][j] - grid[i][j]));
      let midFreq = (grid[i][j] - lowFreq); // 中周波（補間成分）
      //問題
      //lowがhighと比べて常に値が大きくなる。逆にhighはめっちゃ小さい (主に変化量が小さいときに問題)
      //振幅が１の波ならlowはmax1だけどhighは2 (主に変化量が大きい時に問題)
      // prev now
      // 1,  1   : 1,  0
      // 1,  0   : 0.5 1
      // 1,1 : 1, 0, 1
      // 1,0 : 0.5, 1, -0.5
      // -1,1: 0, -2, 2
      //-1 
      // 30hz 60hz 120hz
      // 

      // 吸収を適用
      let attenuatedLow = lowFreq   * (1-absorption[0]); // 低周波の減衰
      let attenuatedMid = midFreq   * (1-absorption[1]); // 中周波の減衰
      let attenuatedHigh = highFreq * (1-absorption[2]); // 高周波の減衰

      //これによってabsorption0で足し合わせたときにnextGrid[i][j]だけが残る必要がなくなる
      //代わりに、正の数の範囲内の変化なら各値も正の数、負の数の数の変化ないなら負の数に"おおむね"なる必要がある。
      let ratio = (lowFreq + midFreq + highFreq+Number.MIN_VALUE)/(nextGrid[i][j]+Number.MIN_VALUE);

      // 吸収後の値を反映
      nextGrid[i][j] = (attenuatedLow + attenuatedMid + attenuatedHigh)/ratio;
    }
  }

  // グリッドの更新
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      prevGrid[i][j] = grid[i][j];
      grid[i][j] = nextGrid[i][j];      // 描画
    }
  }

  time+=dt;
}