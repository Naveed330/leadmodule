import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import axios from 'axios';

const TransferLeads = ({ fetchLeadsData, leadId, transferModal, setTransferModal, fetchSingleLead }) => {
    const [pipelineId, setPipelineId] = useState('');
    const [branch, setBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedProductStage, setSelectedProductStage] = useState('');
    const [productStage, setProductStage] = useState([]);
    const [filteredPipelines, setFilteredPipelines] = useState([]); // New state for filtered pipelines

    const pipelines = useSelector(state => state.loginSlice.pipelines);
    const branches = useSelector(state => state.loginSlice.branches || []);
    const products = useSelector(state => state.loginSlice.productNames);
    const token = useSelector(state => state.loginSlice.user?.token);

    const productPipelineMap = {
        'Business Banking': ['Business Banking'],
        'Personal Loan': ['EIB Bank', 'Personal Loan'],
        'Mortgage Loan': ['Mortgage', 'CEO Mortgage'],
    };

    useEffect(() => {
        if (selectedProduct) {
            const productName = products.find(product => product._id === selectedProduct)?.name;
            if (productName && productPipelineMap[productName]) {
                setFilteredPipelines(pipelines.filter(pipeline => productPipelineMap[productName].includes(pipeline.name)));
            } else {
                setFilteredPipelines([]); // Clear pipelines if no match found
            }
            setPipelineId(''); // Reset pipeline selection
        } else {
            setFilteredPipelines(pipelines); // Reset to all pipelines if no product is selected
        }
    }, [selectedProduct, pipelines, products]);

    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/single-lead/${leadId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const leadData = response.data;
                setSelectedProduct(leadData.products?._id || '');
                setSelectedProductStage('');
            } catch (error) {
                console.error('Error fetching lead data:', error);
            }
        };
        if (leadId) {
            fetchLeadData();
        }
    }, [leadId, token]);

    useEffect(() => {
        const fetchProductStages = async () => {
            if (selectedProduct && pipelineId) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/pipeline/${pipelineId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setProductStage(response.data);
                } catch (error) {
                    console.error('Error fetching product stages:', error);
                }
            } else {
                setProductStage([]);
            }
        };
        fetchProductStages();
    }, [selectedProduct, pipelineId, token]);

    const handlePipelineChange = (e) => {
        setPipelineId(e.target.value);
    };

    const handleBranchChange = (e) => {
        setBranch(e.target.value);
    };

    const handleProductChange = (e) => {
        setSelectedProduct(e.target.value);
        setSelectedProductStage('');
        setPipelineId('');
    };

    const handleProductStageChange = (e) => {
        setSelectedProductStage(e.target.value);
    };

    const transferLeads = async () => {
        if (!pipelineId || !branch || !selectedProduct || !selectedProductStage) {
            alert('Please select all fields before transferring');
            return;
        }

        const payload = {
            pipeline: pipelineId,
            branch,
            product_stage: selectedProductStage,
            products: selectedProduct
        };

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/leads/transfer-lead/${leadId}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            fetchLeadsData();
            fetchSingleLead();
            setTransferModal(false);
        } catch (error) {
            console.error('Error transferring lead:', error);
        }
    };

    return (
        <div>
            <Modal
                show={transferModal}
                onHide={() => setTransferModal(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Body>
                    <h4>Transfer Leads</h4>
                    <div>
                        <Form>
                            <Form.Label>Branch</Form.Label>
                            <Form.Select
                                aria-label="Select Branch"
                                name="branch"
                                value={branch}
                                onChange={handleBranchChange}
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch._id} value={branch._id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </Form.Select>

                            <Form.Group controlId="product">
                                <Form.Label>Product</Form.Label>
                                <Form.Select
                                    aria-label="Select Product"
                                    name="product"
                                    value={selectedProduct}
                                    onChange={handleProductChange}
                                >
                                    <option value="">Select Product</option>
                                    {products.map(product => (
                                        <option key={product._id} value={product._id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Label>Pipeline</Form.Label>
                            <Form.Select
                                aria-label="Select Pipeline"
                                name="pipeline"
                                value={pipelineId}
                                onChange={handlePipelineChange}
                                disabled={!selectedProduct} // Disable if no product selected
                            >
                                <option value="">Select Pipeline</option>
                                {filteredPipelines.map(pipeline => (
                                    <option key={pipeline._id} value={pipeline._id}>
                                        {pipeline.name}
                                    </option>
                                ))}
                            </Form.Select>

                            <Form.Group className="mb-3" controlId="productStage">
                                <Form.Label>Product Stage</Form.Label>
                                <Form.Select
                                    aria-label="Select Product Stage"
                                    name="productStage"
                                    value={selectedProductStage}
                                    onChange={handleProductStageChange}
                                    disabled={!selectedProduct} // Disable if no product selected
                                >
                                    <option value="">Select Product Stage</option>
                                    {productStage.map(stage => (
                                        <option key={stage._id} value={stage._id}>
                                            {stage.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setTransferModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={transferLeads}>
                        Transfer Leads
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TransferLeads;
