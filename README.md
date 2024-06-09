# Interactive web-based terminal aka Webterm

## Requirements:

- NodeJS >= v16 and NPM

## Setup process

There are two parts to this, the frontend and backend, just like a typical web application.

To get the backend running use the following steps:

- `cd` into the directory.
- Run `npm install` to pull in dependencies.
- Run `node backend.js` to start the WebSocket the frontend will be connecting to.
- Run `npm run build-windows` to start packaging webterm into windows executable binaries.

Login using webterm | webterm, to logout append to site /logout and enter
There is not much to do regarding the frontend except to open up `index.html` in the browser.

## Features

- override configurations via .env
- secure https
- basic authentication
- terminal are as dropzone multiple file upload
- download files
- Ctrl+V paste
- resizable terminal
- create binary distribution via pkg for windows, linux and mac
- auto browser popup on start
- modify terminal coloring through chalk package as you like
- banner startup
- assets are packaged in to the file executable

You can download files on current directory by appending /dl/<filename>
You can also upload to specific directory by navigating to the directory and
dragging the files to the terminal

## Generate custom certificates

```
enabled ssl and wss
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
openssl rsa -in key.pem -out key-rsa.pem
```

## ENV's

```
APP_PORT = 8443
ENABLE_AUTH = 1
AUTH_USERNAME = webterm
AUTH_PASSWORD = webterm
APP_WORKING_DIRECTORY = /
```

## Pkg Targets

```
nodeRange (node8), node10, node12, node14, node16 or latest
platform alpine, linux, linuxstatic, win, macos, (freebsd)
arch x64, arm64, (armv6, armv7)
```

## Todo

```
Persistent banner on terminal - has issue on jumping cursor
```

## References

[original source](https://www.eddymens.com/blog/creating-a-browser-based-interactive-terminal-using-xtermjs-and-nodejs)
