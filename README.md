[![NPM](https://nodei.co/npm/yoctopus-generator.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yoctopus-generator/)

![alt text](https://david-dm.org/yoctore/yoctopus-generator.svg "Dependencies Status")
[![Code Climate](https://codeclimate.com/github/yoctore/yoctopus-generator/badges/gpa.svg)](https://codeclimate.com/github/yoctore/yoctopus-generator)
[![Test Coverage](https://codeclimate.com/github/yoctore/yoctopus-generator/badges/coverage.svg)](https://codeclimate.com/github/yoctore/yoctopus-generator/coverage)
[![Issue Count](https://codeclimate.com/github/yoctore/yoctopus-generator/badges/issue_count.svg)](https://codeclimate.com/github/yoctore/yoctopus-generator)

## Overview

This generator build an **Yoctopus** *(Yes this is a name of our tools ;) )* stack based on NodeJs / AngularJs and our [yocto modules](https://www.npmjs.com/~yocto).

## Motivation

We build this generator to gain time between each project. It provide for us : 

- An already defined project strcuture
- Pre build Gruntfile.js
- Pre build templates for AngularJs
- An already set up NodeJs application based on [yocto-core-stack](https://www.npmjs.com/package/yocto-core-stack) package

## Install

To install `yoctotopus`

```bash
sudo npm install -g yo generator-yoctopus bower grunt-cli
```

To verify that the `yoctopus` generator is properly installed :

```bash
yo --generators
```

After that go to the new project base directory and run the generator :

```bash
yo yoctopus
```

## How to use

For the moment please read readme.md of each of our [yocto modules](https://www.npmjs.com/~yocto), each modules describe what we can do with it.
In the future we will generate an documentation with more details.


## Angular Events

For angular project we provide an auto loading of config files.
All error events was automatically catch.

If you want run your angular scripts when app is ready you must catch the `$applicationIsReady` event from `$rootScope`.

## Need more modules ?

Please see [our NPM repository](https://www.npmjs.com/~yocto) for complete list of available tools (completed day after day).

