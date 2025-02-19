let cols, rows;
let grid = [];
let prevGrid = [];
let nextGrid = [];

const defaultDamping = 1; // 減衰率
const defaultWaveSpeed = 0.4;  // 波の伝搬速度
const defaultTransmission = 1; // 透過率 

let damping = [];
let waveSpeed = [];
let transmission = []; //反射率+透過率 = 1

let resolution = 2; // セルの大きさ

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
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
      prevGrid[i][j] = 0;
      nextGrid[i][j] = 0;
      
      damping[i][j] = defaultDamping;
      waveSpeed[i][j] = defaultWaveSpeed;
      transmission[i][j] = defaultTransmission;
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
          grid[i][j-1] * transmission[i][j-1] -
          grid[i][j] * (transmission[i+1][j] + transmission[i-1][j] +
            transmission[i][j+1] + transmission[i][j-1])
        );

      // 減衰を適用
      nextGrid[i][j] *= damping[i][j];

      
    }
  }

  // グリッドの更新
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      prevGrid[i][j] = grid[i][j];
      grid[i][j] = nextGrid[i][j];

      // 描画
      let c = map(grid[i][j], -1, 1, 0, 255);
      let c2 = map(1-transmission[i][j], -1, 1, 0, 255);
      fill(c, c, c2);
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
      transmission[x][y] = 0;
      
      transmission[x][y+1] = 0;
      transmission[x][y-1] = 0;
      transmission[x+1][y] = 0;
      transmission[x-1][y] = 0;
    }
  }
}