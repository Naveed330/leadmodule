import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Button, Form, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Select from 'react-select';
import './convertLeadStyle.css'

const ConvertLead = ({ leadId, setLeadToContract, leadtocontract }) => {
    const token = useSelector(state => state.loginSlice.user?.token)
    const [leadData, setLeadData] = useState({});
    const [hodOptions, setHodOptions] = useState([]);
    const [managerOptions, setManagerOptions] = useState([]);
    const [coordinatorOptions, setCoordinatorOptions] = useState([]);
    const [teamLeaderOptions, setTeamLeaderOptions] = useState([]);
    const [tsAgentOptions, setTsAgentOptions] = useState([]);
    const [financialAmount, setFinancialAmount] = useState('');
    const [bankCommission, setBankCommission] = useState('');
    const [customerCommission, setCustomerCommission] = useState('');
    const [revenueWithVat, setRevenueWithVat] = useState('');
    const [revenueWithoutVat, setRevenueWithoutVat] = useState('');
    const [users, setUsers] = useState([])

    const [brokerCommission, setBrokerCommission] = useState(0);
    const [hodCommissionPercentage, setHodCommissionPercentage] = useState(0);
    const [hodCommission, setHodCommission] = useState(0);
    const [brokerCommissionValue, setBrokerCommissionValue] = useState(0);
    const [salesManagerCommissionPercentage, setSalesManagerCommissionPercentage] = useState(0);
    const [salesManagerCommission, setSalesManagerCommission] = useState(0);

    // Fetch leads data by ID
    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                // Fetch lead data
                const leadResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/single-lead/${leadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setLeadData(leadResponse.data);

                // Fetch all users
                const usersResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/get-users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Filter users with the role "HOD"
                const hodUsers = usersResponse.data.filter(user => user.role === "HOD");

                // Map the filtered HOD users to the Select component's format
                const hodOptions = hodUsers.map(user => ({
                    value: user.id, // Assuming each user has a unique 'id'
                    label: user.name, // Assuming each user has a 'name' field
                }));

                setHodOptions(hodOptions);


                // Filter users with the role "Manager"
                const managerUsers = usersResponse.data.filter(user => user.role === "Manager");

                // Map the filtered Manager users to the Select component's format
                const managerOptions = managerUsers.map(user => ({
                    value: user.id, // Assuming each user has a unique 'id'
                    label: user.name, // Assuming each user has a 'name' field
                }));

                setManagerOptions(managerOptions);

                // Filter users with the role "Coordinator"
                const coordinatorUsers = usersResponse.data.filter(user => user.role === "Coordinator");

                // Map the filtered Coordinator users to the Select component's format
                const coordinatorOptions = coordinatorUsers.map(user => ({
                    value: user.id, // Assuming each user has a unique 'id'
                    label: user.name, // Assuming each user has a 'name' field
                }));

                setCoordinatorOptions(coordinatorOptions);

                // Filter users with the role "Team Leader"
                const teamLeaderUsers = usersResponse.data.filter(user => user.role === "Team Leader");

                // Map the filtered Team Leader users to the Select component's format
                const teamLeaderOptions = teamLeaderUsers.map(user => ({
                    value: user.id, // Assuming each user has a unique 'id'
                    label: user.name, // Assuming each user has a 'name' field
                }));

                setTeamLeaderOptions(teamLeaderOptions);


                // Filter users with the role "TS Agent"
                const tsAgentUsers = usersResponse.data.filter(user => user.role === "TS Agent");

                // Map the filtered TS Agent users to the Select component's format
                const tsAgentOptions = tsAgentUsers.map(user => ({
                    value: user.id, // Assuming each user has a unique 'id'
                    label: user.name, // Assuming each user has a 'name' field
                }));

                setTsAgentOptions(tsAgentOptions);
            } catch (error) {
                console.log(error, 'Error fetching data');
            }
        };

        if (leadId && token) {
            fetchLeadData();
        }
    }, [leadId, token]);

    useEffect(() => {
        // Calculate revenue based on inputs
        const totalCommission = bankCommission + customerCommission;
        const totalRevenue = financialAmount - totalCommission;

        // Update revenues
        setRevenueWithVat(totalRevenue);
        setRevenueWithoutVat(totalRevenue / 1.05);
    }, [financialAmount, bankCommission, customerCommission]);

    // HOD
    const handleHodCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setHodCommissionPercentage(percentage);

        // Calculate and update HOD commission
        const commission = (revenueWithoutVat * percentage) / 100;
        setHodCommission(commission);
    };

    const handleBrokerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setBrokerCommission(percentage);

        // Calculate and update broker commission value
        const commissionValue = (revenueWithoutVat * percentage) / 100;
        setBrokerCommissionValue(commissionValue);

        // Calculate and update remaining HOD commission after broker commission
        const remainingHodCommission = hodCommission - commissionValue;
        setHodCommission(remainingHodCommission);

        // Calculate Sales Manager commission based on remaining revenue
        const adjustedRevenue = revenueWithoutVat - commissionValue;
        const salesManagerCommissionValue = (adjustedRevenue * salesManagerCommissionPercentage) / 100;
        setSalesManagerCommission(salesManagerCommissionValue);
    };

    // Sales Manager
    const handleSalesManagerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setSalesManagerCommissionPercentage(percentage);

        // Calculate and update Sales Manager commission based on adjusted revenue
        // Calculate and update HOD commission
        // const commission = (revenueWithoutVat * percentage) / 100;
        // setSalesManagerCommission(commission);

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const commission = (adjustedRevenue * percentage) / 100;
        setSalesManagerCommission(commission);
    };

    useEffect(() => {
        // Reset calculations if revenue changes or commission percentages are set to 0
        if (hodCommissionPercentage === 0 || brokerCommission === 0 || salesManagerCommissionPercentage === 0) {
            setHodCommission((revenueWithoutVat * hodCommissionPercentage) / 100);
            setSalesManagerCommission((revenueWithoutVat * salesManagerCommissionPercentage) / 100);
        }
    }, [revenueWithoutVat, hodCommissionPercentage, brokerCommission, salesManagerCommissionPercentage]);

    return (
        <div>
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={leadtocontract}
                onHide={() => setLeadToContract(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title className='text-center'>
                        Service Application From
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4 className='text-center' style={{ fontSize: '1.25rem', color: '#060606' }} >Service Application From</h4>
                    <Form>
                        <Card className='convertToLead_card'>
                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label className='label_class'>Financial Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter Amount"
                                            className='convert_to_lead_input_field'
                                            value={financialAmount}
                                            onChange={(e) => setFinancialAmount(parseFloat(e.target.value) || '')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBankCommission">
                                        <Form.Label className='label_class'>Bank Commission</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Bank Commission"
                                            className='convert_to_lead_input_field'
                                            value={bankCommission}
                                            onChange={(e) => setBankCommission(parseFloat(e.target.value) || '')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formCustomerCommission">
                                        <Form.Label className='label_class'>Customer Commission</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Customer Commission"
                                            className='convert_to_lead_input_field'
                                            value={customerCommission}
                                            onChange={(e) => setCustomerCommission(parseFloat(e.target.value) || '')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formRevenueWithVat">
                                        <Form.Label className='label_class'>Revenue (with VAT 5%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            value={Math.round(revenueWithVat)} // Format to 2 decimal places
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formRevenueWithoutVat">
                                        <Form.Label className='label_class'>Revenue (without VAT 5%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            value={Math.round(revenueWithoutVat)} // Format to 2 decimal places
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card>
                        {/* Second Card */}
                        <Card className='convertToLead_card mt-2' >
                            <h5 className='heading_tag' >Sales</h5>
                            <Row>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicHOD">
                                        <Select
                                            className="custom-select"
                                            options={hodOptions}
                                            placeholder="Select HOD"
                                            isClearable
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formHodCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='HOD commission (%)'
                                            value={hodCommissionPercentage}
                                            onChange={handleHodCommissionChange}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formHodCommissionValue">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            value={Math.round(hodCommission)} // Display to 2 decimal places
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicManager">
                                        <Select
                                            className="custom-select"
                                            options={managerOptions}  // Set the filtered Manager options here
                                            placeholder="Select Manager"
                                            isClearable
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formSalesManagerCommission">
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field'
                                            placeholder='Sales Manager commission (%)'
                                            onChange={handleSalesManagerCommissionChange}
                                        />
                                        <Form.Text className="text-muted">
                                            {Math.round(salesManagerCommission)}
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicCoordinator">
                                        <Select
                                            className="custom-select"
                                            options={coordinatorOptions} // Use the coordinatorOptions array here
                                            placeholder="Coordinator"
                                            isClearable
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Control type="number" className='convert_to_lead_input_field' placeholder='Coordinator commission (%)' />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTeamLeader">
                                        <Select
                                            className="custom-select"
                                            options={teamLeaderOptions} // Use the teamLeaderOptions array here
                                            placeholder="Team Leader"
                                            isClearable
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Control type="number" className='convert_to_lead_input_field' placeholder='Team Leader commission (%)' />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTsAgent">
                                        <Select
                                            className="custom-select"
                                            options={tsAgentOptions} // Use the tsAgentOptions array here
                                            placeholder="Select TS Agent"
                                            isClearable
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Control type="number" className='convert_to_lead_input_field' placeholder='Agent commission (%)' />
                                    </Form.Group>
                                </Col>
                            </Row>


                            {/* Lead Cards */}

                            <Card className='convertToLead_card mt-2'>
                                {leadData && leadData.lead_type && (
                                    <>
                                        <h5 className='heading_tag'>{leadData.lead_type.name}</h5>
                                        <Row>
                                            {leadData.lead_type?.name === 'Marketing' && (
                                                <>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formMarketingManager">
                                                            <Form.Select className="custom-select" aria-label="Marketing Manager">
                                                                <option>Marketing Manager</option>
                                                                <option value="1">One</option>
                                                                <option value="2">Two</option>
                                                                <option value="3">Three</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                            <Form.Control type="number" className='convert_to_lead_input_field' placeholder='Marketing Manager commission (%)' />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formMarketingAgent">
                                                            <Form.Select className="custom-select" aria-label="Marketing Agent">
                                                                <option>Marketing Agent</option>
                                                                <option value="1">One</option>
                                                                <option value="2">Two</option>
                                                                <option value="3">Three</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                            <Form.Control type="number" className='convert_to_lead_input_field' placeholder='Marketing Agent commission (%)' />
                                                        </Form.Group>
                                                    </Col>
                                                </>
                                            )}

                                            {leadData.lead_type?.name === 'Tele Sales' && (
                                                <>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Form.Select className="custom-select" aria-label="Tele Sales HOD">
                                                                <option>Tele Sales HOD</option>
                                                                <option value="1">One</option>
                                                                <option value="2">Two</option>
                                                                <option value="3">Three</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHODCommission">
                                                            <Form.Control type="number" className='convert_to_lead_input_field' placeholder='Tele Sales HOD commission (%)' />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesTeamLeader">
                                                            <Form.Select className="custom-select" aria-label="Tele Sales Team Leader">
                                                                <option>Tele Sales Team Leader</option>
                                                                <option value="1">One</option>
                                                                <option value="2">Two</option>
                                                                <option value="3">Three</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesTeamLeaderCommission">
                                                            <Form.Control type="number" className='convert_to_lead_input_field' placeholder='Tele Sales Team Leader commission (%)' />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesAgent">
                                                            <Form.Select className="custom-select" aria-label="Tele Sales Agent">
                                                                <option>Tele Sales Agent</option>
                                                                <option value="1">One</option>
                                                                <option value="2">Two</option>
                                                                <option value="3">Three</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesAgentCommission">
                                                            <Form.Control type="number" className='convert_to_lead_input_field' placeholder='Tele Sales Agent commission (%)' />
                                                        </Form.Group>
                                                    </Col>
                                                </>
                                            )}

                                            {leadData.lead_type?.name === 'Others' && (
                                                <>
                                                    <Col xs={12} md={6}>
                                                        <Form.Group className="mb-3" controlId="formOtherPerson">
                                                            <Form.Control type="text" className='convert_to_lead_input_field' placeholder='Other Person' />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={6}>
                                                        <Form.Group className="mb-3" controlId="formOtherCommission">
                                                            <Form.Control type="number" className='convert_to_lead_input_field' placeholder='Other Commission (%)' />
                                                        </Form.Group>
                                                    </Col>
                                                </>
                                            )}
                                        </Row>
                                    </>
                                )}
                            </Card>


                            {/* is_transfer */}
                            <div>
                                {leadData?.is_transfer &&
                                    <>
                                        <Card className='convertToLead_card mt-2'>
                                            <h5 className='heading_tag'>Transfer Information</h5>
                                            <Row className='mt-3'>
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formSalesManagerRefTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field'
                                                            placeholder='Sales Manager Ref (Transfer)'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formSalesManagerCommissionTransfer">
                                                        <Form.Control
                                                            type="number"
                                                            className='convert_to_lead_input_field'
                                                            placeholder='Sales Manager Ref Commission Transfer (%)'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formAgentRefTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field'
                                                            placeholder='Agent Ref (Transfer)'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formAgentCommissionTransfer">
                                                        <Form.Control
                                                            type="number"
                                                            className='convert_to_lead_input_field'
                                                            placeholder='Agent Ref Commission Transfer (%)'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </>
                                }
                            </div>

                            {/* Third Card */}
                            <Card className='convertToLead_card mt-2' >
                                <h5 className='heading_tag' >3rd Party</h5>
                                <Row>
                                    <Col xs={12} md={6} >
                                        <Form.Group className="mb-3" controlId="formBasicEmail">
                                            <Form.Control type="text" className='convert_to_lead_input_field' placeholder='3rd Party Broker Name' />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={3}>
                                        <Form.Group className="mb-3" controlId="formBrokerCommission">
                                            <Form.Control
                                                type="number"
                                                className='convert_to_lead_input_field'
                                                placeholder='3rd Party Broker Commission (%)'
                                                value={brokerCommission}
                                                onChange={handleBrokerCommissionChange}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col xs={12} md={3}>
                                        <Form.Group className="mb-3" controlId="formBrokerCommissionValue">
                                            <Form.Control
                                                type="number"
                                                className='convert_to_lead_input_field'
                                                value={Math.round(brokerCommissionValue)} // Display to 2 decimal places
                                                disabled
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card>
                        </Card>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={() => setLeadToContract(false)}>Close</Button>
                    <Button>Convert</Button>
                </Modal.Footer>

            </Modal>
        </div>
    )
}

export default ConvertLead