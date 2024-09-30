import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Button, Form, Container, Row, Col, Image } from 'react-bootstrap';
import '../Pages/style.css';
import { RiDeleteBinLine } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import default_image from '../Assets/default_image.jpg';
import deleteimage from '../Assets/deleteimage.png'

const LeadUsers = ({ singleLead }) => {
    const { selected_users = [], pipeline_id } = singleLead;
    const { id } = useParams();
    const [userModal, setUserModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const [error, setError] = useState('');
    const token = useSelector(state => state.loginSlice.user?.token);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

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

    // Filter users based on pipeline_id
    useEffect(() => {
        if (allUsers.length > 0 && pipeline_id) {
            const usersForPipeline = allUsers.filter(user => user.pipeline[0]?._id === pipeline_id._id);
            setFilteredUsers(usersForPipeline);
        }
    }, [allUsers, pipeline_id]);

    // Add User
    const AddUser = async () => {
        setError('');
        if (!selectedUser) {
            setError('Please select a user before submitting.');
            return;
        }

        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/add-user-to-lead/${id}`, {
                userId: selectedUser.value
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSelectedUser(null);
            setUserModal(false);
        } catch (error) {
            console.log(error, 'error');
        }
    }

    // Delete User
    const DeleteUser = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/remove-user-from-lead/${id}`, {
                userId: userIdToDelete
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDeleteModal(false);
        } catch (error) {
            console.log(error, 'err');
        }
    }

    // Prepare options for the select dropdown
    const userOptions = filteredUsers.map(user => ({
        value: user._id,
        label: user.name // You can show the pipeline name if needed by modifying this
    }));

    return (
        <>
            <Container>
                <Row>
                    <Col xs={12} md={7}>
                        <Card className='mt-4 lead_discussion_main_card_description' style={{ padding: '20px' }}>
                            <h4 className='mb-0' style={{ color: '#B9406B', textAlign: 'center' }}>{singleLead?.company_Name}</h4>
                            <p className='text-muted text-sm mb-0 text-center'>Company Name</p>
                            <div>
                                <h5>Lead Details</h5>
                            </div>
                            <p>{singleLead.description}</p>
                        </Card>
                    </Col>
                    <Col xs={12} md={5}>
                        <Card className='mt-4 lead_discussion_main_card_user' style={{ padding: '20px' }}>
                            <div className='discussion_files'>
                                <h5>Users</h5>
                                <div className='lead_users_delete_btn mb-3'>
                                    <IoMdAdd style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => setUserModal(true)} />
                                </div>
                            </div>
                            <Table bordered responsive striped hover className="lead_user_class">
                                <thead>
                                    <tr>
                                        <th style={{ width: '70%' }}>Name</th>
                                        <th className="text-center" style={{ width: '30%' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selected_users.length > 0 ? (
                                        selected_users.map((user, index) => {
                                            const imageSrc = user.image
                                                ? `${process.env.REACT_APP_BASE_URL}/images/${user.image}`
                                                : default_image;
                                            return (
                                                <tr key={index} style={{ height: '50px' }}>
                                                    <td style={{ verticalAlign: 'middle' }}>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <Image
                                                                src={imageSrc}
                                                                alt="image_user"
                                                                className="image_control_discussion"
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                            />
                                                            <span style={{ fontWeight: '600' }}>{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                        <div className="lead_users_delete_btn">
                                                            <RiDeleteBinLine
                                                                style={{ color: 'white', fontSize: '18px', cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    setUserIdToDelete(user._id);
                                                                    setDeleteModal(true);
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="text-center">
                                                No users available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Add user Modal */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={userModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Add User
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Select User</Form.Label>
                            <Select
                                options={userOptions}
                                value={selectedUser}
                                onChange={(option) => {
                                    setSelectedUser(option);
                                    setError('');
                                }}
                                placeholder="Select a user..."
                            />
                            {error && <div className="text-danger">{error}</div>}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setUserModal(false)} className='all_close_btn_container' >Close</Button>
                    <Button className='all_single_leads_button' onClick={AddUser}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete User Modal */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={deleteModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Delete User
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }} >
                        <Image src={deleteimage} alt='deleteimage' style={{ width: "auto", maxWidth: '160px', height: 'auto', maxHeight: '400px' }} />
                        <p style={{ fontSize: '20px', fontWeight: '600px' }} >Are You Sure You want To Delete this User??</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setDeleteModal(false)} className='all_close_btn_container'>Close</Button>
                    <Button onClick={DeleteUser} className='all_delete_btn_container'>Delete User</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default LeadUsers;

