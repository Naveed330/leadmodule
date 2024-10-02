import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../Components/navbar/Navbar';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Button, Card, Spin, Tooltip, Dropdown, Menu } from 'antd';
import { Container, Row, Col, Image } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import CreateLead from '../Components/createLead/CreateLead';
import EditLead from '../Components/editlead/EditLead';
import MoveLeads from '../Components/moveLead/MoveLeads';
import TransferLeads from '../Components/transferLeads/TransferLeads';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './style.css'; // Ensure this CSS file styles your components appropriately
import ConvertLead from '../Components/convertLead/ConvertLead';
import { Link } from 'react-router-dom';
import { BsThreeDotsVertical } from "react-icons/bs";
import WhatsappNotification from '../Components/whatsappNotification/WhatsappNotification';
import default_image from '../Assets/default_image.jpg'

const Leads = () => {
    // State variables
    const [leadData, setLeadsData] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [productStages, setProductStages] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [modal2Open, setModal2Open] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [moveLeadModal, setMoveLeadModal] = useState(false);
    const [transferModal, setTransferModal] = useState(false);
    const [leadtocontract, setLeadToContract] = useState(false)
    const [whtsappModal, setWhatsAppModal] = useState(false)
    const [clientId, setClientId] = useState('')
    const [leadId, setLeadId] = useState(null);
    const [messageCounts, setMessageCounts] = useState({});

    // Redux State
    const token = useSelector(state => state.loginSlice.user?.token);
    const productNames = useSelector(state => state.loginSlice?.productNames || []);
    const branchData = useSelector(state => state.loginSlice.branches || []);
    const loginUserBranch = useSelector(state => state.loginSlice.user?.branch);
    const productID = useSelector(state => state.loginSlice.user?.products);

    // Fetch product details based on product ID
    const fetchProductDetails = async (productId) => {
        if (!productId) return;
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCurrentProduct(data);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    // Fetch product stages based on selected product
    const fetchProductStages = async (productId) => {
        if (!productId) return;
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProductStages(data);
        } catch (error) {
            console.error('Error fetching product stages:', error);
        }
    };

    // Fetch leads data
    const fetchLeadsData = async () => {
        if (!token) {
            console.log('Token missing');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/get-leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Set leads data
            setLeadsData(data.leads || []);
            setFilteredLeads(data.leads || []);

            // Initialize message count map
            const messageCountMap = {};

            // Iterate through each lead and set message counts
            data.leads.forEach(lead => {
                const messageCount = Array.isArray(lead.messages) ? lead.messages.length : 0;
                messageCountMap[lead._id] = messageCount;
            });
            setMessageCounts(messageCountMap);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };


    // Initial data fetch
    useEffect(() => {
        fetchLeadsData();
    }, [token]);

    // Fetch product details and stages when productID changes
    useEffect(() => {
        if (productID) {
            fetchProductDetails(productID);
            fetchProductStages(productID);
            setSelectedProduct(productID); // Set selectedProduct to productID
        }
    }, [productID]);

    // Fetch stages when selectedProduct changes
    useEffect(() => {
        if (selectedProduct) {
            fetchProductStages(selectedProduct);
        }
    }, [selectedProduct]);

    // Filter leads by product and branch
    useEffect(() => {
        let filtered = leadData;

        if (selectedProduct) {
            filtered = filtered.filter(lead => lead.products?._id === selectedProduct);
        }

        if (selectedBranch) {
            filtered = filtered.filter(lead => lead.branch?._id === selectedBranch);
        }

        setFilteredLeads(filtered);
    }, [leadData, selectedProduct, selectedBranch]);

    // Handle branch selection
    const handleBranchClick = (branchId) => {
        if (branchId) {
            setSelectedBranch(branchId);
        } else {
            console.warn('Branch ID is undefined or null');
        }
    };

    // Handle product selection
    const handleProductClick = (productId) => {
        if (productId) {
            setSelectedProduct(productId);
            // Optionally reset branch selection when product changes
            setSelectedBranch(null);
        } else {
            console.warn('Product ID is undefined or null');
        }
    };

    // Modal handlers
    const openModal = (id) => {
        setLeadId(id);
        setModalShow(true);
    };

    const openMoveLeadModal = (id) => {
        setLeadId(id);
        setMoveLeadModal(true);
    };

    const openTransferLeadModal = (id) => {
        setLeadId(id);
        setTransferModal(true);
    };

    // Handler to update lead's stage via API
    const draggableCardHandler = async (id, newStageId) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/leads/update-product-stage/${id}`,
                { newProductStageId: newStageId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Lead updated successfully:', response.data);
            // Refetch leads to ensure state consistency
            fetchLeadsData();
        } catch (error) {
            console.error('Error updating lead stage:', error);
            // Optionally revert the optimistic UI update or notify the user
        }
    };

    // Handle drag end event
    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // If no destination, do nothing
        if (!destination) return;

        // If dropped in the same place, do nothing
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // Find the lead being dragged
        const draggedLead = filteredLeads.find(lead => lead._id === draggableId);
        if (!draggedLead) {
            console.error('Dragged lead not found');
            return;
        }

        const sourceStageId = source.droppableId;
        const destinationStageId = destination.droppableId;

        // Optimistically update the UI
        setFilteredLeads(prevLeads => {
            return prevLeads.map(lead => {
                if (lead._id === draggableId) {
                    return { ...lead, product_stage: { _id: destinationStageId, name: productStages.find(stage => stage._id === destinationStageId)?.name } };
                }
                return lead;
            });
        });

        // Update the backend
        draggableCardHandler(draggableId, destinationStageId);
    };

    // Combine stages with leads for rendering
    const stagesWithLeads = useMemo(() => {
        return productStages.map(stage => {
            const leadsInStage = filteredLeads.filter(lead => lead.product_stage?._id === stage._id);
            return { stage, leads: leadsInStage };
        });
    }, [productStages, filteredLeads]);

    const openLeadConvertModal = (id) => {
        setLeadId(id);
        setLeadToContract(true);
    }

    const openWhtsappModal = (id, clientId) => {
        setLeadId(id);
        setClientId(clientId)
        setWhatsAppModal(true);
    }

    const RejectedLead = async (id) => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/reject-lead/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            fetchLeadsData()
        } catch (error) {
            console.log(error, 'err')
        }
    }

    const renderMenu = (lead) => (
        <Menu>
            <Menu.Item key="edit" onClick={() => openModal(lead._id)}>
                Edit
            </Menu.Item>
            <Menu.Item key="move" onClick={() => openMoveLeadModal(lead._id)}>
                Move
            </Menu.Item>
            <Menu.Item key="transfer" onClick={() => openTransferLeadModal(lead._id)}>
                Transfer
            </Menu.Item>
            <Menu.Item key="convert" onClick={() => openLeadConvertModal(lead._id)}>
                Convert
            </Menu.Item>
            <Menu.Item key="reject" onClick={() => RejectedLead(lead._id)}>
                Reject
            </Menu.Item>
            <Menu.Item key="whatsapp" onClick={() => openWhtsappModal(lead._id, lead.client._id)}>
                WhatsApp
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            <Navbar />
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        {/* Header Section */}
                        <div className='d-flex justify-content-between align-items-center mt-4'>
                            <h1>Lead Data</h1>
                            <Button onClick={() => setModal2Open(true)} type="primary">Create Lead</Button>
                        </div>

                        {/* Branch Selection Buttons */}
                        {!loginUserBranch && branchData.length > 0 && (
                            <div>
                                <div className='d-flex flex-wrap gap-2 mt-3'>
                                    {branchData.map((branch) => (
                                        <Button
                                            key={branch?._id}
                                            type={branch?._id === selectedBranch ? 'primary' : 'default'}
                                            onClick={() => handleBranchClick(branch?._id)}
                                        >
                                            {branch?.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Selection Buttons or Current Product Display */}
                        {loginUserBranch && productID ? (
                            <div className='mt-3'>
                                <Tooltip title={currentProduct ? currentProduct.description : 'Loading...'}>
                                    <Button type="primary">
                                        {currentProduct ? currentProduct.name : <Spin size="small" />}
                                    </Button>
                                </Tooltip>
                            </div>
                        ) : (
                            <div className='d-flex flex-wrap gap-2 mt-3'>
                                {productNames.map((product) => (
                                    <Button
                                        key={product._id}
                                        type={product._id === selectedProduct ? 'primary' : 'default'}
                                        onClick={() => handleProductClick(product._id)}
                                    >
                                        {product.name}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Loading Indicator */}
                        {loading && <Spin size="large" className="d-flex justify-content-center mt-4" />}

                        {/* Stages and Leads Display */}
                        {!loading && selectedProduct && productStages.length > 0 && (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="stage-scroll-container mt-4">
                                    <div className="stages-wrapper d-flex flex-nowrap overflow-auto">
                                        {productStages.map(stage => (
                                            <Droppable key={stage._id} droppableId={stage._id}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        style={{
                                                            // background: snapshot.isDraggingOver ? '#f0f0f0' : '#ffffff',
                                                            padding: 8,
                                                            minWidth: 250,
                                                            borderRadius: 4,
                                                            // boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                            maxHeight: '70vh',
                                                            overflowY: 'auto'
                                                        }}
                                                        className="stage-column mx-2"
                                                    >
                                                        <Card className="stage-card" bordered>
                                                            <h5 className="text-center stage-title">{stage.name}</h5>
                                                            <div className="leads-container">
                                                                {stagesWithLeads.find(s => s.stage._id === stage._id)?.leads.map((lead, index) => {
                                                                    console.log(lead, 'leadData')
                                                                    return (
                                                                        <>
                                                                            <Draggable key={lead._id} draggableId={lead._id} index={index}>
                                                                                {(provided) => (
                                                                                    <Card
                                                                                        ref={provided.innerRef}
                                                                                        {...provided.draggableProps}
                                                                                        {...provided.dragHandleProps}
                                                                                        className="lead_card mb-2"

                                                                                    >
                                                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                                                                                            <Link to={`/single-leads/${lead._id}`} style={{ textDecoration: 'none', color: 'black' }} >
                                                                                                <p className='mb-1' style={{ color: '#B9406B', fontWeight: '600', fontSize: '14px' }} >{lead.client?.name && lead.client?.name}</p>
                                                                                            </Link>
                                                                                            <Dropdown overlay={renderMenu(lead)} trigger={['click']}>
                                                                                                <Button icon={<BsThreeDotsVertical />} />
                                                                                            </Dropdown>
                                                                                        </div>
                                                                                        <Image src={lead.image || default_image} className='image_control_discussion' />

                                                                                        <div className='marketing_source_lead' >
                                                                                            <p className='mb-0' style={{ fontSize: '12px' }} > {lead.lead_type?.name && lead.lead_type?.name} </p>
                                                                                            <p style={{ fontSize: '12px' }}> {lead.source?.name && lead.source?.name} </p>
                                                                                        </div>
                                                                                        <p className='mt-3' >{lead.product_stage?.name && lead.product_stage?.name}</p>
                                                                                    </Card>
                                                                                )}
                                                                            </Draggable>
                                                                        </>
                                                                    )
                                                                })}
                                                                {provided.placeholder}
                                                            </div>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Droppable>
                                        ))}
                                    </div>
                                </div>
                            </DragDropContext>
                        )}

                        {/* No Stages or Products Selected */}
                        {(!selectedProduct || productStages.length === 0) && (
                            <div className="no-stages mt-4">
                                <h5>No Stages or Products Selected. Please Select a Product and Branch.</h5>
                            </div>
                        )}
                    </Col>
                </Row>

                {/* Child Components (Modals) */}
                <CreateLead
                    setModal2Open={setModal2Open}
                    modal2Open={modal2Open}
                    fetchLeadsData={fetchLeadsData}
                />
                <EditLead
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    leadId={leadId}
                    fetchLeadsData={fetchLeadsData}
                />
                <MoveLeads
                    moveLeadModal={moveLeadModal}
                    setMoveLeadModal={setMoveLeadModal}
                    leadId={leadId}
                    fetchLeadsData={fetchLeadsData}
                />
                <TransferLeads
                    leadId={leadId}
                    fetchLeadsData={fetchLeadsData}
                    setTransferModal={setTransferModal}
                    transferModal={transferModal}
                />

                <ConvertLead leadId={leadId} setLeadToContract={setLeadToContract} leadtocontract={leadtocontract} />
                <WhatsappNotification leadId={leadId} whtsappModal={whtsappModal} setWhatsAppModal={setWhatsAppModal} clientId={clientId} />
            </Container>
        </>
    );
};

export default Leads;
