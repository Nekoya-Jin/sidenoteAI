// Build script for webview (TS + React)
// Usage: node esbuild.webview.js [--watch] [--production]
const esbuild = require('esbuild');
const path = require('path');

const args = new Set(process.argv.slice(2));
const watch = args.has('--watch');
// default production unless explicitly watching
const production = args.has('--production') || !watch;

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: [path.resolve(__dirname, 'src', 'webview', 'index.tsx')],
  outfile: path.resolve(__dirname, 'dist', 'webview', 'app.js'),
  bundle: true,
  sourcemap: watch ? 'inline' : false,
  minify: production,
  target: ['es2020'],
  platform: 'browser',
  format: 'iife',
  define: {
    'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development')
  },
  jsx: 'automatic',
};

async function run() {
  if (watch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('[esbuild] watching webview...');
  } else {
    await esbuild.build(options);
    console.log('[esbuild] webview build complete');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
