const esbuild = require('esbuild');
const express = require('express');
const path = require('path');

const isWatchMode = process.argv.includes('--watch');

// Build the main library - always minified
const mainBuildOptions = {
  entryPoints: [
    {
      in: 'src/posthog-fast-feature-flags.ts',
      out: 'posthog-fast-feature-flags',
    },
  ],
  outdir: 'dist',
  bundle: true,
  minify: true, // Always true
  sourcemap: false,
  platform: 'browser',
  target: ['es2020'],
  format: 'iife',
};

// Build the demo server - unminified for debugging
const demoBuildOptions = {
  entryPoints: [{ in: 'demo/index.ts', out: 'demo' }],
  outdir: 'dist',
  bundle: true,
  minify: false, // Never minified
  platform: 'node',
  target: ['node18'],
  format: 'cjs',
};

if (isWatchMode) {
  Promise.all([
    esbuild.context(mainBuildOptions),
    esbuild.context(demoBuildOptions),
  ]).then(async ([mainContext, demoContext]) => {
    // Initial build
    await mainContext.rebuild();
    await demoContext.rebuild();

    // Start watching
    mainContext.watch();
    demoContext.watch();

    // Start the server
    require('../dist/demo.js');

    console.log('Watching for changes...');
  });
} else {
  // Single build
  Promise.all([
    esbuild.build(mainBuildOptions),
    esbuild.build(demoBuildOptions),
  ]).catch(() => process.exit(1));
}
