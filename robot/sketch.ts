import p5 from "p5";

const w = 400;
const h = 400;
const c = new Array(w * h).fill(0);
const u_old = new Array(w * h).fill(0);
const u = new Array(w * h).fill(0);
const u_new = new Array(w * h).fill(0);
function sketch(p: p5) {
  p.setup = function() {
    p.createCanvas(w, h);
  }

  p.draw = function() {
    p.background(220);
  }
}
new p5(sketch);

