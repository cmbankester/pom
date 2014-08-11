#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),
    f = require('ff')(),
    path = require('path'),
    make_daemon = require('daemon'),
    homedir;

if (process.platform === 'win32')
  homedir = process.env.HOMEPATH
else
  homedir = process.env.HOME

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
  .option(
    '-u, --task-duration [number]',
    'Specify duration of work in seconds [' + defaults.task_duration + ']',
    defaults.task_duration
  ).option(
    '-b, --break-duration [number]',
    'Specify the duration of the break in seconds [' + defaults.break_duration + ']',
    defaults.break_duration
  ).option(
    '-r, --times-to-recur [number]',
    'Specify how many work-break cycles to recur until stopping [' + defaults.times_to_recur + ']',
    defaults.times_to_recur
  ).option(
    '-p, --time-to-prepare [number]',
    'Specify the time-to-prepare in minutes [' + defaults.time_to_prepare + ']',
    defaults.time_to_prepare
  ).option(
    '--begin-event-name [text]',
    'Specify the text that should appear when beginning a new section of task [' + defaults.begin_event_name + ']',
    defaults.begin_event_name
  ).option(
    '--break-event-name [text]',
    'Specify the text that should appear when taking a break [' + defaults.break_event_name + ']',
    defaults.break_event_name
  ).option(
    '-d, --daemonize',
    'Run the timer in the background [' + defaults.daemonize + ']',
    defaults.daemonize
  ).option(
    '-v, --verbose',
    'Enable logging to the console [' + defaults.verbose + ']',
    defaults.verbose
  ).parse(process.argv);

// console.log('you ordered a pizza with:');
var duration = parseInt(program.taskDuration),
    break_duration = parseInt(program.breakDuration),
    times_to_recur = parseInt(program.timesToRecur),
    time_to_prepare = parseInt(program.timeToPrepare),
    verbose = (program.verbose),
    daemonize = (program.daemonize),
    begin_event_name = (program.beginEventName),
    break_event_name = (program.breakEventName),
    daemonize = (program.daemonize),
    task_name = (a = program.args).length ? a.join(' ') : defaults.task_name;

// after this point, we are a daemon (if the user said to be)
if (daemonize) make_daemon();

var displayNotification = conf.displayNotificationFn;

// Let the user they have some time to prepare
f.next(function(){
  if (verbose) console.log('You have ' + time_to_prepare + 's to prepare');
  setTimeout(f.waitPlain(), time_to_prepare * 1000);
});

var task_count = 0;

while (task_count < times_to_recur) {
  task_count++;

  // Let the user know their task should be started right now
  f.next(function(){
    displayNotification("begin", {
      task_name: task_name,
      verbose: verbose,
      begin_event_name: begin_event_name
    }, f.slot());
  });

  f.next(function(){
    setTimeout(f.waitPlain(), duration * 1000);
  });

  if (task_count === times_to_recur) {
    // Let the user know the task recurrance has ended
    f.next(function(){
      displayNotification("end", {
        task_name: task_name,
        verbose: verbose
      }, f.slot());
    });
  } else {
    // Let the user have a break
    f.next(function(){
      displayNotification("break", {
        task_name: task_name,
        break_duration: break_duration,
        verbose: verbose,
        break_event_name: break_event_name
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
  else if (verbose)
    console.log("Recurring task complete");
});
