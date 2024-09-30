import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import axios from 'axios';

const MoveLeads = ({ setMoveLeadModal, moveLeadModal, leadId, fetchLeadsData }) => {
    const [pipeline, setPipeline] = useState('');
    const [branch, setBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedProductStage, setSelectedProductStage] = useState('');
    const [productStage, setProductStage] = useState([]);

    const pipelineSlice = useSelector(state => state.loginSlice.pipelines);
    const branchesSlice = useSelector(state => state.loginSlice.branches || []);
    const token = useSelector(state => state.loginSlice.user?.token);

    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/single-lead/${leadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const leadData = response.data;
                setSelectedProduct(leadData.products?._id || '');
                setSelectedProductStage('');
            } catch (error) {
                console.error('Error fetching lead data:', error);
            }
        };
        fetchLeadData();
    }, [leadId, token]);

    useEffect(() => {
        const fetchProductStages = async () => {
            if (selectedProduct) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/${selectedProduct}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setProductStage(response.data); // Update product stages based on the selected product
                } catch (error) {
                    console.error('Error fetching product stages:', error);
                }
            } else {
                setProductStage([]); // Clear product stages if no product is selected
            }
        };
        fetchProductStages();
    }, [selectedProduct, token]);

    const handlePipelineChange = (e) => {
        setPipeline(e.target.value);
    };

    const handleBranchChange = (e) => {
        setBranch(e.target.value);
    };

    const handleProductStageChange = (e) => {
        setSelectedProductStage(e.target.value);
    };

    const moveLeadsHandler = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/leads/move-lead/${leadId}`,
                {
                    pipeline,
                    branch,
                    product_stage: selectedProductStage
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Optionally, you can handle success here (e.g., close modal or show a success message)
            fetchLeadsData()
            setMoveLeadModal(false);
        } catch (error) {
            console.error('Error moving leads:', error);
        }
    };

    return (
        <div>
            <Modal
                show={moveLeadModal}
                onHide={() => setMoveLeadModal(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Body>
                    <h4>Move Leads</h4>
                    <Form>

                        {/* Branch Selection */}
                        <Form.Label>Branch</Form.Label>
                        <Form.Select
                            aria-label="Select Branch"
                            name="branch"
                            value={branch}
                            onChange={handleBranchChange}
                        >
                            <option value="">Select Branch</option>
                            {branchesSlice.map(branch => (
                                <option key={branch._id} value={branch._id}>
                                    {branch.name}
                                </option>
                            ))}
                        </Form.Select>

                        {/* Pipeline Selection */}
                        <Form.Label>Pipeline</Form.Label>
                        <Form.Select
                            aria-label="Select Pipeline"
                            name="pipeline"
                            value={pipeline}
                            onChange={handlePipelineChange}
                        >
                            <option value="">Select Pipeline</option>
                            {pipelineSlice.map(pipeline => (
                                <option key={pipeline._id} value={pipeline._id}>
                                    {pipeline.name}
                                </option>
                            ))}
                        </Form.Select>

                        {/* Product Stage Selection */}
                        <Form.Group className="mb-3" controlId="productStage">
                            <Form.Label>Product Stage</Form.Label>
                            <Form.Select
                                aria-label="Select Product Stage"
                                name="product_stage"
                                value={selectedProductStage}
                                onChange={handleProductStageChange}
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setMoveLeadModal(false)}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onClick={moveLeadsHandler}
                    >
                        Move Leads
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
export default MoveLeads;
