import React, { useEffect } from 'react';
import { Button, Form, Input, Col, Row } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import JoveraLogoweb from '../../Assets/JoveraLogoweb.png';
import { loginApi } from '../../Redux/loginSlice';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const loading = useSelector((state) => state.loginSlice.loading);
    const token = useSelector(state => state.loginSlice.user?.token)

    const formHandler = (values) => {
        dispatch(loginApi(values));
        navigate('/leads')
    };


    return (
        <div className='login_main_container'>
            <Row>
                <Col
                    xs={24}
                    sm={12}
                    md={8}
                    lg={10}
                >
                    <div className='firstCol'>
                        <img src={JoveraLogoweb} alt="JoveraLogoweb" className='JoveraLogoweb' />
                    </div>
                </Col>
                <Col
                    xs={24}
                    sm={12}
                    md={16}
                    lg={14}
                >
                    <div className='secondCol'>
                        <Form
                            name="login"
                            labelCol={{
                                flex: '110px',
                            }}
                            labelAlign="left"
                            labelWrap
                            wrapperCol={{
                                flex: 1,
                            }}
                            colon={false}
                            style={{
                                maxWidth: 600,
                            }}
                            onFinish={formHandler}
                        >
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please Enter your Email!',
                                    },
                                    {
                                        type: 'email',
                                        message: 'Please Enter a valid Email!',
                                    },
                                ]}
                            >
                                <Input placeholder='Enter Email' className='inputField' />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please Enter your Password!',
                                    },
                                ]}
                            >
                                <Input.Password placeholder='Enter Password' className='inputField' />
                            </Form.Item>

                            <Form.Item label="">
                                <Button type="primary" htmlType="submit" className='submitbtn_login' loading={loading}>
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Login;
