import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
    FiDownload,
    FiExternalLink,
    FiShield,
    FiDatabase,
    FiList,
} from "react-icons/fi";
import { exportUserData } from "../utils/FetchData.js";
import { getAuthTokenOrLogout } from "../utils/auth";
import RegistrationCodeManager from "../components/RegistrationCodeManager.jsx";
import StudentAcceptanceModal from "../components/StudentAcceptanceModal.jsx";

const SettingsPage = styled.div`
    margin: -2.5rem;
    padding: 2.5rem;
    min-height: 100vh;
    width: calc(100% + 5rem);
    background: #f6f8fb;
    box-sizing: border-box;
`;

const SettingsHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2.25rem;
`;

const PageTitle = styled.h1`
    font-size: 2rem;
    line-height: 1.2;
    color: #1f2937;
`;

const Subtitle = styled.p`
    max-width: 680px;
    color: #4b5563;
    font-size: 0.95rem;
`;

const SettingsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.9rem;
    max-width: 760px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const SettingCard = styled.article`
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.65rem;
`;

const IconBadge = styled.span`
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #eef2f7;
    color: #475569;
    flex-shrink: 0;
`;

const CardTitle = styled.h2`
    font-size: 1rem;
    font-family: "Inter", sans-serif;
    font-weight: 600;
    color: #1f2937;
`;

const CardDescription = styled.p`
    color: #6b7280;
    line-height: 1.45;
    font-size: 0.9rem;
`;

const ActionButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    width: fit-content;
    background: #2563eb;
    color: #ffffff;
    border: 1px solid #1d4ed8;
    border-radius: 8px;
    padding: 0.68rem 1rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition:
        background-color 0.18s ease,
        opacity 0.18s ease;

    &:hover {
        background: #1d4ed8;
    }

    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1200;
    padding: 1rem;
`;

const ModalCard = styled.div`
    width: 100%;
    max-width: 460px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.2);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const ModalTitle = styled.h3`
    color: #1f2937;
    font-size: 1.05rem;
`;

const ModalMessage = styled.p`
    color: #4b5563;
    font-size: 0.9rem;
    line-height: 1.5;
    white-space: pre-line;
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 0.25rem;
`;

const SecondaryButton = styled.button`
    border: 1px solid #d1d5db;
    background: #fff;
    color: #374151;
    border-radius: 8px;
    padding: 0.62rem 0.95rem;
    font-size: 0.9rem;
    cursor: pointer;
`;

const ModalPrimaryButton = styled(ActionButton)`
    padding: 0.62rem 0.95rem;
`;

const Settings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [exporting, setExporting] = React.useState(false);
    const [dialog, setDialog] = React.useState(null);
    const [user, setUser] = React.useState(null);
    const [showManageModal, setShowManageModal] = React.useState(false);
    const [showStudentModal, setShowStudentModal] = React.useState(false);
    const [pendingCount, setPendingCount] = React.useState(0);

    useEffect(() => {
        const loadSettingsData = async () => {
            const token = getAuthTokenOrLogout(navigate);
            if (!token) return;

            try {
                // Fetch user data
                const meRes = await fetch("/api/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (meRes.ok) {
                    const me = await meRes.json();
                    setUser(me);

                    // If admin, fetch pending count
                    if (me.role === "admin") {
                        const pendingRes = await fetch(
                            "/api/students/pending",
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            },
                        );
                        if (pendingRes.ok) {
                            const pendingData = await pendingRes.json();
                            setPendingCount(
                                Array.isArray(pendingData)
                                    ? pendingData.length
                                    : 0,
                            );
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading settings data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadSettingsData();
    }, [navigate]);

    const isAdmin = user?.role === "admin";

    const closeDialog = () => setDialog(null);

    const dataSafetyMessage =
        "Exported files may contain personal content. Store downloads in a secure location and avoid sharing them on public systems.";

    const handleExportData = async () => {
        setDialog({
            title: "Export Data?",
            message: `This will download your posts and comments as a JSON file.\n\n${dataSafetyMessage}`,
            confirmLabel: "Continue Export",
            onConfirm: async () => {
                closeDialog();
                setExporting(true);
                await exportUserData();
                setExporting(false);
            },
        });
    };

    const handleAccountSettings = () => {
        setDialog({
            title: "Open Account Portal?",
            message: `This opens the SCSU account settings page in a new tab.`,
            confirmLabel: "Open Portal",
            onConfirm: () => {
                closeDialog();
                try {
                    const newWindow = window.open(
                        "https://myaccount.microsoft.com/?ref=MeControl",
                        "_blank",
                        "noopener,noreferrer",
                    );

                    if (!newWindow) {
                        throw new Error("Popup blocked or failed to open.");
                    }
                } catch (error) {
                    console.error("Failed to open SCSU portal:", error);
                    setDialog({
                        title: "Unable to Open Portal",
                        message:
                            "Please allow popups for this site and try again.",
                        confirmLabel: "Close",
                        onConfirm: closeDialog,
                        cancelLabel: null,
                    });
                }
            },
        });
    };

    const adminCreationButton = async () => {
        const email = prompt("New admin email:");
        const password = prompt("New admin password:");
        const name = prompt("Admin name (optional):");

        if (!email || !password) {
            alert("Email and password are required.");
            return;
        }

        const token = getAuthTokenOrLogout(navigate);

        try {
            const res = await fetch("/api/create-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Admin created successfully");
            } else {
                alert(data.error || "Failed to create admin");
            }
        } catch (error) {
            console.error("Admin creation failed:", error);
        }
    };

    const generateRandomCode = () => {
        const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars like 0, O, 1, I
        let result = "";
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * characters.length),
            );
        }
        return result;
    };

    const refreshPendingCount = async () => {
        const token = getAuthTokenOrLogout(navigate);
        if (!token) return;

        try {
            const res = await fetch("/api/students/pending", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setPendingCount(Array.isArray(data) ? data.length : 0);
            }
        } catch (error) {
            console.error("Error refreshing pending count:", error);
        }
    };

    const handleGenerateCode = async () => {
        const semester = prompt("Enter the semester (e.g., Fall 2026):");
        if (!semester) return;

        const newCode = generateRandomCode();
        const token = getAuthTokenOrLogout(navigate);

        try {
            const res = await fetch("/api/generate-registration-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: newCode,
                    semester: semester,
                }),
            });

            if (res.ok) {
                setDialog({
                    title: "Code Generated!",
                    message: `New code for ${semester}: ${newCode}\n\nStudents can now use this to register.`,
                    confirmLabel: "Done",
                    onConfirm: closeDialog,
                    cancelLabel: null,
                });
            } else {
                alert("Failed to save code to database.");
            }
        } catch (error) {
            console.error("Error generating code:", error);
        }
    };

    if (loading) {
        return <div>Loading settings...</div>;
    }

    return (
        <SettingsPage>
            <SettingsHeader>
                <PageTitle>Settings</PageTitle>
                <Subtitle>
                    Manage your account tools, export your data, and open
                    organization-level account controls.
                </Subtitle>
            </SettingsHeader>

            <SettingsGrid>
                <SettingCard>
                    <CardHeader>
                        <IconBadge>
                            <FiDatabase size={17} />
                        </IconBadge>
                        <CardTitle>Data Export</CardTitle>
                    </CardHeader>
                    <CardDescription>
                        Download your posts, comments, and profile metadata as a
                        JSON snapshot for backup or transfer.
                    </CardDescription>
                    <ActionButton
                        onClick={handleExportData}
                        disabled={exporting}
                        title="Export your profile data and posts to a JSON file.">
                        <FiDownload size={16} />
                        {exporting ? "Exporting..." : "Export Data"}
                    </ActionButton>
                </SettingCard>

                <SettingCard>
                    <CardHeader>
                        <IconBadge>
                            <FiShield size={17} />
                        </IconBadge>
                        <CardTitle>Account Portal</CardTitle>
                    </CardHeader>
                    <CardDescription>
                        Open your organization account center to update security
                        settings, sign-in methods, and profile controls.
                    </CardDescription>
                    <ActionButton
                        onClick={handleAccountSettings}
                        title="Navigate to the SCSU account settings page.">
                        <FiExternalLink size={16} />
                        Account Settings
                    </ActionButton>
                </SettingCard>

                {isAdmin && (
                    <SettingCard>
                        <CardHeader>
                            <IconBadge>
                                <FiShield size={17} />
                            </IconBadge>
                            <CardTitle>Admin Creation</CardTitle>
                        </CardHeader>

                        <CardDescription>
                            Create additional administrators for the platform.
                        </CardDescription>

                        <ActionButton onClick={adminCreationButton}>
                            Create Admin
                        </ActionButton>
                    </SettingCard>
                )}
                {isAdmin && (
                    <SettingCard>
                        <CardHeader>
                            <IconBadge>
                                <FiDatabase size={17} />
                            </IconBadge>
                            <CardTitle>Registration Management</CardTitle>
                        </CardHeader>
                        <CardDescription>
                            Generate a random 5-character code or view history
                            for student registration.
                        </CardDescription>

                        {/* New Flex container for buttons */}
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <ActionButton onClick={handleGenerateCode}>
                                Generate New Code
                            </ActionButton>
                            <SecondaryButton
                                onClick={() => setShowManageModal(true)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}>
                                <FiList size={16} />
                                Manage Codes
                            </SecondaryButton>
                            <SecondaryButton
                                onClick={() => setShowStudentModal(true)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}>
                                <FiList size={16} />
                                Manage Students{" "}
                                {pendingCount > 0 && `(${pendingCount})`}
                            </SecondaryButton>
                        </div>
                    </SettingCard>
                )}

                {/* Manage Codes Modal Component */}
                {showManageModal && (
                    <RegistrationCodeManager
                        onClose={() => setShowManageModal(false)}
                    />
                )}
                {showStudentModal && (
                    <StudentAcceptanceModal
                        onClose={() => setShowStudentModal(false)}
                        refreshPendingCount={refreshPendingCount}
                    />
                )}
            </SettingsGrid>
            {dialog && (
                <ModalOverlay onClick={closeDialog}>
                    <ModalCard onClick={(event) => event.stopPropagation()}>
                        <ModalTitle>{dialog.title}</ModalTitle>
                        <ModalMessage>{dialog.message}</ModalMessage>
                        <ModalActions>
                            {dialog.cancelLabel !== null && (
                                <SecondaryButton onClick={closeDialog}>
                                    Cancel
                                </SecondaryButton>
                            )}
                            <ModalPrimaryButton onClick={dialog.onConfirm}>
                                {dialog.confirmLabel || "Continue"}
                            </ModalPrimaryButton>
                        </ModalActions>
                    </ModalCard>
                </ModalOverlay>
            )}
        </SettingsPage>
    );
};

export default Settings;
