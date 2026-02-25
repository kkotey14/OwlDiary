import React from "react";
import styled from "styled-components";
import { exportUserData } from "../utils/FetchData.js";

//styles
const SettingsPage = styled.div`
    margin: -2.5rem;
    padding: 2.5rem;
    min-height: 100vh;
    width: calc(100% + 5rem);
    background: linear-gradient(135deg, #5fa9ff 0%, #ffffff 100%);
    box-sizing: border-box;
`;

const SettingsHeader = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    width: 100%;
`;

const ActionButton = styled.button`
    display: inline-block;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.8rem 1.5rem;
    font-size: 1.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background: #5a6edc;
    }
`;

const ButtonContainer = styled.div`
    margin-top: 2rem;
    display: flex;
    justify-content: flex-start;
`;

//page component
const Settings = () => {
    const [exporting, setExporting] = React.useState(false);

    const handleExportData = async () => {
        const confirmed = confirm(
            "This will download all your posts and comments as a JSON file. Continue?",
        );
        if (!confirmed) return;
        setExporting(true);
        await exportUserData();
        setExporting(false);
    };

    const handleAccountSettings = () => {
        console.log("Navigating to SCSU portal...");

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
            alert(
                "Unable to open the portal. Please allow popups and try again.",
            );
        }
    };

    return (
        <SettingsPage>
            <SettingsHeader>
                <PageTitle>Settings</PageTitle>
                <ButtonContainer>
                    <ActionButton
                        onClick={handleExportData}
                        disabled={exporting}
                        title="Export your profile data and posts to a JSON file.">
                        {exporting ? "Exporting..." : "Export Data"}
                    </ActionButton>
                </ButtonContainer>
                <ButtonContainer>
                    <ActionButton
                        onClick={handleAccountSettings}
                        title="Navigate to the SCSU account settings page.">
                        Account Settings
                    </ActionButton>
                </ButtonContainer>
            </SettingsHeader>
            {/* Additional settings content can go here */}
        </SettingsPage>
    );
};

export default Settings;
