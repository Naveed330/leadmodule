import React, { useState } from 'react';
import { Card, Table, Modal, Button, Form } from 'react-bootstrap';
import '../Pages/style.css';
import { RiDeleteBinLine } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Select from 'react-select';

const LeadUsers = ({ singleLead }) => {
    const { selected_users = [] } = singleLead;
    const { id } = useParams();
    const [userModal, setUserModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userIdToDelete, setUserIdToDelete] = useState(null); // State for the user ID to delete
    const [error, setError] = useState('');
    const token = useSelector(state => state.loginSlice.user?.token);
    const pipelines = useSelector(state => state.loginSlice?.pipelines);

    // Convert pipelines to options for react-select
    const pipelineOptions = pipelines.map(pipeline => ({
        value: pipeline._id,
        label: pipeline.name
    }));

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
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/remove-user-from-lead/${id}`, { // Assuming this is the correct endpoint
                userId: userIdToDelete // Pass the userId to be deleted
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDeleteModal(false); // Close the delete modal after successful deletion
        } catch (error) {
            console.log(error, 'err');
        }
    }

    return (
        <>
            <Card className='mt-4 lead_discussion_main_card' style={{ padding: '20px' }}>
                <h4 style={{ color: '#B9406B', textAlign: 'center' }}>Company Name ({singleLead?.company_Name && singleLead?.company_Name})</h4>
                <div>
                    <h5>Lead Details</h5>
                </div>
                <p>{singleLead.description}</p>
            </Card>
            <Card className='mt-4 lead_discussion_main_card' style={{ padding: '20px' }}>
                <div className='discussion_files'>
                    <h5>Users</h5>
                    <div className='lead_users_delete_btn mb-3'>
                        <IoMdAdd style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => setUserModal(true)} />
                    </div>
                </div>
                <Table striped bordered hover responsive className='lead_user_class'>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selected_users.length > 0 ? (
                            selected_users.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.name}</td>
                                    <td>
                                        <div className='lead_users_delete_btn'>
                                            <RiDeleteBinLine
                                                style={{ color: 'white', fontSize: '18px', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setUserIdToDelete(user._id); // Set the user ID to delete
                                                    setDeleteModal(true); // Open delete modal
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
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
                                options={pipelineOptions}
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
                    <Button onClick={() => setUserModal(false)}>Close</Button>
                    <Button variant="primary" onClick={AddUser}>
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
                    <p>Are You Sure You want To Delete this User??</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setDeleteModal(false)}>Close</Button>
                    <Button onClick={DeleteUser}>Delete User</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default LeadUsers;
