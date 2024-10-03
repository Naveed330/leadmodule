import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

const Labels = ({ labelName, labelModal, setLabelModal, leadId, fetchSingleLead, previousLabels }) => {
    
    // Track the selected label IDs, initialized with previousLabels
    const [selectedLabelIds, setSelectedLabelIds] = useState(previousLabels.map(label => label._id)); // Ensure we're working with IDs
    console.log(previousLabels, 'previousLabelspreviousLabels');

    // Handle checkbox changes
    const handleCheckboxChange = (labelId) => {
        setSelectedLabelIds((prevSelected) => {
            if (prevSelected.includes(labelId)) {
                // If the label is already selected, remove it (uncheck)
                return prevSelected.filter(id => id !== labelId);
            } else {
                // If the label is not selected, add it (check)
                return [...prevSelected, labelId];
            }
        });
    };

    // Submit selected labels
    const submitLabels = async () => {
        try {
            const payload = {
                labels: selectedLabelIds // Send the selected IDs in an array
            };
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/edit-labels/${leadId}`, payload);
            setLabelModal(false);
            fetchSingleLead();
            setSelectedLabelIds(previousLabels.map(label => label._id)); // Reset the selected labels to previous after submission
        } catch (error) {
            console.error('Error adding labels:', error);
            alert('Failed to add labels.');
        }
    };

    // Update selectedLabelIds when previousLabels changes
    useEffect(() => {
        setSelectedLabelIds(previousLabels.map(label => label._id)); // Update based on previousLabels
    }, [previousLabels]);

    return (
        <div>
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={labelModal}
                onHide={() => setLabelModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Labels
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '100%', maxHeight: '600px', overflowY: 'scroll' }}>
                    {labelName.map((label) => (
                        <div key={label._id}>
                            <Form.Check
                                inline
                                id={`${label._id}`} // Unique ID for each checkbox
                                type="checkbox"
                                label={label.name}
                                onChange={() => handleCheckboxChange(label._id)} // Use label._id for toggling
                                checked={selectedLabelIds.includes(label._id)} // Check if the ID is in the selected array
                            />
                        </div>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={submitLabels}>Submit</Button>
                    <Button variant="secondary" onClick={() => setLabelModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Labels;
