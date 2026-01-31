// Build script for server using esbuild API
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['server/index.ts'],
  platform: 'node',
  packages: 'external',
  bundle: true,
  format: 'esm',
  outdir: 'dist',
}).catch(() => process.exit(1));
