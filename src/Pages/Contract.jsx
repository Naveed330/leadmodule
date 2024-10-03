import React from 'react'
import Navbar from '../Components/navbar/Navbar';
import Sidebar from '../Components/sidebar/Sidebar';
import { Container, Row, Col } from 'react-bootstrap';
const Contract = () => {
    return (
        <div>
            <Navbar />
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Contract