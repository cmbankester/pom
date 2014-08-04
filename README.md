# pom

A simple pomodoro timer in node for mac

## Install

N.B still in dev, not published to npm

`git clone git@github.com:cbankester/pom.git`

`cd pom && npm install && npm link`

## Usage

```sh
Usage: pom [options] [Task Name]

Options:

  -h, --help                      this usage information
  -V, --version                   output the version number
  -u, --task-duration [number]    Specify duration of work in seconds
  -b, --break-duration [number]   Specify the duration of the break in seconds
  -r, --times-to-recur [number]   Specify how many work-break cycles to recur until stopping
  -p, --time-to-prepare [number]  Specify the time-to-prepare in minutes
  # TODO --path-to-config                Specify the path the config js file [~/.pom.js]
  # TODO -d, --daemonize                 Run the timer in the background
  -v, --verbose                   Enable logging to the console

```
