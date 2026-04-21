export default function TallContent() {
  return (
    <div>
      <h2>Tall Content</h2>
      <p>This page has content that exceeds 1000px without internal scroll.</p>
      <p>The iframe should expand to fit all the content.</p>
      {Array.from({ length: 25 }, (_, i) => (
        <div key={i} style={{ padding: 16, margin: '8px 0', background: '#f0f0f0', borderRadius: 4 }}>
          <strong>Block {i + 1}</strong> — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </div>
      ))}
    </div>
  )
}
