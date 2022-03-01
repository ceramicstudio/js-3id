import { Provider as MultiauthProvider } from '@ceramicstudio/multiauth'
import { Grommet } from 'grommet'
import { Provider as StateProvider } from 'jotai'
import NextApp, { AppInitialProps } from 'next/app'
import Head from 'next/head'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`   
  @font-face {
    font-family: Segment;       
    font-style: normal;
    font-weight: 400;
    font-display: fallback;
    src: local('Segment Regular'),
      local('Segment-Regular'),
      url('/v2/fonts/Segment-Regular.woff2') format('woff2'),
      url('/v2/fonts/Segment-Regular.woff') format('woff');
  }
  @font-face {
    font-family: Segment;       
    font-style: normal;
    font-weight: 500;
    font-display: fallback;
    src: local('Segment Medium'),
      local('Segment-Medium'),
      url('/v2/fonts/Segment-Medium.woff2') format('woff2'),
      url('/v2/fonts/Segment-Medium.woff') format('woff');
  }
  @font-face {
    font-family: Segment;       
    font-style: normal;
    font-weight: 600;
    font-display: fallback;
    src: local('Segment SemiBold'),
      local('Segment-SemiBold'),
      url('/v2/fonts/Segment-SemiBold.woff2') format('woff2'),
      url('/v2/fonts/Segment-SemiBold.woff') format('woff');
  }

  body {
    background-color: rgba(37, 41, 46, 0.5);
    font-family: Segment, sans-serif;
    height: 100vh;
  }
`

import { connectors } from '../auth'
import { theme } from '../theme'

export default class App extends NextApp<AppInitialProps> {
  render() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { Component, pageProps } = this.props
    return (
      <MultiauthProvider providers={[{ key: 'ethereum', connectors }]} theme={theme}>
        <StateProvider>
          <Grommet full theme={theme}>
            <GlobalStyle />
            <Head>
              <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <Component {...pageProps} />
          </Grommet>
        </StateProvider>
      </MultiauthProvider>
    )
  }
}
