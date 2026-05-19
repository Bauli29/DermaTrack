'use client'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  :root {
    --header-height: 64px;
    --navbar-height: 64px;
  }

  html {
    overflow-x: hidden;
    max-width: 100%;
  }

  html,
  body {
    background-color: ${({ theme }) => theme.colors.background};
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;

    width: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  * {
    box-sizing: border-box;
  }

  #__next {
    width: 100%;
    overflow-x: hidden;
  }

  body {
    padding-top: var(--header-height);
    padding-bottom: calc(var(--navbar-height) + env(safe-area-inset-bottom));
  }
`

export default GlobalStyle
