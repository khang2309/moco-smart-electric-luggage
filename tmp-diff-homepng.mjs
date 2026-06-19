import sharp from "sharp";

const home2 = "c:/Users/Asus/Pictures/HOME (2).png";
const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const homePng = "public/assets/home.png";
const homeRef = "public/assets/home-reference.png";

async function diff(pathA, regionA, pathB, regionB) {
  const a = await sharp(pathA).extract(regionA).resize(80, 40).raw().toBuffer();
  const b = await sharp(pathB).extract(regionB).resize(80, 40).raw().toBuffer();
  let diff = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 3) {
    const la = (a[i] + a[i + 1] + a[i + 2]) / 3;
    const lb = (b[i] + b[i + 1] + b[i + 2]) / 3;
    if (Math.abs(la - lb) > 15) diff++;
  }
  return diff;
}

console.log("home.png vs HOME2 full:", await diff(homePng, {left:0,top:0,width:1890,height:1063}, home2, {left:0,top:0,width:1890,height:1063}));
console.log("home.png vs HOME1 full:", await diff(homePng, {left:0,top:0,width:1890,height:1063}, home1, {left:0,top:0,width:1890,height:1063}));
console.log("home-ref vs HOME1 full:", await diff(homeRef, {left:0,top:0,width:1890,height:1063}, home1, {left:0,top:0,width:1890,height:1063}));
console.log("home-ref vs HOME2 full:", await diff(homeRef, {left:0,top:0,width:1890,height:1063}, home2, {left:0,top:0,width:1890,height:1063}));

console.log("home.png hero vs H2 hero:", await diff(homePng, {left:0,top:110,width:1890,height:200}, home2, {left:0,top:110,width:1890,height:200}));
console.log("home.png hero vs H1 hero:", await diff(homePng, {left:0,top:110,width:1890,height:200}, home1, {left:0,top:110,width:1890,height:200}));
console.log("home-ref scroll vs H1 scroll:", await diff(homeRef, {left:0,top:310,width:1890,height:753}, home1, {left:0,top:310,width:1890,height:753}));