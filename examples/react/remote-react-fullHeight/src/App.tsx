import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="app-layout">
      <header>
        <h1>React FullHeight Example</h1>
        <nav>
          <Link to="/small">Small</Link> | <Link to="/scroll">Scroll Internal</Link> | <Link to="/tall">Tall Content</Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
