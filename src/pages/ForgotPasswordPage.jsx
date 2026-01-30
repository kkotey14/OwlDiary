import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const ForgotPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--soft-background);
  font-family: 'Inter', sans-serif;
`;

const ForgotPasswordForm = styled.form`
  background: var(--card-background);
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 1px solid var(--border-color);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 0.5rem;
  font-family: 'Orbitron', sans-serif; /* Hacking-themed font */
`;

const Subtitle = styled.p`
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

const Input = styled.input`
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--input-background);
  color: var(--text-primary);
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-cyber);
    box-shadow: 0 0 0 4px rgba(0, 255, 255, 0.2);
  }
`;

const Button = styled.button`
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: var(--primary-cyber);
  color: #000;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.2);

  &:hover {
    background: #00e0e0;
    box-shadow: 0 6px 20px rgba(0, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const LinksContainer = styled.div`
  text-align: center;
  margin-top: 0.5rem;
`;

const StyledLink = styled(Link)`
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    color: var(--primary-cyber);
    text-decoration: underline;
  }
`;

const ForgotPasswordPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Forgot password attempt');
    // Here you would typically handle sending a password reset email
    alert('A password reset link has been sent to your email address.');
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordForm onSubmit={handleSubmit}>
        <Title>Reset Password</Title>
        <Subtitle>Enter your email to receive a reset link</Subtitle>
        <Input type="email" placeholder="Email Address" required />
        <Button type="submit">Send Reset Link</Button>
        <LinksContainer>
          <StyledLink to="/login">Back to Login</StyledLink>
        </LinksContainer>
      </ForgotPasswordForm>
    </ForgotPasswordContainer>
  );
};

export default ForgotPasswordPage;
