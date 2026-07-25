import JsonLdScript from '@/components/json-ld-script';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ questions }: { questions: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return <JsonLdScript data={schema} />;
}
