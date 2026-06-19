import sharp from "sharp";

await sharp("c:/Users/Asus/Pictures/HOME (1).png")
  .extract({ left: 820, top: 300, width: 1000, height: 400 })
  .png()
  .toFile("public/assets/newarrival-suitcase.png");
console.log("saved");