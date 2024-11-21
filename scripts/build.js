const esbuild = require('esbuild');
const path = require('path');
const { spawn } = require('child_process');

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
  minify: true,
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
  minify: false,
  platform: 'node',
  target: ['node18'],
  format: 'cjs',
};

let serverProcess = null;

function startServer() {
  if (serverProcess) {
    serverProcess.kill();
  }

  serverProcess = spawn('node-dev', ['dist/demo.js'], {
    stdio: 'inherit',
    shell: true,
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}

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
    startServer();

    // Rebuild notification
    console.log('Watching for changes...');
  });
} else {
  // Single build
  Promise.all([
    esbuild.build(mainBuildOptions),
    esbuild.build(demoBuildOptions),
  ]).catch(() => process.exit(1));
}

// Cleanup on exit
process.on('SIGTERM', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});
