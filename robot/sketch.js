let cols, rows;
let grid = [];
let prevGrid = [];
let nextGrid = [];

let resolution = 2; // セルの大きさ

const defaultDamping = 0; // 減衰率
const defaultWaveSpeed = 0.5;  // 波の伝搬速度(1未満)
const defaultTransmission = 1; // 透過率 
const defaultMaterialType = "none";

let damping = [];
let waveSpeed = [];
let transmission = []; //反射率+透過率 = 1
let materialType = [];


let materialAbsorption = {
  "none": [0, 0, 0],
  "test1": [0, 0, 0.5],//増減が激しいとカット
  "test2": [0.3, 0, 0],//増減が少ないとかっと
  "test3": [0,0,0],
  "water": [0,  0.0, 0.5],
  "glass": [0.5, 0.0, 0],
};


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
    t2(i*40)
  }
  //t2(20,"test1");
  //t2(80,"test2");
  //t2(100);
  //t2(140);
  //t2(200);
  //t2(240);
  //t2(280);
  //t2(320);
  //test(-50,-50,"test1",0.1);//増減が激しいとカット
  //test(-50,+50,"test1",0.5);//増減が激しいとカット
  //test(+50,-50,"test2",0.1);//増減が少ないとカット 
  //test(+50,+50,"test2",0.5);//増減が少ないとカット

  
  for(let i = 1;i < rows -1;i++) {
    //点で放出しないようにする
    damping[0][i] = 1;
    damping[1][i] = 0.5;
    damping[2][i] = 0.25;
    damping[3][i] = 0.125;
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

  for(var i = 0;i < 1;i++) {
    drawF();
  }
}
let rnd = Math.random()*1;
let rnd2;
function drawF() {
  const wallX = (~~(frameCount/4));
  //test2(199-wallX,0,199-wallX,50,"test3",0);
  //test2(198-wallX,0,198-wallX,50,"test3",0.15);
  //test2(197-wallX,0,197-wallX,50,"test3",0.2);
  //test2(196-wallX,0,196-wallX,50,"test3",0.4);
  //test2(195-wallX,0,195-wallX,50,"test3",0.8);
  if(frameCount%32 == 0) {
    rnd = 1||Math.random()*2;
    rnd2 = 4||2+(~~(Math.random()*3));
  }
  if(frameCount%4 == 0) {
    for (let i = 1; i < cols - 1; i++) {
      //grid.pop();
    }
   // cols -= 1;
  }
  if(frameCount % rnd2 == 0) {
    for(let i = 1;i < rows -1;i++) {
      //点で放出しないようにする
      grid[cols-1][i] = rnd;
    }
 }

  //grid[cols-4][22] = 1;

  
  background(0,200);

  // 波の更新
  for (let i = 1; i < cols - 1; i++) {
    for (let j = 1; j < rows - 1; j++) {
      
      // 波動方程式の離散化（差分法）
      nextGrid[i][j] = 
        2 * grid[i][j] - prevGrid[i][j] +
        waveSpeed[i][j] * (
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
      //const smoothingFactor = absorption[0];
      //nextGrid[i][j] = (1 - smoothingFactor) * nextGrid[i][j] + smoothingFactor * grid[i][j];

//if(velocity)      console.log(velocity)
      //let d = 1.0 - absorption[2] * Math.abs(velocity);
      //let d2 = absorption[2] * velocity;
      //nextGrid[i][j] = nextGrid[i][j] * d;
      //nextGrid[i][j] = nextGrid[i][j] - d2;
      // 周波数成分を分解
      let lowFreq = lowPassFilter(nextGrid[i][j], prevGrid[i][j], 0.5)//(nextGrid[i][j] + prevGrid[i][j]) / 2;
      let highFreq = nextGrid[i][j] - grid[i][j];
      let midFreq = (grid[i][j] - lowFreq); // 中周波（補間成分）
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

      //// 吸収後のエネルギーを計算
      //let totalEnergy = Math.abs(nextGrid[i][j]) + Math.abs(midFreq) + Math.abs(highFreq);
      //let newEnergy = Math.abs(attenuatedLow) + Math.abs(attenuatedMid) + Math.abs(attenuatedHigh);
      //// エネルギーが増えないようにスケール補正
      //if (newEnergy > totalEnergy && newEnergy > 0) {
      //  let scale_ = totalEnergy / newEnergy;
      //  attenuatedLow *= scale_;
      //  attenuatedMid *= scale_;
      //  attenuatedHigh *= scale_;
      //}
      const s = attenuatedLow + attenuatedMid + attenuatedHigh;
      if(nextGrid[i][j] > 0 && !(absorption[2] && absorption[0]))
        { 
    //      console.log((s)/
   //   nextGrid[i][j]
   //   , attenuatedLow, attenuatedMid, attenuatedHigh
   // );
      }
      // 吸収後の値を反映
      nextGrid[i][j] = attenuatedLow + attenuatedMid + attenuatedHigh;
    }
  }

  // グリッドの更新
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      prevGrid[i][j] = grid[i][j];
      grid[i][j] = nextGrid[i][j];

      // 描画
      let c = map(Math.abs(grid[i][j]), 0, 1, 0, 255);
      let ct = map(1-transmission[i][j] -1, 1, 0, 255);
      let cw = map(waveSpeed[i][j], 0, 1, 0, 255);
      fill(c, c, ct);
      if(materialType[i][j].startsWith("test")) {
        if(materialType[i][j] === "test1") {
          fill(c,c,255)
        } else {
          fill(255,c,c)
        }
      } else {
        //fill(c, cw, c);
        fill(c)
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