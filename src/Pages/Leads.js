import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '../Components/navbar/Navbar';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Button, Spin, Tooltip, Dropdown, Menu } from 'antd';
import { Container, Row, Col, Image, Modal, Card, Form } from 'react-bootstrap';
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
import { TiDeleteOutline } from "react-icons/ti";
import { IoMdAdd } from "react-icons/io";
import DashboardLabels from '../Components/DashboardLabels';
import { FiEdit2 } from "react-icons/fi";
import { LuMoveUpLeft } from "react-icons/lu";
import { TbTransfer } from "react-icons/tb";
import { RiContractLine } from "react-icons/ri";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidLabel } from "react-icons/bi";
import { IoLogoWhatsapp } from "react-icons/io";
import { SiImessage } from "react-icons/si";
import { TbFileDescription } from "react-icons/tb";

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
    const [rejectedLeadModal, setRejectedLeadModal] = useState(false)
    const [contractModal, setContractModal] = useState(false)
    const [labelsDashboardModal, setLabelsDashBoardModal] = useState(false)
    const [openLeadDescriptionModal, setOpenLeadDescriptionModal] = useState(false)
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedLeadDiscussion, setSelectedDiscussion] = useState([])
    const [leadDiscussionModal, setLeadDiscussionModal] = useState(false)
    const [error, setError] = useState('');
    const [discussionText, setDiscussionText] = useState('');
    const textareaRef = useRef(null);

    console.log(selectedLeadDiscussion._id, 'selectedLeadDiscussionselectedLeadDiscussion')

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

    // Show modal with lead details
    const showLeadDetails = (lead) => {
        setSelectedLead(lead); // Set the selected lead
        setOpenLeadDescriptionModal(true)
    };

    // Show modal with lead Discussion
    const showLeadDiscussion = (lead) => {
        setSelectedDiscussion(lead)
        setLeadDiscussionModal(true)
    }

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
    // useEffect to set default branch and product on component mount
    useEffect(() => {
        // Set Abu Dhabi as the default branch if available
        const defaultBranch = branchData.find(branch => branch.name === 'Abu Dhabi');
        if (defaultBranch) {
            setSelectedBranch(defaultBranch._id);
        }

        // Set Business Banking as the default product if available
        const defaultProduct = productNames.find(product => product.name === 'Business Banking');
        if (defaultProduct) {
            setSelectedProduct(defaultProduct._id);
        }
    }, [branchData, productNames]);
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

    // Add Discussion
    const sendDiscussionMessage = async () => {
        if (!discussionText.trim()) {
            setError('Please Enter a Comment.');
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/add-discussion/${selectedLeadDiscussion._id}`, {
                comment: discussionText
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDiscussionText('');
            fetchLeadsData();
        } catch (error) {
            console.log(error, 'err');
        }
    }

    const handleInputChange = (e) => {
        const value = e.target.value;
        setDiscussionText(value);

        if (value.trim()) {
            setError('');
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
        setContractModal(true)
    }

    const openWhtsappModal = (id, clientId) => {
        setLeadId(id);
        setClientId(clientId)
        setWhatsAppModal(true);
    }

    const RejectedLead = async (id) => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/reject-lead/${leadId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            fetchLeadsData()
            setRejectedLeadModal(false)
        } catch (error) {
            console.log(error, 'err')
        }
    }

    const openRejectedLead = (id) => {
        setLeadId(id)
        setRejectedLeadModal(true)
    }

    const openLabelsLead = (id) => {
        setLeadId(id)
        setLabelsDashBoardModal(true)
    }


    const renderMenu = (lead) => (
        <Menu style={{ padding: '10px 20px', inset: '0px 0px auto auto', display: 'flex', gap: '5px', flexDirection: 'column' }} >
            <Menu.Item key="edit" onClick={() => openModal(lead._id)}>

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
            </Menu.Item>
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
        <>
            <Navbar />
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={1}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={11}>
                        <div className='mt-4 create_lead_icon'>
                            <IoMdAdd style={{ fontSize: '24px' }} onClick={() => setModal2Open(true)} />
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
                                                            borderRadius: 4,
                                                            maxHeight: '70vh',
                                                            overflowY: 'auto'
                                                        }}
                                                        className="stage-column mx-2"
                                                    >
                                                        <Card className="stage-card" bordered  >
                                                            <h5 className="text-center stage-title">{stage.name}</h5>
                                                            <div className="leads-container">
                                                                {stagesWithLeads.find(s => s.stage._id === stage._id)?.leads.map((lead, index) => {
                                                                    console.log(lead, 'leadlead')
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
                                                                                            <div style={{ width: '100%', maxWidth: '160px' }}>
                                                                                                <Link to={`/single-leads/${lead._id}`} style={{ textDecoration: 'none', color: 'black' }} >
                                                                                                    <p className='mb-1' style={{ color: '#B9406B', fontWeight: '600', fontSize: '14px' }} >{lead.company_Name ? lead.company_Name : lead.client?.name && lead.client?.name}</p>
                                                                                                </Link>
                                                                                            </div>
                                                                                            <Dropdown overlay={renderMenu(lead)} trigger={['click']}>
                                                                                                <Button icon={<BsThreeDotsVertical />} />
                                                                                            </Dropdown>
                                                                                        </div>
                                                                                        <div className="image_container">
                                                                                            {lead.selected_users
                                                                                                .filter((leadImage) => {
                                                                                                    const excludedRoles = [
                                                                                                        'Developer', 'Marketing', 'CEO', 'MD',
                                                                                                        'Super Admin', 'HOD',
                                                                                                    ];

                                                                                                    return !excludedRoles.includes(leadImage?.role);
                                                                                                })
                                                                                                .map((leadImage, index) => {
                                                                                                    const imageSrc = leadImage?.image
                                                                                                        ? `${process.env.REACT_APP_BASE_URL}/images/${leadImage?.image}`
                                                                                                        : default_image;

                                                                                                    return (
                                                                                                        <Image
                                                                                                            key={index}
                                                                                                            src={imageSrc}
                                                                                                            alt={`Lead ${index}`}
                                                                                                            className="image_control_discussion_main_lead"
                                                                                                        />
                                                                                                    );
                                                                                                })}

                                                                                        </div>


                                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className='mb-2'>
                                                                                            <div className='marketing_source_lead' >
                                                                                                <p className='mb-0 text-center' style={{ fontSize: '11px' }} > {lead.lead_type?.name && lead.lead_type?.name} </p>
                                                                                                <p className='mb-0 text-center' style={{ fontSize: '11px' }}> {lead.source?.name && lead.source?.name} </p>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '5px' }} >
                                                                                                <SiImessage className='mt-2' style={{ fontSize: '20px', color: '#5c91dc', cursor: 'pointer' }} onClick={() => showLeadDiscussion(lead)} />
                                                                                                <TbFileDescription className='mt-2' style={{ fontSize: '20px', color: '#5c91dc', cursor: 'pointer' }} onClick={() => showLeadDetails(lead)} />
                                                                                                <IoLogoWhatsapp style={{ color: 'green', fontSize: '20px', cursor: 'pointer' }} onClick={() => openWhtsappModal(lead._id, lead.client._id)} />
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Lead Description Modal */}
                                                                                        <Modal
                                                                                            size="lg"
                                                                                            aria-labelledby="contained-modal-title-vcenter"
                                                                                            centered
                                                                                            show={openLeadDescriptionModal}
                                                                                            onHide={() => setOpenLeadDescriptionModal(false)}
                                                                                        >
                                                                                            <Modal.Header closeButton>
                                                                                                <Modal.Title id="contained-modal-title-vcenter">
                                                                                                    Lead Details
                                                                                                </Modal.Title>
                                                                                            </Modal.Header>
                                                                                            <Modal.Body>
                                                                                                <p>
                                                                                                    {selectedLead && (
                                                                                                        <div>
                                                                                                            <p>{selectedLead.description || 'No description available.'}</p>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </p>
                                                                                            </Modal.Body>

                                                                                        </Modal>

                                                                                        {/* Lead Discussion */}
                                                                                        <Modal
                                                                                            show={leadDiscussionModal}
                                                                                            size="lg"
                                                                                            aria-labelledby="contained-modal-title-vcenter"
                                                                                            centered
                                                                                            onHide={() => setLeadDiscussionModal(false)}
                                                                                        >
                                                                                            <Modal.Header closeButton>
                                                                                                <Modal.Title id="contained-modal-title-vcenter">
                                                                                                    Lead Discussion
                                                                                                </Modal.Title>
                                                                                            </Modal.Header>
                                                                                            <Modal.Body>
                                                                                                <Card className="mt-4 lead_discussion_main_card_main" style={{ padding: '15px' }}>
                                                                                                    <Container>
                                                                                                        <Row>
                                                                                                            <Col xs={12}>
                                                                                                                <div className="chat-history mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                                                                                    {selectedLeadDiscussion?.discussions?.length > 0 ? (
                                                                                                                        selectedLeadDiscussion.discussions.reverse().map((leadDiscussion, index) => {
                                                                                                                            const imageSrc = leadDiscussion.created_by?.image
                                                                                                                                ? `${process.env.REACT_APP_BASE_URL}/images/${leadDiscussion.created_by?.image}`
                                                                                                                                : 'default_image_url_here';

                                                                                                                            return (
                                                                                                                                <div key={index} style={{ marginBottom: '15px' }}>
                                                                                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                                                                                        <Image
                                                                                                                                            src={imageSrc}
                                                                                                                                            alt={leadDiscussion.created_by?.name}
                                                                                                                                            className="image_control_discussion"
                                                                                                                                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                                                                                                        />
                                                                                                                                        <p className="mb-0" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                                                                                                            {leadDiscussion.created_by?.name}
                                                                                                                                        </p>
                                                                                                                                    </div>
                                                                                                                                    <p className="mb-0" style={{ fontSize: '0.75rem', color: '#888' }}>
                                                                                                                                        {new Date(leadDiscussion?.created_at).toLocaleDateString('en-US', {
                                                                                                                                            year: 'numeric',
                                                                                                                                            month: 'long',
                                                                                                                                            day: 'numeric',
                                                                                                                                            hour: '2-digit',
                                                                                                                                            minute: '2-digit',
                                                                                                                                            hour12: true,
                                                                                                                                        })}
                                                                                                                                    </p>
                                                                                                                                    <p style={{ fontSize: '14px' }} className="mb-4 mt-2">
                                                                                                                                        {leadDiscussion?.comment}
                                                                                                                                    </p>
                                                                                                                                </div>
                                                                                                                            );
                                                                                                                        })
                                                                                                                    ) : (
                                                                                                                        <p>No discussions available.</p>
                                                                                                                    )}
                                                                                                                </div>

                                                                                                                <Form>
                                                                                                                    <Form.Control
                                                                                                                        as="textarea"
                                                                                                                        placeholder="Leave a comment here"
                                                                                                                        rows={1}
                                                                                                                        value={discussionText}
                                                                                                                        onChange={handleInputChange}
                                                                                                                        required
                                                                                                                        ref={textareaRef}
                                                                                                                        maxLength={300}
                                                                                                                        className="lead_discussion_class"
                                                                                                                    />
                                                                                                                    {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
                                                                                                                </Form>
                                                                                                                <Button onClick={sendDiscussionMessage} className="mt-2 all_single_leads_button">
                                                                                                                    Create
                                                                                                                </Button>
                                                                                                            </Col>
                                                                                                        </Row>
                                                                                                    </Container>
                                                                                                </Card>
                                                                                            </Modal.Body>

                                                                                        </Modal>

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
                <ConvertLead leadId={leadId} setLeadToContract={setLeadToContract} leadtocontract={leadtocontract} contractModal={contractModal} setContractModal={setContractModal} />
                <WhatsappNotification leadId={leadId} whtsappModal={whtsappModal} setWhatsAppModal={setWhatsAppModal} clientId={clientId} />
                <DashboardLabels leadId={leadId} fetchLeadsData={fetchLeadsData} labelsDashboardModal={labelsDashboardModal} setLabelsDashBoardModal={setLabelsDashBoardModal} />
            </Container>
        </>
    );
};

export default Leads;



