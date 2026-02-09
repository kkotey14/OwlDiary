import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Import eye icons

const Input = styled.input`
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 1rem;
  background-color: transparent;
  color: #0f172a;
  transition: all 0.3s ease;
  box-sizing: border-box;
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

const PasswordInputContainer = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box; /* Ensure width is consistent */

  /* Apply specific padding to the input element directly within this container */
  & > input {
    padding-right: 45px; /* Make space for the toggle button */
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
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  position: relative;
  color: #0f172a;
`;

const FeaturedQuote = styled.blockquote`
  font-family: 'Georgia', serif;
  font-size: 1.1rem;
  font-style: italic;
  color: rgba(15, 23, 42, 0.9);
  max-width: 300px;
  margin-top: 1.5rem;
  line-height: 1.5;
`;

const EditorialSection = styled.div`
  flex: 1.5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 10%;
  position: relative;
  z-index: 2;
`;

const WelcomeMessage = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 5rem;
  font-weight: 700;
  line-height: 1.1;
  color: #0f172a;
  margin-left: 0;

  span {
    font-size: 7rem;
    display: inline-block;
    vertical-align: middle;
  }
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
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  margin-bottom: 1rem;
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
`;

const LinksContainer = styled.div`
  display: flex;
  justify-content: space-between;
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
`;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      if (response.ok) {
        data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        let errorMessage = 'Failed to login';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          const errorText = await response.text();
          errorMessage = `API error: ${response.status} - ${errorText || errorMessage}`;
        }
        
        if (response.status === 401) {
          throw new Error('Wrong username or password');
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <PageWrapper>
      <EditorialSection>
        <WelcomeMessage>
          <span>W</span>elcome <span>B</span>ack
        </WelcomeMessage>
        <FeaturedQuote>
          "Fill your paper with the breathings of your heart." — William Wordsworth
        </FeaturedQuote>
      </EditorialSection>
      <FormSection>
        <GlassForm onSubmit={handleSubmit}>
          <Title>Login</Title>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInputContainer>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordToggleButton onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />} {/* Toggle icon */}
            </PasswordToggleButton>
          </PasswordInputContainer>
          <GhostButton type="submit">Login</GhostButton>
          <LinksContainer>
            <StyledLink to="/signup">Create Account</StyledLink>
            <StyledLink to="/forgot-password">Forgot Password?</StyledLink>
          </LinksContainer>
        </GlassForm>
      </FormSection>
    </PageWrapper>
  );
};

export default LoginPage;
