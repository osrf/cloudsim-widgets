# Overview

This widget allows the user to retrieve a list of simulators from
a
[cloudsim-portal](https://bitbucket.org/osrf/cloudsim-portal)
server.

Example:

    <gz-simlist
      url="https://localhost:4000"
      gui
    ></gz-simlist>

# API Reference

## Properties

Properties go inside the tag.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| url | String | https://localhost:4000 | Portal server URL |
| title | String | ... | Title to be displayed in the GUI |
| caption | String | ... | Caption |
| items | Array | ... | Array containing all items. |
| gui | Boolean | false | Display simple GUI. |
| config | Boolean | false | Display configuration input fields. |
| token | String | "xxxadminxxx" | User token. |

## Events

| Event | Structure | Description |
| --- | --- | --- |
|  |  |  |

# Run example

TODO: We should be able to make this less complicated (relying on CDNs?)

1. Make sure our example is within this directory structure:

        <path>/elements/gz-simlist/gz-simlist.html
        <path>/elements/gz-simlist/example.html
        <path>/bower_components/<bunch of components>

2. From path, run a server:

        cd <path>
        http-server

3. On your browser, check the page:

    http://localhost:8080/elements/gz-simlist/example.html
