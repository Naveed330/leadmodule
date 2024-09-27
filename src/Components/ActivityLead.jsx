import React from 'react';
import { Card, Image } from 'react-bootstrap';
import default_image from '../Assets/default_image.jpg'
const ActivityLead = ({ singleLead }) => {
    const { activity_logs = [] } = singleLead;

    return (
        <>
            <Card body className='lead_discussion_main_card_activity_log mt-4'>
                <h4>Activity</h4>
                {activity_logs.length > 0 ? (
                    activity_logs.map((logactivity, index) => (
                        <Card className='activity_log mt-3' key={index}>
                            <div >

                                <div style={{ display: 'flex', gap: '10px' }} >
                                    <Image src={default_image} alt="image" className='image_control_discussion' />
                                    <div>
                                        <p className='mb-0'>{logactivity.log_type ? logactivity.log_type : 'No Log Type Available'}</p>
                                        <p>{logactivity.remark && logactivity.remark}</p>
                                    </div>
                                </div>
                                <p className='mb-0'>
                                    {new Date(logactivity.created_at && logactivity.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </p>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p>No Activity Log Available</p>
                )}
            </Card>
        </>
    );
};

export default ActivityLead;
