import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function buildModeIntegration() {
  return {
    name: 'rivora-build-mode',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const mode = process.env.PUBLIC_SITE_ENV || 'production';
        const apiDir = path.join(fileURLToPath(dir), 'api');
        if (fs.existsSync(apiDir)) {
          fs.writeFileSync(
            path.join(apiDir, 'build-mode.php'),
            `<?php\n// Generated at build time\ndefine('RIVORA_BUILD_MODE', '${mode}');\n`
          );
        }
      },
    },
  };
}

export default defineConfig({
  integrations: [buildModeIntegration()],
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com', '.loca.lt'],
    headers: {
      'X-Robots-Tag': 'noindex, nofollow',
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['.trycloudflare.com', '.loca.lt'],
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
    preview: {
      allowedHosts: ['.trycloudflare.com', '.loca.lt'],
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  },
});
