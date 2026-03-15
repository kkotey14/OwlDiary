import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { getAuthTokenOrLogout } from "../utils/auth";
import { SendApprovalEmail, SendRejectionEmail } from "@/utils/email";
import BrandedLoader from "./BrandedLoader";
import useMinimumLoadingDelay from "../hooks/useMinimumLoadingDelay";

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
    max-width: 620px;
    max-height: 80vh;
    border-radius: 12px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.2);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    position: relative;
`;

const BusyOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.86);
    backdrop-filter: blur(2px);
    border-radius: 12px;
    z-index: 2;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 0.9rem;
    right: 0.9rem;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    color: #475569;
    cursor: pointer;
`;

const Header = styled.div`
    border-bottom: 1px solid #e5e7eb;
    padding: 0.1rem 0.1rem 0.8rem;
`;

const Title = styled.h3`
    margin: 0;
    color: #1f2937;
    font-size: 1.05rem;
`;

const Meta = styled.p`
    margin: 0.35rem 0 0;
    color: #6b7280;
    font-size: 0.88rem;
`;

const CountBadge = styled.span`
    margin-left: 0.5rem;
    padding: 0.12rem 0.45rem;
    border-radius: 999px;
    background: #eef2f7;
    color: #475569;
    font-size: 0.78rem;
    font-weight: 600;
`;

const ListWrap = styled.div`
    margin-top: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
    max-height: 52vh;
    padding-right: 0.1rem;
`;

const StudentRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #ffffff;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
`;

const ActionBtn = styled.button`
    background: ${(props) =>
        props.$kind === "danger" ? "#fef2f2" : "#ecfdf5"};
    color: ${(props) => (props.$kind === "danger" ? "#b91c1c" : "#047857")};
    border: 1px solid
        ${(props) => (props.$kind === "danger" ? "#fecaca" : "#bbf7d0")};
    padding: 0.44rem 0.74rem;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    opacity: ${(props) => (props.disabled ? 0.6 : 1)};
`;

const ApproveAllBtn = styled.button`
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.52rem 0.86rem;
    border-radius: 8px;
    font-size: 0.86rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.75rem;
    align-self: flex-start;
    opacity: ${(props) => (props.disabled ? 0.6 : 1)};

    &:hover {
        background: #1d4ed8;
    }
`;

const EmptyState = styled.div`
    margin-top: 0.9rem;
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    color: #6b7280;
    padding: 1rem;
    text-align: center;
    font-size: 0.92rem;
`;

const FooterRow = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.7rem;
    margin-top: 0.8rem;
`;

const PagerBtn = styled.button`
    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
    padding: 0.4rem 0.72rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const PageText = styled.span`
    font-size: 0.85rem;
    color: #6b7280;
    font-weight: 600;
`;

const ErrorText = styled.p`
    margin: 0.75rem 0 0;
    color: #b91c1c;
    font-size: 0.9rem;
    font-weight: 600;
`;

const SuccessText = styled.p`
    margin: 0.75rem 0 0;
    color: #047857;
    font-size: 0.9rem;
    font-weight: 600;
`;

const StudentAcceptanceModal = ({ onClose, refreshPendingCount }) => {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [busyId, setBusyId] = useState(null);
    const [busyAll, setBusyAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busyMessage, setBusyMessage] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const showLoader = useMinimumLoadingDelay(loading, 500);

    const limit = 10;

    useEffect(() => {
        const loadPendingStudents = async () => {
            const token = getAuthTokenOrLogout(navigate);
            if (!token) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");
            setSuccessMessage("");

            try {
                const res = await fetch(
                    `/api/students/pending?page=${page}&limit=${limit}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );

                if (!res.ok) {
                    const errorText = await res.text();
                    setError(errorText || "Failed to load pending students.");
                    setStudents([]);
                    return;
                }

                const data = await res.json();
                setStudents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching pending students:", err);
                setError("Failed to load pending students.");
            } finally {
                setLoading(false);
            }
        };

        loadPendingStudents();
    }, [navigate, page]);

    const approveStudent = async (id, name, email) => {
        const token = getAuthTokenOrLogout(navigate);
        if (!token) return;
        setError("");
        setSuccessMessage("");
        setBusyId(id);
        setBusyMessage("Approving student...");

        try {
            const res = await fetch(`/api/students/${id}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorText = await res.text();
                setError(errorText || "Failed to approve student.");
                return;
            }
            try {
                await SendApprovalEmail(name, email);
                console.log(`Approval email sent to ${email}`);
            } catch (err) {
                console.error("Approval email failed:", err);
            }
            refreshPendingCount();
            setSuccessMessage(`${name} was successfully approved.`);

            const updated = students.filter((s) => s.id !== id);

            if (updated.length === 0 && page > 1) {
                setPage((p) => p - 1);
            } else {
                setStudents(updated);
            }
        } catch (err) {
            console.error("Error approving student:", err);
            setError("Failed to approve student.");
        } finally {
            setBusyId(null);
            setBusyMessage("");
        }
    };

    const denyStudent = async (id, name, email) => {
        const token = getAuthTokenOrLogout(navigate);
        if (!token) return;
        setError("");
        setSuccessMessage("");
        setBusyId(id);
        setBusyMessage("Denying student...");

        try {
            const res = await fetch(`/api/students/${id}/deny`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorText = await res.text();
                setError(errorText || "Failed to deny student.");
                return;
            }
            try {
                await SendRejectionEmail(name, email);
                console.log(`Rejection email sent to ${email}`);
            } catch (err) {
                console.error("Rejection email failed:", err);
            }

            refreshPendingCount();
            setSuccessMessage(`${name} was successfully denied and removed.`);

            const updated = students.filter((s) => s.id !== id);

            if (updated.length === 0 && page > 1) {
                setPage((p) => p - 1);
            } else {
                setStudents(updated);
            }
        } catch (err) {
            console.error("Error denying student:", err);
            setError("Failed to deny student.");
        } finally {
            setBusyId(null);
            setBusyMessage("");
        }
    };

    const approveAll = async () => {
        const token = getAuthTokenOrLogout(navigate);
        if (!token) return;
        setError("");
        setSuccessMessage("");
        setBusyAll(true);
        setBusyMessage("Approving all students...");

        try {
            const res = await fetch("/api/students/approve-all", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorText = await res.text();
                setError(errorText || "Failed to approve all students.");
                return;
            }

            for (const student of students) {
                try {
                    await SendApprovalEmail(student.name, student.email);
                } catch (err) {
                    console.error(
                        "Failed to send approval email to:",
                        student.email,
                    );
                }
            }

            setStudents([]);

            refreshPendingCount();
            setSuccessMessage("All pending students were successfully approved.");
        } catch (err) {
            console.error("Error approving all students:", err);
            setError("Failed to approve all students.");
        } finally {
            setBusyAll(false);
            setBusyMessage("");
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
                {(busyId !== null || busyAll) && (
                    <BusyOverlay>
                        <BrandedLoader
                            message={busyMessage || "Loading..."}
                            minHeight="220px"
                            size="72px"
                        />
                    </BusyOverlay>
                )}
                <CloseButton onClick={onClose}>
                    <FiX size={20} />
                </CloseButton>

                <Header>
                    <Title>
                        Pending Student Approvals
                        <CountBadge>{students.length}</CountBadge>
                    </Title>
                    <Meta>Review and approve registration requests.</Meta>
                </Header>
                {error && <ErrorText>{error}</ErrorText>}
                {successMessage && <SuccessText>{successMessage}</SuccessText>}

                {students.length > 0 && (
                    <ApproveAllBtn
                        onClick={approveAll}
                        disabled={busyAll}>
                        {busyAll ? "Approving..." : "Approve All"}
                    </ApproveAllBtn>
                )}

                {showLoader ? (
                    <BrandedLoader
                        message="Loading pending students..."
                        minHeight="280px"
                        size="72px"
                    />
                ) : students.length === 0 ? (
                    <EmptyState>No pending students.</EmptyState>
                ) : (
                    <>
                        <ListWrap>
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
                                        <ActionBtn
                                            disabled={busyId === student.id}
                                            onClick={() =>
                                                approveStudent(
                                                    student.id,
                                                    student.name,
                                                    student.email,
                                                )
                                            }>
                                            {busyId === student.id
                                                ? "Working..."
                                                : "Approve"}
                                        </ActionBtn>

                                        <ActionBtn
                                            $kind="danger"
                                            disabled={busyId === student.id}
                                            onClick={() =>
                                                denyStudent(
                                                    student.id,
                                                    student.name,
                                                    student.email,
                                                )
                                            }>
                                            {busyId === student.id
                                                ? "Working..."
                                                : "Deny"}
                                        </ActionBtn>
                                    </ButtonGroup>
                                </StudentRow>
                            ))}
                        </ListWrap>

                        <FooterRow>
                            <PagerBtn
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}>
                                Previous
                            </PagerBtn>

                            <PageText>Page {page}</PageText>

                            <PagerBtn
                                disabled={students.length < limit}
                                onClick={() => setPage((p) => p + 1)}>
                                Next
                            </PagerBtn>
                        </FooterRow>
                    </>
                )}
            </ModalCard>
        </ModalOverlay>
    );
};

export default StudentAcceptanceModal;
