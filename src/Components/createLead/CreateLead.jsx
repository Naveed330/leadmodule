import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './CreateLead.css';
import { Button, Row, Col, Modal, Form } from 'react-bootstrap'
import Select from 'react-select';
import IntlTelInput from 'intl-tel-input/react';
import { TiDeleteOutline } from "react-icons/ti";


const CreateLead = ({ setModal2Open, modal2Open, fetchLeadsData }) => {
    // Redux Data
    const branchesSlice = useSelector(state => state.loginSlice.branches);
    const leadTypeSlice = useSelector(state => state.loginSlice.leadType);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(true);
    const [isValidPhone, setIsValidPhone] = useState(null);
    const [clientExistsError, setClientExistsError] = useState("");
    const [apiData, setApiData] = useState([]);
    const [productExist, setProductExist] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [filteredPipelines, setFilteredPipelines] = useState([]);
    const [productStage, setProductStage] = useState([]);
    const [pipelineId, setPipelineId] = useState('');

    console.log(pipelineId,'pipelineId')

    // Redux User Data
    const productNamesSlice = useSelector(state => state.loginSlice.productNames);
    const pipelineSlice = useSelector(state => state.loginSlice.pipelines);
    const branchUserSlice = useSelector(state => state.loginSlice.user?.branch);
    const pipelineUserSlice = useSelector(state => state.loginSlice.user?.pipeline);
    const productUserSlice = useSelector(state => state.loginSlice.user?.products);

    console.log(selectedProduct, filteredPipelines, 'pipelineSlice')

    // Auth Token
    const token = useSelector(state => state.loginSlice.user?.token);

    const regexPatterns = {
        clientName: /^[a-zA-Z\s]{3,10}$/, // Name must be between 3-50 characters long with only letters and spaces
        clientPhone: /^\+?[1-9][0-9]{6,8}$/, // Phone number pattern
        clientEmail: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Email pattern
        clientEID: /^\d{3}-\d{4}-\d{7}-\d{1}$/
    };

    const productPipelineMap = {
        'Business Banking': ['Business Banking'],
        'Personal Loan': ['EIB Bank', 'Personal Loan'],
        'Mortgage Loan': ['Mortgage', 'CEO Mortgage'],
    };

    // State for form fields
    const [formData, setFormData] = useState({
        clientPhone: '',
        clientWhatsappPhone: '',
        clientEID: '',
        clientName: '',
        clientEmail: '',
        company_Name: '',
        products: productUserSlice || null,
        product_stage: '',
        lead_type: '',
        pipeline: pipelineUserSlice?.[0] || pipelineUserSlice, // Set default to first item if available
        branch: branchUserSlice || null, // Default branch if user branch is available
        source: '',
        description: '',
        user: ''
    });

    console.log(formData.pipeline, 'pipelinepipeline')

    useEffect(() => {
        if (selectedProduct) {
            const productName = productNamesSlice.find(product => product._id === selectedProduct)?.name;
            if (productName && productPipelineMap[productName]) {
                setFilteredPipelines(pipelineSlice.filter(pipeline => productPipelineMap[productName].includes(pipeline.name)));
            }
        } else {
            setFilteredPipelines(pipelineSlice);
        }
    }, [selectedProduct, pipelineSlice, productNamesSlice]);

    // Fetch all users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/get-users`);
                setAllUsers(response.data);
            } catch (error) {
                console.log(error, 'err');
            }
        };
        fetchData();
    }, []);

    // Prepare options for the select dropdown
    const userOptions = allUsers.map(user => ({
        value: user._id,
        label: user.name
    }));


    // State for sources and stages
    const [sources, setSources] = useState([]);

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

    // Handle input change and remove errors if valid
    const countryCode = '+971';
    const handleInputChange = (e) => {
        const selectedProductId = e.target.value;
        setSelectedProduct(e.target.value)
        setPipelineId(e.target.value)

        // Check if selected productId matches any productId from API response
        const clientExists = apiData.some((client) => client.productId === selectedProductId);

        if (clientExists) {
            setClientExistsError("Client already exists for this product.");
            setProductExist(true);
        } else {
            setClientExistsError("");
            setProductExist(false);
        }
        const { name, value: rawValue } = e.target; // Use rawValue to keep the original value
        let value = rawValue;

        const completePhoneNumber = `+971 ${value}`; // Concatenate country code
        if (value.length >= 7) { // Assuming phone numbers are at least 7 digits long
            debouncedCheckClientPhone(completePhoneNumber);
        }

        // Handle phone number input to remove leading zero if present
        if (name === "clientPhone") {
            // Remove leading zero
            if (value.startsWith('0')) {
                // Update value to remove the leading zero
                value = value.substring(1);
            }

            debouncedCheckClientPhone(value);
        }

        setFormData({ ...formData, [name]: value });

        // Validate field when value changes
        if (regexPatterns[name]?.test(value)) {
            setErrors((prev) => ({ ...prev, [name]: "" })); // Remove error if valid
        } else {
            setErrors((prev) => ({ ...prev, [name]: "Invalid input" })); // Set error if invalid
        }

        validateFields(name, value)
    };

    // Validate all fields before submission
    const validateFields = (name, value) => {
        let newErrors = {};
        if (!regexPatterns.clientName.test(formData.clientName)) {
            newErrors.clientName = "Please enter a valid name (3-10 characters, letters only).";
        }
        if (name === "clientPhone") {
            // Check for valid length
            if (value.length < 9) {
                newErrors.clientPhone = "Phone number must be at least 9 digits.";
            } else if (value.length > 9) {
                newErrors.clientPhone = "Phone number must be at most 9 digits.";
            } else if (!regexPatterns.clientPhone.test(value)) {
                newErrors.clientPhone = "Please enter a valid phone number.";
            }
        }
        if (!regexPatterns.clientEmail.test(formData.clientEmail)) {
            newErrors.clientEmail = "Please enter a valid email address.";
        }
        if (!regexPatterns.clientEID.test(formData.clientEID)) {
            newErrors.clientEID = "Emirates ID must be 15 digits long.";
        }

        // Check required fields
        // if (!formData.clientWhatsappPhone) {
        //     newErrors.clientWhatsappPhone = "WhatsApp Number is required.";
        // }
        if (!formData.company_Name) {
            newErrors.company_Name = "Company Name is required.";
        }
        if (!formData.pipeline) {
            newErrors.pipeline = "Pipeline is required.";
        }
        if (!formData.products) {
            newErrors.products = "Products is required.";
        }
        if (!formData.lead_type) {
            newErrors.lead_type = "Lead Type is required.";
        }

        if (!formData.user) {
            newErrors.user = "Please Select Atleast One User";
        }

        if (!formData.branch) {
            newErrors.branch = "Branch is required.";
        }
        if (!formData.products) {
            newErrors.products = "Products is required.";
        }
        if (!formData.pipeline) {
            newErrors.pipeline = "Pipeline is required.";
        }
        if (!formData.product_stage) {
            newErrors.product_stage = "Product Stage is required.";
        }
        if (!formData.lead_type) {
            newErrors.lead_type = "Lead Type is required.";
        }
        if (!formData.source) {
            newErrors.source = "Source is required.";
        }

        if (!formData.description) {
            newErrors.description = "Lead Details is required.";
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (validateFields()) {
            try {
                await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/create-lead`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                fetchLeadsData();
                setModal2Open(false);
            } catch (error) {
                console.log(error, "Failed to submit form");
            }
        }
    };

    // Validation function for the phone number
    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^[0-9]{9}$/; // Regex to check if the number has exactly 9 digits
        return phoneRegex.test(phoneNumber);
    };
    // Debounce function
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    }
    // API call to check client phone
    const checkClientPhone = async (completePhoneNumber) => {
        try {
            const responseData = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/check-client-phone`, {
                clientPhone: completePhoneNumber // Use the complete phone number
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setApiData(responseData.data);
            console.log(responseData.data, 'responseDataresponseData')
            setIsValidPhone(true); // or false based on your validation logic
        } catch (error) {
            setIsValidPhone(false);
        }
    };

    // Debounced version of checkClientPhone
    const debouncedCheckClientPhone = debounce((phoneNumber) => {
        if (phoneNumber) {
            checkClientPhone(phoneNumber); // Pass the complete phone number
        }
    }, 500); // 500ms delay

    // Function to handle the blur event
    const handleClientPhoneBlur = () => {
        const phoneNumber = formData.clientPhone;

        // Validate phone number length
        if (!validatePhoneNumber(phoneNumber)) {
            setErrors((prevErrors) => ({ ...prevErrors, clientPhone: "Phone number must be 9 digits" }));
            return;
        }
        if (formData.clientPhone) {
            const completePhoneNumber = `+971${formData.clientPhone}`;
            checkClientPhone(completePhoneNumber);
        }
    };

    return (
        <>
            <Modal
                title="Create Lead"
                centered
                show={modal2Open}
                onHide={() => setModal2Open(false)}
                size="xl"
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title>Create Lead</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            {/* Client Phone */}
                            <Col md={1}>
                                <Form.Group className="mb-3" controlId="clientPhone">
                                    <Form.Label>Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="+971"
                                        value="+971"
                                        disabled
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group className="mb-3" controlId="clientPhone">
                                    <Form.Label>Client Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Number"
                                        name="clientPhone"
                                        value={formData.clientPhone.replace(countryCode + ' ', '')} // Display without the country code
                                        onChange={handleInputChange}
                                        onBlur={handleClientPhoneBlur}
                                        isInvalid={!!errors.clientPhone}
                                    />
                                    {errors.clientPhone && <div className="text-danger">{errors.clientPhone}</div>}
                                </Form.Group>
                            </Col>

                            {/* WhatsApp Number */}
                            <Col md={4}>

                                <Form.Label>WhatsApp Number</Form.Label>
                                <IntlTelInput
                                    initialValue={formData.clientWhatsappPhone}
                                    // onChangeNumber={handleInputChange}
                                    onChangeValidity={setIsValid}
                                    // onChangeErrorCode={!!errors.clientPhone}
                                    initOptions={{
                                        initialCountry: "ae",
                                    }}
                                    className='intel_value'
                                />
                                {errors.clientPhone && <div className="text-danger">{errors.clientPhone}</div>}
                            </Col>

                            {/* Emirates ID */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="clientEID">
                                    <Form.Label>Emirates ID</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Emirates ID"
                                        name="clientEID"
                                        value={formData.clientEID}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.clientEID}
                                    />
                                    {errors.clientEID && <div className="text-danger">{errors.clientEID}</div>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            {/* Client Name */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="clientName">
                                    <Form.Label>Client Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Name"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.clientName}
                                    />
                                    {errors.clientName && <div className="text-danger">{errors.clientName}</div>}
                                </Form.Group>
                            </Col>

                            {/* Company Name */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="company_Name">
                                    <Form.Label>Company Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Company Name"
                                        name="company_Name"
                                        value={formData.company_Name}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Client Email */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="clientEmail">
                                    <Form.Label>Client Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter Email"
                                        name="clientEmail"
                                        value={formData.clientEmail}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.clientEmail}
                                    />
                                    {errors.clientEmail && <div className="text-danger">{errors.clientEmail}</div>}
                                </Form.Group>
                            </Col>
                        </Row>

                        {!branchUserSlice && (
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="branch">
                                        <Form.Label>Branch</Form.Label>
                                        <Form.Select
                                            aria-label="Select Branch"
                                            name="branch"
                                            value={formData.branch}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.branch}
                                        >
                                            <option value="">Select Branch</option>
                                            {branchesSlice.map((branch, index) => (
                                                <option key={index} value={branch._id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.branch}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {!productUserSlice && (
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId="products">
                                            <Form.Label>Products</Form.Label>
                                            <Form.Select
                                                aria-label="Select Product"
                                                name="products"
                                                value={formData.products}
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.products}
                                            >
                                                <option value="">Select Product</option>
                                                {productNamesSlice.map((product, index) => (
                                                    <option key={index} value={product._id}>
                                                        {product?.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.products}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                )}

                                {pipelineUserSlice?.length === 0 && (
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId="pipeline">
                                            <Form.Label>Pipeline</Form.Label>
                                            <Form.Select
                                                aria-label="Select Pipeline"
                                                name="pipeline"
                                                value={formData.pipeline} // Default to empty if no selection
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.pipeline}
                                            >
                                                <option value="">Select Pipeline</option>
                                                {filteredPipelines.map(pipeline => (
                                                    <option key={pipeline._id} value={pipeline._id}>
                                                        {pipeline.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.pipeline}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                )}


                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="product_stage">
                                        <Form.Label>Product Stages</Form.Label>
                                        <Form.Select
                                            aria-label="Select Product Stage"
                                            name="product_stage"
                                            value={formData.product_stage}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.product_stage}

                                        >
                                            <option value="">Select Product Stage</option>
                                            {productStage.map(stage => (
                                                <option key={stage._id} value={stage._id}>
                                                    {stage.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.product_stage}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="lead_type">
                                        <Form.Label>Lead Type</Form.Label>
                                        <Form.Select
                                            aria-label="Select Lead Type"
                                            name="lead_type"
                                            value={formData.lead_type}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.lead_type}
                                        >
                                            <option value="">Select Lead Type</option>
                                            {leadTypeSlice.map((type, index) => (
                                                <option key={index} value={type._id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.lead_type}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="source">
                                        <Form.Label>Source</Form.Label>
                                        <Form.Select
                                            aria-label="Select Source"
                                            name="source"
                                            value={formData.source}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.source}
                                        >
                                            <option value="">Select Source</option>
                                            {sources.map((source, index) => (
                                                <option key={index} value={source._id}>
                                                    {source.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.source}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                        <Row>
                            <Col md={6} >
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Users</Form.Label>
                                        <Select
                                            options={userOptions}
                                            value={selectedUsers}
                                            onChange={(options) => { setSelectedUsers(options) }}
                                            isMulti // Enable multi-select
                                            placeholder="Select users..."
                                            isInvalid={!!errors.user}
                                        />
                                    </Form.Group>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.user}
                                    </Form.Control.Feedback>
                                </Form>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="description">
                                    <Form.Label>Lead Details</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={1}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.description}
                                    />
                                    {errors.description && <div className="text-danger">{errors.description}</div>}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setModal2Open(false)}>
                        Close
                    </Button>
                    <Button className='all_single_leads_button' onClick={handleSubmit}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Check Product ID */}
            <Modal
                show={productExist}
                onHide={() => setProductExist(false)}
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Body>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                        <TiDeleteOutline style={{ color: 'red', fontSize: '90px' }} />
                    </div>

                    <p>
                        {clientExistsError}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setProductExist(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>

    );


};

export default CreateLead;



