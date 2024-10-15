import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card, Dropdown, Menu, Modal, Button, Spin, Input, Form, message } from 'antd';
import Navbar from '../Components/navbar/Navbar';
import { useSelector } from 'react-redux';
import { BsThreeDotsVertical } from "react-icons/bs";
import Select from 'react-select';
import './style.css';

import defaultImage from '../Assets/JoveraLogoweb.png';
import Sidebar from '../Components/sidebar/Sidebar';

const Allusers = () => {
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filteredSubpipelines, setFilteredSubpipelines] = useState([]);
    const [isUpdatingUser, setIsUpdatingUser] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [userToDelete, setUserToDelete] = useState(null);
    const loading = useSelector((state) => state.loginSlice.loading);
    const pipelines = useSelector((state) => state.loginSlice.pipelines);
    const subpipelines = useSelector((state) => state.loginSlice.subpipelines);
    const branches = useSelector((state) => state.loginSlice.branches);
    const authtoken = useSelector(state => state?.loginSlice?.user?.token);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/get-users`);
                setUsers(response.data);
            } catch (error) {
                console.log(error, 'err');
            }
        };
        fetchData();
    }, []);

    const handleMenuClick = (e, user) => {
        if (e.key === "1") {
            setSelectedUser({
                ...user,
                pipeline: user.pipeline ? { value: user.pipeline._id, label: user.pipeline.name } : null,
                subpipeline: user.subpipeline ? { value: user.subpipeline._id, label: user.subpipeline.name } : null,
                branch: user.branch ? { value: user.branch._id, label: user.branch.name } : null,
            });
            setFilteredSubpipelines(subpipelines.filter(subpipeline => subpipeline.pipeline._id === user.pipeline?._id));
            setIsModalVisible(true);
        } else if (e.key === "2") {
            setUserToDelete(user);
            setIsDeleteModalVisible(true);
        } else if (e.key === "3") {
            setSelectedUser(user);
            setIsPasswordModalVisible(true);
        }
    };

    const menu = (user) => (
        <Menu onClick={(e) => handleMenuClick(e, user)}>
            <Menu.Item key="1">Edit</Menu.Item>
            <Menu.Item key="2">Delete</Menu.Item>
            <Menu.Item key="3">Reset Password</Menu.Item>
        </Menu>
    );

    const handleOk = async () => {
        setIsUpdatingUser(selectedUser._id);
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/users/update-user/${selectedUser._id}`,
                {
                    name: selectedUser.name,
                    email: selectedUser.email,
                    role: selectedUser.role,
                    pipeline: selectedUser.pipeline ? selectedUser.pipeline.value : null,
                    subpipeline: selectedUser.subpipeline ? selectedUser.subpipeline.value : null,
                    branch: selectedUser.branch ? selectedUser.branch.value : null,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authtoken}`,
                    },
                }
            );

            if (response.status === 200) {
                message.success('User updated successfully');
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === selectedUser._id
                            ? { ...user, ...response.data }
                            : user
                    )
                );
            }
        } catch (error) {
            message.error('Failed to update user');
        } finally {
            setIsUpdatingUser(null);
            setIsModalVisible(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/users/delete-user/${userToDelete._id}`,
                {
                    delstatus: true, // Set delStatus to true to indicate the user is deleted
                },
                {
                    headers: {
                        Authorization: `Bearer ${authtoken}`,
                    },
                }
            );

            if (response.status === 200) {
                message.success('User marked as deleted successfully');
                setUsers((prevUsers) =>
                    prevUsers.filter((user) => user._id !== userToDelete._id)
                );
            }
        } catch (error) {
            message.error('Failed to mark user as deleted');
        } finally {
            setIsDeleteModalVisible(false);
            setUserToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalVisible(false);
        setUserToDelete(null);
    };

    const InputChangeHandler = (option, fieldName) => {
        if (fieldName === 'pipeline') {
            setSelectedUser({
                ...selectedUser,
                pipeline: option,
                subpipeline: null
            });

            const filtered = subpipelines.filter(subpipeline => subpipeline.pipeline._id === option.value);
            setFilteredSubpipelines(filtered);
        } else {
            setSelectedUser({
                ...selectedUser,
                [fieldName]: option
            });
        }
    };

    const pipelineOptions = pipelines.map((pipeline) => ({
        value: pipeline._id,
        label: pipeline.name,
    }));

    const subpipelineOptions = filteredSubpipelines.length > 0
        ? filteredSubpipelines.map((subpipeline) => ({
            value: subpipeline._id,
            label: subpipeline.name,
        }))
        : [{ value: null, label: 'No Sub-Pipeline Available' }];

    const branchOptions = branches.map((branch) => ({
        value: branch._id,
        label: branch.name,
    }));

    const handlePasswordReset = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            message.error('Passwords do not match');
            return;
        }

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/users/reset-password/${selectedUser._id}`,
                { password: passwords.newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${authtoken}`,
                    },
                }
            );

            if (response.status === 200) {
                message.success('Password reset successfully');
            }
        } catch (error) {
            message.error('Failed to reset password');
        } finally {
            setIsPasswordModalVisible(false);
            setPasswords({ newPassword: '', confirmPassword: '' });
            setSelectedUser(null);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <Navbar />
            <div className="all-users-container">
                <Row>
                    <Col xs={24} sm={24} md={6} lg={4}>
                        <Sidebar />
                    </Col>
                    <Col xs={24} sm={24} md={18} lg={20}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Spin size="large" style={{ color: 'black' }} />
                            </div>
                        ) : (
                            <Row>
                                {users.map((user) => (
                                    <Col
                                        xs={24}
                                        sm={12}
                                        md={12}
                                        lg={12}
                                        xxl={6}
                                        key={user._id}
                                        style={{ marginTop: '1%' }}
                                    >
                                        <Card
                                            hoverable
                                            style={{
                                                width: '90%',
                                                height: '100%',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                pointerEvents: isUpdatingUser === user._id ? 'none' : 'auto',
                                            }}
                                            cover={
                                                <div className="user_image_container" style={{ position: 'relative' }}>
                                                    <img
                                                        src={user.image ? user.image : defaultImage}
                                                        alt="user_image"
                                                        className="user_image"
                                                        style={{ display: isUpdatingUser === user._id ? 'none' : 'block' }}
                                                    />
                                                    {isUpdatingUser === user._id && (
                                                        <Spin
                                                            size="large"
                                                            style={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                                zIndex: 1,
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            }

                                        >
                                            <Dropdown overlay={menu(user)} trigger={['click']}>
                                                <BsThreeDotsVertical
                                                    className="icons_class"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </Dropdown>
                                            <div style={{ textAlign: 'center' }}>
                                                <h3>{user.name}</h3>
                                                <p>{user.email}</p>
                                                <p>{user.role}</p>
                                                <p>{user?.branch?.name}</p>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Col>
                </Row>

                {/* Edit Modal */}
                <Modal
                    title="Edit User"
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText="Save"
                    cancelText="Cancel"
                >
                    <Form layout="vertical">
                        <Form.Item label="Name">
                            <Input
                                value={selectedUser?.name || ''}
                                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="Email">
                            <Input
                                value={selectedUser?.email || ''}
                                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="Role">
                            <Input
                                value={selectedUser?.role || ''}
                                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="Pipeline">
                            <Select
                                value={selectedUser?.pipeline || null}
                                onChange={(option) => InputChangeHandler(option, 'pipeline')}
                                options={pipelineOptions}
                            />
                        </Form.Item>
                        <Form.Item label="Sub-Pipeline">
                            <Select
                                value={selectedUser?.subpipeline || null}
                                onChange={(option) => InputChangeHandler(option, 'subpipeline')}
                                options={subpipelineOptions}
                            />
                        </Form.Item>
                        <Form.Item label="Branch">
                            <Select
                                value={selectedUser?.branch || null}
                                onChange={(option) => InputChangeHandler(option, 'branch')}
                                options={branchOptions}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    title="Confirm Delete"
                    visible={isDeleteModalVisible}
                    onOk={handleDelete}
                    onCancel={handleCancelDelete}
                    okText="Delete"
                    cancelText="Cancel"
                >
                    <p>Are you sure you want to delete this user?</p>
                </Modal>


                {/* Reset Passowrd Modal */}
                <Modal
                    title="Reset Password"
                    visible={isPasswordModalVisible}
                    onOk={handlePasswordReset}
                    onCancel={() => setIsPasswordModalVisible(false)}
                >
                    <Form layout="vertical">
                        <Form.Item label="New Password">
                            <Input.Password
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                            />
                        </Form.Item>
                        <Form.Item label="Confirm Password">
                            <Input.Password
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </>
    );
};

export default Allusers;
