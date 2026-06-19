import sharp from "sharp";

await sharp("public/assets/home.png")
  .extract({ left: 850, top: 80, width: 1000, height: 280 })
  .png()
  .toFile("public/assets/hero-suitcase.png");
console.log("saved hero-suitcase.png");