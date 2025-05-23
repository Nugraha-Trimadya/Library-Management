import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'

export default function PrivatePage() {
    let authentication = localStorage.getItem("access_token");
    //jika navigate disimpan di function, harus gunakan useNavigate(), jika digunakan di konten HTML gunakan <Navigate>
    //Outlet -> element children routenya
  return !authentication ? <Outlet /> : <Navigate to="/dashboard" replace />
}