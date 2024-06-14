import express from 'express'
import { LiveChat } from 'youtube-chat'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { BrowserWindow } from 'electron'
import * as path from 'path'

export class Srv {
  socket: Socket | null = null
  mainWindow: BrowserWindow | null = null
  liveChat: LiveChat | null = null

  serve(): void {
    const app = express()
    const httpServer = createServer(app)
    const io = new Server(httpServer, {
      path: '/socket/',
      cors: { origin: '*' }
    })

    io.on('connect', (s) => {
      this.socket = s
      console.log('server connected')
    })

    io.on('disconnect', () => (this.socket = null))

    app.get('/', (req, res) => {
      console.log('root')
      //      res.send('hello')
      res.sendFile(path.join(__dirname, 'serve/display.html'))
    })

    httpServer.listen(3000)
  }

  sendStatus(msg: string): void {
    this.mainWindow?.webContents.send('status', msg)
  }

  start(liveId: string): void {
    this.stop()
    if (!this.mainWindow) return
    this.sendStatus('try start')
    const liveChat = new LiveChat({ liveId })

    liveChat.on('start', (liveId) => {
      console.log(liveId)
      this.sendStatus('started')
    })

    liveChat.on('chat', (chatItem) => {
      console.log(chatItem)
      if (!this.socket) return
      if (!Array.isArray(chatItem.message)) return
      this.socket.emit('chat', chatItem)
      this.sendStatus(JSON.stringify(chatItem))
    })

    liveChat.start().then()
    this.liveChat = liveChat
  }

  stop(): void {
    this.sendStatus('stop')
    this.liveChat?.stop()
    this.liveChat = null
  }
}
