import { useState } from 'react'

type Store = {
  liveId?: string
}

const ipc = window.electron.ipcRenderer

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const [store, setStore] = useState<Store>(ipc.sendSync('getStore'))
  const [status, setStatus] = useState('')

  ipc.on('status', (e, v) => {
    setStatus(v)
  })

  window.electron.ipcRenderer.on
  return (
    <>
      <div>
        live ID{' '}
        <input
          type="text"
          id="liveId"
          defaultValue={store.liveId ?? ''}
          onChange={(event) => {
            store.liveId = event.target.value
          }}
        ></input>
        <button
          onClick={(event) => {
            ipc.sendSync('setStore', store)
            setStore(store)
            ipc.sendSync('start', store.liveId)
          }}
        >
          go
        </button>
        <p style={{ fontSize: '10px', padding: '10px' }}>{status}</p>
      </div>
      {/* <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
        <input type="text"></input>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to sopen the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              const z = window.electron.ipcRenderer.sendSync('z', val)
              setVal(z)
            }}
          >
            vvva
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
        {val}
      </div> */}
    </>
  )
}

export default App
