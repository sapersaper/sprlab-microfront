import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initReactRemote } from '@sprlab/microfront/react/remote'
import App from './App'

const connection = initReactRemote({ appName: 'remote-react-connection' })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App connection={connection} />
  </StrictMode>,
)
