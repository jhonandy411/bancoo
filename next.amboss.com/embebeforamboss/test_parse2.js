const dom = require("jsdom").JSDOM;
const w = new dom("<html><body></body></html>").window;
const div = w.document.createElement("div");
div.innerHTML = `<iframe src="https://embed.smartzoom.com/slide/QDauV5?theme=amboss&lang=en"></iframe>`;
console.log(div.innerHTML);
