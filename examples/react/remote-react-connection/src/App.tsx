import { useState, useEffect } from 'react'
import type { RemoteConnection } from '@sprlab/microfront/react/remote'

interface Props {
  connection: RemoteConnection | null
}

export default function App({ connection }: Props) {
  const [shellCounter, setShellCounter] = useState(0)
  const [localCounter, setLocalCounter] = useState(0)
  const [showLorem, setShowLorem] = useState(false)

  useEffect(() => {
    if (!connection) return
    connection.onMessage((payload: any) => {
      setShellCounter(payload.counter)
    })
  }, [connection])

  function sendToShell() {
    const next = localCounter + 1
    setLocalCounter(next)
    connection?.send({ counter: next })
  }

  return (
    <div>
      <h1>React Connection Example</h1>
      <p>Shell counter: {shellCounter}</p>
      <button onClick={sendToShell}>Send to Shell: {localCounter}</button>
      <br /><br />
      <button onClick={() => setShowLorem(!showLorem)}>
        {showLorem ? 'Hide' : 'Show'} Lorem Ipsum
      </button>
      {showLorem && (
        <div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
          <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
          <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.</p>
        </div>
      )}
    </div>
  )
}
