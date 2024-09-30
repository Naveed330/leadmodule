import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { MdOutlinePhone, MdOutlineEmail } from "react-icons/md";
import { SiEmirates } from "react-icons/si";
import LeadUsers from '../Components/LeadUsers';
import LeadDiscussion from '../Components/LeadDiscussion';
import ActivityLead from '../Components/ActivityLead';
import FileUploader from '../Components/FileUploader';
import './style.css';
import EditLead from '../Components/editlead/EditLead';
import TransferLeads from '../Components/transferLeads/TransferLeads';
import MoveLeads from '../Components/moveLead/MoveLeads';
import ConvertLead from '../Components/convertLead/ConvertLead';
import { FiEdit2 } from "react-icons/fi";
import { HiMiniBuildingOffice2 } from "react-icons/hi2";
import { FaCodeBranch } from "react-icons/fa6";
import { SiGoogleadsense } from "react-icons/si";
import { TbSocial } from "react-icons/tb";
import { TbWorldWww } from "react-icons/tb";

const SingleLead = () => {
    // User Token
    const token = useSelector(state => state.loginSlice.user?.token)
    const { id } = useParams();
    const [singleLead, setSingleLead] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalShow, setModalShow] = useState(false); // Modal state
    const [transferModal, setTransferModal] = useState(false);
    const [moveLeadModal, setMoveLeadModal] = useState(false)
    const [leadtocontract, setLeadToContract] = useState(false)
    const navigate = useNavigate()

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
    useEffect(() => {
        fetchSingleLead()
    }, [token])


    const RejectedLead = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/reject-lead/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            navigate('/leads')
        } catch (error) {
            console.log(error, 'err')
        }
    }


    return (
        <div>
            <Navbar />
            <Container fluid>
                <Row >
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>
                    <Col xs={12} md={12} lg={10}>

                        <div className='' style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap:'8px' }}>
                            <Button className="mt-3 all_single_leads_button" onClick={() => setModalShow(true)}>
                                Edit Lead
                            </Button>

                            <Button className="mt-3 all_single_leads_button" onClick={() => setTransferModal(true)}>
                                Transfer Lead
                            </Button>

                            <Button className="mt-3 all_single_leads_button" onClick={() => setMoveLeadModal(true)}>
                                Move Lead
                            </Button>

                            <Button className="mt-3 all_single_leads_button" onClick={() => setLeadToContract(true)}>
                                Convert Lead
                            </Button>

                            <Button className="mt-3 all_single_leads_button" onClick={RejectedLead}>
                                Rejected Lead
                            </Button>
                        </div>

                        <Row className='mt-4' >
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
                                                <HiMiniBuildingOffice2  style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Branch Name</p>
                                                <h5 className='mb-0' style={{ color: '#B9406B', fontSize: '18px' }}> {singleLead.branch?.name && singleLead.branch?.name} </h5>
                                            </div>
                                        </div>

                                        <div className='single_lead_upper_container' >
                                            <div className='single_lead_icons' >
                                                <FaCodeBranch  style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Pipeline</p>
                                                <h5 className='mb-0' style={{ color: '#B9406B', fontSize: '18px' }}> {singleLead.pipeline_id?.name && singleLead.pipeline_id?.name} </h5>
                                            </div>
                                        </div>

                                        <div className='single_lead_upper_container' >
                                            <div className='single_lead_icons_two' >
                                                <SiGoogleadsense  style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Lead Stage</p>
                                                <h5 className='mb-0' style={{ color: '#3ec9d6', fontSize: '18px' }}> {singleLead.product_stage?.name && singleLead.product_stage?.name} </h5>
                                            </div>
                                        </div>

                                        <div className='single_lead_upper_container' >
                                            <div className='single_lead_icons_two' >
                                                <TbSocial  style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Lead From</p>
                                                <h5 className='mb-0' style={{ color: '#3ec9d6', fontSize: '18px' }}> {singleLead.lead_type?.name && singleLead.lead_type?.name} </h5>
                                            </div>
                                        </div>

                                        <div className='single_lead_upper_container' >
                                            <div className='single_lead_icons_one' >
                                                <TbWorldWww  style={{ fontSize: '24px' }} />
                                            </div>
                                            <div>
                                                <p className='text-muted text-sm mb-0' >Source</p>
                                                <h5 className='mb-0' style={{ color: '#ffa21d', fontSize: '18px' }} > {singleLead.source?.name && singleLead.source?.name} </h5>
                                            </div>
                                        </div>


                                    </div>
                                </Card>

                                <LeadUsers singleLead={singleLead} />
                                <FileUploader singleLead={singleLead} id={id} fetchSingleLead={fetchSingleLead} />
                                <ActivityLead singleLead={singleLead} />
                            </Col>

                            <Col xs={12} md={12} lg={3}>
                                <LeadDiscussion singleLead={singleLead} id={id} fetchSingleLead={fetchSingleLead} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container >

            {/* EditLead Modal */}
            <EditLead
                modalShow={modalShow}
                setModalShow={setModalShow}
                leadId={id}
                fetchLeadsData={() => setSingleLead(singleLead)} // Pass the function to re-fetch lead data after editing
            />

            <TransferLeads
                leadId={id}
                transferModal={transferModal}
                setTransferModal={setTransferModal}
                fetchLeadsData={() => setSingleLead(singleLead)} // Callback to refresh data after transfer
            />

            <MoveLeads
                leadId={id}
                fetchLeadsData={() => setSingleLead(singleLead)}
                moveLeadModal={moveLeadModal}
                setMoveLeadModal={setMoveLeadModal}
            />

            <ConvertLead
                leadId={id}
                fetchLeadsData={() => setSingleLead(singleLead)}
                leadtocontract={leadtocontract}
                setLeadToContract={setLeadToContract}
            />
        </div >
    )
}

export default SingleLead