#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),
    ff = require('ff'),
    path = require('path');

var homedir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;

if (require('fs').existsSync(p = path.join(homedir, '.pom.js'))) {
  conf = require(p);
  defaults = conf.defaults;
} else {
  conf = require(path.join('..', 'config'));
  defaults = conf.defaults;
}

program
  .version('0.0.1')
  .usage("[options] [Task Name]")
  .option('-u, --task-duration [number]', 'Specify duration of work in seconds')
  .option('-b, --break-duration [number]', 'Specify the duration of the break in seconds')
  .option('-r, --times-to-recur [number]', 'Specify how many work-break cycles to recur until stopping')
  .option('-p, --time-to-prepare [number]', 'Specify the time-to-prepare in minutes')
  .option('--path-to-config', 'Specify the path the config.js file [~/.pom.js]')
  .option('-d, --daemonize', 'Run the timer in the background')
  .option('-v, --verbose', 'Enable logging to the console')
  .parse(process.argv);

// console.log('you ordered a pizza with:');
var duration = parseInt(program.taskDuration || defaults.task_duration),
    break_duration = parseInt(program.breakDuration || defaults.break_duration),
    times_to_recur = parseInt(program.timesToRecur || defaults.times_to_recur),
    time_to_prepare = parseInt(program.timeToPrepare || defaults.time_to_prepare)
    task_name = (a = program.args).length ? a.join(' ') : defaults.task_name,
    verbose = (program.verbose || defaults.verbose),
    daemonize = (program.daemonize || defaults.daemonize);

var f = ff()

var displayNotification = conf.displayNotificationFn;

// Let the user they have some time to prepare
f.next(function(){
  console.log('You have ' + time_to_prepare + 's to prepare');
  setTimeout(f.waitPlain(), time_to_prepare * 1000);
});

var task_count = 0;

while (task_count < times_to_recur) {
  task_count++;

  // Let the user know their task should be started right now
  f.next(function(){
    displayNotification({event: "begin", task_name: task_name, verbose: verbose}, f.slot());
  });

  f.next(function(){
    setTimeout(f.waitPlain(), duration * 1000);
  });

  if (task_count === times_to_recur) {
    // Let the user know the task recurrance has ended
    f.next(function(){
      displayNotification({event: "end", task_name: task_name, verbose: verbose}, f.slot());
    });
  } else {
    // Let the user have a break
    f.next(function(){
      displayNotification({
        event: "break",
        task_name: task_name,
        break_duration: break_duration,
        verbose: verbose
      }, f.slot());
    });
    f.next(function(){
      setTimeout(f.waitPlain(), break_duration * 1000);
    });
  }
}

f.onComplete(function(err, stdout){
  if (err)
    console.log("Error:", err);
  else
    console.log("Recurring task complete");
});
