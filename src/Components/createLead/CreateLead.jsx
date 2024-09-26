import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './CreateLead.css';

const CreateLead = ({ modal2Open, setModal2Open, fetchLeadsData }) => {
    // Redux Data
    const branchesSlice = useSelector(state => state.loginSlice.branches);
    const productNamesSlice = useSelector(state => state.loginSlice.productNames);
    const pipelineSlice = useSelector(state => state.loginSlice.pipelines);
    const leadTypeSlice = useSelector(state => state.loginSlice.leadType);
    // Redux User Data
    const branchUserSlice = useSelector(state => state.loginSlice.user?.branch);
    const pipelineUserSlice = useSelector(state => state.loginSlice.user?.pipeline);
    const productUserSlice = useSelector(state => state.loginSlice.user?.products);

    // Auth Token
    const token = useSelector(state => state.loginSlice.user?.token);

    // State for form fields
    const [formData, setFormData] = useState({
        clientPhone: '',
        clientName: '',
        clientEmail: '',
        products: productUserSlice || null,
        product_stage: '',
        lead_type: '',
        pipeline: pipelineUserSlice?.[0] || pipelineUserSlice, // Set default to first item if available
        branch: branchUserSlice || null, // Default branch if user branch is available
        source: '',
        description: ''
    });

    // State for sources and stages
    const [sources, setSources] = useState([]);
    const [stages, setStages] = useState([]);

    // Fetch sources based on selected leadType
    useEffect(() => {
        const fetchSources = async () => {
            if (formData.lead_type) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/sources/${formData.lead_type}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setSources(response.data); // assuming response.data contains the sources array
                } catch (error) {
                    console.log(error, 'Failed to fetch sources');
                }
            } else {
                setSources([]); // Clear sources if no lead type is selected
            }
        };

        fetchSources();
    }, [formData.lead_type, token]);

    // Fetch stages based on selected product or user product
    useEffect(() => {
        const fetchStages = async () => {
            const productId = formData.products || productUserSlice;
            if (productId) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/${productId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setStages(response.data); // assuming response.data contains the stages array
                } catch (error) {
                    console.log(error, 'Failed to fetch stages');
                }
            } else {
                setStages([]); // Clear stages if no product is selected
            }
        };

        fetchStages();
    }, [formData.products, productUserSlice, token]);

    // Handler to update form state
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/create-lead`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Form data submitted:', formData);
            fetchLeadsData()
            setModal2Open(false);
        } catch (error) {
            console.log(error, 'Failed to submit form');
        }
    };

    return (
        <div>
            <Modal
                title="Create Lead"
                centered
                open={modal2Open}
                onOk={handleSubmit}
                onCancel={() => setModal2Open(false)}
                style={{ height: '100%', maxHeight: '700px', overflowY: 'scroll' }}
            >
                <div>
                    <Form>
                        <Form.Group className="mb-3" controlId="clientPhone">
                            <Form.Label>Client Phone</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter Number"
                                name="clientPhone"
                                value={formData.clientPhone}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="clientName">
                            <Form.Label>Client Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Name"
                                name="clientName"
                                value={formData.clientName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="clientEmail">
                            <Form.Label>Client Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter Email"
                                name="clientEmail"
                                value={formData.clientEmail}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        {!branchUserSlice && (
                            <Form.Group className="mb-3" controlId="branch">
                                <Form.Label>Branch</Form.Label>
                                <Form.Select
                                    aria-label="Select Branch"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Branch</option>
                                    {branchesSlice.map((branch, index) => (
                                        <option key={index} value={branch._id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}

                        {!productUserSlice ? (
                            <Form.Group className="mb-3" controlId="products">
                                <Form.Label>Products</Form.Label>
                                <Form.Select
                                    aria-label="Select Product"
                                    name="products"
                                    value={formData.products}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Product</option>
                                    {productNamesSlice.map((product, index) => (
                                        <option key={index} value={product._id}>
                                            {product?.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        ) : null}

                        <Form.Group className="mb-3" controlId="product_stage">
                            <Form.Label>Product Stages</Form.Label>
                            <Form.Select
                                aria-label="Select Product Stage"
                                name="product_stage"
                                value={formData.product_stage}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Product Stage</option>
                                {stages.map((stage, index) => (
                                    <option key={index} value={stage._id}>
                                        {stage.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="lead_type">
                            <Form.Label>Lead Type</Form.Label>
                            <Form.Select
                                aria-label="Select Lead Type"
                                name="lead_type"
                                value={formData.lead_type}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Lead Type</option>
                                {leadTypeSlice.map((type, index) => (
                                    <option key={index} value={type._id}>
                                        {type.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="source">
                            <Form.Label>Source</Form.Label>
                            <Form.Select
                                aria-label="Select Source"
                                name="source"
                                value={formData.source}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Source</option>
                                {sources.map((source, index) => (
                                    <option key={index} value={source._id}>
                                        {source.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Conditionally render Pipeline select */}
                        {pipelineUserSlice?.length === 0 && (
                            <Form.Group className="mb-3" controlId="pipeline">
                                <Form.Label>Pipeline</Form.Label>
                                <Form.Select
                                    aria-label="Select Pipeline"
                                    name="pipeline"
                                    value={formData.pipeline}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Pipeline</option>
                                    {pipelineSlice.map((pipeline, index) => (
                                        <option key={index} value={pipeline._id}>
                                            {pipeline.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3" controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default CreateLead;
