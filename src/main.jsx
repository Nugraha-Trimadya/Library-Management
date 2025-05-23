import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './routes/index.jsx'
import { RouterProvider } from 'react-router-dom'
import axios from 'axios'


// default header authorization agar setiao memanggil axios tdk perlu mendefinisikan header:authorization))
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)
