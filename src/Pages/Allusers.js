import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Image, Row, Col, Card, Container, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import default_image from '../Assets/default_image.jpg'
import { useSelector } from 'react-redux';
import { TiDeleteOutline } from "react-icons/ti";
import Select from 'react-select';
import './style.css'
import Sidebar from '../Components/sidebar/Sidebar';
import Navbar from '../Components/navbar/Navbar';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [branches, setBranches] = useState([]);
    const [roles, setRoles] = useState([]); // New state for roles
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteModal, setdeleteModal] = useState(false)
    const [createModal, setCreateModal] = useState(false)
    const [userId, setUserId] = useState('')
    const [errors, setErrors] = useState({}); // Validation state
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        pipeline: [],
        email: '',
        password: '',
        image: '',
        role: '', // Role field
        branch: '',
        permissions: [],
        delstatus: false,
        verified: false,
        products: '',
        phone: '',
    });
    const token = useSelector(state => state.loginSlice.user?.token);

    // State for form values
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState(null);
    const [branch, setBranch] = useState(null);
    const [pipeline, setPipeline] = useState(null);
    const [product, setProduct] = useState(null);
    const [image, setImage] = useState(null);


    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/get-users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch pipelines, branches, products, and roles
    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/pipelines/get-pipelines`);
                setPipelines(response.data);
            } catch (error) {
                console.error('Error fetching pipelines:', error);
            }
        };

        const fetchBranches = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branch/get-branches`);
                setBranches(response.data);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };

        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/get-all-products`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/roles`);
                setRoles(response.data); // Store roles in state
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };

        fetchPipelines();
        fetchBranches();
        fetchProducts();
        fetchRoles(); // Fetch roles
    }, []);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // Open modal and populate form data with the selected user's data
    const handleEditClick = (user) => {
        console.log(user,'selectedUser')
        setSelectedUser(user);
        setFormData({
            name: user.name || '',
            pipeline: user.pipeline.map(p => p._id) || [], // Extract pipeline IDs for default values
            email: user.email || '',
            password: '',
            image: user.image || '',
            role: user.role || '', // Set role from user data
            branch: user.branch ? user.branch._id : null, // Set branch ID or null
            permissions: user.permissions || [], // Ensure permissions is an array
            delstatus: user.delstatus || false,
            verified: user.verified || false,
            products: user.products ? user.products._id : null, // Set product ID or null
            phone: user.phone || '',
        });
        setShowModal(true);
    };

    // Update user
    const handleUpdateUser = async (e) => {
        e.preventDefault();

        // Set null values for branch and products if "No Branch" or "No Product" is selected
        const updatedFormData = {
            ...formData,
            branch: formData.branch === 'null' ? null : formData.branch, // Handle null for branch
            products: formData.products === 'null' ? null : formData.products, // Handle null for products
            pipeline: formData.pipeline[0] === 'null' ? [] : formData.pipeline // Handle empty array for pipelines
        };

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/users/update-user/${selectedUser._id}`,
                updatedFormData
            );
            console.log('User updated:', response.data);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === selectedUser._id ? response.data : user
                )
            );
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const openDeleteModal = (user) => {
        setUserId(user)
        setdeleteModal(true)
    }

    // Delete User API
    const handleDeleteClick = async (id) => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/users//delete-user/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            fetchUsers();
            setdeleteModal(false)
        } catch (error) {
            console.log(error, 'err')
        }
    }

    // Handle form submission
    const handleCreateUser = async (e) => {
        e.preventDefault(); // Prevent the default form submission

        // Clear previous errors
        const newErrors = {};

        // Validate form fields
        if (!name) newErrors.name = 'Name is required';
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        if (!phone) newErrors.phone = 'Phone is required';
        if (!role) newErrors.role = 'Role is required';
        if (!branch) newErrors.branch = 'Branch is required';
        if (!product) newErrors.product = 'Product is required';
        if (!pipeline) newErrors.pipeline = 'Pipeline is required';

        // Check if there are any errors
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors); // Set the errors to display
            return; // Stop form submission if there are errors
        }

        const formData = new FormData(); // Use FormData to handle image and other data
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone', phone);
        formData.append('role', role?.value);
        formData.append('branch', branch?.value);
        formData.append('pipeline', pipeline?.value);
        formData.append('product', product?.value);
        formData.append('image', image); // Append image file

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/users/create-user`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data', // To handle image upload
                    },
                }
            );
            setCreateModal(false); // Close modal on success
            fetchUsers();
            resetFormFields(); // Clear the form state after successful user creation
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    // User Role
    const roleOptions = roles.map((role) => ({
        value: role.role,
        label: role.role,
    }));

    // User Branch
    const branchOptions = branches.map((branch) => ({
        value: branch._id,
        label: branch.name,
    }));

    // User Product
    const productOptions = products.map((product) => ({
        value: product._id,
        label: product.name,
    }));

    // User Pipeline
    const pipelineOptions = pipelines.map((pipeline) => ({
        value: pipeline._id,
        label: pipeline.name,
    }));

    // Field-specific onChange handlers
    const handleNameChange = (e) => {
        setName(e.target.value);
        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
    };

    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
    };

    const handleRoleChange = (selectedOption) => {
        setRole(selectedOption);
        if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
    };

    const handleBranchChange = (selectedOption) => {
        setBranch(selectedOption);
        if (errors.branch) setErrors((prev) => ({ ...prev, branch: '' }));
    };

    const handleProductChange = (selectedOption) => {
        setProduct(selectedOption);
        if (errors.product) setErrors((prev) => ({ ...prev, product: '' }));
    };

    const handlePipelineChange = (selectedOption) => {
        setPipeline(selectedOption);
        if (errors.pipeline) setErrors((prev) => ({ ...prev, pipeline: '' }));
    };

    const handleImageUpload = (e) => {
        setImage(e.target.files[0]);
    };


    const resetFormFields = () => {
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setRole(null);
        setBranch(null);
        setPipeline(null);
        setProduct(null);
        setImage(null);
        setErrors({}); // Reset errors
    };

    const openResetPasswordModal = (user) => {
        setUserId(user)
        setIsPasswordModalVisible(true)
    }

    // Reset Password API
    const handlePasswordReset = async (id) => {
        console.log(id, 'resetPassword')
        if (passwords.newPassword !== passwords.confirmPassword) {
            // message.error('Passwords do not match');
            return;
        }

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/users/reset-password/${id}`,
                { password: passwords.newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                // message.success('Password reset successfully');
            }
        } catch (error) {
            // message.error('Failed to reset password');
        } finally {
            setIsPasswordModalVisible(false);
            setPasswords({ newPassword: '', confirmPassword: '' });
            setSelectedUser(null);
        }
    };

    const handleResetPasswordChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div>
            <Navbar />
            <Container fluid >
                <Row>
                    <Col xs={12} md={12} lg={2} >
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <h1>All Users</h1>
                        <Button variant="primary" onClick={() => setCreateModal(true)}>
                            Create
                        </Button>


                        <Row>
                            {users.map((user) => (
                                <Col key={user._id} xs={12} sm={6} md={4} lg={3}>
                                    <Card>
                                        <Card.Body>
                                            <Image
                                                src={user.image || default_image}
                                                alt='user_image'
                                                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                                            />
                                            <div>
                                                {user.name} - {user.email} - {user.role}
                                            </div>
                                            <Button variant="primary" onClick={() => handleEditClick(user)}>
                                                Edit
                                            </Button>
                                            <Button variant="danger" onClick={() => openDeleteModal(user._id)}>
                                                Delete
                                            </Button>
                                            <Button variant="primary" onClick={() => openResetPasswordModal(user._id)}>
                                                Reset Password
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </Container>

            {/* Modal for editing user */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateUser}>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formRole">
                                    <Form.Label>Role</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="role"
                                        value={formData.role || 'null'} // Default to "null" if no role is selected
                                        onChange={handleInputChange}
                                    >
                                        <option value="null">No Role</option> {/* No Role option */}
                                        {roles.map((role) => (
                                            <option key={role.role} value={role.role}>
                                                {role.role}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formBranch">
                                    <Form.Label>Branch</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="branch"
                                        value={formData.branch || 'null'} // Default to "null" if no branch is selected
                                        onChange={handleInputChange}
                                    >
                                        <option value="null">No Branch</option> {/* No Branch option */}
                                        {branches.map((branch) => (
                                            <option key={branch._id} value={branch._id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formProducts">
                                    <Form.Label>Products</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="products"
                                        value={formData.products || 'null'} // Default to "null" if no product is selected
                                        onChange={handleInputChange}
                                    >
                                        <option value="null">No Product</option> {/* No Product option */}
                                        {products.map((product) => (
                                            <option key={product._id} value={product._id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formPhone">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formPipeline">
                                    <Form.Label>Pipeline</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="pipeline"
                                        value={formData.pipeline.length > 0 ? formData.pipeline[0] : 'null'} // Default to "null" if no pipeline is selected
                                        onChange={(e) => setFormData({ ...formData, pipeline: [e.target.value] })}
                                    >
                                        <option value="null">No Pipeline</option> {/* No Pipeline option */}
                                        {pipelines.map((pipeline) => (
                                            <option key={pipeline._id} value={pipeline._id}>
                                                {pipeline.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Modal.Footer>
                            <Button className='all_close_btn_container' onClick={() => setShowModal(false)} >Close</Button>
                            <Button className='all_single_leads_button' type="submit">Update</Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Modal */}
            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={deleteModal}
                onHide={() => setdeleteModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Delete User
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                    <p>Are you sure you want to delete this user?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setdeleteModal(false)} >Close</Button>
                    <Button className='all_single_leads_button' onClick={() => handleDeleteClick(userId)} >Delete</Button>
                </Modal.Footer>
            </Modal>

            {/* Create Modal */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={createModal}
                onHide={() => setCreateModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        User Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateUser}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter name"
                                        value={name}
                                        onChange={handleNameChange}
                                        required
                                    />
                                    {errors.name && <small className="text-danger">{errors.name}</small>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        required
                                    />
                                    {errors.email && <small className="text-danger">{errors.email}</small>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    {errors.password && <small className="text-danger">{errors.password}</small>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formPhone">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter phone number"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        required
                                    />
                                    {errors.phone && <small className="text-danger">{errors.phone}</small>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formRole">
                                    <Form.Label>Role</Form.Label>
                                    <Select
                                        options={roleOptions}
                                        placeholder="Select role"
                                        value={role}
                                        onChange={handleRoleChange}
                                        isClearable
                                        required
                                    />
                                    {errors.role && <small className="text-danger">{errors.role}</small>}
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="formBranch">
                                    <Form.Label>Branch</Form.Label>
                                    <Select
                                        options={branchOptions}
                                        placeholder="Select branch"
                                        value={branch}
                                        onChange={handleBranchChange}
                                        isClearable
                                        required
                                    />
                                    {errors.branch && <small className="text-danger">{errors.branch}</small>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formProduct">
                                    <Form.Label>Product</Form.Label>
                                    <Select
                                        options={productOptions}
                                        placeholder="Select product"
                                        value={product}
                                        onChange={handleProductChange}
                                        isClearable
                                        required
                                    />
                                    {errors.product && <small className="text-danger">{errors.product}</small>}
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="formPipeline">
                                    <Form.Label>Pipeline</Form.Label>
                                    <Select
                                        options={pipelineOptions}
                                        placeholder="Select pipeline"
                                        value={pipeline}
                                        onChange={handlePipelineChange}
                                        isClearable
                                        required
                                    />
                                    {errors.pipeline && <small className="text-danger">{errors.pipeline}</small>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group controlId="formImage">
                                    <Form.Label>Image</Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={handleImageUpload}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Modal.Footer>
                            <Button className="all_close_btn_container" onClick={() => setCreateModal(false)}>
                                Close
                            </Button>
                            <Button type="submit" className="all_close_btn_container">Create User</Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Reset Passowrd Modal */}
            <Modal
                show={isPasswordModalVisible}
                onHide={() => setIsPasswordModalVisible(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="newPassword">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handleResetPasswordChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="confirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handleResetPasswordChange}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsPasswordModalVisible(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => handlePasswordReset(userId)}>
                        Reset Password
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AllUsers;