import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import axios from 'axios';

const EditLead = ({ modalShow, setModalShow, leadId,fetchLeadsData }) => {
    const [leadData, setLeadData] = useState({});
    const [sources, setSources] = useState([]);
    const [productStages, setProductStages] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]); // New state for selected users
    const productsName = useSelector(state => state.loginSlice.productNames);
    const leadTypeSlice = useSelector(state => state.loginSlice.leadType);
    const token = useSelector((state) => state.loginSlice.user?.token);
    const branchesSlice = useSelector((state) => state.loginSlice.branches || []);
    const pipelineSlice = useSelector(state => state.loginSlice.pipelines);

    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/single-lead/${leadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setLeadData(response.data);
                setSelectedProduct(response.data.products?._id || '');
            } catch (error) {
                console.log(error, 'err');
            }
        };

        if (modalShow) {
            fetchLeadData();
        }
    }, [modalShow, leadId, token]);

    useEffect(() => {
        const fetchSources = async () => {
            if (leadData.lead_type?._id) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/sources/${leadData.lead_type._id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
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
    }, [leadData.lead_type, token]); // Re-fetch sources when lead_type changes

    useEffect(() => {
        const fetchProductStages = async () => {
            if (selectedProduct) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/${selectedProduct}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setProductStages(response.data); // Update product stages based on the selected product
                } catch (error) {
                    console.log(error, 'err');
                }
            } else {
                setProductStages([]); // Clear product stages if no product is selected
            }
        };

        fetchProductStages();
    }, [selectedProduct, token]); // Fetch product stages when selectedProduct changes

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeadData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleBranchChange = (e) => {
        const selectedBranchId = e.target.value;
        const selectedBranch = branchesSlice.find((branch) => branch._id === selectedBranchId);
        setLeadData((prevData) => ({
            ...prevData,
            branch: selectedBranch ? { _id: selectedBranch._id, name: selectedBranch.name } : {},
        }));
    };

    const handleProductChange = (e) => {
        const selectedProductId = e.target.value;
        setSelectedProduct(selectedProductId); // Update selectedProduct
        setLeadData((prevData) => ({
            ...prevData,
            products: productsName.find((product) => product._id === selectedProductId) || {},
        }));
    };

    const handleLeadTypeChange = (e) => {
        const selectedLeadTypeId = e.target.value;
        const selectedLeadType = leadTypeSlice.find(
            (leadType) => leadType._id === selectedLeadTypeId
        );
        setLeadData((prevData) => ({
            ...prevData,
            lead_type: selectedLeadType || {}, // Update lead_type
        }));
    };

    const handlePipelineChange = (e) => {
        const selectedPipelineId = e.target.value;
        const selectedPipeline = pipelineSlice.find(
            (pipeline) => pipeline._id === selectedPipelineId
        );
        setLeadData((prevData) => ({
            ...prevData,
            pipeline_id: selectedPipeline || {}, // Update pipeline_id
        }));
    };

    const handleSourceChange = (e) => {
        const selectedSourceId = e.target.value;
        const selectedSource = sources.find((source) => source._id === selectedSourceId);
        setLeadData((prevData) => ({
            ...prevData,
            source: selectedSource || {}, // Update source in leadData
        }));
    };

    const handleProductStagesChange = (e) => {
        const selectedProductStageId = e.target.value;
        const selectedProductStage = productStages.find((stage) => stage._id === selectedProductStageId);
        setLeadData((prevData) => ({
            ...prevData,
            product_stage: selectedProductStage || {}, // Update product_stage in leadData
        }));
    };

    const handleSaveChanges = async () => {
        const payload = {
            clientPhone: leadData.client?.phone || '',
            clientName: leadData.client?.name || '',
            clientEmail: leadData.client?.email || '',
            product_stage: leadData.product_stage?._id || '',
            lead_type: leadData.lead_type?._id || '',
            pipeline: leadData.pipeline_id?._id || '',
            products: leadData.products?._id || '',
            source: leadData.source?._id || '',
            description: leadData.description || '',
            branch: leadData.branch?._id || '',
            selected_users: selectedUsers || [], // Include selected users in the payload
        };

        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/edit-lead/${leadId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setModalShow(false); // Close the modal on success
            fetchLeadsData()
        } catch (error) {
            console.log(error, 'err');
        }
    };

    return (
        <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={modalShow}
            onHide={() => setModalShow(false)}
        >
            <Modal.Body style={{height:'100%',maxHeight:'750px', overflowY:'scroll'}} >
                <h4>Edit Lead</h4>
                <Form>
                    {/* Form Fields */}
                    <Form.Group className="mb-3" controlId="clientPhone">
                        <Form.Label>Client Phone</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Number"
                            name="clientPhone"
                            value={leadData.client?.phone || ''}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="clientName">
                        <Form.Label>Client Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Name"
                            name="clientName"
                            value={leadData.client?.name || ''}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="clientEmail">
                        <Form.Label>Client Email</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Email"
                            name="clientEmail"
                            value={leadData.client?.email || ''}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="branch">
                        <Form.Label>Branch</Form.Label>
                        <Form.Select
                            aria-label="Select Branch"
                            name="branch"
                            value={leadData.branch?._id || ''}
                            onChange={handleBranchChange}
                        >
                            <option value="">Select Branch</option>
                            {branchesSlice.map((branch) => (
                                <option key={branch._id} value={branch._id}>
                                    {branch.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="product">
                        <Form.Label>Product</Form.Label>
                        <Form.Select
                            aria-label="Select Product"
                            name="product"
                            value={leadData.products?._id || ''}
                            onChange={handleProductChange}
                        >
                            <option value="">Select Product</option>
                            {productsName.map((product) => (
                                <option key={product._id} value={product._id}>
                                    {product.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="leadType">
                        <Form.Label>Lead Type</Form.Label>
                        <Form.Select
                            aria-label="Select Lead Type"
                            name="leadType"
                            value={leadData.lead_type?._id || ''}
                            onChange={handleLeadTypeChange}
                        >
                            <option value="">Select Lead Type</option>
                            {leadTypeSlice.map((type) => (
                                <option key={type._id} value={type._id}>
                                    {type.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="pipeline">
                        <Form.Label>Pipeline</Form.Label>
                        <Form.Select
                            aria-label="Select Pipeline"
                            name="pipeline"
                            value={leadData.pipeline_id?._id || ''}
                            onChange={handlePipelineChange}
                        >
                            <option value="">Select Pipeline</option>
                            {pipelineSlice.map((pipeline) => (
                                <option key={pipeline._id} value={pipeline._id}>
                                    {pipeline.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="source">
                        <Form.Label>Source</Form.Label>
                        <Form.Select
                            aria-label="Select Source"
                            name="source"
                            value={leadData.source?._id || ''}
                            onChange={handleSourceChange}
                        >
                            <option value="">Select Source</option>
                            {sources.map((source) => (
                                <option key={source._id} value={source._id}>
                                    {source.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="productStage">
                        <Form.Label>Product Stage</Form.Label>
                        <Form.Select
                            aria-label="Select Product Stage"
                            name="productStage"
                            value={leadData.product_stage?._id || ''}
                            onChange={handleProductStagesChange}
                        >
                            <option value="">Select Product Stage</option>
                            {productStages.map((stage) => (
                                <option key={stage._id} value={stage._id}>
                                    {stage.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={leadData.description || ''}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setModalShow(false)}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSaveChanges}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditLead;
