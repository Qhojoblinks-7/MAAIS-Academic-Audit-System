const e = require('esbuild');
function check(file) {
  try {
    e.buildSync({ entryPoints: [file], bundle: false, write: false, loader: { '.jsx': 'jsx' }, logLevel: 'silent' });
    console.log('OK  ' + file);
  } catch (err) {
    const x = err.errors && err.errors[0];
    console.log('ERR ' + file + ' -> ' + (x ? x.text + ' @ line ' + x.location.line + ' col ' + x.location.column + ' :: ' + x.location.lineText.trim().slice(0,70) : err.message));
  }
}
check('src/pages/admin/ParentRegistry.jsx');
check('src/pages/admin/StaffRegistry.jsx');
check('src/pages/admin/StudentRegistry.jsx');
