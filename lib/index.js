#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),
    ff = require('ff'),
    exec = require('child_process').exec;

program
  .version('0.0.1')
  .usage("[options] [Task Name]")
  .option('-d, --duration [number]', 'Specify duration of work in seconds [1500]', '1500')
  .option('-b, --break [number]', 'Specify the duration of the break in seconds [300]', '300')
  .option('-r, --recurring [number]', 'Specify how many work-break cycles to recur until stopping [4]', '4')
  .option('-p, --prepare [number]', 'Specify the time-to-prepare in minutes [60]', '60')
  .parse(process.argv);

// console.log('you ordered a pizza with:');
var duration = parseInt(program.duration),
    break_duration = parseInt(program.break),
    times_to_recur = parseInt(program.recurring),
    prepare_duration = parseInt(program.prepare)
    task_name = program.args.join(' ');

/**
 *
 * Displays a notification to the user via notification center
 * Taks event: ['begin', 'end'], task_name: String, callback
 * Callback returns (err, text_response)
 */
function _displayNotification(event, task_name, cb)
{
  switch (event) {
    case "begin":
    case "start":
      subtitle = "Begin Task"
      break;
    case "break":
      subtitle = "Take a Break for " + Math.round(break_duration / 60) + "m"
      break;
    case "end":
    case "stop":
      subtitle = "Stop Task"
  }

  var osascript_cmd = 'display notification "' + task_name + '" with title "Pom Timer" subtitle "' + subtitle + '" sound name "Beep"';
  var cmd = 'osascript -e "' + osascript_cmd.replace(/"/gi, '\\"') + '"';

  exec(cmd, cb);
}

var f = ff()

// Let the user they have some time to prepare
f.next(function(){
  console.log('You have ' + prepare_duration + 's to prepare');
  setTimeout(f.waitPlain(), prepare_duration * 1000);
});

task_count = 0

while (task_count < times_to_recur) {
  task_count++;

  // Let the user know their task should be started right now
  f.next(function(){
    _displayNotification("begin", task_name, f.slot());
  });

  f.next(function(){
    setTimeout(f.waitPlain(), duration * 1000);
  });

  if (task_count === times_to_recur) {
    // Let the user know the task recurrance has ended
    f.next(function(){
      _displayNotification("end", task_name, f.slot());
    });
  } else {
    // Let the user have a break
    f.next(function(){
      _displayNotification("break", task_name, f.slot());
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
