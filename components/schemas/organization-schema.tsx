import JsonLdScript from '@/components/json-ld-script';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://barrerawallpaper.com';

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${baseUrl}/#organization`,
    name: 'Barrera Wallpaper',
    legalName: 'Barrera Wallpaper LLC',
    alternateName: 'Barrera Wallpaper Miami',
    description: 'Premium wall coverings and professional wallpaper installation services in Miami. Specializing in SYSTEXX German-engineered glass fiber textiles, AI-powered custom wallpaper design, and residential/commercial installation.',
    url: baseUrl,
    logo: `${baseUrl}/images/Barrera_logo_black-2.png`,
    image: `${baseUrl}/og-image.jpg`,
    foundingDate: '2014',
    founder: {
      '@type': 'Person',
      name: 'Oscar Barrera',
      jobTitle: 'Founder & Principal Designer',
      url: `${baseUrl}/about`,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Miami',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.7617,
      longitude: -80.1918,
    },
    telephone: '+1-305-555-0000',
    email: 'info@barrerawallpaper.com',
    priceRange: '$$-$$$',
    areaServed: [
      { '@type': 'City', name: 'Miami' },
      { '@type': 'State', name: 'Florida' },
      { '@type': 'Country', name: 'US' },
    ],
    sameAs: [
      'https://facebook.com/barrerawallpaper',
      'https://instagram.com/barrerawallpaper',
      'https://pinterest.com/barrerawallpaper',
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Wallpaper Installation',
          description: 'Professional wallpaper installation for residential and commercial spaces.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'SYSTEXX Wall Coverings',
          description: 'German-engineered glass fiber textile wall coverings.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Custom Wallpaper Design',
          description: 'AI-powered and custom wallpaper design services.',
        },
      },
    ],
  };

  return <JsonLdScript data={schema} />;
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'Barrera Wallpaper',
    url: baseUrl,
    description: 'Premium wall coverings by Oscar Barrera. AI-powered custom wallpaper, installation services in Miami & USA.',
    publisher: { '@id': `${baseUrl}/#organization` },
    inLanguage: ['en', 'es'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/catalog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLdScript data={schema} />;
}
