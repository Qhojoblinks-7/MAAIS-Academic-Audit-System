const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

const components = [
  'dialog',
  'button',
  'input',
  'badge',
  'sheet',
  'card',
  'table',
  'tabs',
  'select',
  'checkbox',
  'skeleton',
  'tooltip',
  'dropdown-menu',
  'scroll-area',
  'toast',
  'alert',
  'popover',
  'progress',
  'switch',
  'avatar',
  'separator',
  'calendar',
  'textarea',
  'slider',
  'radio-group',
  'command',
  'empty',
];

const root = process.cwd();

function run(cmd) {
  try {
    console.log(`\n→ ${cmd}`);
    execSync(cmd, { cwd: root, stdio: 'inherit' });
  } catch (err) {
    console.error(`✗ Failed: ${cmd}`);
    process.exit(1);
  }
}

console.log('Installing shadcn/ui components...\n');

for (const name of components) {
  run(`npx shadcn@latest add ${name} -y`);
}

console.log('\n✓ All shadcn components installed');
