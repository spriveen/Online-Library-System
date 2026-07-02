import React from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './shared/ProtectedRoute'
import AdminLayout from './admin/AdminLayout'
import AdminDashboardPage from './admin/AdminDashboardPage'

const App = () => {
  return (
    <Routes>
     <Route path='/' element={<Home />} />
     <Route path='/login' element={<Login />} />
     <Route path='/signup' element={<Signup />} />

     {/* Protected Routes */}
     {/* Admin */}
     <Route element={<ProtectedRoute allowedRole="admin"/>}>
     <Route path="/admin" element={<AdminLayout />}>
     <Route index element={<Navigate to="/admin/dashboard" replace />} />
     <Route path= "dashboard" element={<AdminDashboardPage />}/>

     </Route>
     </Route>
    </Routes>
  )
}

export default App
