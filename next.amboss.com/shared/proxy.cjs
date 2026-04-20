const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const HOST = '127.0.0.1';
const PORT = 3131;

function send(res, status, body, type = 'text/plain; charset=utf-8', extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*',
    ...extraHeaders,
  });
  res.end(body);
}

function getClient(url) {
  return url.startsWith('https://') ? https : http;
}

function fetchUrl(targetUrl, opts = {}, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 8) {
      reject(new Error('Too many redirects'));
      return;
    }

    const u = new URL(targetUrl);
    const client = getClient(targetUrl);

    const req = client.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        method: opts.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': opts.accept || '*/*',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': u.origin + '/',
          ...(opts.headers || {}),
        },
      },
      (remoteRes) => {
        const status = remoteRes.statusCode || 500;
        const location = remoteRes.headers.location;

        if ([301, 302, 303, 307, 308].includes(status) && location) {
          const nextUrl = new URL(location, targetUrl).toString();
          resolve(fetchUrl(nextUrl, opts, redirectCount + 1));
          return;
        }

        const chunks = [];
        remoteRes.on('data', (c) => chunks.push(c));
        remoteRes.on('end', () => {
          resolve({
            status,
            headers: remoteRes.headers,
            body: Buffer.concat(chunks),
            finalUrl: targetUrl,
          });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

function rewriteCss(css, baseUrl) {
  return css.replace(
    /url\((["']?)([^)"']+)\1\)/gi,
    (m, quote, assetUrl) => {
      if (
        assetUrl.startsWith('data:') ||
        assetUrl.startsWith('blob:') ||
        assetUrl.startsWith('javascript:')
      ) return m;

      const abs = new URL(assetUrl, baseUrl).toString();
      return `url("/asset?url=${encodeURIComponent(abs)}")`;
    }
  );
}

function injectBridgeScript(baseUrl) {
  return `
<script>
(function() {
  const BASE_URL = ${JSON.stringify(baseUrl)};

  function abs(u) {
    try { return new URL(u, BASE_URL).toString(); }
    catch { return u; }
  }

  function proxyUrl(u) {
    return '/browse?url=' + encodeURIComponent(abs(u));
  }

  function proxyAsset(u) {
    return '/asset?url=' + encodeURIComponent(abs(u));
  }

  document.addEventListener('click', function(e) {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    e.preventDefault();
    location.href = proxyUrl(href);
  }, true);

  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function(input, init) {
      try {
        if (typeof input === 'string') {
          input = proxyAsset(input);
        } else if (input && input.url) {
          input = proxyAsset(input.url);
        }
      } catch (e) {}
      return origFetch.call(this, input, init);
    };
  }

  const OrigXHR = window.XMLHttpRequest;
  if (OrigXHR) {
    const open = OrigXHR.prototype.open;
    OrigXHR.prototype.open = function(method, url) {
      try { url = proxyAsset(url); } catch (e) {}
      return open.apply(this, [method, url, ...Array.prototype.slice.call(arguments, 2)]);
    };
  }
})();
</script>
`;
}

function rewriteHtml(html, baseUrl) {
  let out = html;

  out = out.replace(/<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');
  out = out.replace(/<meta[^>]+http-equiv=["']X-Frame-Options["'][^>]*>/gi, '');

  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${baseUrl}">`);
  } else {
    out = `<head><base href="${baseUrl}"></head>` + out;
  }

  out = out.replace(
    /\b(src|href|poster)=["']([^"']+)["']/gi,
    (m, attr, url) => {
      const lower = url.toLowerCase();

      if (
        lower.startsWith('data:') ||
        lower.startsWith('blob:') ||
        lower.startsWith('javascript:') ||
        lower.startsWith('mailto:') ||
        lower.startsWith('tel:') ||
        lower.startsWith('#')
      ) return m;

      const abs = new URL(url, baseUrl).toString();

      if (attr.toLowerCase() === 'href') {
        return `${attr}="/browse?url=${encodeURIComponent(abs)}"`;
      }
      return `${attr}="/asset?url=${encodeURIComponent(abs)}"`;
    }
  );

  out = out.replace(
    /srcset=["']([^"']+)["']/gi,
    (m, value) => {
      const rewritten = value
        .split(',')
        .map(part => {
          const bits = part.trim().split(/\s+/);
          if (!bits[0]) return part;
          const abs = new URL(bits[0], baseUrl).toString();
          bits[0] = `/asset?url=${encodeURIComponent(abs)}`;
          return bits.join(' ');
        })
        .join(', ');
      return `srcset="${rewritten}"`;
    }
  );

  out = out.replace(
    /url\((["']?)([^)"']+)\1\)/gi,
    (m, quote, assetUrl) => {
      if (
        assetUrl.startsWith('data:') ||
        assetUrl.startsWith('blob:') ||
        assetUrl.startsWith('javascript:')
      ) return m;

      const abs = new URL(assetUrl, baseUrl).toString();
      return `url("/asset?url=${encodeURIComponent(abs)}")`;
    }
  );

  out = out.replace(
    /<form([^>]*?)action=["']([^"']+)["']([^>]*)>/gi,
    (m, before, action, after) => {
      const abs = new URL(action, baseUrl).toString();
      return `<form${before}action="/browse?url=${encodeURIComponent(abs)}"${after}>`;
    }
  );

  out = out.replace(
    /<head([^>]*)>/i,
    `<head$1>${injectBridgeScript(baseUrl)}`
  );

  return out;
}

async function handleBrowse(res, targetUrl) {
  try {
    const result = await fetchUrl(targetUrl, {
      accept: 'text/html,application/xhtml+xml',
    });

    const contentType = result.headers['content-type'] || '';
    const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml+xml');

    if (!isHtml) {
      return handleAsset(res, targetUrl);
    }

    const html = result.body.toString('utf8');
    const rewritten = rewriteHtml(html, result.finalUrl);

    send(res, 200, rewritten, 'text/html; charset=utf-8');
  } catch (err) {
    send(res, 500, 'Browse error: ' + err.message);
  }
}

async function handleAsset(res, targetUrl) {
  try {
    const result = await fetchUrl(targetUrl);

    const headers = { ...result.headers };
    delete headers['content-security-policy'];
    delete headers['content-security-policy-report-only'];
    delete headers['x-frame-options'];
    delete headers['frame-options'];
    delete headers['content-length'];

    const contentType = headers['content-type'] || 'application/octet-stream';

    let body = result.body;
    if (contentType.includes('text/css')) {
      body = Buffer.from(rewriteCss(body.toString('utf8'), result.finalUrl), 'utf8');
    }

    res.writeHead(result.status, {
      ...headers,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    res.end(body);
  } catch (err) {
    send(res, 500, 'Asset error: ' + err.message);
  }
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    res.end();
    return;
  }

  if (reqUrl.pathname === '/') {
    const filePath = path.join(__dirname, 'browser.html');
    if (!fs.existsSync(filePath)) {
      send(res, 404, 'No se encontró browser.html');
      return;
    }
    send(res, 200, fs.readFileSync(filePath), 'text/html; charset=utf-8');
    return;
  }

  if (reqUrl.pathname === '/browse' || reqUrl.pathname === '/asset') {
    const targetUrl = reqUrl.searchParams.get('url');
    if (!targetUrl) {
      send(res, 400, 'Falta ?url=');
      return;
    }

    try {
      new URL(targetUrl);
    } catch {
      send(res, 400, 'URL inválida');
      return;
    }

    if (reqUrl.pathname === '/browse') {
      await handleBrowse(res, targetUrl);
    } else {
      await handleAsset(res, targetUrl);
    }
    return;
  }

  send(res, 404, 'Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Proxy browser corriendo en http://${HOST}:${PORT}`);
});