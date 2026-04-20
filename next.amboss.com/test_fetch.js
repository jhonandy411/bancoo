fetch("https://drive.google.com/uc?export=view&id=1buf5tYxZ-gDXB985puWn4Vb--Sa0jxrp")
  .then(r => r.text())
  .then(t => console.log(t.substring(0, 50)))
  .catch(e => console.error("fetch err:", e));
