import Head from "next/head";
import { useRouter } from "next/router";
import {
  absoluteUrl,
  compactJsonLd,
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO_DESCRIPTION,
  localBusinessSchema,
  organizationSchema,
  SITE_NAME,
} from "@/utils/seo";


const SEO = ({
  pageTitle,
  description = DEFAULT_SEO_DESCRIPTION,
  canonical,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  jsonLd = [],
  noindex = false,
}) => {
  const router = useRouter();
  const title = pageTitle ? `${pageTitle} - ${SITE_NAME}` : SITE_NAME;
  const routePath = router?.asPath ? router.asPath.split("?")[0].split("#")[0] : "";
  const canonicalUrl = canonical || absoluteUrl(canonicalPath || routePath || "/");
  const imageUrl = absoluteUrl(ogImage);
  const schemas = [
    organizationSchema(),
    localBusinessSchema(),
    ...(Array.isArray(jsonLd) ? jsonLd : [jsonLd]),
  ].filter(Boolean);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="description" content={description} />
        <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
        <meta name="theme-color" content="#811a49" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={pageTitle || SITE_NAME} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        {schemas.map((schema, index) => (
          <script
            key={`json-ld-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: compactJsonLd(schema) }}
          />
        ))}
        <link rel="icon" href="/favicon.png" />
      </Head>
    </>
  );
};

export default SEO;
