// Reads amplify_outputs.json (produced by `npx ampx sandbox` or pipeline-deploy)
// and writes a .env.local with the NEXT_PUBLIC_* vars the Lure client reads.
// Run with: npm run sync:lure-env

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputsPath = join(root, 'amplify_outputs.json');

if (!existsSync(outputsPath)) {
  console.error('amplify_outputs.json not found. Run `npx ampx sandbox` first.');
  process.exit(1);
}

const outputs = JSON.parse(readFileSync(outputsPath, 'utf8'));
const auth = outputs.auth || {};
const data = outputs.data || {};

const lines = [
  '# Generated from amplify_outputs.json by npm run sync:lure-env',
  `NEXT_PUBLIC_AWS_REGION=${auth.aws_region || data.aws_region || ''}`,
  `NEXT_PUBLIC_COGNITO_USER_POOL_ID=${auth.user_pool_id || ''}`,
  `NEXT_PUBLIC_COGNITO_CLIENT_ID=${auth.user_pool_client_id || ''}`,
  `NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=${auth.identity_pool_id || ''}`,
  `NEXT_PUBLIC_APPSYNC_ENDPOINT=${data.url || ''}`,
  '',
];

writeFileSync(join(root, '.env.local'), lines.join('\n'), 'utf8');
console.log('Wrote .env.local from amplify_outputs.json. Restart the dev server to pick it up.');
