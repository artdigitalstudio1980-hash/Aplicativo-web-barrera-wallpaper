const requiredEnv = [
  'DATABASE_URL',
  'GOOGLE_AI_STUDIO_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'AWS_REGION',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN'
];

console.log('--- Verificando variables de entorno necesarias ---');
requiredEnv.forEach(env => {
  if (!process.env[env]) {
    console.log('⚠️  FALTA: ' + env);
  } else {
    console.log('✅ OK: ' + env);
  }
});
