# express example

## About

This is the example project of Express.

## Requirements

* Node.js v8.9.1 or heiher

## Install

```
$ npm install
```

## Usage

```
$ npm start
```

### Example

```
$ curl -d '{"text":"This is the test!"}' -H "Content-Type: application/json" -X POST http://localhost:3000/message
```

## Docker

```
$ docker image build -t express-example:create -f ./Dockerfile ./
```
