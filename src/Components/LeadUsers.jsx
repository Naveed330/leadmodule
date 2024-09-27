import React from 'react';
import { Card, Table } from 'react-bootstrap';
import '../Pages/style.css';
import { RiDeleteBinLine } from "react-icons/ri";

const LeadUsers = ({ singleLead }) => {
    const { selected_users = [] } = singleLead;

    return (
        <>
            <Card className='mt-4 lead_discussion_main_card' style={{ padding: '20px' }}>
                <div>
                    <h5>Users</h5>
                </div>
                <Table striped bordered hover responsive className='lead_user_class' >
                    <thead>
                        <tr>
                            <th>Name</th>
                            {/* <th>Action</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {selected_users.length > 0 ? (
                            selected_users.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.name}</td>
                                    {/* <td>

                                        <div className='lead_users_delete_btn' >
                                            <RiDeleteBinLine style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                    </td> */}
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
        </>
    );
};

export default LeadUsers;
