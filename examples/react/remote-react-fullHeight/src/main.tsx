import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import { initReactRemote } from '@sprlab/microfront/react/remote'
import App from './App'
import SmallContent from './pages/SmallContent'
import ScrollInternal from './pages/ScrollInternal'
import TallContent from './pages/TallContent'
import './style.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/small" replace /> },
      { path: 'small', element: <SmallContent /> },
      { path: 'scroll', element: <ScrollInternal /> },
      { path: 'tall', element: <TallContent /> },
    ],
  },
])

initReactRemote({
  appName: 'remote-react-fullHeight',
  router,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
