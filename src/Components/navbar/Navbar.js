import React from 'react'
import './Navbar.css'
import joveraLogo from '../../Assets/JoveraLogoweb.png'
import { Navbar, Container, Button } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logout } from '../../Redux/loginSlice';
const Navbars = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const logoutHandler = () => {
        localStorage.removeItem('token');
        dispatch(logout());
        navigate('/');
    }

    const joveraimagelogo = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    return (
        <div>
            <Navbar expand="lg" className="navbar_container" >
                <Container fluid style={{ padding: '0px 50px' }}>
                    <img src={joveraLogo} alt="joveraLogo" style={{ width: '60px', height: '60px', cursor: 'pointer' }} onClick={joveraimagelogo} />

                    <div style={{ display: 'flex', gap: '20px' }} >
                        <Link to={''} className='navbarLinks' >Business Loan</Link>
                        <Link to={''} className='navbarLinks' >Personal Loan</Link>
                        <Link to={''} className='navbarLinks'>Mortgage Loan</Link>
                        <Link to={''} className='navbarLinks'>Real Estate</Link>
                    </div>

                    <div>
                        <Button className='logout_btn' onClick={logoutHandler} style={{ cursor: 'pointer' }}>  Logout</Button>
                    </div>

                </Container>
            </Navbar>
        </div>
    )
}

export default Navbars