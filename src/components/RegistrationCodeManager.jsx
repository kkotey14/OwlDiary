import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getAuthTokenOrLogout } from "../utils/auth";
import { FiX } from "react-icons/fi";

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
    background: #ffffff;
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
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    &:hover {
        color: #1e293b;
    }
`;

const TableContainer = styled.div`
    overflow-y: auto;
    margin-top: 1.25rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 0.9rem;

    th {
        background: #f8fafc;
        padding: 0.75rem;
        font-weight: 600;
        color: #475569;
        border-bottom: 2px solid #e5e7eb;
    }

    td {
        padding: 0.75rem;
        border-bottom: 1px solid #f1f5f9;
        color: #1e293b;
    }
`;

const StatusBadge = styled.span`
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    background: ${(props) => (props.$active ? "#ecfdf5" : "#f1f5f9")};
    color: ${(props) => (props.$active ? "#059669" : "#64748b")};
`;

const ManageCodesModal = ({ onClose }) => {
    const navigate = useNavigate();
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCodes = async () => {
            const token = getAuthTokenOrLogout(navigate);
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/registration-codes", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    setCodes([]);
                    return;
                }
                const data = await res.json();
                setCodes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching codes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCodes();
    }, [navigate]);

    return (
        <ModalOverlay onClick={onClose}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <FiX size={20} />
                </CloseButton>
                <h3>Registration Code History</h3>

                {loading ? (
                    <p style={{ padding: "2rem", textAlign: "center" }}>
                        Loading history...
                    </p>
                ) : (
                    <TableContainer>
                        <StyledTable>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Semester</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {codes.map((codeRow) => (
                                    <tr key={codeRow.code_id}>
                                        <td
                                            style={{
                                                fontWeight: "bold",
                                                color: "#2563eb",
                                            }}
                                        >
                                            {codeRow.code}
                                        </td>
                                        <td>{codeRow.semester}</td>
                                        <td>
                                            <StatusBadge $active={codeRow.is_active}>
                                                {codeRow.is_active ? "Active" : "Inactive"}
                                            </StatusBadge>
                                        </td>
                                        <td
                                            style={{
                                                color: "#94a3b8",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            {new Date(codeRow.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </StyledTable>
                    </TableContainer>
                )}
            </ModalCard>
        </ModalOverlay>
    );
};

export default ManageCodesModal;
