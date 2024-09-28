import React, { useState } from 'react';
import { Card, Container, Row, Col, Modal, Button, Form, Image } from 'react-bootstrap';
import { IoMdAdd } from "react-icons/io";
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../Pages/style.css';
import default_image from '../Assets/default_image.jpg'
import { FaCloudUploadAlt } from "react-icons/fa";
import WhatsAppChatBox from './whatsappChatBox/WhatsAppChatBox';

const LeadDiscussion = ({ id, singleLead }) => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [discussionModal, setDiscussionModal] = useState(false);
    const [discussionText, setDiscussionText] = useState('');
    const [error, setError] = useState('');
    const [imageErr, setImageErr] = useState('')
    const [selectedFile, setSelectedFile] = useState(null); // Store the selected file
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const { discussions = [] } = singleLead;
    const { files = [] } = singleLead

    const handleClose = () => {
        setShowModal(false);
        setSelectedImage('');
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setDiscussionText(value);

        if (value.trim()) {
            setError('');
        }
    };


    // Add Discussion
    const sendDiscussionMessage = async () => {
        if (!discussionText.trim()) {
            setError('Please Enter a Comment.');
        } else {
            setError('');
            setDiscussionText('');
        }
        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/add-discussion/${id}`, {
                comment: discussionText
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDiscussionModal(false);
        } catch (error) {
            console.log(error, 'err');
        }
    }

    return (
        <div>
            <WhatsAppChatBox />
            <Card className='mt-4 lead_discussion_main_card_main' style={{ padding: '15px' }} >
                <Container>
                    <Row>
                        <Col xs={12} md={12} >
                            <div className='discussion_files' >
                                <h4>Discussion</h4>
                                <div className='lead_users_delete_btn' >
                                    <IoMdAdd style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => setDiscussionModal(true)} />
                                </div>
                            </div>
                            <hr />

                            {discussions.map((leadDiscussion, index) => {
                                return (
                                    <div>

                                        <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className='' >
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} >
                                                <Image src={default_image || leadDiscussion.created_by.image} alt="image" className='image_control_discussion' />
                                                <p className='mb-0' style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{leadDiscussion.created_by.name && leadDiscussion.created_by.name}</p>
                                            </div>
                                            <p className='mb-0' style={{ fontSize: '14px' }}>
                                                {new Date(leadDiscussion.created_at && leadDiscussion.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </p>
                                        </div>
                                        <p style={{ fontSize: '14px' }} className='mb-4 mt-2'>{leadDiscussion.comment && leadDiscussion.comment}</p>
                                    </div>
                                );
                            })}
                        </Col>
                    </Row>
                </Container>
            </Card>

            <Modal
                show={discussionModal}
                onHide={() => setDiscussionModal(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Discussion Block
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Control
                            as="textarea"
                            placeholder="Leave a comment here"
                            style={{ height: '100px' }}
                            type='text'
                            name='discussionText'
                            value={discussionText}
                            onChange={handleInputChange}
                            required
                        />
                        {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={sendDiscussionMessage}>Create</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Body>
                    <Image src={selectedImage} alt={selectedImage} fluid />
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={handleClose} className="btn btn-secondary">Close</button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default LeadDiscussion;
