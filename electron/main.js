const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let serverProcess;
let mainWindow;

function startServer() {
  return new Promise((resolve) => {
    serverProcess = spawn("node", [path.join(__dirname, "..", "server.js")], {
      cwd: path.join(__dirname, ".."),
      stdio: "pipe",
    });
    serverProcess.stdout.on("data", (data) => {
      if (data.toString().includes("Ready")) resolve();
    });
    setTimeout(resolve, 5000);
  });
}

app.whenReady().then(async () => {
  await startServer();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "FitLog",
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false },
  });
  mainWindow.loadURL("http://localhost:3000");
  mainWindow.on("closed", () => { mainWindow = null; });
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});
