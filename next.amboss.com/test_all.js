fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://drive.google.com/uc?export=download&id=1buf5tYxZ-gDXB985puWn4Vb--Sa0jxrp'))
  .then(r => r.json())
  .then(data => {
    let b64 = data.contents.split(',')[1];
    let decoded = Buffer.from(b64, 'base64').toString('utf8');
    console.log("SVG Starts With:", decoded.substring(0, 100));
  })
  .catch(e => console.error(e));
