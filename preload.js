const {
    contextBridge,
    ipcRenderer,
    ipcMain
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (name, ...opts) => {
            ipcRenderer.send(name, ...opts);
        },
        receive: (name, func) => {
            ipcRenderer.on(name, (event, ...args) => func(...args));
        }
    }
);