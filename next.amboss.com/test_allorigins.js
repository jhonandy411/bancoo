fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://drive.google.com/uc?export=download&id=1buf5tYxZ-gDXB985puWn4Vb--Sa0jxrp'))
  .then(r => r.json())
  .then(d => console.log(d.contents ? d.contents.substring(0, 100) : 'no contents'))
  .catch(e => console.error(e));
