import { app, BrowserWindow, ipcMain, ipcRenderer } from "electron";
import * as path from "path";
import express from "express";
import { LiveChat } from "youtube-chat";
import { createServer } from "http";
import { Server } from "socket.io";

let mainWindow: BrowserWindow;

let socket: any = null;

const exapp = express();
const httpServer = createServer(exapp);
const io = new Server(httpServer, { path: "/socket/" });

io.on("connect", (s) => {
  socket = s;
  console.log("server connected");
});

io.on("disconnect", () => (socket = null));

exapp.get("/", (req, res) => {
  console.log("root");
  res.sendFile(path.join(__dirname, "../display.html"));
});

async function start(liveId: string) {
  mainWindow.webContents.send("status", "do");
  const liveChat = new LiveChat({ liveId });

  liveChat.on("start", (liveId) => {
    console.log(liveId);
    mainWindow.webContents.send("status", "start live");
  });

  liveChat.on("chat", (chatItem) => {
    console.log(chatItem);
    if (!socket) return;
    for (const mm of chatItem.message) {
      socket.emit("chat", mm);
      mainWindow.webContents.send("status", JSON.stringify(mm));
    }
  });

  await liveChat.start();
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

  httpServer.listen(3000);
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});
