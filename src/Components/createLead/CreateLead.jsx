import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './CreateLead.css';
import { Button, Row, Col, Modal, Form } from 'react-bootstrap'
import Select from 'react-select';
import IntlTelInput from 'intl-tel-input/react';
import { GoCheck } from "react-icons/go";
import InputMask from "react-input-mask";

const CreateLead = ({ setModal2Open, modal2Open, fetchLeadsData }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [errors, setErrors] = useState({});
    const [isValidPhone, setIsValidPhone] = useState(null);
    const [apiData, setApiData] = useState([]);
    const [isDisable, setIsDisable] = useState(true)
    const [pipelineId, setPipelineId] = useState('');
    const [filteredPipelines, setFilteredPipelines] = useState([]);
    const [sources, setSources] = useState([]);
    const [selectedProductStage, setSelectedProductStage] = useState('');
    const [contactNumber, setContactNumber] = useState('')
    const [whatsappContact, setWhatsappContact] = useState('')
    const [eid, setEid] = useState('')
    const [clientName, setClientName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [branch, setBranch] = useState('')
    const [product, setProduct] = useState('')
    const [productStage, setProductStage] = useState([])
    const [leadType, setLeadType] = useState('')
    const [source, setSource] = useState('')
    const [leadDetails, setLeadDetails] = useState('')
    const [thirdparty, setThirdParty] = useState('')
    const [isValid, setIsValid] = useState(false);
    const [fullPhoneNumber, setFullPhoneNumber] = useState('');
    const [errorMessages, setErrorMessages] = useState({});
    const [matchingProduct, setMatchingProduct] = useState(false)
    const [notMatchingProduct, setNotMatchingProduct] = useState(false)
    const [checkTransfer, setCheckTransfer] = useState(false)
    const [disableField, setIsDisbleField] = useState(false)
    // Redux User Data
    const branchesSlice = useSelector(state => state.loginSlice.branches);
    const leadTypeSlice = useSelector(state => state.loginSlice.leadType);
    const productNamesSlice = useSelector(state => state.loginSlice.productNames);
    const pipelineSlice = useSelector(state => state.loginSlice.pipelines);
    const branchUserSlice = useSelector(state => state.loginSlice.user?.branch);
    const pipelineUserSlice = useSelector(state => state.loginSlice.user?.pipeline);
    const productUserSlice = useSelector(state => state.loginSlice.user?.products);
    const userRole = useSelector(state => state?.loginSlice?.user?.role)
    // Auth Token
    const token = useSelector(state => state.loginSlice.user?.token);
    const leadData = apiData.length > 0 ? apiData[0] : null;

    const regexPatterns = {
        clientName: /^[a-zA-Z\s]{3,20}$/, // Name must be between 3-50 characters long with only letters and spaces
        clientPhone: /^\+?[1-9][0-9]{6,8}$/, // Phone number pattern
        // clientEmail: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        // clientEID: /^\d{3}-\d{4}-\d{7}-\d{1}$/
    };

    const productPipelineMap = {
        'Business Banking': ['Business Banking'],
        'Personal Loan': ['EIB Bank', 'Personal Loan'],
        'Mortgage Loan': ['Mortgage', 'CEO Mortgage'],
    };

    useEffect(() => {
        if (product) {
            const selectedProductName = productNamesSlice.find(p => p._id === product)?.name;
            if (selectedProductName && productPipelineMap[selectedProductName]) {
                // Filter pipelines based on the selected product's mapped pipelines
                setFilteredPipelines(pipelineSlice.filter(pipeline => productPipelineMap[selectedProductName].includes(pipeline.name)));
            } else {
                setFilteredPipelines([]);
            }
        } else {
            // Reset filtered pipelines if no product is selected
            setFilteredPipelines(pipelineSlice);
        }
    }, [product, pipelineSlice, productNamesSlice]);

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

    // Fetch sources based on selected leadType
    useEffect(() => {
        const fetchSources = async () => {
            if (leadType) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/sources/${leadType}`, {
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
    }, [leadType, token]);

    const fetchProductStages = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/pipeline/${pipelineId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProductStage(response.data);
        } catch (error) {
            console.error('Error fetching product stages:', error);
        }
    };
    useEffect(() => {
        fetchProductStages();
    }, [pipelineId]);

    // Validate all fields before submission
    // const validateFields = (name, value) => {
    //     let newErrors = {};
    //     if (!regexPatterns.clientName.test(clientName)) {
    //         newErrors.clientName = "Please enter a valid name (3-20 characters, letters only).";
    //     }
    //     if (name === "clientPhone") {
    //         if (value.length < 9) {
    //             newErrors.clientPhone = "Phone number must be at least 9 digits.";
    //         } else if (value.length > 9) {
    //             newErrors.clientPhone = "Phone number must be at most 9 digits.";
    //         } else if (!regexPatterns.clientPhone.test(value)) {
    //             newErrors.clientPhone = "Please enter a valid phone number.";
    //         }
    //     }
    //     if (clientName) {
    //         newErrors.clientName = "Company Name is required.";
    //     }
    //     if (companyName) {
    //         newErrors.companyName = "Company Name is required.";
    //     }
    //     if (Pipeline) {
    //         newErrors.Pipeline = "Pipeline is required.";
    //     }
    //     if (product) {
    //         newErrors.product = "Products is required.";
    //     }
    //     if (leadType) {
    //         newErrors.leadType = "Lead Type is required.";
    //     }
    //     if (branch) {
    //         newErrors.branch = "Branch is required.";
    //     }
    //     if (productStage) {
    //         newErrors.productStage = "Product Stage is required.";
    //     }
    //     if (source) {
    //         newErrors.source = "Source is required.";
    //     }
    //     setErrors(newErrors);
    //     return Object.keys(newErrors).length === 0; // Return true if no errors
    // };

    // Handle form submission
    const handleSubmit = async () => {
        // Clear previous error messages
        setErrorMessages({});

        // Validate fields
        const newErrors = {};
        if (!contactNumber) newErrors.contactNumber = "Number is required.";
        if (!clientName) newErrors.clientName = "Name is required.";
        if (!selectedProductStage) newErrors.selectedProductStage = "Product stage is required.";
        if (!leadType) newErrors.leadType = "Lead type is required.";
        if (!pipelineId) newErrors.pipelineId = "Pipeline is required.";
        if (!product) newErrors.product = "Product is required.";
        if (!source) newErrors.source = "Source is required.";
        if (!branch) newErrors.branch = "Branch is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrorMessages(newErrors);
            return; // Stop submission if there are errors
        }

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/create-lead`, {
                clientPhone: contactNumber,
                clientw_phone: whatsappContact,
                clientName: clientName,
                clientEmail: clientEmail,
                cliente_id: eid,
                company_Name: companyName,
                product_stage: selectedProductStage,
                lead_type: leadType,
                pipeline: pipelineId,
                products: product,
                source: source,
                description: leadDetails,
                branch: branch,
                thirdpartyname: thirdparty,
                selected_users: selectedUsers
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchLeadsData(); // Refresh leads data after successful submission
            setModal2Open(true); // Close the modal
            setClientName('')
            setContactNumber('')
            setClientEmail('')
            setCompanyName('')
            setEid('')
            setLeadDetails('')
            setProductStage([])
            setBranch('')
            setProduct('')
            setPipelineId('')
            setLeadType('')
            setSource('')
            setIsDisbleField(true)
        } catch (error) {
            console.log(error, "Failed to submit form");
        }
    };

    // Update API
    const handleSaveChanges = async () => {
        const payload = {
            clientPhone: contactNumber,
            clientw_phone: whatsappContact,
            clientName: clientName,
            clientEmail: clientEmail,
            company_Name: companyName,
            cliente_id: eid,
            description: leadDetails || '',
            product_stage: selectedProductStage || '',
            lead_type: leadType || '',
            pipeline: pipelineId || '',
            products: product || '',
            source: source || '',
            branch: branch || '',
            selected_users: selectedUsers || [],
        };

        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/edit-lead/${leadData.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setModal2Open(false);
        } catch (error) {
            console.log(error, 'Error saving lead data');
        }
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
    const countryCode = '+971';
    const handleClientPhoneBlur = () => {
        const phoneNumber = contactNumber.replace(/\D/g, ''); // Extract digits only

        // Validate phone number length
        if (phoneNumber.length !== 9) {
            setErrors((prevErrors) => ({ ...prevErrors, clientPhone: "Phone number must be exactly 9 digits" }));
            setIsValidPhone(false); // Reset validity if invalid
            return;
        }

        if (phoneNumber) {
            const completePhoneNumber = `+971${phoneNumber}`; // Prepend country code
            debouncedCheckClientPhone(completePhoneNumber); // Call the debounced function
        }
    };

    const handlePhoneInputChange = (e) => {
        const value = e.target.value;

        // Remove existing error when user starts typing
        setErrors((prevErrors) => ({ ...prevErrors, clientPhone: '' }));

        // Check if the value starts with '0'
        let processedValue = value;
        if (processedValue.startsWith('0')) {
            // Replace the leading '0' with the second digit if it exists
            const secondDigit = processedValue.charAt(1);
            if (secondDigit) {
                processedValue = secondDigit + processedValue.slice(2); // Remove the '0' and prepend the second digit
            } else {
                processedValue = processedValue.slice(1); // If no second digit, just remove '0'
            }
        }

        // Remove non-digit characters and limit to 9 digits
        const digitsOnly = processedValue.replace(/\D/g, '').slice(0, 9);

        // Format the value to match the desired format
        // Example: Adjust to "99 999 9999"
        const formattedValue = digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');

        setContactNumber(formattedValue); // Update state with formatted value
        if (errorMessages.contactNumber) {
            setErrorMessages((prev) => ({ ...prev, contactNumber: '' }));
        }
        setFullPhoneNumber(`+971${digitsOnly}`); // Update state with full phone number including country code
    };

    const handleEidInputChange = (e) => {
        setEid(e.target.value)
    }

    // Handle Input Change Name
    const handleClientNameHandler = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Z\s]{3,20}$/;

        // Set client name value
        setClientName(value);

        // Validate client name
        if (!regex.test(value)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                clientName: 'Name must be between 3 to 20 characters and contain only letters',
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                clientName: '', // Clear the error if valid
            }));
        }
        if (errorMessages.clientName) {
            setErrorMessages((prev) => ({ ...prev, clientName: '' }));
        }
    };

    const handleCompanyInputChange = (e) => {
        setCompanyName(e.target.value)
    }

    const handleEmailInputChange = (e) => {
        setClientEmail(e.target.value)
    }


    const handleBranchname = (e) => {
        setBranch(e.target.value)
        if (errorMessages.branch) {
            setErrorMessages((prev) => ({ ...prev, branch: '' }));
        }
    }

    const handleProductInputChange = async (e) => {
        const selectedProductId = e.target.value;
        setProduct(selectedProductId);
        setPipelineId(''); // Reset pipeline ID when the product changes

        if (errorMessages.product) {
            setErrorMessages((prev) => ({ ...prev, product: '' }));
        }

        // Check if apiData exists and has items
        if (Array.isArray(apiData) && apiData.length > 0) {
            const matchingProduct = apiData.find(dataItem =>
                dataItem.products?._id === selectedProductId
            );

            if (matchingProduct) {
                // Check if product is rejected
                if (matchingProduct.isRejected) {
                    // Set all the necessary fields for rejected product
                    setClientName(matchingProduct.client.name);
                    setClientEmail(matchingProduct.client.email);
                    setContactNumber(matchingProduct.client.phone);
                    setLeadDetails(matchingProduct.description);
                    setCompanyName(matchingProduct.companyName);
                    setEid(matchingProduct.eid);
                    setBranch(matchingProduct.branch._id);
                    setLeadType(matchingProduct.leadType._id);
                    setSource(matchingProduct.source._id);
                    setPipelineId(matchingProduct.pipeline._id);
                    setModal2Open(true); // Open modal for rejected product
                    return; // Exit early since product is rejected
                }

                // Continue with matching pipeline logic
                if (Array.isArray(matchingProduct.products.pipeline_id) && matchingProduct.products.pipeline_id.length > 0) {
                    const productPipelineId = matchingProduct.products.pipeline_id[0];
                    console.log(matchingProduct.pipeline._id, 'productPipelineId', productPipelineId)
                    if (productPipelineId === matchingProduct.pipeline._id) {
                        // Product and pipeline match
                        console.log("Product and pipeline match");
                        setPipelineId(productPipelineId);
                        setMatchingProduct(true);
                        setNotMatchingProduct(false);
                        setModal2Open(false);
                        showModalWithMatch(matchingProduct); // Show matching modal
                    } else {
                        // Product and pipeline do not match
                        console.log("Product and pipeline do not match");
                        setCheckTransfer(true);
                        setMatchingProduct(false);
                        // setNotMatchingProduct(true); 
                        setModal2Open(false);
                        showModalWithNoMatch(); // Show non-matching modal
                    }
                } else {
                    // No pipeline exists for the product
                    console.log("No pipeline exists for the product");
                    setCheckTransfer(true);
                    setMatchingProduct(false); // Ensure matching modal is closed
                    // setNotMatchingProduct(true); 
                    setModal2Open(false);
                    showModalWithNoMatch(); // Show non-matching modal
                }
            } else {
                // No matching product found in the API data
                console.log("No matching product found");
                setCheckTransfer(true);
                setMatchingProduct(false); // Close matching modal
                // setNotMatchingProduct(true);
                setModal2Open(false);
                showModalWithNoMatch(); // Show non-matching modal
            }
        } else {
            // Invalid apiData or empty data
            console.log("Invalid or empty apiData");
            showModalWithNoMatch(); // Show non-matching modal if apiData is invalid
        }
    };

    const handlePipelineInputChange = (e) => {
        setPipelineId(e.target.value);
        if (errorMessages.pipelineId) {
            setErrorMessages((prev) => ({ ...prev, pipelineId: '' }));
        }
    };

    const CloseNotMatchingHandler = () => {
        setNotMatchingProduct(false);
        // setModal2Open(true);
    }

    // Example functions to show modals
    const showModalWithMatch = (product) => {
        // Logic to display modal with product details
        console.log('Matched product:', product);
        // You can use a modal library or your custom modal implementation here
    };

    const showModalWithNoMatch = () => {
        // Logic to display modal indicating no match found
        console.log('No matching product found.');
        // You can use a modal library or your custom modal implementation here
    };

    const handleSourceInputChange = (e) => {
        setSource(e.target.value)
        if (errorMessages.source) {
            setErrorMessages((prev) => ({ ...prev, source: '' }));
        }
    }
    const handleLeadDetailsInputChange = (e) => {
        setLeadDetails(e.target.value)
    }
    const handleInputChangeProductstage = (e) => {
        setSelectedProductStage(e.target.value);
        if (errorMessages.selectedProductStage) {
            setErrorMessages((prev) => ({ ...prev, selectedProductStage: '' }));
        }
    }
    const handleInputChangeLeadType = (e) => {
        setLeadType(e.target.value)
        if (errorMessages.leadType) {
            setErrorMessages((prev) => ({ ...prev, leadType: '' }));
        }
    }

    // Input change handler
    const handleInputChange = (isValidNumber, value, countryData, fullNumber, event) => {
        setWhatsappContact(value); // Update state with the new value

        // countryData might still be undefined, so we check for it
        if (countryData) {
            setIsValid(isValidNumber); // Check if the number is valid
        } else {
            setIsValid(false); // Fallback if countryData is undefined
        }
    };

    const userOptions = allUsers
        .filter(user => user.role === 'TS Team Leader') // Filter users by role
        .map(user => ({
            value: user._id,
            label: user.name
        }));

    const handlethirdpartyInputChange = (e) => {
        setThirdParty(e.target.value)
    }

    const TransferCase = () => {
        setCheckTransfer(false)
        setNotMatchingProduct(true)
    }

    const createNewLead = () => {
        setCheckTransfer(false)
        setModal2Open(true)
    }

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
                                        value={contactNumber}
                                        onChange={handlePhoneInputChange}
                                        onBlur={handleClientPhoneBlur}
                                        isInvalid={!!errors.clientPhone}
                                        // disabled={disableField}
                                    />
                                    {errorMessages.contactNumber && <div className="text-danger"><p style={{ fontSize: '12px' }} >{errorMessages.contactNumber}</p> </div>}
                                </Form.Group>
                            </Col>

                            {/* WhatsApp Number */}
                            <Col md={4}>
                                <Form.Label>WhatsApp Number</Form.Label>
                                <IntlTelInput
                                    initialValue={whatsappContact}
                                    onChangeNumber={handleInputChange} // Use the corrected input change handler
                                    initOptions={{
                                        initialCountry: "ae",
                                    }}
                                    className='intel_value'
                                />
                            </Col>

                            {/* Emirates ID */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="clientEID">
                                    <Form.Label>Emirates ID</Form.Label>
                                    <InputMask
                                        mask="999-9999-9999999-9"
                                        value={eid}
                                        onChange={handleEidInputChange}

                                    >
                                        {(inputProps) => (
                                            <Form.Control
                                                {...inputProps}
                                                type="text"
                                                placeholder="784-1234-1234567-1"
                                                name="clientEID"
                                                isInvalid={!!errors.clientEID}
                                            />
                                        )}
                                    </InputMask>

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
                                        value={clientName}
                                        onChange={handleClientNameHandler}
                                        onPaste={handleClientNameHandler}
                                        isInvalid={!!errors.clientName}
                                        disabled={disableField}
                                    />
                                    {errorMessages.clientName && <div className="text-danger"><p style={{ fontSize: '12px' }}>{errorMessages.clientName} </p></div>}
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
                                        value={companyName}
                                        onChange={handleCompanyInputChange}
                                        disabled={disableField}
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
                                        value={clientEmail}
                                        onChange={handleEmailInputChange}
                                        isInvalid={!!errors.clientEmail}
                                        disabled={disableField}
                                    />
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
                                            value={branch}
                                            onChange={handleBranchname}
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
                                        {errorMessages.branch && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.branch}</p> </div>}
                                    </Form.Group>
                                </Col>

                                {/* Product Select Dropdown */}
                                {!productUserSlice && (
                                    <Col md={4}>
                                        <Form.Group controlId="product">
                                            <Form.Label>Product</Form.Label>
                                            <Form.Select
                                                aria-label="Select Product"
                                                name="product"
                                                value={product}
                                                onChange={handleProductInputChange}
                                            >
                                                <option value="">Select Product</option>
                                                {productNamesSlice.map(p => (
                                                    <option key={p._id} value={p._id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            {errorMessages.product && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.product}</p> </div>}
                                        </Form.Group>
                                    </Col>
                                )}

                                {/* Pipeline Select Dropdown */}
                                {pipelineUserSlice?.length === 0 && (
                                    <Col md={4}>
                                        <Form.Label>Pipeline</Form.Label>
                                        <Form.Select
                                            aria-label="Select Pipeline"
                                            name="pipeline"
                                            value={pipelineId}
                                            onChange={handlePipelineInputChange}
                                        >
                                            <option value="">Select Pipeline</option>
                                            {filteredPipelines.map(pipeline => (
                                                <option key={pipeline._id} value={pipeline._id}>
                                                    {pipeline.name}
                                                </option>
                                            ))}
                                            {errorMessages.pipelineId && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.pipelineId}</p> </div>}
                                        </Form.Select>
                                    </Col>
                                )}


                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="product_stage">
                                        <Form.Label>Product Stages</Form.Label>
                                        <Form.Select
                                            aria-label="Select Product Stage"
                                            name="product_stage"
                                            value={selectedProductStage}
                                            onChange={handleInputChangeProductstage}
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
                                        {errorMessages.selectedProductStage && <div className="text-danger"><p style={{ fontSize: '12px' }}>{errorMessages.selectedProductStage}</p></div>}
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="lead_type">
                                        <Form.Label>Lead Type</Form.Label>
                                        <Form.Select
                                            aria-label="Select Lead Type"
                                            name="lead_type"
                                            value={leadType}
                                            onChange={handleInputChangeLeadType}
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
                                        {errorMessages.leadType && <div className="text-danger"><p style={{ fontSize: '12px' }}>{errorMessages.leadType} </p> </div>}
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="source">
                                        <Form.Label>Source</Form.Label>
                                        <Form.Select
                                            aria-label="Select Source"
                                            name="source"
                                            value={source}
                                            onChange={handleSourceInputChange}
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
                                        {errorMessages.source && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.source}</p> </div>}
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Row>

                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="description">
                                    <Form.Label>Lead Details</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={1}
                                        name="description"
                                        value={leadDetails}
                                        onChange={handleLeadDetailsInputChange}
                                        isInvalid={!!errors.description}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                {leadType.name === "others" && source.name === "Third Party" && (
                                    <Form.Group className="mb-3" controlId="thirdparty">
                                        <Form.Label>Third Party Name</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={1}
                                            name="thirdparty"
                                            value={thirdparty}
                                            onChange={handlethirdpartyInputChange}
                                        />
                                    </Form.Group>
                                )}
                            </Col>

                            <Col md={4} >
                                {(userRole === 'TS Agent' || userRole === 'TS Team Leader') && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Users</Form.Label>
                                        <Select
                                            options={userOptions} // Pass the filtered user options
                                            value={selectedUsers} // Value for the selected users
                                            onChange={(options) => {
                                                setSelectedUsers(options); // Update the selected users
                                            }}
                                            isMulti // Allow multiple user selection
                                            placeholder="Select users..."
                                        />
                                    </Form.Group>
                                )}
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setModal2Open(false)}>
                        Close
                    </Button>

                    <Button className='all_single_leads_button' onClick={handleSaveChanges}>
                        Update
                    </Button>

                    <Button className='all_single_leads_button' onClick={handleSubmit}>
                        Submit
                    </Button>

                </Modal.Footer>
            </Modal>

            {/* Matching Model */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={matchingProduct}
                onHide={() => setMatchingProduct(false)}
            >
                <Modal.Body>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                        <GoCheck style={{ fontSize: '100px', color: 'green' }} />
                    </div>
                    <p className='text-center' >
                        Lead Already Exist
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setMatchingProduct(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Check if Product is different then show a modal with two button create new lead or Transfer */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={checkTransfer}
                onHide={() => setCheckTransfer(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Create New Lead or Transfer
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Product in Lead is not same! Would You Like to Create New Lead or Transfer Case...
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => TransferCase()} >Transfer</Button>
                    <Button onClick={() => createNewLead()} >Create New Lead</Button>
                </Modal.Footer>
            </Modal>

            {/* if Lead Not Exist */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={notMatchingProduct}
                onHide={() => setNotMatchingProduct(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Transfer Leads
                    </Modal.Title>
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
                                        value={contactNumber}
                                        onChange={handlePhoneInputChange}
                                        onBlur={handleClientPhoneBlur}
                                        isInvalid={!!errors.clientPhone}
                                    />
                                    {errorMessages.contactNumber && <div className="text-danger"><p style={{ fontSize: '12px' }} >{errorMessages.contactNumber}</p> </div>}
                                </Form.Group>
                            </Col>

                            {/* WhatsApp Number */}
                            <Col md={4}>
                                <Form.Label>WhatsApp Number</Form.Label>
                                <IntlTelInput
                                    initialValue={whatsappContact}
                                    onChangeNumber={handleInputChange} // Use the corrected input change handler
                                    initOptions={{
                                        initialCountry: "ae",
                                    }}
                                    className='intel_value'
                                />
                            </Col>

                            {/* Emirates ID */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="clientEID">
                                    <Form.Label>Emirates ID</Form.Label>
                                    <InputMask
                                        mask="999-9999-9999999-9"
                                        value={eid}
                                        onChange={handleEidInputChange}
                                    >
                                        {(inputProps) => (
                                            <Form.Control
                                                {...inputProps}
                                                type="text"
                                                placeholder="784-1234-1234567-1"
                                                name="clientEID"
                                                isInvalid={!!errors.clientEID}
                                            />
                                        )}
                                    </InputMask>
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
                                        value={clientName}
                                        onChange={handleClientNameHandler}
                                        onPaste={handleClientNameHandler}
                                        isInvalid={!!errors.clientName}
                                    />
                                    {errorMessages.clientName && <div className="text-danger"><p style={{ fontSize: '12px' }}>{errorMessages.clientName} </p></div>}
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
                                        value={companyName}
                                        onChange={handleCompanyInputChange}
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
                                        value={clientEmail}
                                        onChange={handleEmailInputChange}
                                        isInvalid={!!errors.clientEmail}
                                    />
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
                                            value={branch}
                                            onChange={handleBranchname}
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
                                        {errorMessages.branch && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.branch}</p> </div>}
                                    </Form.Group>
                                </Col>

                                {/* Product Select Dropdown */}
                                {!productUserSlice && (
                                    <Col md={4}>
                                        <Form.Group controlId="product">
                                            <Form.Label>Product</Form.Label>
                                            <Form.Select
                                                aria-label="Select Product"
                                                name="product"
                                                value={product}
                                                onChange={handleProductInputChange}
                                            >
                                                <option value="">Select Product</option>
                                                {productNamesSlice.map(p => (
                                                    <option key={p._id} value={p._id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            {errorMessages.product && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.product}</p> </div>}
                                        </Form.Group>
                                    </Col>
                                )}

                                {/* Pipeline Select Dropdown */}
                                {pipelineUserSlice?.length === 0 && (
                                    <Col md={4}>
                                        <Form.Label>Pipeline</Form.Label>
                                        <Form.Select
                                            aria-label="Select Pipeline"
                                            name="pipeline"
                                            value={pipelineId}
                                            onChange={handlePipelineInputChange}
                                        >
                                            <option value="">Select Pipeline</option>
                                            {filteredPipelines.map(pipeline => (
                                                <option key={pipeline._id} value={pipeline._id}>
                                                    {pipeline.name}
                                                </option>
                                            ))}
                                            {errorMessages.pipelineId && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.pipelineId}</p> </div>}
                                        </Form.Select>
                                    </Col>
                                )}


                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="product_stage">
                                        <Form.Label>Product Stages</Form.Label>
                                        <Form.Select
                                            aria-label="Select Product Stage"
                                            name="product_stage"
                                            value={selectedProductStage}
                                            onChange={handleInputChangeProductstage}
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
                                        {errorMessages.selectedProductStage && <div className="text-danger"><p style={{ fontSize: '12px' }}>{errorMessages.selectedProductStage}</p></div>}
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="lead_type">
                                        <Form.Label>Lead Type</Form.Label>
                                        <Form.Select
                                            aria-label="Select Lead Type"
                                            name="lead_type"
                                            value={leadType}
                                            onChange={handleInputChangeLeadType}
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
                                        {errorMessages.leadType && <div className="text-danger"><p style={{ fontSize: '12px' }}>{errorMessages.leadType} </p> </div>}
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="source">
                                        <Form.Label>Source</Form.Label>
                                        <Form.Select
                                            aria-label="Select Source"
                                            name="source"
                                            value={source}
                                            onChange={handleSourceInputChange}
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
                                        {errorMessages.source && <div className="text-danger"> <p style={{ fontSize: '12px' }}>{errorMessages.source}</p> </div>}
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Row>

                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="description">
                                    <Form.Label>Lead Details</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={1}
                                        name="description"
                                        value={leadDetails}
                                        onChange={handleLeadDetailsInputChange}
                                        isInvalid={!!errors.description}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                {leadType.name === "others" && source.name === "Third Party" && (
                                    <Form.Group className="mb-3" controlId="thirdparty">
                                        <Form.Label>Third Party Name</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={1}
                                            name="thirdparty"
                                            value={thirdparty}
                                            onChange={handlethirdpartyInputChange}
                                        />
                                    </Form.Group>
                                )}
                            </Col>

                            <Col md={4} >
                                {(userRole === 'TS Agent' || userRole === 'TS Team Leader') && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Users</Form.Label>
                                        <Select
                                            options={userOptions} // Pass the filtered user options
                                            value={selectedUsers} // Value for the selected users
                                            onChange={(options) => {
                                                setSelectedUsers(options); // Update the selected users
                                            }}
                                            isMulti // Allow multiple user selection
                                            placeholder="Select users..."
                                        />
                                    </Form.Group>
                                )}
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setNotMatchingProduct(false)} >Transfer</Button>
                    <Button onClick={CloseNotMatchingHandler} >Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CreateLead;