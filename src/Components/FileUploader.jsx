import React, { useState } from 'react';
import { Card, Button, Form, Image, Modal } from 'react-bootstrap';
import { FaCloudUploadAlt } from "react-icons/fa";
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../Pages/style.css';
import default_image from '../Assets/default_image.jpg';
import { BiSolidFilePdf } from "react-icons/bi";

const FileUploader = ({ id, singleLead, fetchSingleLead }) => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [discussionText, setDiscussionText] = useState('');
    const [error, setError] = useState('');
    const [imageErr, setImageErr] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]); // Store multiple files
    const [showModal, setShowModal] = useState(false);
    const [selectedFileType, setSelectedFileType] = useState('');
    const [selectedFileUrl, setSelectedFileUrl] = useState('');
    const { discussions = [] } = singleLead;
    const { files = [] } = singleLead;

    const handleFileClick = (fileName, fileType) => {
        const fileUrl = `${process.env.REACT_APP_BASE_URL}${fileName.file_path}`;
        setSelectedFileUrl(fileUrl);
        setSelectedFileType(fileType);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFileUrl('');
        setSelectedFileType('');
    };

    const handleInputChange = (e) => {
        setDiscussionText(e.target.value);
        if (e.target.value.trim()) setError('');
    };

    const handleImageChange = (e) => {
        const filesArray = Array.from(e.target.files); // Convert FileList to Array
        if (filesArray.length > 0) {
            setSelectedFiles(filesArray);
        }
    };

    const handleRemoveImage = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    // Upload multiple files
    const uploadFile = async () => {
        if (selectedFiles.length === 0) {
            setImageErr('Please select files to upload.');
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/upload-files/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSelectedFiles([]); // Clear files after upload
            fetchSingleLead()
        } catch (error) {
            console.log(error, 'err');
        }
    };

    // Print the image
    const handlePrintImage = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Image</title>
                </head>
                <body>
                    <img src="${selectedFileUrl}" style="width: 100%;" />
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <>
            <Card className="border-0 shadow card_discussion mt-4" style={{ padding: '20px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }} >
                    {/* <h4 className="mb-4">Files</h4> */}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Choose images or PDFs</Form.Label>
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
                                    accept="image/*,.pdf"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                    multiple // Allow multiple file selection
                                />
                                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                    <FaCloudUploadAlt size={50} color="#d7aa47" />
                                    <p className="mt-2">Drag and drop or click to upload</p>
                                </label>
                            </div>
                        </Form.Group>
                    </Form>
                    {selectedFiles.length > 0 && (
                        <div className="mt-4">
                            <h6>Preview:</h6>
                            <div className="d-flex flex-wrap">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="position-relative me-2 mb-2">
                                        {file.type === 'application/pdf' ? (
                                            <BiSolidFilePdf size={50} className="pdf_icon_fallback" style={{ color: '#ef222b' }} />
                                            // <img
                                            //     src={default_image}
                                            //     alt="PDF Preview"
                                            //     style={{
                                            //         width: '100px',
                                            //         height: '100px',
                                            //         objectFit: 'cover',
                                            //         borderRadius: '10px',
                                            //         border: '1px solid #d7aa47',
                                            //     }}
                                            // />
                                        ) : (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    objectFit: 'cover',
                                                    borderRadius: '10px',
                                                    border: '1px solid #d7aa47',
                                                }}
                                            />
                                        )}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemoveImage(index)}
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
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <Button onClick={uploadFile} className="mt-3 upload_btn" style={{ width: '100%' }}>Upload</Button>
                {imageErr && <div style={{ color: 'red', marginTop: '5px' }}>{imageErr}</div>}

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }} className='mt-3'>
                    {files.map((file, index) => {
                        const fileType = file.file_name.endsWith('.pdf') ? 'pdf' : file.file_name.match(/\.(jpeg|jpg|png|gif)$/) ? 'image' : <BiSolidFilePdf style={{ color: '#ef222b' }} />;
                        console.log(file.file_path,'filefile')
                        return (
                            <div key={index} onClick={() => handleFileClick(file, fileType)} style={{ cursor: 'pointer' }}>
                                {fileType === 'image' ? (
                                    <Image src={`${process.env.REACT_APP_BASE_URL}${file.file_path}`} alt={file.file_name} className='image_control_discussion_files' />
                                ) : fileType === 'pdf' ? (
                                    <div className="pdf_icon_container">
                                        {/* <img src={default_image} alt="PDF Icon" className="pdf_icon" /> */}
                                        <BiSolidFilePdf size={50} className="pdf_icon_fallback" style={{ color: '#ef222b' }} />
                                    </div>
                                ) : (
                                    // <BiSolidFilePdf size={50} className="pdf_icon_fallback" style={{ color: '#ef222b' }} />
                                    null
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Modal for Image or PDF */}
            <Modal show={showModal} onHide={handleCloseModal} centered size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>File Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFileType === 'image' ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >

                            <img src={selectedFileUrl} alt="Selected File" style={{ width: 'auto', maxWidth: '800px', height: 'auto', maxHeight: '600px' }} />
                        </div>
                    ) : (
                        <iframe
                            src={selectedFileUrl}
                            title="PDF Preview"
                            width="100%"
                            height="500px"
                            style={{ border: 'none' }}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {selectedFileType === 'image' && (
                        <Button variant="primary" onClick={handlePrintImage}>
                            Print Image
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default FileUploader;
