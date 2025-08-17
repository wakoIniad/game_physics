const SIZE = 32;
const m = new Array(SIZE).fill(0).map(_=>
new Array(SIZE).fill().map(_=>
  Math.round(Math.random())));
function setup() {
  createCanvas(400, 400);
  frameRate(8);
}

//曲線的な変化にする
const weight = [
    1,2,1,2,1,2,1,2
];
const WEIGHT_SUM = weight.reduce((sum,v)=>sum+v,0)
const rule = [

  [
    0,//波の発生たち
    1,
    2,
  ],
  [
4 // 個々の値を変更すると変化＆収束スピードが大雑把な感じになる
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
  
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
      if(m[i][j]!=ref[i][j]){
        m[i][j]=1;
      }else {
        m[i][j] = 0;
      }
    }
  }
}

function myf(i,j) {
    let total = 0;
    const filterWeight = [
        1,2,1,
        2,4,2,
        1,2,1
    ].map(v=>v/16);
    let at = 0;
    for(let s = -1;s < 2; s++) {
        for(let t = -1;t < 2; t++) {
            total += filterWeight[at] * 
            m[((j+t) + SIZE)%SIZE][((i+s) + SIZE)%SIZE];
            at++;
        }
    }
    return total;
}
function draw() {
  background(220);
  update();
  //fill(0);
  for(let i = 0;i < SIZE;i++) {
    for(let j = 0;j < SIZE;j++) {
      console.log(myf(i,j));
      fill(0,0,0,myf(i,j)*255);
      rect(width/SIZE * i, height/SIZE * j, width/SIZE, width/SIZE);
    }
  }
}