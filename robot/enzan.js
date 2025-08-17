//RAINY_NOISE
const SIZE = 64;
const m = new Array(SIZE).fill(0).map(_=>
new Array(SIZE).fill().map((v,i)=>Math.random()<0.001//(Math.sin(Math.random()*PI)
));
function setup() {
  createCanvas(400, 400);
  frameRate(32);
}

//上下左右の重みを強くして曲線的な変化にする
const weight = [
  1,1,2,2,4,4,8,8//,16,//1,4,2,3,3,2,4,1//-1,1,-1,2,-1,4,-1,2,-1
]; // -> ４近傍が大きい時、最大値に近いそうでない時最小値に近い
const WEIGHT_SUM = weight.reduce((sum,v)=>sum+v,0)
const rule = [

  [
    0,4
  ],
  [
    8
  ]
];
const dx = 0.01;
const dt = 0.04//0.0005//0.0008;
let last = m.map(arr=>[...arr]);;
const c = 0.99;
function update() {
  //セルオートマトン部分は、画素がいい感じに動けば何でもいい
  //ランダムな値加算 & ぼかし が重要
  const now = m.map(arr=>[...arr]);
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
      
      lap = (now[(i+1)%SIZE][j] - 2.0*now[i][j] + now[(i-1+SIZE)%SIZE][j]) / (dx)
                 + (now[i][(j+1)%SIZE] - 2.0*now[i][j] + now[i][(j-1+SIZE)%SIZE]) / (dx);
      m[i][j] = 2.0*now[i][j] - last[i][j] + (c*dt)*(c*dt) * lap;
    }  
  }
  last = now;
   
  /*const ref2 = m.map(arr=>[...arr]);
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
      //更新タイミングの関係で
      //斜めの線ができない
      //if((~~ref2[i][j])!=(~~ref[i][j])){
//      if((~~m[i][j])!=(~~ref[i][j])){
      if((~~m[i][j])!=(~~ref2[i][j])){
        m[i][j]= myf(ref2,i,j,true);
      }else {
        m[i][j] = 1-myf(ref2,i,j,true);
      }
    }
  }*/
  
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
      //雨の強さ変えたいときはここを変更 
        //m[i][j]+=(1-Math.random()**2-0.5)/4//10;
        const rnd = Math.random();
        const rnd2 = Math.random()-0.5;// > 0.5 ? 1 : -1;
        m[i][j]+=rnd < 0.00001 ? rnd2: 0//10;
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
const MODE = //"RAW";
"FILTERED";
function draw() {
  background(220/2,220/2,255);
  background(22,22,100);
  background(22,22,20);
  update();
  fill(0);
  noStroke();
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
//         console.log(myf(i,j));
         //fill(10,10,100,myf(m,i,j)*255);
         fill(255,255,255,128-myf(m,i,j)*255);
         rect(width/SIZE * i, height/SIZE * j, width/SIZE, width/SIZE);
      
      //if(m[i][j]<0.5) {
        //rect(width/SIZE * i, height/SIZE * j, width/SIZE, width/SIZE);
      //}
      //if(m[i][j]<0.5) {
      //  rect(width/SIZE * i, height/SIZE * j, width/SIZE, width/SIZE);
      //}
    }
  }
}