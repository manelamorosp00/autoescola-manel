import Head from "next/head";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Autoescola Manel — Ares al volant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#05040a" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
