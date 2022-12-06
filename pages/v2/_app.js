import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'
import { Layout } from '../components'
import { AppContext } from "../context";

function MyApp({ Component, pageProps }) {
  const [accountAddress, setAccountAddress] = useState(null);

  return (
    <AppContext.Provider
      value={{accountAddress, setAccountAddress}}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppContext.Provider>
  )
}

export default MyApp
