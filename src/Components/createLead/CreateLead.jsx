import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './CreateLead.css';
import { Button, Row, Col, Modal, Form } from 'react-bootstrap'
import Select from 'react-select';
import IntlTelInput from 'intl-tel-input/react';
import { GoCheck } from "react-icons/go";
import InputMask from "react-input-mask";


const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const CreateLead = ({ setModal2Open, modal2Open, fetchLeadsData }) => {
    // Redux User Data
    const branchesSlice = useSelector(state => state.loginSlice.branches);
    const leadTypeSlice = useSelector(state => state.loginSlice.leadType);
    const productNamesSlice = useSelector(state => state.loginSlice.productNames);
    const pipelineSlice = useSelector(state => state.loginSlice.pipelines);
    const branchUserSlice = useSelector(state => state.loginSlice.user?.branch);
    const pipelineUserSlice = useSelector(state => state.loginSlice.user?.pipeline);
    const productUserSlice = useSelector(state => state.loginSlice.user?.products);
    const userRole = useSelector(state => state?.loginSlice?.user?.role)
    const userPipeline = useSelector(state => state?.loginSlice?.user?.pipeline)
    const userBranch = useSelector(state => state?.loginSlice?.user?.branch)
    const userProduct = useSelector(state => state?.loginSlice?.user?.products)
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [errors, setErrors] = useState({});
    const [isValidPhone, setIsValidPhone] = useState(null);
    const [disableField, setDisableField] = useState(true);
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
    const [movePipeline, setMovePipeline] = useState(false)
    const [apiData, setApiData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('')
    const [isClientNameDisabled, setIsClientNameDisabled] = useState(false);
    // Auth Token
    const token = useSelector(state => state.loginSlice.user?.token);
    // const leadData = apiData.length > 0 ? apiData[0] : null;
    console.log(branch, 'leadData')

    const productPipelineMap = {
        'Business': ['Business Banking'],
        'Personal Loan': ['EIB Bank', 'Personal Loan'],
        'Mortgage Loan': ['Mortgage', 'CEO Mortgage'],
    };

    useEffect(() => {
        if (product) {
            const selectedProductName = productNamesSlice.find(p => p._id === product)?.name;
            if (selectedProductName && productPipelineMap[selectedProductName]) {
                setFilteredPipelines(pipelineSlice.filter(pipeline => productPipelineMap[selectedProductName].includes(pipeline.name)));
            } else {
                setFilteredPipelines([]);
            }
        } else {
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
        const selectedPipelineId = userPipeline || pipelineId;
        console.log('selectedPipelineId', pipelineId)

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

    // Handle form submission
    const handleSubmit = async () => {
        // Clear previous error messages
        setErrorMessages({});

        // Validate fields
        const newErrors = {};
        // Check if contactNumber is less than 9 digits
        if (!contactNumber) {
            newErrors.contactNumber = "Number is required.";
        } else if (contactNumber.length < 9) {
            newErrors.contactNumber = "9 digits are required."; // Display error if contactNumber is less than 9 digits
        }
        if (!clientName) newErrors.clientName = "Name is required.";
        if (!selectedProductStage) newErrors.selectedProductStage = "Product stage is required.";
        if (!leadType) newErrors.leadType = "Lead type is required.";
        if (['CEO', 'MD', 'Superadmin'].includes(userRole)) {
            if (!pipelineId) newErrors.pipelineId = "pipelineId is required.";
            if (!product) newErrors.product = "Product is required.";
            if (!branch) newErrors.branch = "Branch is required.";
        }
        if (!source) newErrors.source = "Source is required.";

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
                pipeline: pipelineId ? pipelineId : userPipeline,
                products: product ? product : userProduct, // Conditionally send products
                source: source,
                description: leadDetails,
                branch: branch ? branch : userBranch,
                thirdpartyname: thirdparty,
                selected_users: selectedUsers
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchLeadsData()
            setModal2Open(false)
            resetFormFields();
        } catch (error) {
            console.log(error.response.data, "errorCreateLead");
            setErrorMessage(error.response.data)
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
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/edit-lead/${apiData.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setModal2Open(false);
            resetFormFields();
            setIsClientNameDisabled(false)
        } catch (error) {
            console.log(error, 'Error saving lead data');
        }
    };


    const checkClientPhone = async (completePhoneNumber) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/leads/check-client-phone`,
                {
                    clientPhone: completePhoneNumber, // Use the complete phone number
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const responseData = response.data[0];
            console.log(responseData, 'responseData')
            setApiData(responseData); // Save the first object in state
            setIsValidPhone(true); // Assuming the response means it's valid

            if (responseData && responseData.client.phone === completePhoneNumber) {
                setClientName(responseData.client.name);
                setClientEmail(responseData.client.email);
                setLeadDetails(responseData.description);
                setCompanyName(responseData.companyName);
                setEid(responseData.client.e_id);
                setBranch(responseData?.branch?._id);
                setLeadType(responseData.leadType._id);
                setSource(responseData.source._id);
                setPipelineId(responseData.pipeline._id);
                setProduct(responseData.products._id);
                setWhatsappContact(responseData.client.w_phone)

                // If the phone matches, disable the client name input
                setIsClientNameDisabled(true);
                if (responseData.productStage && responseData.productStage._id) {
                    setSelectedProductStage(responseData.productStage._id);
                }
            }
        } catch (error) {
            setIsValidPhone(false);
        }
    };

    // Function to handle input change and trigger API call when the phone is complete
    const handlePhoneInputChange = (e) => {
        const value = e.target.value;
        setErrors((prevErrors) => ({ ...prevErrors, clientPhone: '' }));
        setDisableField(value.trim() === '');

        let processedValue = value.startsWith('0') ? value.slice(1) : value;
        const digitsOnly = processedValue.replace(/\D/g, '').slice(0, 9); // Keep only digits
        const formattedValue = digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'); // Format the number

        setContactNumber(formattedValue);
        if (errorMessages.contactNumber) {
            setErrorMessages((prev) => ({ ...prev, contactNumber: '' }));
        }
        const fullPhone = `+971${digitsOnly}`;
        setFullPhoneNumber(fullPhone);

        // Trigger API call when user has input the full 9 digits
        if (digitsOnly.length === 9) {
            debouncedCheckClientPhone(fullPhone);
        }
    };

    // Debounced version of the API call
    const debouncedCheckClientPhone = debounce(checkClientPhone, 500);

    const handleEidInputChange = (e) => {
        const value = e.target.value
        setEid(value)
        setDisableField(value.trim() === '');
    }

    // Handle Input Change Name
    const handleClientNameHandler = (e) => {

        const value = e.target.value;
        const regex = /^[a-zA-Z\s]{3,20}$/;

        // Set client name value
        setClientName(value);
        setDisableField(value.trim() === '');
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
        const value = e.target.value;  // Get the current input value
        setCompanyName(value);

        setDisableField(value.trim() === '');
    }

    const handleEmailInputChange = (e) => {
        const value = e.target.value;
        setClientEmail(value)

        setDisableField(value.trim() === '');
    }


    const handleBranchname = (e) => {
        const selectedBranchId = e.target.value;
        // console.log(selectedBranchId,'selectedBranchId')
        setBranch(selectedBranchId);

        // Disable the field if the branch value is empty
        setDisableField(selectedBranchId.trim() === '');

        // Clear branch error if any
        if (errorMessages.branch) {
            setErrorMessages((prev) => ({ ...prev, branch: '' }));
        }

        // Check for product and API data
        if (product && apiData) {
            const matchingProduct = apiData.products?._id === product;

            if (matchingProduct) {
                const productPipelineId = apiData.products.pipeline_id[0];
                const productBranchId = apiData.branch?._id;

                const selectedPipelineBranchId = apiData.pipeline?._id;

                // Check if the selected branch matches the API response branch and pipeline
                if (productBranchId === selectedBranchId && productPipelineId === selectedPipelineBranchId) {
                    console.log("Pipeline and Branch match the product");
                    setMatchingProduct(true);
                    setCheckTransfer(false);
                    setNotMatchingProduct(false);
                    setModal2Open(true); // Show modal for matching product, pipeline, and branch
                    showModalWithMatch(true); // Show modal indicating a full match
                } else if (productBranchId === selectedBranchId) {
                    console.log("Only the branch matches the product");
                    setMovePipeline(true);
                    setCheckTransfer(false);
                    setMatchingProduct(false);
                    setNotMatchingProduct(false);
                    setModal2Open(true); // Show modal for branch match but pipeline mismatch
                    showModalWithNoMatch(); // Show non-matching modal
                } else {
                    console.log("Branch does not match the product");
                    setMovePipeline(true);
                    setCheckTransfer(false);
                    setMatchingProduct(false);
                    setNotMatchingProduct(false);
                    setModal2Open(true); // Show modal for no match
                    showModalWithNoMatch(); // Show non-matching modal
                }
            } else {
                console.log("No branch available for this product");
                setCheckTransfer(true);
                setMatchingProduct(false);
                setModal2Open(true); // Show modal for no branch scenario
                showModalWithNoMatch(); // Show non-matching modal
            }
        }
    };


    const handleProductInputChange = async (e) => {
        const value = e.target.value
        const selectedProductId = value;
        setProduct(selectedProductId);
        setPipelineId(''); // Reset pipeline ID when the product changes

        setDisableField(value.trim() === '');

        if (errorMessages.product) {
            setErrorMessages((prev) => ({ ...prev, product: '' }));
        }

        // Check if apiData exists and has items
        // if (Array.isArray(apiData) && apiData.length > 0) {
        //     const matchingProduct = apiData.find(dataItem =>
        //         dataItem.products?._id === selectedProductId
        //     );

        //     if (matchingProduct) {
        //         if (!matchingProduct.isRejected) {
        //             setClientName(matchingProduct.client.name);
        //             setClientEmail(matchingProduct.client.email);
        //             setContactNumber(matchingProduct.client.phone);
        //             setLeadDetails(matchingProduct.description);
        //             setCompanyName(matchingProduct.companyName);
        //             setEid(matchingProduct.eid);
        //             setBranch(matchingProduct.branch._id);
        //             setLeadType(matchingProduct.leadType._id);
        //             setSource(matchingProduct.source._id);
        //             setPipelineId(matchingProduct.pipeline._id);
        //             if (matchingProduct.productStage && matchingProduct.productStage._id) {
        //                 setSelectedProductStage(matchingProduct.productStage._id);
        //             } else {
        //                 setSelectedProductStage(null);
        //             }
        //             return;
        //         }

        //         if (Array.isArray(matchingProduct.products.pipeline_id) && matchingProduct.products.pipeline_id.length > 0) {
        //             const productPipelineId = matchingProduct.products.pipeline_id[0];
        //         } else {
        //             console.log("No pipeline exists for the product");
        //         }
        //     } else {
        //         console.log("No matching product found");
        //     }
        // } else {
        //     console.log("Invalid or empty apiData");
        // }
    };

    const handlePipelineInputChange = (e) => {
        const selectedPipelineId = e.target.value;
        console.log(selectedPipelineId, 'selectedPipelineId')
        setPipelineId(selectedPipelineId);

        if (errorMessages.pipelineId) {
            setErrorMessages((prev) => ({ ...prev, pipelineId: '' }));
        }

        if (product && apiData) {
            const matchingProduct = apiData.products?._id === product;

            if (matchingProduct) {
                const productPipelineId = apiData.products.pipeline_id[0];
                const productBranchId = apiData.branch?._id;
                const selectedPipelineBranchId = apiData.pipeline?._id;

                // Check if both the product pipeline and branch match the selected pipeline and branch
                if (productPipelineId === selectedPipelineId && productBranchId === selectedPipelineBranchId) {
                    console.log("Pipeline and Branch match the product");
                    setMatchingProduct(true);
                    setCheckTransfer(false);
                    setNotMatchingProduct(false);
                    setModal2Open(true); // Show modal for matching product and pipeline
                    showModalWithMatch(true); // Show modal indicating a match
                } else if (productPipelineId === selectedPipelineId) {
                    console.log("Only the pipeline matches the product");
                    setMovePipeline(true);
                    setCheckTransfer(false);
                    setMatchingProduct(false);
                    setNotMatchingProduct(false);
                    setModal2Open(true); // Show modal for pipeline match but branch mismatch
                    showModalWithNoMatch(); // Show non-matching modal
                } else {
                    console.log("Pipeline does not match the product");
                    setMovePipeline(true);
                    setCheckTransfer(false);
                    setMatchingProduct(false);
                    setNotMatchingProduct(false);
                    setModal2Open(true); // Show modal for no match
                    showModalWithNoMatch(); // Show non-matching modal
                }
            } else {
                console.log("No pipeline available for this product");
                setCheckTransfer(true);
                setMatchingProduct(false);
                setModal2Open(true); // Show modal for no pipeline scenario
                showModalWithNoMatch(); // Show non-matching modal
            }
        }
    };


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
        const value = e.target.value
        setSource(value)

        setDisableField(value.trim() === '');
        if (errorMessages.source) {
            setErrorMessages((prev) => ({ ...prev, source: '' }));
        }
    }
    const handleLeadDetailsInputChange = (e) => {
        const value = e.target.value
        setLeadDetails(value)

        setDisableField(value.trim() === '');
    }
    const handleInputChangeProductstage = (e) => {
        const value = e.target.value
        setSelectedProductStage(value);

        setDisableField(value.trim() === '');
        if (errorMessages.selectedProductStage) {
            setErrorMessages((prev) => ({ ...prev, selectedProductStage: '' }));
        }
    }
    const handleInputChangeLeadType = (e) => {
        const value = e.target.value
        setLeadType(value)

        setDisableField(value.trim() === '');

        if (errorMessages.leadType) {
            setErrorMessages((prev) => ({ ...prev, leadType: '' }));
        }
    }

    // Input change handler
    const handleInputChange = (isValidNumber, value, countryData) => {
        console.log(value, 'valueofwhtsapp')
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
        const value = e.target.value
        setThirdParty(value)

        setDisableField(value.trim() === '');
    }

    const TransferCase = () => {
        console.log('Transfer Leads');

    }

    const MoveLead = () => {
        console.log('Move Leads');
    }

    const resetFormFields = () => {
        setContactNumber('');
        setWhatsappContact('');
        setEid('');
        setClientName('');
        setCompanyName('');
        setClientEmail('');
        setBranch('');
        setProduct('');
        setPipelineId('');
        setSelectedProductStage('');
        setLeadType('');
        setSource('');
        setLeadDetails('');
        setThirdParty('');
        setSelectedUsers([]);
        // Reset error messages as well
        setErrorMessages({});
        setErrors({});
    };

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(''); // Clear the error message after 1 second
            }, 4000);

            return () => clearTimeout(timer); // Clear the timer on component unmount or if errorMessage changes
        }
    }, [errorMessage]);

    const handlewhatsppPhoneInputChange = (e) => {
        let value = e.target.value;

        // Process the value to remove leading zero if present
        let processedValue = value.startsWith('0') ? value.slice(1) : value;

        // Keep only digits and limit the number of digits to 9
        const digitsOnly = processedValue.replace(/\D/g, '').slice(0, 9);

        // Format the number as XX XXX XXXX
        const formattedValue = digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');

        // Set the formatted value to the state
        setWhatsappContact(formattedValue);
    };

    return (
        <>
            <Modal
                title="Create Lead"
                centered
                show={modal2Open}
                size="xl"
                scrollable
                onHide={() => {
                    setModal2Open(false);
                    resetFormFields(); // Clear the fields when closing the modal
                }}

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
                                        value={contactNumber.replace(/\s/g, '')} // Remove spaces from the display
                                        onChange={handlePhoneInputChange}
                                        isInvalid={!!errors.clientPhone}

                                    />
                                    {errorMessages.contactNumber && (
                                        <div className="text-danger">
                                            <p style={{ fontSize: '12px' }}>{errorMessages.contactNumber}</p>
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* WhatsApp Number */}
                            <Col md={4}>
                                <Form.Label>WhatsApp Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Whatsapp Number"
                                    name="clientPhone"
                                    value={whatsappContact.replace(/\s/g, '')} // Remove spaces from the display
                                    onChange={handlewhatsppPhoneInputChange}
                                    isInvalid={!!errors.clientPhone}
                                    disabled={isClientNameDisabled}
                                />
                                {/* <IntlTelInput
                                    value={whatsappContact} 
                                    onPhoneNumberChange={(isValidNumber, value, countryData) =>
                                        handleInputChange(isValidNumber, value, countryData)
                                    }
                                    initOptions={{
                                        initialCountry: "ae",
                                    }}
                                    className="intel_value"
                                /> */}
                            </Col>

                            {/* Emirates ID */}
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="clientEID">
                                    <Form.Label>Emirates ID</Form.Label>
                                    <InputMask
                                        mask="999-9999-9999999-9"
                                        value={eid}
                                        onChange={handleEidInputChange}
                                        disabled={isClientNameDisabled}
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
                                        disabled={isClientNameDisabled} // Disable based on state
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
                                        disabled={isClientNameDisabled} // Disable based on state
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
                                        disabled={isClientNameDisabled} // Disable based on state
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {!branchUserSlice && (
                            <Row>

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
                                        disabled={isClientNameDisabled}
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

                    {errorMessage && <div className="alert alert-danger">{errorMessage.message}</div>}


                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container'
                        onClick={() => {
                            setModal2Open(false);
                            resetFormFields(); // Clear the fields when closing the modal
                            setIsClientNameDisabled(false)
                        }}

                    >
                        Close
                    </Button>
                    {
                        apiData && apiData.isRejected ?
                            <Button className='all_single_leads_button' onClick={handleSaveChanges} disabled={disableField}>
                                Update
                            </Button>
                            :

                            <Button className='all_single_leads_button' onClick={handleSubmit} disabled={disableField} >
                                Submit
                            </Button>
                    }
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
                        Lead Already Exist in Product <span style={{ fontWeight: 'bold' }} >{apiData && apiData.products.name}</span> and Pipeline <span style={{ fontWeight: 'bold' }}>{apiData && apiData.pipeline.name}</span>
                    </p>

                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setMatchingProduct(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* If PipeLine is Change than open a modal of Move */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={movePipeline}
                onHide={() => setMovePipeline(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Move Lead
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Pipeline in Lead is not same with Product! Would You Like to Move Lead from <span style={{ fontWeight: 'bold' }}> {apiData && apiData.pipeline.name}</span> to Other
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setMovePipeline(false)} >Close</Button>
                    <Button className='all_single_leads_button' onClick={() => MoveLead()} >Move Lead </Button>
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
                        Transfer Lead
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Do You want tp Transfer Your Lead from <span style={{ fontWeight: 'bold' }} >{apiData && apiData.products.name}</span> and from Pipeline <span style={{ fontWeight: 'bold' }} >{apiData && apiData.pipeline.name}</span>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setCheckTransfer(false)} >Close </Button>
                    <Button className='all_single_leads_button' onClick={() => TransferCase()} >Send Transfer Request </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CreateLead;