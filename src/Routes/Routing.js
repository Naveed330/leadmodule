import React from 'react'
import { BrowserRouter as Router, Route, Routes, } from 'react-router-dom'
import Login from '../Auth/login/Login'
import SuperAdminDashboard from '../Pages/SuperAdminDashboard'
import Allusers from '../Pages/Allusers'
import Leads from '../Pages/Leads'
const Routing = () => {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/superadmindashboard' element={<SuperAdminDashboard />} />
                    <Route path='/allusers' element={<Allusers />} />
                    <Route path='/leads' element={<Leads />} />
                </Routes>
            </Router>
        </div>
    )
}

export default Routing