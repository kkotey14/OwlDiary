import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { getAuthTokenOrLogout } from "../utils/auth";

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1300;
    padding: 1rem;
`;

const ModalCard = styled.div`
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    border-radius: 12px;
    background: white;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.2);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    border: none;
    background: none;
    cursor: pointer;
`;

const StudentRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ApproveBtn = styled.button`
    background: #10b981;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
`;

const DenyBtn = styled.button`
    background: #ef4444;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
`;
const ApproveAllBtn = styled.button`
    background: #2563eb;
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 0.75rem;
    margin-bottom: 1rem;

    &:hover {
        background: #1d4ed8;
    }
`;

const StudentAcceptanceModal = ({ onClose }) => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const loadPendingStudents = async () => {
            const token = getAuthTokenOrLogout(navigate);
            if (!token) return;

            try {
                const res = await fetch("/api/students/pending", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    setStudents([]);
                    return;
                }

                const data = await res.json();
                setStudents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching pending students:", err);
            }
        };

        loadPendingStudents();
    }, [navigate]);

    const approveStudent = async (id) => {
        const token = getAuthTokenOrLogout(navigate);
        if (!token) return;

        const res = await fetch(`/api/students/${id}/approve`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        setStudents((prev) => prev.filter((s) => s.id !== id));
    };

    const denyStudent = async (id) => {
        const token = getAuthTokenOrLogout(navigate);
        if (!token) return;

        const res = await fetch(`/api/students/${id}/deny`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        setStudents((prev) => prev.filter((s) => s.id !== id));
    };

    const approveAll = async () => {
        const token = getAuthTokenOrLogout(navigate);
        if (!token) return;

        try {
            const res = await fetch("/api/students/approve-all", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;

            setStudents([]); // clears list instantly
        } catch (err) {
            console.error("Error approving all students:", err);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <FiX size={20} />
                </CloseButton>

                <h3>Pending Student Approvals ({students.length})</h3>

                {students.length > 0 && (
                    <ApproveAllBtn onClick={approveAll}>
                        Approve All
                    </ApproveAllBtn>
                )}

                {students.length === 0 ? (
                    <p style={{ marginTop: "1rem" }}>No pending students.</p>
                ) : (
                    <div style={{ marginTop: "1rem" }}>
                        {students.map((student) => (
                            <StudentRow key={student.id}>
                                <div>
                                    <strong>{student.name}</strong>
                                    <div
                                        style={{
                                            fontSize: "0.8rem",
                                            color: "#64748b",
                                        }}>
                                        {student.email}
                                    </div>
                                </div>

                                <ButtonGroup>
                                    <ApproveBtn
                                        onClick={() =>
                                            approveStudent(student.id)
                                        }>
                                        Approve
                                    </ApproveBtn>

                                    <DenyBtn
                                        onClick={() => denyStudent(student.id)}>
                                        Deny
                                    </DenyBtn>
                                </ButtonGroup>
                            </StudentRow>
                        ))}
                    </div>
                )}
            </ModalCard>
        </ModalOverlay>
    );
};

export default StudentAcceptanceModal;
