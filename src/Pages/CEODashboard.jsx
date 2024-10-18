import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Dashboard.css';
import LeadSearch from '../Components/LeadSearch';

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
    const [selectedBranchId, setSelectedBranchId] = useState(localStorage.getItem('selectedBranchId') || branch || null);
    const [selectedProductId, setSelectedProductId] = useState(localStorage.getItem('selectedProductId') || product || null);
    const [hasFetchedLeads, setHasFetchedLeads] = useState(false);
    const defaultBranchName = 'Abu Dhabi';
    const defaultProductName = 'Business Banking';
    const [searchQuery, setSearchQuery] = useState(''); // Search state

    const filteredLeads = (leadsByStage[stages._id]?.leads || []).filter(lead =>
        lead.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    useEffect(() => {
        const fetchBranchesAndProducts = async () => {
            try {
                const branchResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branch/get-branches`
                    //     , {
                    //     headers: {
                    //         Authorization: `Bearer ${token}`,
                    //     }
                    // }
                );
                const productResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/get-all-products`
                    //     , {
                    //     headers: {
                    //         Authorization: `Bearer ${token}`,
                    //     }
                    // }
                );

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

        if (branchId && productId && !hasFetchedLeads && token) {
            fetchLeads(productId, branchId);
            fetchProductStages(productId);
            setSelectedBranchId(branchId);
            setSelectedProductId(productId);
            setHasFetchedLeads(true);
        }
    }, [selectedBranchId, selectedProductId, token, branch, product, branches, products, hasFetchedLeads]);

    const fetchLeads = async (productId, branchId) => {
        try {

            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/get-leads/${productId}/branch/${branchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
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
        localStorage.setItem('selectedBranchId', branchId);
        if (selectedProductId) {
            fetchLeads(selectedProductId, branchId);
        }
    };

    const handleProductSelect = (productId) => {
        setSelectedProductId(productId);
        localStorage.setItem('selectedProductId', productId);
        fetchProductStages(productId);
        if (selectedBranchId) {
            fetchLeads(productId, selectedBranchId);
        }
    };

    const draggableCardHandler = async (leadId, newStageId) => {
        try {
            await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/leads/update-product-stage/${leadId}`,
                { newProductStageId: newStageId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchLeads(selectedProductId, selectedBranchId); // Refresh leads
        } catch (error) {
            console.error('Error updating lead stage:', error);
        }
    };

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // Check if dropped outside any droppable area
        if (!destination) return;

        const sourceStageId = source.droppableId;
        const destinationStageId = destination.droppableId;

        // If dropped in the same stage, do nothing
        if (sourceStageId === destinationStageId) return;

        // Call handler to update lead's stage in backend
        draggableCardHandler(draggableId, destinationStageId);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }



    const handleSearch = async (filters) => {
        try {

            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/search-leads`, {
                params: {
                    pipeline: filters.pipeline,
                    userId: filters.userId,
                    created_at_start: filters.created_at_start,
                    created_at_end: filters.created_at_end,
                    products: filters.product,
                    lead_type: filters.lead_type,
                    source: filters.source,
                    client: filters.client,
                    branch: filters.branch,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLeads(response.data.leads);
            organizeLeadsByStage(response.data.leads);
        } catch (error) {
            console.error('Error searching leads:', error);
        }
    };

    return (
        <div>
            <Navbar />
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={1}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={11}>
                        {/* <LeadSearch onSearch={handleSearch} fetchLeadsData={fetchLeads} selectedProductId={selectedProductId} selectedBranchId={selectedBranchId} /> */}
                        {!branch && (
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
                        )}

                        {!product && (
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

                                <div className='mt-3' >
                                    <LeadSearch onSearch={handleSearch} fetchLeadsData={fetchLeads} selectedProductId={selectedProductId} selectedBranchId={selectedBranchId} />
                                </div>
                                <Form className="mt-3">
                                    <Form.Group controlId="searchLeads">
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by Client Name"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </Form.Group>
                                </Form>
                            </div>
                        )}

                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="stages-wrapper d-flex overflow-auto mt-3" style={{ maxHeight: '75vh', overflowX: 'auto' }}>
                                {stages.length > 0 ? (
                                    stages.map((stage) => (
                                        <Droppable key={stage._id} droppableId={stage._id}>
                                            {(provided) => (
                                                <Card
                                                    className="stage-card"
                                                    style={{ minWidth: '300px', margin: '0 7px', height: 'auto' }}
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                >

                                                    <h5 className='sticky-top'>
                                                        {stage.name}
                                                        {leadsByStage[stage._id]?.leads.length > 0 && (
                                                            <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px' }}>
                                                                ({leadsByStage[stage._id].leads.length})
                                                            </span>
                                                        )}
                                                    </h5>
                                                    {leadsByStage[stage._id] ? (
                                                        leadsByStage[stage._id].leads?.filter((lead) => lead.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((lead, index) => (
                                                            <Draggable key={lead._id} draggableId={lead._id} index={index}>
                                                                {(provided) => (
                                                                    <Card
                                                                        className="lead-card mt-3"
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                    >
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '28px' }}>
                                                                            <div style={{ width: '100%', maxWidth: '160px' }}>
                                                                                <Link to={`/single-leads/${lead._id}`} style={{ textDecoration: 'none', color: 'black' }}>
                                                                                    <p className='mb-1' style={{ color: '#B9406B', fontWeight: '600', fontSize: '14px' }}>
                                                                                        {lead.company_Name ? lead.company_Name : lead.client?.name && lead.client?.name}
                                                                                    </p>
                                                                                </Link>
                                                                            </div>
                                                                        </div>

                                                                        <div className='marketing_source_lead'>
                                                                            <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                {lead.lead_type?.name && lead.lead_type?.name}
                                                                            </p>
                                                                            <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                {lead.source?.name && lead.source?.name}
                                                                            </p>
                                                                        </div>

                                                                        <div
                                                                            className='product_stage_lead'
                                                                            style={{
                                                                                backgroundColor:
                                                                                    lead.pipeline_id?.name === 'Personal Loan'
                                                                                        ? '#ffa000'
                                                                                        : lead.pipeline_id?.name === 'EIB Bank'
                                                                                            ? '#08448c'
                                                                                            : 'defaultBackgroundColor', // Set a default background color if needed
                                                                            }}
                                                                        >
                                                                            <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                {lead.pipeline_id?.name && lead.pipeline_id?.name}
                                                                            </p>

                                                                        </div>
                                                                        {/* <p>{lead.created_at && lead.created_at}</p> */}
                                                                    </Card>
                                                                )}
                                                            </Draggable>
                                                        ))
                                                    ) : (
                                                        <p>No leads available</p>
                                                    )}
                                                    {provided.placeholder}
                                                </Card>
                                            )}
                                        </Droppable>
                                    ))
                                ) : (
                                    <p>No stages available</p>
                                )}
                            </div>
                        </DragDropContext>

                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CeoDashboard;
