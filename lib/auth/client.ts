// ==============================================================================
// CINDERPRESS INSFORGE AUTHENTICATION CLIENT
// ==============================================================================

import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://q7hwjwtx.ap-southeast.insforge.app';
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'anon_4c318c8b629d149fca35396623101b6db2d93f213ba6b3e591878f9c66e52e70';

export const insforge = createClient({
  baseUrl,
  anonKey,
});

export default insforge;
