import JsonLdScript from '@/components/json-ld-script';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://barrerawallpaper.com';

export function InstallationServiceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/installation#service`,
    name: 'Professional Wallpaper Installation',
    description: 'Expert wallpaper installation services for residential and commercial spaces in Miami, FL and nationwide.',
    provider: { '@id': `${baseUrl}/#organization` },
    areaServed: [
      { '@type': 'City', name: 'Miami' },
      { '@type': 'State', name: 'Florida' },
      { '@type': 'Country', name: 'US' },
    ],
    serviceType: 'Wallpaper Installation',
    category: ['Residential Installation', 'Commercial Installation'],
    offers: [
      {
        '@type': 'Offer',
        name: 'Residential Wallpaper Installation',
        description: 'Professional installation for homes including surface preparation, precision installation, and cleanup.',
        price: '0',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '0',
          priceCurrency: 'USD',
          description: 'Custom quote based on project scope',
        },
      },
      {
        '@type': 'Offer',
        name: 'Commercial Wallpaper Installation',
        description: 'Specialized installation for offices, hotels, restaurants, and retail spaces.',
        price: '0',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '0',
          priceCurrency: 'USD',
          description: 'Custom quote based on project scope',
        },
      },
    ],
  };

  return <JsonLdScript data={schema} />;
}

export function DesignServiceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Custom Wallpaper Design Service',
    description: 'AI-powered wallpaper generation, custom design consultation, and custom printing services.',
    provider: { '@id': `${baseUrl}/#organization` },
    serviceType: 'Custom Wallpaper Design',
    category: ['AI Wallpaper Generation', 'Custom Design Consultation', 'Custom Printing'],
  };

  return <JsonLdScript data={schema} />;
}
