import React from 'react'
import '../navbar/Navbar.css'
import { Link } from 'react-router-dom'
const Sidebar = () => {
    return (
        <div className='sidebar_main_container'>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center' }} >
                <Link to={'/leads'} style={{ textDecoration: 'none', color: 'black' }} className='mt-4' >Leads</Link>
                <Link to={'/contract'} style={{ textDecoration: 'none', color: 'black' }} >Contract</Link>
                <Link to={'/ceophonebook'} style={{ textDecoration: 'none', color: 'black' }} >CEO PhoneBook</Link>
                <Link to={'/rejectedlead'} style={{ textDecoration: 'none', color: 'black' }} >Rejected Leads</Link>
                <Link to={'/product'} style={{ textDecoration: 'none', color: 'black' }} >Products</Link>
                <Link to={'/branches'} style={{ textDecoration: 'none', color: 'black' }} >Branches</Link>
                <Link to={'/pipelines'} style={{ textDecoration: 'none', color: 'black' }} >PipeLines</Link>
                <Link to={'/productstages'} style={{ textDecoration: 'none', color: 'black' }} >Product Stages</Link>
                <Link to={'/leadtype'} style={{ textDecoration: 'none', color: 'black' }} >Lead Type</Link>
                <Link to={'/sources'} style={{ textDecoration: 'none', color: 'black' }} >Sources</Link>
                <Link to={'/allusers'} style={{ textDecoration: 'none', color: 'black' }} >Users</Link>
                <Link to={'/usermanagement'} style={{ textDecoration: 'none', color: 'black' }} >User Management</Link>
                <Link to={'/ceodashboard'} style={{ textDecoration: 'none', color: 'black' }} >CEO Dashboard</Link>
            </div>
        </div>
    )
}

export default Sidebar