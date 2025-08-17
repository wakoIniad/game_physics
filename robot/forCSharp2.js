//RAINY_NOISE
const SIZE = 64;
const m = new Array(SIZE).fill(0).map(_=>
new Array(SIZE).fill().map(_=>
  Math.round(Math.random())));
function setup() {
  createCanvas(400, 400);
  frameRate(5);
}

//上下左右の重みを強くして曲線的な変化にする
const weight = [
  1,1,2,2,4,4,8,8//,16,//1,4,2,3,3,2,4,1//-1,1,-1,2,-1,4,-1,2,-1
]; // -> ４近傍が大きい時、最大値に近いそうでない時最小値に近い
const WEIGHT_SUM = weight.reduce((sum,v)=>sum+v,0)
const rule = [

  [
    //1,
    //2,//波の発生減たち
    //3,2
    //2,4
    0,4
    //4,
  ],
  [
    8
    //1,2,3,4,5,6,7
    //0,1,2,3,4,5,6,7,8
//4,5,6 // ここの値を大きくするとなんか変化が大雑把な感じ
  ]
];

function update() {
  const ref = m.map(arr=>[...arr]);
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
      const ts = [1, 0];
      const p = [-1,-1];
      let total = 0;
      for(let _ = 0;_ < 8;_++) {
        if(_ && _ % 2 === 0) {
          ts.reverse();
          if(ts[0]) {
            ts[0] *= -1;
          }
        }
        const x = p[0] + i;
        const y = p[1] + j;
        total += weight[_]*ref[(x + SIZE)%SIZE][(y + SIZE)%SIZE];
        //console.log(i,j,(x + SIZE)%SIZE, (y + SIZE)%SIZE);
        p[0] += ts[0];
        p[1] += ts[1];
      }
      total = ~~(8*total/WEIGHT_SUM)
      if(rule[0].includes(total)) {
        m[i][j] = 1;
      } else if(!(rule[1].includes(total)) && ref[i][j]) {
        m[i][j] = 0;
      }
    }  
  }
   
  const ref2 = m.map(arr=>[...arr]);
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
      //if((~~m[i][j])!=(~~ref2[i][j])){
      if(m[i][j] != ref2[i][j] > 0.5){
      //if(m[i][j] - ref2[i][j] > 0.5){
        m[i][j]= 1-myf(ref2,i,j,true);
      }else {
        m[i][j] = myf(ref2,i,j,true);
      }
    }
  }
  
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
      //** 雨の強さ変えたいときはここを変更 **//
        //m[i][j]+=(1-Math.random()**2-0.5)/4//10;
        m[i][j]+=~~((1-Math.random()**2-0.5)/4)//10;
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
  noStroke();
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
        col[i][j] = 0.5+myf(m,i,j)/2;
        fill(255*col[i][j]);
        rect(width/SIZE * i, height/SIZE * j, width/SIZE, width/SIZE);
    }
  }
}