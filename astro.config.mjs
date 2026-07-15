// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://kryshn7777.github.io',
  base: '/FreelancerPlanningg',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});