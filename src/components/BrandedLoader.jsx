import React from "react";
import styled, { keyframes } from "styled-components";

const bounce = keyframes`
    0%,
    80%,
    100% {
        transform: translateY(0);
        opacity: 0.35;
    }

    40% {
        transform: translateY(-5px);
        opacity: 1;
    }
`;

const LoaderShell = styled.div`
    width: 100%;
    min-height: ${({ $minHeight }) => $minHeight};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    padding: 1.5rem;
    text-align: center;
`;

const LoaderRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const Logo = styled.img`
    width: ${({ $size }) => $size};
    height: ${({ $size }) => $size};
    object-fit: contain;
    filter: drop-shadow(0 10px 24px rgba(15, 23, 42, 0.18));
`;

const DotGroup = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 0.4rem;
    min-width: 48px;
`;

const Dot = styled.span`
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #1d4ed8;
    box-shadow: 0 6px 14px rgba(29, 78, 216, 0.25);
    animation: ${bounce} 1.2s ease-in-out infinite;
    animation-delay: ${({ $delay }) => $delay};
`;

const Message = styled.p`
    margin: 0;
    font-size: 0.96rem;
    font-weight: 600;
    color: #334155;
`;

function BrandedLoader({
    message = "Loading...",
    minHeight = "220px",
    size = "88px",
}) {
    return (
        <LoaderShell $minHeight={minHeight}>
            <LoaderRow>
                <Logo src="/scsu.png" alt="SCSU logo" $size={size} />
                <DotGroup aria-hidden="true">
                    <Dot $delay="0s" />
                    <Dot $delay="0.18s" />
                    <Dot $delay="0.36s" />
                </DotGroup>
            </LoaderRow>
            <Message>{message}</Message>
        </LoaderShell>
    );
}

export default BrandedLoader;
