import React from 'react'
import { BrowserRouter as Router, Route, Routes, } from 'react-router-dom'
import Login from '../Auth/login/Login'
import SuperAdminDashboard from '../Pages/SuperAdminDashboard'
import Allusers from '../Pages/Allusers'
import Leads from '../Pages/Leads'
import SingleLead from '../Pages/SingleLead'
import Contract from '../Pages/Contract'
import CEOphoneBook from '../Pages/CeoPhoneBook'
import RejectedLeads from '../Pages/RejectedLeads'
import Branches from '../Components/SuperAdminPages/Branches'
import Pipelines from '../Components/SuperAdminPages/Pipelines'
import Sources from '../Components/SuperAdminPages/Sources'
import LeadType from '../Components/SuperAdminPages/LeadType'
import Products from '../Components/SuperAdminPages/Products'
import ProductStages from '../Components/SuperAdminPages/ProductStages'
import UserManagement from '../Pages/UserManagement'
const Routing = () => {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/superadmindashboard' element={<SuperAdminDashboard />} />
                    <Route path='/allusers' element={<Allusers />} />
                    <Route path='/leads' element={<Leads />} />
                    <Route path='/single-leads/:id' element={<SingleLead />} />
                    <Route path='/ceophonebook' element={<CEOphoneBook />} />
                    <Route path='/rejectedlead' element={<RejectedLeads />} />
                    <Route path='/branches' element={<Branches />} />
                    <Route path='/pipelines' element={<Pipelines />} />
                    <Route path='/leadtype' element={<LeadType />} />
                    <Route path='/sources' element={<Sources />} />
                    <Route path='/product' element={<Products />} />
                    <Route path='/productstages' element={<ProductStages />} />
                    <Route path='/usermanagement' element={<UserManagement />} />
                </Routes>
            </Router>
        </div>
    )
}

export default Routing