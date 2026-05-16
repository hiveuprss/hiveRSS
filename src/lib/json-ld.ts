/** Site origin for structured data (matches astro.config site). */
const SITE = 'https://hiverss.com';

const WEBSITE_ID = `${SITE}/#website`;
const ORG_ID = `${SITE}/#organization`;

export function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: `${SITE}/`,
        name: 'HiveRSS',
        description:
          'RSS feeds for any Hive author, tag, or community. Subscribe in Feedly, NetNewsWire, or any RSS reader.',
        publisher: { '@id': ORG_ID },
        inLanguage: 'en',
      },
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'HiveRSS',
        url: `${SITE}/`,
        sameAs: ['https://github.com/hiveuprss/hiverss'],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'HiveRSS',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: `${SITE}/`,
      },
    ],
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function profileJsonLd(username: string, pageTitle: string, description: string) {
  const path = `/@${encodeURIComponent(username)}`;
  const url = `${SITE}${path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    name: pageTitle,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'Person',
      name: `@${username}`,
      identifier: username,
      url,
    },
  };
}

export function tagBrowseJsonLd(
  category: string,
  tag: string,
  pageTitle: string,
  description: string,
) {
  const path = `/${encodeURIComponent(category)}/${encodeURIComponent(tag)}`;
  const url = `${SITE}${path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: pageTitle,
        description,
        isPartOf: { '@id': WEBSITE_ID },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: `#${tag}`,
            item: url,
          },
        ],
      },
    ],
  };
}

export function communityJsonLd(
  communityId: string,
  pageTitle: string,
  description: string,
) {
  const path = `/community/${encodeURIComponent(communityId)}`;
  const url = `${SITE}${path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: pageTitle,
        description,
        isPartOf: { '@id': WEBSITE_ID },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Communities',
            item: `${SITE}/communities`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: pageTitle.split(' — ')[0] || communityId,
            item: url,
          },
        ],
      },
    ],
  };
}

export function communitiesListJsonLd(pageTitle: string, description: string) {
  const url = `${SITE}/communities`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: pageTitle,
        description,
        isPartOf: { '@id': WEBSITE_ID },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Communities',
            item: url,
          },
        ],
      },
    ],
  };
}
