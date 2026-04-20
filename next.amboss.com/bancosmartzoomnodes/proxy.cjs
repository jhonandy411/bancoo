const http = require('http');
const https = require('https');
const url = require('url');
const PORT = 3131;
function corsHeaders() {
  return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, HEAD, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
}
function proxyRequest(targetUrl, method, res) {
  const parsed = new url.URL(targetUrl);
  const req = https.request({hostname:parsed.hostname,path:parsed.pathname+parsed.search,method:method,headers:{'User-Agent':'Mozilla/5.0','Referer':'https://embed.smartzoom.com/'},rejectUnauthorized:false}, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {...corsHeaders(),'Content-Type':proxyRes.headers['content-type']||'application/octet-stream'});
    if (method !== 'HEAD') proxyRes.pipe(res); else res.end();
  });
  req.on('error',(e)=>{res.writeHead(502,corsHeaders());res.end(e.message)});
  req.end();
}
http.createServer((req,res)=>{
  const parsed=url.parse(req.url,true);
  if(req.method==='OPTIONS'){res.writeHead(204,corsHeaders());res.end();return;}
  const m=parsed.pathname.match(/^\/api\/image\/([^/]+)\/([^/]+)$/);
  if(m){proxyRequest(`https://embed.smartzoom.com/api/image/${m[1]}/${m[2]}`,req.method,res);return;}
  if(parsed.pathname==='/tile/head'){proxyRequest(parsed.query.url,'HEAD',res);return;}
  if(parsed.pathname==='/tile/get'){proxyRequest(parsed.query.url,'GET',res);return;}
  res.writeHead(404,corsHeaders());res.end('Not found');
}).listen(PORT,'127.0.0.1',()=>console.log(`✅ Proxy corriendo en http://127.0.0.1:${PORT}`));
