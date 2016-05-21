# Overview

This widget allows the user to log into the system and get identity tokens from
the cloudsim-auth server. These tokens are required when performing requests to
cloudsim-portal and cloudsim-sim servers. A popup will show up to input username
and password.

Example:

    <gz-token
      url="https://localhost:5050"
      on-login="loginEvent"
      on-logout="logoutEvent"
      gui
    ></gz-token>

# API Reference

## Properties

Properties go inside the tag.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| url | String | https://localhost:5050 | Auth server URL |
| title | String | ... | Title to be displayed in the GUI |
| caption | String | ... | Caption |
| data | String | .. | JSON data to be passed into the token. |
| gui | Boolean | false | Display simple GUI. |
| config | Boolean | false | Display configuration input fields. |

## Events

| Event | Structure | Description |
| --- | --- | --- |
| login | {user: <user>} | Fired when user <user> has logged in |
| logout | {} | Fired when the current user has logged out |

# Run example

TODO: We should be able to make this less complicated (relying on CDNs?)

1. Make sure our example is within this directory structure:

    ~~~
    <path>/elements/gz-token/gz-token.html
    <path>/elements/gz-token/example.html
    <path>/../../bower_components/<bunch of components>
    ~~~

2. From path, run a server:

    cd <path>
    http-server

3. On your browser, check the page:

    http://localhost:8080/elements/gz-token/example.html
