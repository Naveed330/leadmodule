import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Button, Card, Modal } from 'react-bootstrap';
import { Dropdown, Menu } from 'antd';
import Sidebar from '../Components/sidebar/Sidebar';
import { Link } from 'react-router-dom';
import { BsThreeDotsVertical } from "react-icons/bs";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BiSolidLabel } from "react-icons/bi";
import { TiDeleteOutline } from "react-icons/ti";
import { AiFillDelete } from "react-icons/ai";
import DashboardLabels from '../Components/DashboardLabels';
import Select from 'react-select';
import './Dashboard.css';

const CeoDashboard = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const branch = useSelector((state) => state.loginSlice.user?.branch);
    const product = useSelector((state) => state.loginSlice.user?.products);
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leads, setLeads] = useState([]);
    const [leadsByStage, setLeadsByStage] = useState({});
    const [selectedBranchId, setSelectedBranchId] = useState(branch || null);
    const [selectedProductId, setSelectedProductId] = useState(product || null);
    const [hasFetchedLeads, setHasFetchedLeads] = useState(false);
    const [leadId, setLeadId] = useState(null);
    const [labelsDashboardModal, setLabelsDashBoardModal] = useState(false)
    const [selectedTransferForm, setSelectedTransferForm] = useState('')
    const [leadTransferMessageModal, setLeadTransferMessageModal] = useState(false)
    const [rejectedLeadModal, setRejectedLeadModal] = useState(false)
    const defaultBranchName = 'Abu Dhabi';
    const defaultProductName = 'Business Banking';

    useEffect(() => {
        const fetchBranchesAndProducts = async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const branchResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branch/get-branches`, { headers });
                const productResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/get-all-products`, { headers });

                setBranches(branchResponse.data);
                setProducts(productResponse.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBranchesAndProducts();
    }, [token]);

    useEffect(() => {
        const branchId = selectedBranchId || branches.find(b => b.name === defaultBranchName)?._id;
        const productId = selectedProductId || products.find(p => p.name === defaultProductName)?._id;

        if (branchId && productId && !hasFetchedLeads) {
            fetchLeads(productId, branchId);
            fetchProductStages(productId);
            setSelectedBranchId(branchId);
            setSelectedProductId(productId);
            setHasFetchedLeads(true);
        }
    }, [selectedBranchId, selectedProductId, branch, product, branches, products, hasFetchedLeads]);

    const fetchLeads = async (productId, branchId) => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/get-leads/${productId}/branch/${branchId}`, { headers });
            setLeads(response.data);
            organizeLeadsByStage(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchProductStages = async (productId) => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/${productId}`, { headers });
            setStages(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const organizeLeadsByStage = (leads) => {
        const organizedLeads = {};

        leads.forEach(lead => {
            const stageId = lead.product_stage._id;
            if (!organizedLeads[stageId]) {
                organizedLeads[stageId] = {
                    stageName: lead.product_stage.name,
                    leads: []
                };
            }
            organizedLeads[stageId].leads.push(lead);
        });

        setLeadsByStage(organizedLeads);
    };

    const handleBranchSelect = (branchId) => {
        setSelectedBranchId(branchId);
        if (selectedProductId) {
            fetchLeads(selectedProductId, branchId);
        }
    };

    const handleProductSelect = (productId) => {
        setSelectedProductId(productId);
        fetchProductStages(productId);
        if (selectedBranchId) {
            fetchLeads(productId, selectedBranchId);
        }
    };

    const RejectedLead = async (id) => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/reject-lead/${leadId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            fetchLeads()
            setRejectedLeadModal(false)
        } catch (error) {
            console.log(error, 'err')
        }
    }

    const openRejectedLead = (id) => {
        setLeadId(id)
        setRejectedLeadModal(true)
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const openLabelsLead = (id) => {
        setLeadId(id)
        setLabelsDashBoardModal(true)
    }

    const TransferMessageModal = (lead) => {
        setSelectedTransferForm(lead)
        setLeadTransferMessageModal(true)
    }

    const renderMenu = (lead) => (
        <Menu style={{ padding: '10px 20px', inset: '0px 0px auto auto', display: 'flex', gap: '5px', flexDirection: 'column' }} >
            {/* <Menu.Item key="edit" onClick={() => openModal(lead._id)}>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <FiEdit2 style={{ color: '#95630d', fontSize: '16px' }} /> <span>Edit</span>
                </div>
            </Menu.Item>
            <Menu.Item key="move" onClick={() => openMoveLeadModal(lead._id)}>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <LuMoveUpLeft style={{ color: '#95630d', fontSize: '16px' }} /> <span>Move</span>
                </div>
            </Menu.Item>
            <Menu.Item key="transfer" onClick={() => openTransferLeadModal(lead._id)}>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <TbTransfer style={{ color: '#6c757d', fontSize: '16px' }} /> <span>Transfer</span>
                </div>
            </Menu.Item>
            <Menu.Item key="convert" onClick={() => openLeadConvertModal(lead._id)}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <RiContractLine style={{ color: '#6fd943', fontSize: '16px' }} /> <span>Contract</span>
                </div>
            </Menu.Item>*/}
            <Menu.Item key="reject" onClick={() => openRejectedLead(lead._id)}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <AiFillDelete style={{ color: 'red', fontSize: '16px' }} />  <span>Reject</span>
                </div>
            </Menu.Item>
            <Menu.Item key="labels" onClick={() => openLabelsLead(lead._id)}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                    <BiSolidLabel style={{ color: '#ff3a6e', fontSize: '16px' }} />
                    <span>
                        Labels
                    </span>
                </div>
            </Menu.Item>
        </Menu>
    );

    return (
        <div>
            <Navbar />
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={1}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={11}>
                        {!branch && (
                            <>
                                <div className="mt-3">
                                    {branches.length > 0 ? (
                                        branches.map((branch) => (
                                            <Button
                                                key={branch._id}
                                                className={`button ${selectedBranchId === branch._id ? 'selected' : ''}`}
                                                style={{
                                                    backgroundColor: selectedBranchId === branch._id ? '#ffa000' : '#5c91dc',
                                                    color: selectedBranchId === branch._id ? 'white' : 'black',
                                                    border: 'none'
                                                }}
                                                onClick={() => handleBranchSelect(branch._id)}
                                            >
                                                {branch.name}
                                            </Button>
                                        ))
                                    ) : (
                                        <p>No branches available</p>
                                    )}
                                </div>
                            </>
                        )}

                        {!product && (
                            <>
                                <div className="mt-2">
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <Button
                                                key={product._id}
                                                className={`button ${selectedProductId === product._id ? 'selected' : ''}`}
                                                onClick={() => handleProductSelect(product._id)}
                                                style={{
                                                    backgroundColor: selectedProductId === product._id ? '#ffa000' : '#5c91dc',
                                                    color: selectedProductId === product._id ? 'white' : 'black',
                                                    border: 'none'
                                                }}
                                            >
                                                {product.name}
                                            </Button>
                                        ))
                                    ) : (
                                        <p>No products available</p>
                                    )}

                                </div>
                            </>
                        )}

                        <div className=" stages-wrapper d-flex overflow-auto mt-3" style={{ maxHeight: '70vh', overflowX: 'auto' }}>
                            {stages.length > 0 ? (
                                stages.map((stage) => (
                                    <Card key={stage._id} className="stage-card" style={{ minWidth: '300px', margin: '0 7px', height: 'auto' }}>
                                        <h5 className='' >{stage.name}</h5>
                                        {leadsByStage[stage._id] ? (
                                            leadsByStage[stage._id].leads.map((lead) => (
                                                <Card key={lead._id} className="lead-card mt-3">
                                                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '-27px' }}>
                                                        {lead.labels.map((labelname, index) => {
                                                            let backgroundColor = '';
                                                            switch (labelname.color) {
                                                                case 'success':
                                                                    backgroundColor = '#6fd943';
                                                                    break;
                                                                case 'danger':
                                                                    backgroundColor = '#ff3a6e';
                                                                    break;
                                                                case 'primary':
                                                                    backgroundColor = '#5c91dc';
                                                                    break;
                                                                case 'warning':
                                                                    backgroundColor = '#ffa21d';
                                                                    break;
                                                                case 'info':
                                                                    backgroundColor = '#6ac4f4';
                                                                    break;
                                                                case 'secondary':
                                                                    backgroundColor = '#6c757d';
                                                                    break;
                                                                default:
                                                                    backgroundColor = '#ccc'; // Default color if no match
                                                            }

                                                            return (
                                                                <div key={index} style={{ marginRight: '4px', marginTop: '8px' }}>
                                                                    <div
                                                                        className='labels_class'
                                                                        style={{
                                                                            backgroundColor: backgroundColor,
                                                                            borderRadius: '4px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            padding: '4px 8px',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        <p style={{ color: '#fff', margin: 0, fontSize: '11px' }}>{labelname.name}</p>
                                                                    </div>

                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '28px' }}>
                                                        <div style={{ width: '100%', maxWidth: '170px' }}>
                                                            <Link to={`/single-leads/${lead._id}`} style={{ textDecoration: 'none', color: 'black' }} >
                                                                <p className='mb-1' style={{ color: '#B9406B', fontWeight: '600', fontSize: '14px' }} >{lead.company_Name ? lead.company_Name : lead.client?.name && lead.client?.name}</p>
                                                            </Link>
                                                        </div>
                                                        <Dropdown overlay={renderMenu(lead)} trigger={['click']}>
                                                            <BsThreeDotsVertical style={{ cursor: 'pointer', fontSize: '20px' }} />
                                                        </Dropdown>
                                                    </div>
                                                    <div className='marketing_source_lead' >
                                                        <p className='mb-0 text-center' style={{ fontSize: '11px' }} > {lead.lead_type?.name && lead.lead_type?.name} </p>
                                                        <p className='mb-0 text-center' style={{ fontSize: '11px' }}> {lead.source?.name && lead.source?.name} </p>
                                                    </div>
                                                    <div
                                                        className='product_stage_lead'
                                                        style={{
                                                            backgroundColor:
                                                                lead.pipeline_id?.name === 'Personal Loan'
                                                                    ? '#ffa000'
                                                                    : lead.pipeline_id?.name === 'EIB Bank'
                                                                        ? '#08448c'
                                                                        : 'defaultBackgroundColor', // You can set a default background color if needed
                                                        }}
                                                    >
                                                        <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                            {lead.pipeline_id?.name && lead.pipeline_id?.name}
                                                        </p>
                                                    </div>

                                                    {lead.is_transfer && (
                                                        <div className='Transfer_stage_lead' onClick={() => TransferMessageModal(lead._id)} >
                                                            <p className="mb-0 text-center" style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                Transfer Form
                                                            </p>
                                                        </div>
                                                    )}
                                                </Card>
                                            ))
                                        ) : (
                                            <p>No leads found for this stage</p>
                                        )}
                                    </Card>
                                ))
                            ) : (
                                <p>No stages available</p>
                            )}
                        </div>
                    </Col>
                </Row>

                {/* Lead Transfer Message Modal */}
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={leadTransferMessageModal}
                    onHide={() => setLeadTransferMessageModal(false)}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Lead Transfer Form
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            {selectedTransferForm ?
                                `The lead  has been successfully transferred.` :
                                'No lead selected.'}
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => setLeadTransferMessageModal(false)} >Close</Button>
                    </Modal.Footer>
                </Modal>

                {/* Lead Rejected Message Modal */}
                <Modal
                    size="sm"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={rejectedLeadModal}
                    onHide={() => setRejectedLeadModal(false)}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Reject Lead
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                        <p  >
                            <span style={{ color: 'red', fontWeight: '600' }} > Are You Sure?</span>  <br /> <span style={{ color: '#3ec9d6' }} >You Want to Reject this Lead</span>
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className='all_close_btn_container' onClick={() => setRejectedLeadModal(false)}>Close</Button>
                        <Button className='all_single_leads_button' onClick={RejectedLead} >Reject Lead</Button>
                    </Modal.Footer>
                </Modal>

                <DashboardLabels leadId={leadId} fetchLeadsData={fetchLeads} labelsDashboardModal={labelsDashboardModal} setLabelsDashBoardModal={setLabelsDashBoardModal} />
            </Container>
        </div>
    );
};

export default CeoDashboard;
