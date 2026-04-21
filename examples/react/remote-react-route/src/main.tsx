import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import { initReactRemote } from '@sprlab/microfront/react/remote'
import App from './App'
import Page1 from './pages/Page1'
import Page2 from './pages/Page2'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/page1" replace /> },
      { path: 'page1', element: <Page1 /> },
      { path: 'page2', element: <Page2 /> },
    ],
  },
])

initReactRemote({
  appName: 'remote-react-route',
  router,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
