# Overview

This widget allows creating new accounts and deleting existing accounts in
a
[cloudsim-auth](https://bitbucket.org/osrf/cloudsim-auth)
server.

Example:

    <gz-accounts
      url="https://localhost:5050"
      gui
    ></gz-accounts>

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

## Events

| Event | Structure | Description |
| --- | --- | --- |
|  |  |  |

# Run example

TODO: We should be able to make this less complicated (relying on CDNs?)

1. Make sure our example is within this directory structure:

        <path>/elements/gz-accounts/gz-accounts.html
        <path>/elements/gz-accounts/example.html
        <path>/bower_components/<bunch of components>

2. From path, run a server:

        cd <path>
        http-server

3. On your browser, check the page:

    http://localhost:8080/elements/gz-accounts/example.html
