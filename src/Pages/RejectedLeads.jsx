import React, { useState, useEffect } from 'react';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Table, Form } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const RejectedLeads = () => {
    // User Token
    const token = useSelector(state => state.loginSlice.user?.token);
    const { id } = useParams();
    const [rejectedLeads, setRejectedLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Search term state

    // Fetch Rejected Leads
    useEffect(() => {
        const fetchRejectedLeads = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/rejected-leads`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Set leadDetails in state
                setRejectedLeads(response.data.leadDetails || []);
            } catch (error) {
                console.log(error, 'Error fetching rejected leads');
            }
        };

        fetchRejectedLeads();
    }, [token]);

    // Filter leads based on the search term
    const filteredLeads = rejectedLeads.filter(lead =>
        lead.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <Navbar />
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        {/* Search Bar */}
                        <Form className="my-3">
                            <Form.Group controlId="search">
                                <Form.Control
                                    type="text"
                                    placeholder="Search by Client Name"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Form>

                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Client Name</th>
                                    <th>Pipeline Name</th>
                                    <th>Product Stage</th>
                                    <th>Product Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map((lead, index) => (
                                        <tr key={lead.id}>
                                            <td>{index + 1}</td>
                                            <td>{lead.clientName}</td>
                                            <td>{lead.pipelineName}</td>
                                            <td>{lead.productStage}</td>
                                            <td>{lead.productName}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            No leads found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default RejectedLeads;
