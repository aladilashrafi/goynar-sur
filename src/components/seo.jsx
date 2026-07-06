import Head from "next/head";


const SEO = ({pageTitle}) => (
  <>
    <Head>
      <title>
        {pageTitle ? `${pageTitle} - Goynar Sur` : 'Goynar Sur'}
      </title>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="description" content="Shop handmade jewellery from Goynar Sur with Cash on Delivery across Bangladesh." />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#811a49" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <link rel="icon" href="/favicon.png" />
    </Head>
  </>
);

export default SEO;
