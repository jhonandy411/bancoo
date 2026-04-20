const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('embebeAPI', {
  go: (url) => ipcRenderer.send('nav-go', url),
  back: () => ipcRenderer.send('nav-back'),
  forward: () => ipcRenderer.send('nav-forward'),
  reload: () => ipcRenderer.send('nav-reload'),
  toggleSidebar: () => ipcRenderer.send('toggle-sidebar'),
  toggleInspector: () => ipcRenderer.send('toggle-devtools'),
  showInspector: () => ipcRenderer.send('show-devtools'),
  toggleShellInspector: () => ipcRenderer.send('toggle-shell-devtools'),
  layoutDevtools: () => ipcRenderer.send('layout-devtools'),
  executeJS: (script) => ipcRenderer.invoke('execute-js', script),
  resizeSidebar: (width) => ipcRenderer.send('resize-sidebar', width),
  setLastExpandedWidth: (width) => ipcRenderer.send('set-last-expanded-width', width),
  onNavState: (callback) => ipcRenderer.on('nav-state', (_, data) => callback(data)),
  driveFetch: (url) => ipcRenderer.invoke('drive-fetch', url),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  toggleProxy: (enabled) => ipcRenderer.send('toggle-proxy', enabled),
  execYt: (url) => ipcRenderer.invoke('exec-yt', url),
  startDriveOAuth: () => ipcRenderer.invoke('drive-oauth-start'),
  refreshDriveToken: (token) => ipcRenderer.invoke('drive-oauth-refresh', token)
});