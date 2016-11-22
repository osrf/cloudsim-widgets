[ ![Codeship Status for osrf/cloudsim-widgets](https://codeship.com/projects/17ac82b0-0e62-0134-df85-7ab2ad815cc6/status?branch=default)](https://codeship.com/projects/156369)

[![Coverage Status](https://coveralls.io/repos/bitbucket/osrf/cloudsim-widgets/badge.svg?branch=default)](https://coveralls.io/bitbucket/osrf/cloudsim-widgets?branch=default)

[![Dependency Status](https://www.versioneye.com/user/projects/57ca396c968d64004d976620/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/57ca396c968d64004d976620)


![](cloudsim.png)

## Cloudsim construction set

This project is based on the Polymer Starter Kit.

> A starting point for building web applications with Polymer 1.0

#### Prerequisites (for everyone)

The full starter kit requires the following major dependencies:

- Node.js, used to run JavaScript tools from the command line.
- npm, the node package manager, installed with Node.js and used to install Node.js packages.
- gulp, a Node.js-based build tool.
- bower, a Node.js-based package manager used to install front-end packages (like Polymer).

**To install dependencies:**

1)  Check your Node.js version.

```sh
node --version
```

The version should be at or above 0.12.x.

### Install and run

With Node.js installed, run the following one liner from the root of your Polymer Starter Kit download:

```sh
sudo npm install -g gulp bower
npm install
bower install
```

### Design

The idea is to have independent reusable components that you can use to build
different systems (run a simulation contest, perform cloud experiments, share
simulations with the community).

Components can be run from the local machine, and point to different servers.
Components live in the `app/elements` folder.

#### gz-token

This widget allows the user to log in the system and get identity tokens from
the [`cloudsim-auth`](https://bitbucket.org/osrf/cloudsim-auth) server. These
tokens are required when performing requests to
[`cloudsim-portal`](https://bitbucket.org/osrf/cloudsim-portal) and
[`cloudsim-sim`](https://bitbucket.org/osrf/cloudsim-sim) servers.

### Usage

Configure server URL:

1. Create a`.env` file

1. Add urls to it, for example:

    CLOUDSIM_AUTH_URL="https://<ip>:<port>"

To start:

```sh
gulp serve
```


#### Run tests

```sh
gulp test:local
```

This runs the unit tests defined in the `app/test` directory through [web-component-tester](https://github.com/Polymer/web-component-tester).

To run tests Java 7 or higher is required. To update Java go to http://www.oracle.com/technetwork/java/javase/downloads/index.html and download ***JDK*** and install it.


##### Run individual tests

1. Install polymer-cli

    sudo npm install -g polymer-cli

1. Start serving (it can be from the root dir `cloudsim-widgets`)

    polymer serve

1. Open the browser to trigger a test case, for example:

    http://localhost:8080/app/test/gz-token-basic.html


#### Build & Vulcanize

```sh
gulp
```

Build and optimize the current project, ready for deployment. This includes vulcanization, image, script, stylesheet and HTML optimization and minification.

## Application Theming & Styling

See `app/styles/app-theme.html` to provide theming for your application.
You can also find our presets for Material Design breakpoints in this file.

These style files are located in the [styles folder](app/styles/).

## Unit Testing

Web apps built with Polymer Starter Kit come configured with support for [Web Component Tester](https://github.com/Polymer/web-component-tester) - Polymer's preferred tool for authoring and running unit tests. This makes testing your element based applications a pleasant experience.

[Read more](https://github.com/Polymer/web-component-tester#html-suites) about using Web Component tester.

