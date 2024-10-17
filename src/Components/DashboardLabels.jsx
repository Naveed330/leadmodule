import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Button, Form } from 'react-bootstrap';

const DashboardLabels = ({ fetchLeadsData, leadId, setLabelsDashBoardModal, labelsDashboardModal }) => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [singleLead, setSingleLead] = useState(null); // Store the entire lead data
    const [pipelineId, setPipelineID] = useState(null);
    const [previousLabels, setPreviousLabels] = useState([]); // Store the previous labels
    const [allLabels, setAllLabels] = useState([]); // Store labels fetched by pipeline ID
    const [selectedLabelIds, setSelectedLabelIds] = useState([]); // Store selected label IDs

    // Fetch single lead information
    const fetchSingleLead = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/single-lead/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const leadData = response.data;
            setSingleLead(leadData);
            setPreviousLabels(leadData.labels);
            setSelectedLabelIds(leadData.labels.map(label => label._id)); // Set pre-selected labels
            setPipelineID(leadData.pipeline_id._id); // Set pipeline ID
        } catch (error) {
            console.error('Error fetching single lead:', error);
        }
    };

    // Fetch labels for the pipeline
    const fetchPipelineLabels = async (pipelineId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/labels/pipeline/${pipelineId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllLabels(response.data);
        } catch (error) {
            console.error('Error fetching labels:', error);
        }
    };

    // Fetch single lead on component mount
    useEffect(() => {
        fetchSingleLead();
    }, [leadId]);

    // Fetch labels when the pipelineId is set
    useEffect(() => {
        if (pipelineId) {
            fetchPipelineLabels(pipelineId);
        }
    }, [pipelineId]);

    // Handle checkbox changes
    const handleCheckboxChange = (labelId) => {
        setSelectedLabelIds((prevSelected) => {
            if (prevSelected.includes(labelId)) {
                return prevSelected.filter(id => id !== labelId); // Uncheck label
            } else {
                return [...prevSelected, labelId]; // Check label
            }
        });
    };

    // Submit selected labels
    const submitDashBoardLabels = async () => {
        try {
            const payload = { labels: selectedLabelIds };
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/edit-labels/${leadId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLabelsDashBoardModal(false);
            fetchLeadsData(); // Refresh lead data
        } catch (error) {
            console.error('Error updating labels:', error);
            alert('Failed to update labels.');
        }
    };

    return (
        <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={labelsDashboardModal}
            onHide={() => setLabelsDashBoardModal(false)}
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Labels</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ height: '100%', maxHeight: '600px', overflowY: 'scroll' }}>
                {allLabels.length === 0 ? (
                    <p>No labels found for this pipeline.</p>
                ) : (
                    allLabels.map((label, index) => {
                        let backgroundColor = '';

                        // Set the background color based on the label color
                        switch (label.color) {
                            case 'success':
                                backgroundColor = '#6fd943';
                                break;
                            case 'danger':
                                backgroundColor = '#ff3a6e';
                                break;
                            case 'primary':
                                backgroundColor = '#5c91dc';
                                break;
                            case 'warning':
                                backgroundColor = '#ffa21d';
                                break;
                            case 'info':
                                backgroundColor = '#6ac4f4';
                                break;
                            case 'secondary':
                                backgroundColor = '#6c757d';
                                break;
                            default:
                                backgroundColor = '#ccc'; // Default color if no match
                        }
                        return (
                            <div key={index} style={{ marginRight: '4px', marginTop: '8px' }}>
                                <div key={label._id} className='labels_class'
                                    style={{
                                        backgroundColor: backgroundColor,
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        width: 'auto',
                                        maxWidth: '150px'
                                    }}>
                                    <Form.Check
                                        inline
                                        id={`${label._id}`}
                                        type="checkbox"
                                        label={label.name}
                                        onChange={() => handleCheckboxChange(label._id)}
                                        checked={selectedLabelIds.includes(label._id)} // Check if already selected
                                    />
                                </div>
                            </div>
                        )
                    }

                    )
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => setLabelsDashBoardModal(false)}>Close</Button>
                <Button variant="primary" onClick={submitDashBoardLabels}>Submit</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DashboardLabels;
