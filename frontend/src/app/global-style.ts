'use client'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  html {
    overflow-x: hidden;
    max-width: 100%;
  }

  html,
  body {
    background-color: ${({ theme }) => theme.colors.background};
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }

  * {
    box-sizing: border-box;
  }

  body > * {
    max-width: 100vw;
  }

  /* Add padding for fixed header and navbar */
  body {
    padding-top: 64px; /* Header height */
    padding-bottom: calc(64px + env(safe-area-inset-bottom));
  }
`

export default GlobalStyle
