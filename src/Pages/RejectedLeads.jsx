import React, { useState, useEffect } from 'react';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Table, Form, Pagination } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { useSelector } from 'react-redux';
import axios from 'axios';

const RejectedLeads = () => {
    // User Token
    const token = useSelector(state => state.loginSlice.user?.token);
    const [rejectedLeads, setRejectedLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Search term state

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Number of leads per page

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

    // Pagination logic
    const indexOfLastLead = currentPage * itemsPerPage;
    const indexOfFirstLead = indexOfLastLead - itemsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

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
                                {currentLeads.length > 0 ? (
                                    currentLeads.map((lead, index) => (
                                        <tr key={lead.id}>
                                            <td>{indexOfFirstLead + index + 1}</td>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination>
                                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                {[...Array(totalPages)].map((_, pageIndex) => (
                                    <Pagination.Item
                                        key={pageIndex + 1}
                                        active={pageIndex + 1 === currentPage}
                                        onClick={() => handlePageChange(pageIndex + 1)}
                                    >
                                        {pageIndex + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default RejectedLeads;
