# C9/SY @mana extension

## Setup

### Node

You need `node 16.8.0` and `yarn 1.15.2` to build and test the extension.

Use `nvm` to be able to maintain multiple `node` versions for different projects.
To install `nvm` run: `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash`

Use `yvm` to be able to maintain multiple `yarn` versions for different projects.
To install `yvm` run: `curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.sh | bash`

After `nvm` and `yvm` are installed, close the current terminal and open a new one to use it.

To install `node 16.18.3`, run: `nvm install v16.8.0`
To install `yarn 1.15.2`, run `yvm install v1.15.2`

### Artifactory

Now that we have `node` and `yarn`, we need to install this project's dependencies. Because we are using some private packages from Symphony, you will need to authenticate to acquire those packages that will be installed. To do that, please contact someone to give you access to [repo.symphony.com](https://repo.symphony.com/). After adding the credentials, install all dependencies by running: `yarn install` in the repository root.

### Certificates

To be able to run locally you need to add `local-dev.symphony.com` to your `hosts` file, and accept the certificate.

See [SFE-Lite extension docs](https://github.com/SymphonyOSF/SFE-Lite/blob/master/core/core-doc/examples/hello-world/README.md) for details.

### Linting and VSCode setup

Linting is done by `eslint`, see https://eslint.org/.

Rules can be found here:
 - https://eslint.org/docs/rules/
 - https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
 - https://www.npmjs.com/package/eslint-plugin-react
 - https://github.com/benmosher/eslint-plugin-import

#### VSCode integration

It is possible to have VS Code automatically lint and format the code by installing the `ESLint` plugin. ESLint will now highlight any linting problems directly in the editor.

It is possible to configure ESLint to fix linting problems when you save your file, by adding this to the `settings.json` file (Code -> Preferences -> Settings, then click the 'Open Settings JSON' icon):

```json
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
}
```

You can also tell vscode to use 4 spaces indentation by default:

```json
  "editor.tabSize": 4,
```

All linting problems that have fixers can be fixed by running:

```bash
$ yarn lint --fix
```

Make sure no other formatters are installed or enabled for the project (such as prettier, tslint), since they might interfere with the rules for eslint.

## Build

To build the extension, run the following command.

```bash
$ yarn build
```

## Run

The extension is compiled and run locally using `webpack-devserver`. To start it run the following command. The `--proxy` argument should point to your POD. The `--cloud9` argument should point to your running instance of the cloud9 proxy.

```bash
$ yarn watch --proxy <POD>.symphony.com --cloud9 localhost:8443
```

Point your browser to `https://local-dev.symphony.com:9091?client2`.
