import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary-teal: #1abc9c;
    --soft-background: #f7f9fb;
    --card-background: #ffffff;
    --text-primary: #2c3e50;
    --text-secondary: #556;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    
    --gradient-pastel: linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%);
    --gradient-sidebar: linear-gradient(180deg, #84fab0 0%, #8fd3f4 100%);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: var(--soft-background);
    color: var(--text-primary);
  }

  h1, h2, h3, h4 {
    font-family: 'Playfair Display', serif;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

export default GlobalStyles;
