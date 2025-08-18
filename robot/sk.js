//RAINY_NOISE
const SIZE = 128;
const m = new Array(SIZE).fill(0).map(_=>
new Array(SIZE).fill().map(_=>
  Math.round(Math.random())));
function setup() {
  createCanvas(400, 400);
  frameRate(10);
}

//上下左右の重みを強くして曲線的な変化にする
const weight = [
  2,1,2,1,2,1,2,1,2
]; 
const WEIGHT_SUM = weight.reduce((sum,v)=>sum+v,0)
const rule = [
  [
    0,2
  ],
  [
    1,4
  ]
];

const neighbors = [
  [-1,-1],
  [-1, 0],
  [-1, 1],
  [ 0, 1],
  [ 1, 1],
  [ 1, 0],
  [ 1,-1],
  [ 0,-1],
]
function update() {
  const ref = m.map(arr=>[...arr]);
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
      let total = 0;
      for(let at = 0;at < 8;at++) {
        const p = neighbors[at];
        const x = (p[0] + i + SIZE)%SIZE;
        const y = (p[1] + j + SIZE)%SIZE;
        total += weight[at]*ref[x][y];
        
      }
      total = Math.floor(8*total/WEIGHT_SUM);
      if(rule[0].includes(total) && m[i][j] < 0.5) {
        m[i][j] += 2;
      } else if(!(rule[1].includes(total)) && m[i][j] > 0.5) {
        m[i][j] -= 1;
      }
    }  
  }
   
  const ref2 = m.map(arr=>[...arr]);
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) { 
      //if(m[i][j] != ref2[i][j]){   
      if(m[i][j] - ref2[i][j] > 0.5){  
        m[i][j]= 1-myf(ref2,i,j,true);
      }else {
        m[i][j] = myf(ref2,i,j,true);
      }
    }
  }
}

function myf(ref,i,j,removeSelf=false) {
    let total = 0;
    const filterWeight = [
        1,2,1,
        2,4,2,
        1,2,1
    ].map(v=>v/(removeSelf?12:16));
    let at = 0;
    for(let s = -1;s < 2; s++) {
        for(let t = -1;t < 2; t++) {
            if(!(s||t) && removeSelf)continue;
            total += filterWeight[at] * 
            ref[((j+t) + SIZE)%SIZE][((i+s) + SIZE)%SIZE];
            at++;
        }
    }
    return total;
}
function draw() {
  
 const col = new Array(SIZE).fill(0).map(_=>
 new Array(SIZE).fill().map(_=>220));
 const col2 = new Array(SIZE).fill(0).map(_=>
 new Array(SIZE).fill().map(_=>[0,1,0]));
  //2回やるの重要
  update();
  update();
  noStroke();
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
        col[i][j] = 0.5+myf(m,i,j)/2;
        //fill(255*col[i][j]);
        //rect(width/SIZE * i, height/SIZE * j, width/SIZE, width/SIZE);
    }
  }
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
        col2[i][j][0] = col[(i+1)%SIZE][j]- col[(i-1+SIZE)%SIZE][j];
        col2[i][j][2] = col[i][(j+1)%SIZE]- col[i][(j-1+SIZE)%SIZE];
        //0を下回る可能性もあるがその場合、片面のみ描画なら透過してそらが透けてるような感じになるかもなので残しておく
        col2[i][j][1] = 1- col2[i][j][0]**2 - col2[i][j][2]**2
        const abs = (col2[i][j][0] ** 2 + col2[i][j][1] + col2[i][j][2] ** 2);
        col2[i][j][0]/=abs;
        col2[i][j][1]/=abs;
        col2[i][j][2]/=abs;
    }
  }
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
        fill(...col2[i][j].map(v=>v*255));
        rect(width/SIZE * i, height/SIZE * j, width/SIZE, width/SIZE);
    }
  }
}