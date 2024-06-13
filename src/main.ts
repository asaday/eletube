import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import express from "express";
import { LiveChat } from "youtube-chat";

let mainWindow: BrowserWindow;

const list: string[] = [];

async function start(liveId: string) {
  const liveChat = new LiveChat({ liveId });
  const ok = await liveChat.start();

  liveChat.on("start", (liveId) => {
    console.log(liveId);
  });

  liveChat.on("chat", (chatItem) => {
    for (const mm of chatItem.message) {
      const t = (mm as any).text;
      if (list.length > 100) list.length = 100;
      list.unshift(t);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../index.html"));
  //  mainWindow.webContents.openDevTools();

  ipcMain.on("setID", (event, id) => {
    console.log(`got id ${id}`);
    start(id);
  });

  mainWindow.on("closed", () => {
    mainWindow = null!;
  });

  const app = express();
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../display.html"));
  });
  app.get("/data", (req, res) => {
    res.json(list);
  });

  app.listen(3000);
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});
