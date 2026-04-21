export default function ScrollInternal() {
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div>
        <h2>Scroll Internal</h2>
        <p>This page fills the available height and scrolls internally.</p>
      </div>
      {Array.from({ length: 30 }, (_, i) => (
        <p key={i}>
          Scrollable item {i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      ))}
    </div>
  )
}
