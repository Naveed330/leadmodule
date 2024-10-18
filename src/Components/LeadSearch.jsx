import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Row, Col, Form } from 'react-bootstrap';
import { MdClear } from "react-icons/md";
import { useSelector } from 'react-redux';

const LeadSearch = ({ onSearch, fetchLeadsData, selectedBranchId, selectedProductId, }) => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const [branch, setBranch] = useState([]);
    const [products, setProducts] = useState([]);
    const [pipelines, setPipelines] = useState([]); // State for pipelines
    const [users, setUsers] = useState([]);
    const [leadTypes, setLeadTypes] = useState([]);
    const [sources, setSources] = useState([]);
    const [clients, setClients] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('')
    const [selectedBranch, setSelectedBranch] = useState(selectedBranchId);
    const [selectedProduct, setSelectedProduct] = useState(selectedProductId);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState('');
    const [selectedLeadType, setSelectedLeadType] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [createdAtStart, setCreatedAtStart] = useState('');
    const [createdAtEnd, setCreatedAtEnd] = useState('');
    const [apiData, setApiData] = useState(null);
  

    // Fetch data for branches, lead types, sources, and clients
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [branchResponse, leadTypeResponse, sourceResponse, clientResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/branch/get-branches`),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/leadtypes/get-all-leadtypes`),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/sources/get/get-sources`),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/clients/get-clinets`),
                ]);

                setBranch(branchResponse.data);
                setLeadTypes(leadTypeResponse.data);
                setSources(sourceResponse.data);
                setClients(clientResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Fetch users based on selected product
    useEffect(() => {
        const fetchUsers = async () => {
            if (selectedProductId) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/get-users-by-product/${selectedProductId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    setUsers(response.data);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            } else {
                setUsers([]); // Clear users if no product is selected
            }
        };

        fetchUsers();
    }, [selectedProductId]);

    // Fetch pipelines based on selected product
    useEffect(() => {
        const fetchPipelines = async () => {
            if (selectedProductId) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/${selectedProductId}`);
                    const pipelinesData = response.data.pipeline_id || [];
                    setPipelines(pipelinesData); // Set pipelines from the product response
                } catch (error) {
                    console.error('Error fetching pipelines:', error);
                }
            } else {
                setPipelines([]); // Clear pipelines if no product is selected
            }
        };

        fetchPipelines();
    }, [selectedProductId]);

    // Debouncing function
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const handleSearch = () => {
        onSearch({
            branch: selectedBranchId,
            pipeline: selectedPipeline ? selectedPipeline.value : '',
            product: selectedProductId,
            userId: selectedUsers ? selectedUsers.value : '',
            lead_type: selectedLeadType ? selectedLeadType.value : '',
            source: selectedSource ? selectedSource.value : '',
            client: selectedClient ? selectedClient.value : '',
            created_at_start: createdAtStart,
            created_at_end: createdAtEnd,
        });
    };

    const debouncedSearch = debounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch();
    }, [selectedPipeline, selectedUsers, selectedLeadType, selectedSource, selectedClient, createdAtStart, createdAtEnd]);

    const handleClearFilters = () => {
        setSelectedPipeline(null);
        setSelectedUsers([]);
        setSelectedLeadType(null);
        setSelectedSource(null);
        setCreatedAtStart('');
        setCreatedAtEnd('');
        setPhoneNumber('')
    };

    // Clear selected filters when selectedProductId or selectedBranchId change
    useEffect(() => {
        setSelectedPipeline(null);
        setSelectedUsers([]);
        setSelectedLeadType(null);
        setSelectedSource(null);
        setCreatedAtStart('');
        setCreatedAtEnd('');
        setPhoneNumber('')
    }, [selectedProductId, selectedBranchId]);

    const handlePhoneInputChange = async (e) => {
        let inputValue = e.target.value;

        // Validation and formatting
        let processedValue = inputValue.replace(/^\+971\s?/, '').replace(/^0+/, '');
        const digitsOnly = processedValue.replace(/\D/g, '').slice(0, 9); // Keep only digits
        const formattedValue = digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'); // Format the number

        setPhoneNumber(formattedValue); // Update state with formatted number

        // If no digits are left after processing, return early
        if (digitsOnly.length === 0) {
            return; // Optionally, add a message to inform the user if needed
        }

        // Concatenate +971 with the processed phone number for the payload
        const payloadPhone = `+971${digitsOnly}`;

        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/check-client-phone`, {
                clientPhone: payloadPhone, // Use the concatenated phone number for API call
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Handle the response as needed
            const responseData = response.data[0];
            setApiData(responseData); // Save the first object in state

            // Check if apiData exists and if the phone number matches
            if (responseData && responseData.client && responseData.client.phone === payloadPhone) {
                alert('Client found!');
            }
        } catch (error) {
            console.error('Error checking client phone:', error);
            // Handle error accordingly (e.g., show an error message)
        }
    };


    return (
        <div className="lead-search">
            <Row>
                <Col md={3}>
                    <div>
                        <label htmlFor="pipeline">Pipeline</label>
                        <Select
                            id="pipeline"
                            value={selectedPipeline}
                            onChange={setSelectedPipeline}
                            options={pipelines.map((pipeline) => ({ value: pipeline._id, label: pipeline.name }))} // Use the fetched pipelines
                            placeholder="Select Pipeline"
                        />
                    </div>
                </Col>

                <Col md={3}>
                    <div>
                        <label htmlFor="users">Users</label>
                        <Select
                            id="users"
                            value={selectedUsers}
                            onChange={setSelectedUsers}
                            options={users.map((user) => ({ value: user._id, label: user.name }))} // Updated to show users based on selected product
                            // isMulti
                            placeholder="Select Users"
                        />
                    </div>
                </Col>

                <Col md={3}>
                    <div>
                        <label htmlFor="lead_type">Lead Type</label>
                        <Select
                            id="lead_type"
                            value={selectedLeadType}
                            onChange={setSelectedLeadType}
                            options={leadTypes.map((leadType) => ({ value: leadType._id, label: leadType.name }))}
                            placeholder="Select Lead Type"
                        />
                    </div>
                </Col>
                <Col md={3}>
                    <div>
                        <label htmlFor="source">Source</label>
                        <Select
                            id="source"
                            value={selectedSource}
                            onChange={setSelectedSource}
                            options={sources.map((source) => ({ value: source._id, label: source.name }))}
                            placeholder="Select Source"
                        />
                    </div>
                </Col>
            </Row>

            <Row>

                <Col md={3}>
                    <div>
                        <Form.Label htmlFor="created_at_start">Created At (Start)</Form.Label>
                        <Form.Control
                            type="date"
                            id="created_at_start"
                            value={createdAtStart}
                            onChange={(e) => setCreatedAtStart(e.target.value)}
                        />
                    </div>
                </Col>

                <Col md={3}>
                    <div>
                        <Form.Label htmlFor="created_at_end">Created At (End)</Form.Label>
                        <Form.Control
                            type="date"
                            id="created_at_end"
                            value={createdAtEnd}
                            onChange={(e) => setCreatedAtEnd(e.target.value)}
                        />
                    </div>
                </Col>

                <Col md={3}>
                    <div>
                        <Form.Label htmlFor="phoneNumber">Phone</Form.Label>
                        <Form.Control type="text" placeholder="Search By Number" value={phoneNumber} name='phoneNumber' onChange={handlePhoneInputChange} />
                    </div>
                </Col>


                <Col md={1}>
                    <div style={{ marginTop: '28px', cursor: 'pointer' }} className='clear_filter_btn' onClick={handleClearFilters}>
                        <MdClear style={{ color: 'white', fontSize: '24px' }} />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default LeadSearch;
