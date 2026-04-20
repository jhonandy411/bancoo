const { app, BrowserWindow, BrowserView, ipcMain, shell } = require('electron');
const https = require('https');
const http = require('http');
const path = require('path');
const { URL } = require('url');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
app.commandLine.appendSwitch('ignore-certificate-errors');

let win;
let view;

const TOPBAR_HEIGHT = 64;
let lastExpandedWidth = 320;
const SIDEBAR_COLLAPSED = 0;

let sidebarWidth = 320;

function updateNavState() {
  if (!win || !view) return;

  win.webContents.send('nav-state', {
    canGoBack: view.webContents.canGoBack(),
    canGoForward: view.webContents.canGoForward(),
    url: view.webContents.getURL(),
    sidebarWidth
  });
}

function resizeView() {
  if (!win || !view) return;

  const bounds = win.getContentBounds();

  view.setBounds({
    x: sidebarWidth,
    y: TOPBAR_HEIGHT,
    width: bounds.width - sidebarWidth,
    height: bounds.height - TOPBAR_HEIGHT
  });

  view.setAutoResize({
    width: true,
    height: true
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1700,
    height: 1000,
    autoHideMenuBar: true,
    title: 'Embebe for Amboss',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false
    }
  });

  win.loadFile(path.join(__dirname, 'shell.html'));
  
  // Abrir links externos en el navegador predeterminado (evita bloqueo de Google en Electron)
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false
    }
  });

  view.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  // Abrir links externos detectados en el BrowserView en el navegador predeterminado
  view.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.setBrowserView(view);
  resizeView();

  view.webContents.loadURL('https://next.amboss.com/us/article/so0tWS');

  view.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && (input.meta || input.control) && input.key.toLowerCase() === 'f') {
      event.preventDefault();
      win.webContents.executeJavaScript('if(typeof openSearch === "function") openSearch()');
    }
  });

  view.webContents.on('did-navigate', updateNavState);
  view.webContents.on('did-navigate-in-page', updateNavState);
  view.webContents.on('page-title-updated', updateNavState);
  view.webContents.on('dom-ready', () => {
    updateNavState();
    view.webContents.insertCSS('div[data-ds-id="Lightbox"]:has(div[data-e2e-test-id="email-verification-modal"]) { display: none !important; }').catch(console.error);
    view.webContents.executeJavaScript(`
      if (!window.__consoleIntercepted) {
        window.__consoleIntercepted = true;
        window.__allLogs = [];
        const formatArgs = (args) => args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        
        const methods = ['log', 'info', 'warn', 'error'];
        methods.forEach(method => {
          const oldMethod = console[method];
          console[method] = function(...args) {
            const msg = formatArgs(args);
            // Filtrar ruido de píxeles de terceros
            if (msg.includes('Meta Pixel') || msg.includes('TikTok Pixel') || msg.includes('ApolloError')) {
              oldMethod.apply(console, args);
              return;
            }
            window.__allLogs.push(msg);
            oldMethod.apply(console, args);
          };
        });

        const oldTable = console.table;
        console.table = function(...args) {
          window.__allLogs.push(formatArgs(args));
          oldTable.apply(console, args);
        };

        const oldGroup = console.group;
        console.group = function(...args) {
          window.__allLogs.push('> ' + formatArgs(args));
          oldGroup.apply(console, args);
        };

        const oldGroupCollapsed = console.groupCollapsed;
        console.groupCollapsed = function(...args) {
          window.__allLogs.push('> ' + formatArgs(args));
          oldGroupCollapsed.apply(console, args);
        };

        const oldGroupEnd = console.groupEnd;
        console.groupEnd = function() {
          window.__allLogs.push('');
          oldGroupEnd.apply(console);
        };
      }
    `).catch(console.error);
  });

  win.on('resize', resizeView);

  view.webContents.openDevTools({ mode: 'right' });
}

ipcMain.on('nav-go', (_, rawUrl) => {
  if (!view || !rawUrl) return;
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  view.webContents.loadURL(url);
});

ipcMain.on('nav-back', () => {
  if (view?.webContents.canGoBack()) view.webContents.goBack();
});

ipcMain.on('nav-forward', () => {
  if (view?.webContents.canGoForward()) view.webContents.goForward();
});

ipcMain.on('nav-reload', () => {
  view?.webContents.reload();
});

ipcMain.on('toggle-sidebar', () => {
  sidebarWidth = sidebarWidth === 0 ? lastExpandedWidth : 0;
  resizeView();
  updateNavState();
});

ipcMain.on('toggle-devtools', () => {
  if (view.webContents.isDevToolsOpened()) {
    view.webContents.closeDevTools();
  } else {
    view.webContents.openDevTools({ mode: 'right' });
  }
});

ipcMain.on('toggle-shell-devtools', () => {
  if (win.webContents.isDevToolsOpened()) {
    win.webContents.closeDevTools();
  } else {
    win.webContents.openDevTools({ mode: 'detach' });
  }
});

ipcMain.on('show-devtools', () => {
  view?.webContents.openDevTools({ mode: 'right' });
});

ipcMain.on('layout-devtools', () => {
  if (view && view.webContents) {
    // Garantiza que el devtools se abra y cambie al panel "Elements" automáticamente
    view.webContents.openDevTools({ mode: 'right' });
    view.webContents.inspectElement(0, 0); 

    setTimeout(() => {
      const dt = view.webContents.devToolsWebContents;
      if (dt) {
        dt.executeJavaScript(`
          try {
            // Intentar usar el API directa de inspector (funciona en muchas versiones de Chrome/Electron)
            if (window.UI && UI.inspectorView) {
              UI.inspectorView.showDrawer('console');
            } else {
              // Fallback: Buscar el botón de Toggle Console Drawer y presionarlo si no está abierto
              const drawer = document.querySelector('.drawer-view');
              const isDrawerHidden = !drawer || window.getComputedStyle(drawer).display === 'none';
              
              if (isDrawerHidden) {
                // Simula teclear Escape
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
              }
            }
          } catch(e) {}
        `).catch(() => {});
      }
    }, 600);
  }
});

ipcMain.handle('execute-js', async (_, script) => {
  return await view?.webContents.executeJavaScript(script);
});

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const os = require('os');
const fs = require('fs');

ipcMain.handle('exec-yt', async (_, url) => {
  try {
    const tmpPath = path.join(os.tmpdir(), `yt_${Date.now()}.mp4`);
    await exec(`yt-dlp -f "bestvideo[height<=480]+bestaudio/best[height<=480]" --merge-output-format mp4 -o "${tmpPath}" "${url}"`);
    const buffer = fs.readFileSync(tmpPath);
    fs.unlinkSync(tmpPath);
    return buffer.toString('base64');
  } catch (e) {
    return { error: e.message };
  }
});


// ── Proxy Drive API: hace peticiones HTTP desde Node.js (sin restricciones de browser) ──
ipcMain.handle('drive-fetch', async (_, url) => {
  return new Promise(async (resolve) => {
    try {
      // Obtener cookies de la sesión actual del view para Amboss
      const cookies = await view.webContents.session.cookies.get({ url: 'https://next.amboss.com' });
      const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Referer': 'https://next.amboss.com/',
          'Cookie': cookieStr
        }
      };
      
      const req = https.get(url, options, (res) => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ 
            ok: res.statusCode >= 200 && res.statusCode < 300, 
            status: res.statusCode, 
            text: buffer.toString('utf8'),
            base64: buffer.toString('base64')
          });
        });
      });
      req.on('error', (e) => resolve({ ok: false, error: e.message }));
      req.setTimeout(300000, () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
    } catch (err) {
      resolve({ ok: false, error: err.message });
    }
  });
});

ipcMain.on('resize-sidebar', (_, width) => {
  if (width !== 0 && width < 200) width = 200;
  sidebarWidth = width;
  if (width > 0) lastExpandedWidth = width;
  resizeView();
  updateNavState();
});

ipcMain.on('set-last-expanded-width', (_, width) => {
  if (width >= 200) lastExpandedWidth = width;
});

ipcMain.on('open-external', (_, url) => {
  if (url) shell.openExternal(url);
});

// ── OAuth Google Drive (desde proceso principal para evitar error file://) ──
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const OAUTH_REDIRECT_PORT = 53742;
const OAUTH_REDIRECT_URI = `http://localhost:${OAUTH_REDIRECT_PORT}/oauth2callback`;
let _oauthServer = null; // referencia global para evitar EADDRINUSE

ipcMain.handle('drive-oauth-start', async () => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }
  // Cerrar servidor anterior si quedó abierto
  if (_oauthServer) { try { _oauthServer.close(); } catch(_) {} _oauthServer = null; }
  return new Promise((resolve) => {
    let server = null;
    let oauthWin = null;
    let resolved = false;

    const finish = (result) => {
      if (resolved) return;
      resolved = true;
      try { if (server) server.close(); } catch(_) {}
      try { if (oauthWin && !oauthWin.isDestroyed()) oauthWin.close(); } catch(_) {}
      resolve(result);
    };

    // Authorization Code flow: el code llega en query string (no en hash fragment)
    server = http.createServer(async (req, res) => {
      const reqUrl = new URL(req.url, `http://localhost:${OAUTH_REDIRECT_PORT}`);
      if (reqUrl.pathname !== '/oauth2callback') { res.writeHead(404); res.end(); return; }

      const code = reqUrl.searchParams.get('code');
      const error = reqUrl.searchParams.get('error');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#f5f5f5">
        <div style="background:#fff;border-radius:12px;padding:40px;max-width:400px;margin:0 auto;box-shadow:0 4px 20px rgba(0,0,0,.1)">
          <div style="font-size:40px;margin-bottom:16px">${code ? '✅' : '❌'}</div>
          <h2 style="margin:0 0 8px;color:#1a2535">${code ? 'Autorizado correctamente' : 'Error: ' + (error || 'desconocido')}</h2>
          <p style="color:#6b7685;font-size:13px">Puedes cerrar esta ventana y volver a la aplicación.</p>
        </div>
        <script>setTimeout(() => window.close(), 2000);</script>
      </body></html>`);

      if (error || !code) { finish({ ok: false, error: error || 'sin código' }); return; }

      // Canjear el code por un access_token
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: OAUTH_REDIRECT_URI,
            grant_type: 'authorization_code'
          }).toString()
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          finish({ ok: true, access_token: tokenData.access_token, refresh_token: tokenData.refresh_token || null });
        } else {
          finish({ ok: false, error: tokenData.error_description || JSON.stringify(tokenData) });
        }
      } catch(e) {
        finish({ ok: false, error: 'Token exchange failed: ' + e.message });
      }
    });

    server.listen(OAUTH_REDIRECT_PORT, '127.0.0.1', () => {
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: OAUTH_REDIRECT_URI,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        access_type: 'offline',   // solicita refresh_token
        prompt: 'consent'         // fuerza a Google a devolver refresh_token siempre
      });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Abrir en el navegador del sistema (Chrome/Safari) — Electron BrowserWindow es bloqueado por Google
      shell.openExternal(authUrl);
    });

    server.on('error', (e) => finish({ ok: false, error: e.message }));
    setTimeout(() => finish({ ok: false, error: 'timeout' }), 180000);
  });
});

// Renovar token silenciosamente usando el refresh_token guardado
ipcMain.handle('drive-oauth-refresh', async (_, refreshToken) => {
  if (!refreshToken) return { ok: false, error: 'sin refresh token' };
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return { ok: false, error: 'faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET' };
  }
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }).toString()
    });
    const data = await res.json();
    if (data.access_token) {
      return { ok: true, access_token: data.access_token };
    } else {
      return { ok: false, error: data.error_description || JSON.stringify(data) };
    }
  } catch(e) {
    return { ok: false, error: e.message };
  }
});

const { spawn } = require('child_process');
let proxyProc = null;

ipcMain.on('toggle-proxy', (event, enabled) => {
  if (enabled) {
    if (proxyProc) return;
    const proxyPath = path.join(__dirname, '..', 'bancosmartzoomnodes', 'proxy.cjs');
    proxyProc = spawn('node', ['proxy.cjs'], {
      cwd: path.dirname(proxyPath),
      stdio: 'inherit'
    });
    proxyProc.on('error', () => { proxyProc = null; });
    proxyProc.on('exit', () => { proxyProc = null; });
  } else {
    if (proxyProc) {
      proxyProc.kill();
      proxyProc = null;
    }
  }
});

app.whenReady().then(() => {
  app.userAgentFallback = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
