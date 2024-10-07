import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import axios from 'axios';

const MoveLeads = ({ setMoveLeadModal, moveLeadModal, leadId, fetchLeadsData, fetchSingleLead }) => {
    const [pipeline, setPipeline] = useState('');
    const [branch, setBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedProductStage, setSelectedProductStage] = useState(''); // This will hold the stage id
    const [pipelines, setPipelines] = useState([]); // State for pipelines
    const [filteredPipelines, setFilteredPipelines] = useState([]); // State for filtered pipelines
    const [productStages, setProductStages] = useState([]); // State for product stages
    const [productStage, setProductStage] = useState('');
    const [initialValues, setInitialValues] = useState({ pipeline: '', branch: '', productStage: '' }); // Store initial values
    const branchesSlice = useSelector(state => state.loginSlice.branches || []);
    const token = useSelector(state => state.loginSlice.user?.token);

    const productPipelineMap = {
        'Business Banking': ['Business Banking'],
        'Personal Loan': ['EIB Bank', 'Personal Loan'],
        'Mortgage Loan': ['Mortgage', 'CEO Mortgage'],
    };

    // Fetch pipelines data on component mount
    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/pipelines/get-pipelines`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPipelines(response.data); // Store fetched pipelines
            } catch (error) {
                console.error('Error fetching pipelines:', error);
            }
        };
        fetchPipelines();
    }, [token]);

    // Fetch lead data and set default values for pipeline, branch, product_stage
    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/single-lead/${leadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const leadData = response.data;

                // Set initial values based on lead data
                const initialPipeline = leadData.pipeline_id?._id || '';
                const initialBranch = leadData.branch?._id || '';
                const initialProductStage = leadData.product_stage?._id || '';

                setInitialValues({ pipeline: initialPipeline, branch: initialBranch, productStage: initialProductStage });
                setSelectedProduct(leadData.products?._id || '');
                setBranch(initialBranch);
                setPipeline(initialPipeline);
                setProductStage(initialProductStage);

                // Filter pipelines based on the selected product
                const productName = leadData.products?.name;
                if (productName) {
                    const filtered = productPipelineMap[productName] || [];
                    setFilteredPipelines(pipelines.filter(pipeline => filtered.includes(pipeline.name)));
                }
            } catch (error) {
                console.error('Error fetching lead data:', error);
            }
        };
        fetchLeadData();
    }, [leadId, token, pipelines]); // Add pipelines to dependencies

    // Fetch product stages based on selected pipeline
    useEffect(() => {
        const fetchProductStages = async () => {
            if (pipeline) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/pipeline/${pipeline}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setProductStages(response.data); // Set fetched product stages
                    setSelectedProductStage(''); // Reset product stage selection
                } catch (error) {
                    console.error('Error fetching product stages:', error);
                }
            } else {
                setProductStages([]); // Clear product stages if no pipeline is selected
            }
        };
        fetchProductStages();
    }, [pipeline, token]);

    // Handlers for form fields
    const handlePipelineChange = (e) => {
        setPipeline(e.target.value);
        setSelectedProductStage(''); // Reset selected stage when pipeline changes
    };

    const handleBranchChange = (e) => {
        setBranch(e.target.value);
    };

    const handleProductStageChange = (e) => {
        setSelectedProductStage(e.target.value);
    };

    // Move leads handler
    const moveLeadsHandler = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/leads/move-lead/${leadId}`,
                {
                    pipeline,
                    branch,
                    product_stage: selectedProductStage,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchLeadsData();
            fetchSingleLead();
            setMoveLeadModal(false);
        } catch (error) {
            console.error('Error moving leads:', error);
        }
    };

    // Function to reset the form fields to their initial values
    const resetToInitialValues = () => {
        setBranch(initialValues.branch);
        setPipeline(initialValues.pipeline);
        setProductStage(initialValues.productStage);
    };

    return (
        <div>
            <Modal
                show={moveLeadModal}
                onHide={() => {
                    resetToInitialValues(); // Reset fields to initial values
                    setMoveLeadModal(false);
                }}
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
                            {filteredPipelines.map(pipeline => (
                                <option key={pipeline._id} value={pipeline._id}>
                                    {pipeline.name}
                                </option>
                            ))}
                        </Form.Select>

                        {/* Product Stage Selection */}
                        <Form.Label>Product Stage</Form.Label>
                        <Form.Select
                            aria-label="Select Product Stage"
                            name="productStage"
                            value={productStage}
                            onChange={handleProductStageChange}
                        >
                            <option value="">Select Product Stage</option>
                            {productStages.map(stage => (
                                <option key={stage._id} value={stage._id}>
                                    {stage.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => {
                        resetToInitialValues(); // Reset fields to initial values
                        setMoveLeadModal(false);
                    }}
                    >
                        Close
                    </Button>
                    <Button
                        className='all_single_leads_button'
                        onClick={moveLeadsHandler}
                        disabled={!branch || !pipeline || !selectedProductStage} // Disable if any field is empty
                    >
                        Move Leads
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MoveLeads;
