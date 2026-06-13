const {app, BrowserWindow, shell, dialog, ipcMain, Menu} = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../public/images/icons/favicon-32x32.png"),
    title: "Fantasy Map Generator",
    show: false,
  });

  win.once("ready-to-show", () => win.show());

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  win.webContents.setWindowOpenHandler(({url}) => {
    // non-web links (mailto:, etc.) go to the OS
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      shell.openExternal(url);
      return {action: "deny"};
    }

    // everything else opens in a new Electron window
    const child = new BrowserWindow({
      width: 1200,
      height: 800,
      parent: win,
      webPreferences: {nodeIntegration: false, contextIsolation: true},
    });
    child.loadURL(url);
    child.webContents.setWindowOpenHandler(({url: childUrl}) => {
      child.loadURL(childUrl);
      return {action: "deny"};
    });
    return {action: "deny"};
  });
}

// Native save-file dialog — renderer calls window.electronAPI.saveFile(data, defaultName)
ipcMain.handle("dialog:save-file", async (_event, {data, defaultName}) => {
  const {filePath, canceled} = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: [{name: "Map files", extensions: ["map"]}, {name: "All files", extensions: ["*"]}],
  });
  if (canceled || !filePath) return {ok: false};
  fs.writeFileSync(filePath, Buffer.from(data));
  return {ok: true, filePath};
});

// Native open-file dialog — renderer calls window.electronAPI.openFile()
ipcMain.handle("dialog:open-file", async () => {
  const {filePaths, canceled} = await dialog.showOpenDialog({
    filters: [{name: "Map files", extensions: ["map"]}, {name: "All files", extensions: ["*"]}],
    properties: ["openFile"],
  });
  if (canceled || !filePaths.length) return {ok: false};
  const data = fs.readFileSync(filePaths[0]);
  return {ok: true, filePath: filePaths[0], data: data.buffer};
});

app.whenReady().then(() => {
  createWindow();

  const send = (channel) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.webContents.send(channel);
  };

  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {label: "New Map", accelerator: "F2", click() { send("menu:new-map"); }},
        {type: "separator"},
        {label: "Save", accelerator: "CmdOrCtrl+S", click() { send("menu:save"); }},
        {label: "Load...", click() { send("menu:load"); }},
        {label: "Export...", click() { send("menu:export"); }},
        {type: "separator"},
        {label: "Exit", role: "quit"},
      ],
    },
    {
      label: "Help",
      submenu: [
        {label: "Hotkeys", accelerator: "F1", click() { send("show-hotkeys"); }},
        {label: "About", click() { send("show-about"); }},
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
