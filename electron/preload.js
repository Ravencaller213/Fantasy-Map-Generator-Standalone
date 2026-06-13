const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,

  saveFile: (data, defaultName) =>
    ipcRenderer.invoke("dialog:save-file", {data, defaultName}),

  openFile: () =>
    ipcRenderer.invoke("dialog:open-file"),
});
