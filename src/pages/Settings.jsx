import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

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
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
`;

const ActionButton = styled.button`
    border: 1px solid #dfe6ee;
    background: white;
    color: #2c3e50;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
`;

//page component
const Settings = () => {
    const handleExportData = () => {
        console.log("Exporting data...");
    };

    return (
        <SettingsPage>
            <SettingsHeader>
                <PageTitle>Settings</PageTitle>
                <div>
                    <ActionButton onClick={handleExportData}>
                        Export Data
                    </ActionButton>
                    <Link to="/settings/account">
                        <ActionButton style={{ marginLeft: "1rem" }}>
                            Account Settings
                        </ActionButton>
                    </Link>
                </div>
            </SettingsHeader>
            {/* Additional settings content can go here */}
        </SettingsPage>
    );
};

export default Settings;
