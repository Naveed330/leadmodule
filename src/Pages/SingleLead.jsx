import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { MdOutlinePhone, MdOutlineEmail } from "react-icons/md";
import { SiEmirates } from "react-icons/si";
import './style.css'; // Ensure this CSS file styles your components appropriately
import LeadUsers from '../Components/LeadUsers';
import LeadDiscussion from '../Components/LeadDiscussion';
import ActivityLead from '../Components/ActivityLead';
import { IoChevronForwardOutline } from "react-icons/io5";

const SingleLead = () => {
    // User Token
    const token = useSelector(state => state.loginSlice.user?.token)
    const { id } = useParams();
    const [singleLead, setSingleLead] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSingleLead = async () => {
            try {
                const singleLeadResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/single-lead/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSingleLead(singleLeadResponse.data)
            } catch (error) {
                console.log(error, 'error')
            }
        }
        fetchSingleLead()
    }, [token])

    return (
        <div>
            <Navbar />
            <Container fluid>
                <Row  >
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>
                    <Col xs={12} md={12} lg={10}>
                        <Row className='mt-4' >
                            <Col xs={12} md={12} lg={3}>
                                <Card body className='lead_discussion_main_card' style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} >
                                        {['Client Info', 'Service Info', 'Users | Sources', 'Discussion | Files', 'Activity'].map((text, index) => (
                                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover-link">
                                                <Link to={'/'} className="hover_link_services">
                                                    {text}
                                                </Link>
                                                <IoChevronForwardOutline />
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={12} md={12} lg={9} className='single_lead_col'>
                                <Card body className='lead_discussion_main_card' >
                                    <h4 style={{ color: '#B9406B', textAlign: 'center' }} > {singleLead.client?.name && singleLead.client?.name} </h4>
                                    <div className='first_card' >
                                        <div className='single_lead_upper_container' >
                                            <div className='single_lead_icons' >
                                                <MdOutlinePhone style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Phone</p>
                                                <h5 className='mb-0' style={{ color: '#B9406B', fontSize: '18px' }}> {singleLead.client?.phone && singleLead.client?.phone} </h5>
                                            </div>
                                        </div>

                                        <div className='single_lead_upper_container' >
                                            <div className='single_lead_icons_one' >
                                                <MdOutlineEmail style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Email</p>
                                                <h5 className='mb-0' style={{ color: '#ffa21d', fontSize: '18px' }} > {singleLead.client?.email && singleLead.client?.email} </h5>
                                            </div>
                                        </div>

                                        <div className='single_lead_upper_container' >
                                            <div className='single_lead_icons_two' >
                                                <SiEmirates style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Emorate ID</p>
                                                <h5 className='mb-0' style={{ color: '#3ec9d6', fontSize: '18px' }}> {singleLead.client?.phone && singleLead.client?.phone} </h5>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* 2nd Card */}
                                <Card body className='mt-4 lead_discussion_main_card' >
                                    <h4 style={{ color: '#B9406B', textAlign: 'center' }} > {singleLead.products?.name && singleLead.products?.name} </h4>
                                    <div className='first_card' >
                                        <div className='single_lead_upper_container' >
                                            <div className='single_lead_icons' >
                                                <MdOutlinePhone style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Pipeline</p>
                                                <h5 className='mb-0' style={{ color: '#B9406B', fontSize: '18px' }}> {singleLead.pipeline_id?.name && singleLead.pipeline_id?.name} </h5>
                                            </div>
                                        </div>

                                        <div className='single_lead_upper_container' >
                                            <div className='single_lead_icons_one' >
                                                <MdOutlineEmail style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Source</p>
                                                <h5 className='mb-0' style={{ color: '#ffa21d', fontSize: '18px' }} > {singleLead.source?.name && singleLead.source?.name} </h5>
                                            </div>
                                        </div>

                                        <div className='single_lead_upper_container' >
                                            <div className='single_lead_icons_two' >
                                                <SiEmirates style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Lead From</p>
                                                <h5 className='mb-0' style={{ color: '#3ec9d6', fontSize: '18px' }}> {singleLead.product_stage?.name && singleLead.product_stage?.name} </h5>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <LeadUsers singleLead={singleLead} />
                                <LeadDiscussion singleLead={singleLead} id={id} />
                                <ActivityLead singleLead={singleLead} />
                            </Col>


                        </Row>
                    </Col>
                </Row>
            </Container >
        </div >
    )
}

export default SingleLead