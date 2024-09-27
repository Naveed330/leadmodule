import React, { useState } from 'react';
import { Card, Table, Container, Row, Col, Modal, Button, Form, Image } from 'react-bootstrap';
import { IoMdAdd } from "react-icons/io";
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../Pages/style.css';
import default_image from '../Assets/default_image.jpg'
import { FaCloudUploadAlt } from "react-icons/fa";

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

    const handleImageClick = (fileName) => {
        setSelectedImage(fileName);
        setShowModal(true);
    };

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

    const handleImageChange = (e) => {
        const file = e.target.files[0]; // Get the first selected file
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null); // Remove the selected file
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

    // Upload File
    const uploadFile = async () => {
        if (!selectedFile) {
            setImageErr('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile); // Append the selected file

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/upload-file/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data', // Set content type
                },
            });
            setSelectedFile(null); // Clear the selected file after upload
        } catch (error) {
            console.log(error, 'err');
        }
    }

    return (
        <div>
            <Card className='mt-4 lead_discussion_main_card' style={{ padding: '15px' }} >
                <Container>
                    <Row>
                        <Col xs={12} md={6} >
                            <Card style={{ padding: '15px' }} className='card_discussion' >
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
                                                    <p className='mb-0' style={{ fontSize: '0.75rem' }}>{leadDiscussion.created_by.name && leadDiscussion.created_by.name}</p>
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
                                            <p style={{ fontSize: '14px' }} className='mb-2'>{leadDiscussion.comment && leadDiscussion.comment}</p>
                                        </div>
                                    );
                                })}
                            </Card>
                        </Col>

                        <Col xs={12} md={6}>
                            <Card className="border-0 shadow card_discussion" style={{ padding: '20px', borderRadius: '10px' }}>
                                <div>
                                    <h4 className="mb-4">Files</h4>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Choose an image</Form.Label>
                                            <div
                                                className="image-upload"
                                                style={{
                                                    border: '2px dashed #d7aa47',
                                                    borderRadius: '10px',
                                                    padding: '20px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'border-color 0.3s',
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    style={{ display: 'none' }}
                                                    id="file-upload"
                                                />
                                                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                                    <FaCloudUploadAlt size={50} color="#d7aa47" />
                                                    <p className="mt-2">Drag and drop or click to upload</p>
                                                </label>
                                            </div>
                                        </Form.Group>
                                    </Form>
                                    {selectedFile && (
                                        <div className="mt-4">
                                            <h6>Preview:</h6>
                                            <div className="position-relative me-2 mb-2">
                                                <img
                                                    src={URL.createObjectURL(selectedFile)}
                                                    alt="Preview"
                                                    style={{
                                                        width: '100px',
                                                        height: '100px',
                                                        objectFit: 'cover',
                                                        borderRadius: '10px',
                                                        border: '1px solid #d7aa47',
                                                    }}
                                                />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={handleRemoveImage}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '0',
                                                        left: '0',
                                                        borderRadius: '50%',
                                                        padding: '0.2rem 0.5rem',
                                                    }}
                                                >
                                                    &times;
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    <Button onClick={uploadFile} className="mt-3 upload_btn" style={{ width: '100%' }}>Upload</Button>
                                    {imageErr && <div style={{ color: 'red', marginTop: '5px' }}>{imageErr}</div>}
                                </div>

                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }} className='mt-3'>
                                    {
                                        files.map((fileName, index) => (
                                            <div key={index} onClick={() => handleImageClick(fileName.file_name)} style={{ cursor: 'pointer' }}>
                                                <Image src={fileName.file_path} alt={fileName.file_name} className='image_control_discussion_files' />
                                            </div>
                                        ))
                                    }
                                </div>
                            </Card>
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
