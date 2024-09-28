import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import '../../Pages/style.css';

const WhatsAppChat = () => {
    const { id } = useParams();
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const token = useSelector(state => state.loginSlice.user?.token);

    useEffect(() => {

    }, [])

    useEffect(() => {
        // Fetch chat history
        const fetchChatHistory = async () => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/whatsup/chat-history/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setChatHistory(data);
            } catch (err) {
                console.error('Failed to fetch chat history', err);
            }
        };

        fetchChatHistory();

        // Initialize socket connection
        const socket = io('http://192.168.2.137:2000', {
            transports: ['websocket'],
            upgrade: false,
        });

        // Join the specific room for this lead
        socket.emit('join_lead_room', id);

        // Handle incoming messages
        socket.on('new_message', (newMessage) => {
            setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
        });

        return () => {
            socket.disconnect();
        };
    }, [id, token]);

    const handleSendMessage = async () => {
        setSending(true);
        setError('');

        try {
            await axios.post(
                'http://192.168.2.137:2000/api/whatsup/send-message',
                {
                    messageBody: message,
                    clientId: null, // Adjust accordingly
                    leadId: id, // or another identifier
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage('');
            alert('Message sent successfully!');
        } catch (err) {
            setError('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <Container>
            <Card body style={{ padding: '15px' }} className='card_discussion_chat_boat'>
                <h5 className='text-center'>Chat Conversation</h5>

                <div className="chat-history mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {chatHistory.length > 0 ? (
                        chatHistory.map((chat, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: chat.user ? 'flex-end' : 'flex-start', margin: '10px 0' }}>
                                <Card className={`message_sender ${chat.user ? 'bg-light text-dark' : 'text-black'}`} style={{ maxWidth: '60%', borderRadius: '10px' }}>
                                    <p className='mb-0' style={{ fontSize: '14px', padding: '0px 5px' }}>
                                        <strong style={{ fontSize: '12px', padding: '0px 5px' }} >{chat.user ? chat.user.name : 'Client'}:</strong> {chat.message_body}
                                    </p>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <p>No messages yet.</p>
                    )}
                </div>

                <Form.Group controlId="messageTextarea" className='mt-3'>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                    />
                </Form.Group>
                {error && <p className="text-danger">{error}</p>}

                <Button variant="primary" onClick={handleSendMessage} disabled={sending} style={{ width: '100%' }} className='mt-3 whatspp_send_message' >
                    {sending ? (
                        <>
                            <Spinner animation="border" size="sm" /> Sending...
                        </>
                    ) : (
                        'Send Message'
                    )}
                </Button>
            </Card>
        </Container>
    );
};

export default WhatsAppChat;
