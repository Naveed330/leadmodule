import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select'; // Import react-select
import { Row, Col, Form } from 'react-bootstrap';
import { MdClear } from "react-icons/md";

const LeadSearch = ({ onSearch, fetchLeadsData }) => {
    const [branch, setBranch] = useState([]);
    const [products, setProducts] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [users, setUsers] = useState([]);
    const [leadTypes, setLeadTypes] = useState([]);
    const [sources, setSources] = useState([]);
    const [clients, setClients] = useState([]);
    const [phone,setPhone]=useState('')

    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedLeadType, setSelectedLeadType] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [createdAtStart, setCreatedAtStart] = useState(''); // Start date
    const [createdAtEnd, setCreatedAtEnd] = useState(''); // End date

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pipelineResponse, productResponse, branchResponse, userResponse, leadTypeResponse, sourceResponse, clientResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/pipelines/get-pipelines`),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/get-all-products`),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/branch/get-branches`),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/get-users`),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/leadtypes/get-all-leadtypes`),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/sources/get/get-sources`),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/api/clients/get-clinets`),
                ]);

                setBranch(branchResponse.data);
                setProducts(productResponse.data);
                setPipelines(pipelineResponse.data);
                setUsers(userResponse.data);
                setLeadTypes(leadTypeResponse.data);
                setSources(sourceResponse.data);
                setClients(clientResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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
            branch: selectedBranch ? selectedBranch.value : '',
            pipeline: selectedPipeline ? selectedPipeline.value : '',
            product: selectedProduct ? selectedProduct.value : '',
            selected_users: selectedUsers.map((user) => user.value),
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
    }, [selectedPipeline, selectedProduct, selectedBranch, selectedUsers, selectedLeadType, selectedSource, selectedClient, createdAtStart, createdAtEnd]);

    const handleClearFilters = () => {
        setSelectedBranch(null);
        setSelectedProduct(null);
        setSelectedPipeline(null);
        setSelectedUsers([]);
        setSelectedLeadType(null);
        setSelectedSource(null);
        setSelectedClient(null);
        setCreatedAtStart('');
        setCreatedAtEnd('');
        fetchLeadsData();
    };

    return (
        <div className="lead-search">
            <h2>Search Leads</h2>

            <Row>
                <Col md={3}>
                    <div>
                        <label htmlFor="branch">Branch</label>
                        <Select
                            id="branch"
                            value={selectedBranch}
                            onChange={setSelectedBranch}
                            options={branch.map((b) => ({ value: b._id, label: b.name }))} // Fetching and mapping branch options
                            placeholder="Select branch"
                        />
                    </div>
                </Col>

                <Col md={3}>
                    <div>
                        <label htmlFor="product">Product</label>
                        <Select
                            id="product"
                            value={selectedProduct}
                            onChange={setSelectedProduct}
                            options={products.map((product) => ({ value: product._id, label: product.name }))}
                            placeholder="Select Product"
                        />
                    </div>
                </Col>

                <Col md={3}>
                    <div>
                        <label htmlFor="pipeline">Pipeline</label>
                        <Select
                            id="pipeline"
                            value={selectedPipeline}
                            onChange={setSelectedPipeline}
                            options={pipelines.map((pipeline) => ({ value: pipeline._id, label: pipeline.name }))}
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
                            options={users.map((user) => ({ value: user._id, label: user.name }))}
                            isMulti
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
            </Row>

            <Row>
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

                <Col md={3}>
                    <div>
                        <label htmlFor="client">Client</label>
                        <Select
                            id="client"
                            value={selectedClient}
                            onChange={setSelectedClient}
                            options={clients.map((client) => ({ value: client._id, label: client.name }))}
                            placeholder="Select Client"
                        />
                    </div>
                </Col>

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

                <Col md={2}>
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

                <Col md={1}>
                    <div style={{ marginTop: '28px' }} className='clear_filter_btn' onClick={handleClearFilters}>
                        <MdClear style={{ color: 'white', fontSize: '24px' }} />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default LeadSearch;