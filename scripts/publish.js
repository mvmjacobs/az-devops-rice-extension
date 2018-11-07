//'use strict';

const exec = require('child_process').exec;

// Package extension
const command = `tfx extension create --overrides-file release.json --manifest-globs vss-extension-release.json --no-prompt --json`;

exec(command, {
  'cwd': './dist'
}, (error, stdout) => {
  if (error) {
    console.error(`Could not create package: '${error}'`);
    return;
  }

  const output = JSON.parse(stdout);

  console.log(`Package created ${output.path}`);

  const command = `tfx extension publish --vsix ${output.path} --no-prompt`;
  exec(command, (error) => {
    if (error) {
      console.error(`Could not publish package: '${error}'`);
      return;
    }

    console.log('Package published.');
  });
});
