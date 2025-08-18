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

      if(m[i][j] < 0.5) {
        m[i][j] += 1;
      } else if(m[i][j] > 0.5/*ref[i][j]*/) {
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
  update();
  update();
  noStroke();
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
        col[i][j] = 0.5+/*m[i][j]*/myf(m,i,j)/2;
        fill(255*col[i][j]);
        rect(width/SIZE * i, height/SIZE * j, width/SIZE, width/SIZE);
    }
  }
}