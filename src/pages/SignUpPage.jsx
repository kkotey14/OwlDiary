import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { SendStudentACKEmail, SendAdminACKEmail } from "../utils/email.js";

const PasswordInputContainer = styled.div`
    position: relative;
    width: 100%;
    box-sizing: border-box;

    & > input {
        padding-right: 45px;
    }
`;

const PasswordToggleButton = styled.span`
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: rgba(15, 23, 42, 0.7);
    font-size: 1.1rem;

    &:hover {
        color: #0f172a;
    }
`;

const PageWrapper = styled.div`
    min-height: 100vh;
    width: 100%;
    display: flex;
    background: linear-gradient(135deg, #5fa9ff 0%, #ffffff 100%);
    font-family: "Inter", sans-serif;
    overflow: hidden;
    position: relative;
    color: #0f172a;
`;

const EditorialSection = styled.div`
    flex: 1.5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding-left: 10%;
    position: relative;
    transform: translateY(-3rem);
    z-index: 2;
`;

const AnimationWrap = styled.div`
    width: min(420px, 82vw);
    aspect-ratio: 1 / 1;
    min-height: 320px;
    margin-bottom: -1.8rem;
    filter: drop-shadow(0 14px 30px rgba(15, 23, 42, 0.14));
    border-radius: 28px;
    overflow: hidden;
    background:
        radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.85) 0%, rgba(219, 234, 254, 0.95) 48%, rgba(191, 219, 254, 0.75) 100%);
    display: grid;
    place-items: center;
`;

const EditorialImage = styled.img`
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
`;

const DateDetail = styled.p`
    font-size: 0.7rem;
    font-weight: 400;
    color: rgba(15, 23, 42, 0.7);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 20px;
`;

const WelcomeMessage = styled.h1`
    font-family: "Playfair Display", serif;
    font-size: 5rem;
    font-weight: 700;
    line-height: 1.1;
    color: #0f172a;
    margin: 0;
`;

const FeaturedQuote = styled.blockquote`
    font-family: "Georgia", serif;
    font-size: 1.1rem;
    font-style: italic;
    color: rgba(15, 23, 42, 0.9);
    max-width: 300px;
    margin-top: 1.5rem;
    line-height: 1.5;
`;

const FormSection = styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
`;

const GlassForm = styled.form`
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    padding: 3rem 2.5rem;
    border-radius: 20px;
    width: 100%;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
    font-family: "Playfair Display", serif;
    font-size: 2.2rem;
    font-weight: 700;
    color: #0f172a;
    text-align: center;
    margin-bottom: 1rem;
`;

const Input = styled.input`
    padding: 1rem 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    font-size: 1rem;
    background-color: transparent;
    color: #0f172a;
    transition: all 0.3s ease;
    box-sizing: border-box; /* Ensure consistent box model */
    width: 100%; /* Ensure all inputs take full width */

    &::placeholder {
        color: rgba(15, 23, 42, 0.6);
    }

    &:focus {
        outline: none;
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.7);
    }
`;

const GhostButton = styled.button`
    padding: 1rem;
    border: 2px solid #0f172a;
    border-radius: 12px;
    background: transparent;
    color: #0f172a;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: #0f172a;
        color: #ffffff;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const LinksContainer = styled.div`
    text-align: center;
    margin-top: 0.5rem;
`;

const StyledLink = styled(Link)`
    color: rgba(15, 23, 42, 0.8);
    text-decoration: none;
    font-size: 0.9rem;

    &:hover {
        color: #0f172a;
        text-decoration: underline;
    }
`;

const ErrorMessage = styled.p`
    color: #ff6b6b;
    text-align: center;
    font-size: 0.9rem;
`;

const SuccessOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
`;

const SuccessModal = styled.div`
    width: 100%;
    max-width: 460px;
    background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 0.96) 100%);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(95, 169, 255, 0.28);
    border-radius: 24px;
    box-shadow: 0 24px 55px rgba(15, 23, 42, 0.26);
    padding: 2rem 1.8rem 1.7rem;
    text-align: center;
    position: relative;
    overflow: hidden;
`;

const SuccessGlow = styled.div`
    position: absolute;
    width: 220px;
    height: 220px;
    border-radius: 999px;
    background: radial-gradient(
        circle,
        rgba(95, 169, 255, 0.28) 0%,
        rgba(95, 169, 255, 0) 72%
    );
    top: -110px;
    right: -70px;
    pointer-events: none;
`;

const SuccessBadge = styled.div`
    width: 74px;
    height: 74px;
    margin: 0 auto 1rem;
    border-radius: 22px;
    display: grid;
    place-items: center;
    font-size: 2rem;
    background: linear-gradient(135deg, #5fa9ff 0%, #dbeafe 100%);
    box-shadow: 0 14px 30px rgba(95, 169, 255, 0.28);
    position: relative;
    z-index: 1;
`;

const SuccessEyebrow = styled.p`
    margin: 0 0 0.45rem 0;
    color: #2563eb;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.18rem;
    text-transform: uppercase;
    position: relative;
    z-index: 1;
`;

const SuccessTitle = styled.h3`
    font-family: "Playfair Display", serif;
    font-size: 2rem;
    margin: 0 0 0.65rem 0;
    color: #0f172a;
    position: relative;
    z-index: 1;
`;

const SuccessText = styled.p`
    margin: 0 auto 1.35rem;
    color: rgba(15, 23, 42, 0.78);
    font-size: 1rem;
    line-height: 1.65;
    max-width: 34ch;
    position: relative;
    z-index: 1;
`;

const SuccessInfo = styled.div`
    margin: 0 auto 1.35rem;
    padding: 0.9rem 1rem;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(148, 163, 184, 0.18);
    color: #334155;
    font-size: 0.92rem;
    line-height: 1.55;
    max-width: 34ch;
    position: relative;
    z-index: 1;
`;

const SuccessButton = styled.button`
    padding: 0.95rem 1.3rem;
    border: none;
    border-radius: 14px;
    background: #0f172a;
    color: #ffffff;
    font-size: 0.96rem;
    font-weight: 600;
    cursor: pointer;
    min-width: 220px;
    position: relative;
    z-index: 1;
    transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        background-color 0.18s ease;

    &:hover {
        background: #111827;
        transform: translateY(-1px);
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.22);
    }
`;

const CodeInputWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
`;

const CodeInput = styled.input`
    width: 160px; /* Half the size of regular inputs */
    padding: 1rem;
    border-radius: 12px;
    font-size: 1.2rem;
    font-family:
        "Courier New", Courier, monospace; /* Monospace for alignment */
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.5rem; /* Creates the "empty space" look between chars */
    background-color: #ffffff; /* Solid white box */
    color: #0f172a;
    border: 2px solid #0f172a;
    text-transform: uppercase;

    &::placeholder {
        letter-spacing: normal;
        font-size: 0.8rem;
        color: rgba(15, 23, 42, 0.4);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(95, 169, 255, 0.4);
    }

    border: 2px solid
        ${(props) =>
            props.$codeLength < 5
                ? "#0f172a"
                : props.$isValid
                  ? "#22c55e"
                  : "#ef4444"};
    transition: border-color 0.3s ease;
`;

const CodeLabel = styled.label`
    font-size: 0.75rem;
    font-weight: 600;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const SignUpPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [registrationCode, setRegistrationCode] = useState("");
    const [isCodeValid, setIsCodeValid] = useState(false);

    useEffect(() => {
        const validateEntry = async () => {
            if (registrationCode.length === 5) {
                try {
                    const res = await fetch(
                        `/api/validate-code/${registrationCode}`,
                    );
                    const data = await res.json();
                    setIsCodeValid(data.isValid);
                } catch (err) {
                    console.error("Error validating code:", err);
                    setIsCodeValid(false);
                }
            } else {
                setIsCodeValid(false);
            }
        };
        validateEntry();
    }, [registrationCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (registrationCode.length !== 5) {
            setError("Registration code must be 5 characters.");
            return;
        }

        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    code: registrationCode.toUpperCase(),
                }),
            });

            const raw = await response.text();
            const data = raw ? JSON.parse(raw) : {};

            if (!response.ok)
                throw new Error(data.error || "Failed to sign up");
            try {
                await SendStudentACKEmail(name, email);
                await SendAdminACKEmail(name);
                console.log(
                    `Acknowledgment emails sent to ${email} and admin.`,
                );
            } catch (emailError) {
                console.error("Email sending failed:", emailError);
            }
            setShowSuccessPopup(true);
        } catch (err) {
            setError(err.message);
        }
    };
    return (
        <PageWrapper>
            <EditorialSection>
                <AnimationWrap aria-hidden="true">
                    <EditorialImage
                        src="/Poetry-rafiki.png"
                        alt="Poetry illustration"
                    />
                </AnimationWrap>
                <WelcomeMessage>Start Your Story</WelcomeMessage>
                <FeaturedQuote>
                    'The palest ink is better than the best memory.' — Chinese
                    Proverb.
                </FeaturedQuote>
            </EditorialSection>
            <FormSection>
                <GlassForm onSubmit={handleSubmit}>
                    <Title>Create Account</Title>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <Input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <PasswordInputContainer>
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <PasswordToggleButton
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </PasswordToggleButton>
                    </PasswordInputContainer>
                    <PasswordInputContainer>
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <PasswordToggleButton
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }>
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </PasswordToggleButton>
                    </PasswordInputContainer>
                    <CodeInputWrapper>
                        <CodeLabel>Registration Code</CodeLabel>
                        <CodeInput
                            $isValid={isCodeValid}
                            $codeLength={registrationCode.length}
                            type="text"
                            placeholder="_____"
                            required
                            maxLength="5"
                            value={registrationCode}
                            onChange={(e) =>
                                setRegistrationCode(
                                    e.target.value.toUpperCase(),
                                )
                            }
                        />
                    </CodeInputWrapper>
                    <GhostButton
                        type="submit"
                        disabled={
                            password !== confirmPassword ||
                            !password ||
                            !confirmPassword ||
                            !isCodeValid
                        }>
                        Sign Up
                    </GhostButton>
                    <LinksContainer>
                        <StyledLink to="/login">
                            Already have an account? Login
                        </StyledLink>
                    </LinksContainer>
                </GlassForm>
            </FormSection>
            {showSuccessPopup && (
                <SuccessOverlay>
                    <SuccessModal>
                        <SuccessGlow />
                        <SuccessBadge>✓</SuccessBadge>
                        <SuccessEyebrow>Request Received</SuccessEyebrow>
                        <SuccessTitle>Account Created</SuccessTitle>
                        <SuccessText>
                            Your Owl Diary account request has been submitted
                            successfully.
                        </SuccessText>
                        <SuccessInfo>
                            Your access is now awaiting approval. You will
                            receive an email once your request has been
                            reviewed.
                        </SuccessInfo>
                        <SuccessButton
                            type="button"
                            onClick={() => {
                                setShowSuccessPopup(false);
                                navigate("/login");
                            }}>
                            Continue to Login
                        </SuccessButton>
                    </SuccessModal>
                </SuccessOverlay>
            )}
        </PageWrapper>
    );
};

export default SignUpPage;
