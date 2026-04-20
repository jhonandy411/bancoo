const urls = "QDauV5 | Cardiac | https://embed.smartzoom.com/slide/QDauV5?theme=amboss&lang=en&showanno=1";
const parts = urls.split('|').map(p => p.trim());
console.log("parts[2]:", parts[2]);
console.log("url:", parts[2].split(/\s+/)[0]);
