# Overview

This widget allows the user to run a command line command on
a
[cloudsim-sim](https://bitbucket.org/osrf/cloudsim-sim)
server and visualize the terminal output on the browser.

Example:

    <gz-cmd
      url="https://localhost:5050"
      gui
    ></gz-cmd>

# API Reference

## Properties

Properties go inside the tag.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| url | String | https://localhost:5050 | Auth server URL |
| title | String | ... | Title to be displayed in the GUI |
| caption | String | ... | Caption |
| gui | Boolean | false | Display simple GUI. |
| config | Boolean | false | Display configuration input fields. |
| processOutput | String | "" | String that contains the terminal output in html format. |
| processPid | String | "" | String containing the id of the process started by the command. |
| processStatus | String | "ready" | String containing the status of the process started by the command. |
| cmd | String | 'echo "Hello Cloudsim!"' | String containing the status of the process started by the command. |

## Events

| Event | Structure | Description |
| --- | --- | --- |
| login | {user: <user>} | Fired when user <user> has logged in |
| logout | {} | Fired when the current user has logged out |

# Run example

TODO: We should be able to make this less complicated (relying on CDNs?)

1. Make sure our example is within this directory structure:

        <path>/elements/gz-cmd/gz-cmd.html
        <path>/elements/gz-cmd/example.html
        <path>/bower_components/<bunch of components>

2. From path, run a server:

        cd <path>
        http-server

3. On your browser, check the page:

    http://localhost:8080/elements/gz-cmd/example.html
