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
            </div>
        </div>
    )
}

export default Sidebar