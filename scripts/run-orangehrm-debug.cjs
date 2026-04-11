const { spawnSync } = require('node:child_process');

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const forwardedArgs = process.argv.slice(2);
const hasExplicitTarget = forwardedArgs.some((arg) => !arg.startsWith('-'));
const targetArgs = hasExplicitTarget ? [] : ['tests/ui/orangehrm'];
const baseArgs = [
  'playwright',
  'test',
  '--project=chromium-orangehrm-debug',
  '--workers=1',
];

const result = spawnSync(command, [...baseArgs, ...targetArgs, ...forwardedArgs], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    ORANGEHRM_DEBUG: '1',
  },
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
