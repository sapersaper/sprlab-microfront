import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <h1>React Route Example</h1>
      <nav>
        <Link to="/page1">Page 1</Link> | <Link to="/page2">Page 2</Link>
      </nav>
      <Outlet />
    </div>
  )
}
