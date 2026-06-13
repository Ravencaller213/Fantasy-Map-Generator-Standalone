const {contextBridge, ipcRenderer} = require("electron");

const on = (channel, cb) => ipcRenderer.on(channel, cb);

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,

  saveFile: (data, defaultName) =>
    ipcRenderer.invoke("dialog:save-file", {data, defaultName}),

  openFile: () =>
    ipcRenderer.invoke("dialog:open-file"),

  onShowHotkeys: (cb) => on("show-hotkeys", cb),
  onShowAbout:   (cb) => on("show-about",   cb),
  onMenuNewMap:  (cb) => on("menu:new-map",  cb),
  onMenuSave:    (cb) => on("menu:save",     cb),
  onMenuLoad:    (cb) => on("menu:load",     cb),
  onMenuExport:  (cb) => on("menu:export",   cb),
});
