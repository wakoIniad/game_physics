let cols, rows;
let grid = [];
let prevGrid = [];
let nextGrid = [];

let resolution = 2; // セルの大きさ

const defaultDamping = 0.99; // 減衰率
const defaultWaveSpeed = 0.2;  // 波の伝搬速度(1未満)
const defaultTransmission = 1; // 透過率 
const defaultMaterialType = "none";

let damping = [];
let waveSpeed = [];
let transmission = []; //反射率+透過率 = 1
let materialType = [];


let materialAbsorption = {
  "none": [0, 0, 0],
  "test1": [0, 0, 1],//増減が激しいとカット
  "test2": [1, 0, 0],//増減が少ないとかっと
  "water": [0,  0.0, 0.5],
  "glass": [0.5, 0.0, 0],
};

function setup() {
  createCanvas(400, 400);
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

  //テスト用の障害物
  for(let i = 0;i < 2*Math.PI;i+=0.01) {
    let x = ~~(Math.sin(i)*20) + 120
    let y = ~~(Math.cos(i)*20) + 120
    
    
    materialType[x][y]   = "test1";
  }
  for(let r = 0;r < 50;r++) {
    for(let i = 0;i < 2*Math.PI;i+=0.05) {
      let x = ~~(Math.sin(i)*r) + 120
      let y = ~~(Math.cos(i)*r) + 120
      
      waveSpeed[x][y]   = 0.1;
      waveSpeed[x][y+1] = 0.1;
      waveSpeed[x][y-1] = 0.1;
      waveSpeed[x+1][y] = 0.1;
      waveSpeed[x-1][y] = 0.1;
//      materialType[x][y]   = "test1";
    }
  }
  
  for(let i = 0;i < 2*Math.PI;i+=0.01) {
    let x = ~~(Math.sin(i)*20) + 50
    let y = ~~(Math.cos(i)*20) + 50
    
    materialType[x][y]   = "test2";
  }
  for(let r = 0;r < 50;r++) {
    for(let i = 0;i < 2*Math.PI;i+=0.05) {
      let x = ~~(Math.sin(i)*r) + 50
      let y = ~~(Math.cos(i)*r) + 50
      
      waveSpeed[x][y]   = 0.1;
      waveSpeed[x][y+1] = 0.1;
      waveSpeed[x][y-1] = 0.1;
      waveSpeed[x+1][y] = 0.1;
      waveSpeed[x-1][y] = 0.1;
//      materialType[x][y]   = "test2";
    }
  }
}

function draw() {
  background(0);

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
        );

      // 減衰を適用
      nextGrid[i][j] *= damping[i][j];

      // 各セルの素材を取得
      let material = materialType[i][j];
      let absorption = materialAbsorption[material];
      // 周波数成分を分解
      let lowFreq = (nextGrid[i][j] + prevGrid[i][j]) / 2;
      let highFreq = nextGrid[i][j] - grid[i][j];
      let midFreq = grid[i][j] - lowFreq; // 中周波（補間成分）

      // 吸収を適用
      let attenuatedLow = lowFreq * (1 - absorption[0]); // 低周波の減衰
      let attenuatedMid = midFreq * (1 - absorption[1]); // 中周波の減衰
      let attenuatedHigh = highFreq * (1 - absorption[2]); // 高周波の減衰

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
      if(nextGrid[i][j] > 0 && (absorption[2] || absorption[0]))
        { 
          console.log((s)/
      nextGrid[i][j]
    //  , attenuatedLow, attenuatedMid, attenuatedHigh
    );
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
      let c = map(grid[i][j], -1, 1, 0, 255);
      let ct = map(1-transmission[i][j] -1, 1, 0, 255);
      let cw = map(waveSpeed[i][j], 0, 0.5, 0, 255);
      fill(c, c, ct);
      if(materialType[i][j].startsWith("test")) {
        fill(c,c,cw)
      } else {
        
        fill(c);
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
      grid[x][y] = 1;
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

      
      materialType[x][y]   = "none2";
      materialType[x][y+1] = "none2";
      materialType[x][y-1] = "none2";
      materialType[x+1][y] = "none2";
      materialType[x-1][y] = "none2";
    }
  }
}