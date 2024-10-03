import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const WhatsAppComponent = ({ clientId, leadId, setWhatsAppModal, whtsappModal }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const token = useSelector(state => state.loginSlice.user?.token);

    useEffect(() => {
        // Fetch chat history
        const fetchChatHistory = async () => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/whatsup/chat-history/${leadId}`, {
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
        socket.emit('join_lead_room', leadId);

        // Handle incoming messages
        socket.on('new_message', (newMessage) => {
            setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
        });

        return () => {
            socket.disconnect();
        };
    }, [leadId, token]);

    const handleSendMessage = async () => {
        setSending(true);
        setError('');

        try {
            await axios.post(
                'http://192.168.2.137:2000/api/whatsup/send-message',
                {
                    messageBody: message,
                    clientId,
                    leadId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage('');
            alert('Message sent successfully!');
            setWhatsAppModal(false);
        } catch (err) {
            setError('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const renderMediaPreview = (mediaUrls) => {
        return mediaUrls.map((url, index) => {
            const extension = url.split('.').pop().toLowerCase();

            // Render images
            if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                return <img key={index} src={url} alt="Media" className="media-preview" />;
            }

            // Render PDFs
            if (extension === 'pdf') {
                return (
                    <iframe
                        key={index}
                        src={url}
                        title="PDF Preview"
                        className="pdf-preview"
                        frameBorder="0"
                    />
                );
            }

            // Render a link for other types of media
            return (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                    Open file
                </a>
            );
        });
    };

    return (
        <Modal show={whtsappModal} onHide={() => setWhatsAppModal(false)} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Contact via WhatsApp</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Send a message to the client via WhatsApp:</p>

                <div className="chat-history mb-3">
                    {chatHistory.length > 0 ? (
                        chatHistory.map((chat, index) => (
                            <div key={index} className={chat.user ? 'message sent' : 'message received'}>
                                <p>
                                    <strong>{chat.user ? chat.user.name : chat.client.name}:</strong> {chat.message_body}
                                </p>
                                {chat.media_urls && renderMediaPreview(chat.media_urls)}
                            </div>
                        ))
                    ) : (
                        <p>No messages yet.</p>
                    )}
                </div>

                <Form.Group controlId="messageTextarea">
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here"
                    />
                </Form.Group>
                {error && <p className="text-danger">{error}</p>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setWhatsAppModal(false)}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSendMessage} disabled={sending}>
                    {sending ? (
                        <>
                            <Spinner animation="border" size="sm" /> Sending...
                        </>
                    ) : (
                        'Send Message'
                    )}
                </Button>
            </Modal.Footer>

            <style jsx>{`
                .chat-history {
                    max-height: 300px;
                    overflow-y: auto;
                }
                .message {
                    margin: 5px 0;
                }
                .message.sent {
                    text-align: right;
                }
                .message.received {
                    text-align: left;
                }
                .media-preview {
                    max-width: 100%;
                    margin-top: 10px;
                }
                .pdf-preview {
                    width: 100%;
                    height: 200px;
                    margin-top: 10px;
                }
            `}</style>
        </Modal>
    );
};

export default WhatsAppComponent;
