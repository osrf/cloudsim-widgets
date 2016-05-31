![](https://cloud.githubusercontent.com/assets/110953/7877439/6a69d03e-0590-11e5-9fac-c614246606de.png)
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

#### gz-accounts

Add and remove users to the authentication server. This needs a server that
implements the authentication (see
[`cloudsim-auth`](https://bitbucket.org/osrf/cloudsim-auth)).

#### gz-launcher

This widget allows to start and stop gzserver instances on a machine. The server
 component is [`cloudsim-sim`](https://bitbucket.org/osrf/cloudsim-sim).

#### gz-simlist

This widget displays the list of simulations that a user has acccess to. It
connects to the
[`cloudsim-portal`](https://bitbucket.org/osrf/cloudsim-portal) server.

#### gz-token

This widget allows the user to log in the system and get identity tokens from
the [`cloudsim-auth`](https://bitbucket.org/osrf/cloudsim-auth) server. These
tokens are required when performing requests to
[`cloudsim-portal`](https://bitbucket.org/osrf/cloudsim-portal) and
[`cloudsim-sim`](https://bitbucket.org/osrf/cloudsim-sim) servers.

### Usage

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


