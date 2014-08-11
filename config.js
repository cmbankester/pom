exec = require('child_process').exec

/**
 * _displayNotification
 * Displays a notification to the user via notification center
 * @param    {event} String -- One of ['begin', 'break', 'end']
 * @param    {opts} Object -- {task_name: String, break_duration: Number, begin_event_name: String, break_event_name: String}
 * @callback {cb} (err, text_response)
 * @return   {void(0)}
*/
function _displayNotification(event, opts, cb)
{
  var subtitle = (function() {
    switch (event) {
      case "begin":
      case "start":
        return opts.begin_event_name;
      case "break":
        duration = opts.break_duration
        if (duration > 120 || duration % 60 === 0)
          return opts.break_event_name + " (" + (Math.round(duration / 60)) + "m)";
        else
          return opts.break_event_name + " (" + (duration + "s)");
      case "end":
      case "stop":
        return "Stop Task";
    }
  })();

  var osascript_cmd = 'display notification "' + subtitle + '" with title "Pom Timer" subtitle "' + opts.task_name + '" sound name "Beep"';
  var cmd = 'osascript -e "' + osascript_cmd.replace(/"/gi, '\\"') + '"';

  exec(cmd, cb);

  if (opts.verbose)
    console.log(_currentDateTime(), '--', subtitle + ":", opts.task_name);
};

/**
 * _currentDateTime
 * @return {String} the current date/time represented as mm/dd/yy HH:mm
*/
function _currentDateTime()
{
  d = new Date();
  return (('0' + (d.getMonth() + 1)).slice(-2) + '/' + ('0' + d.getDate()).slice(-2) + '/' + d.getFullYear()) +
          " " +
          ('0' + d.getHours()).slice(-2) + ':' + ('0' + (d.getMinutes())).slice(-2);
};


module.exports = {
  defaults: {
    daemonize: false,
    task_duration: 1500,
    break_duration: 300,
    times_to_recur: 4,
    time_to_prepare: 60,
    verbose: false,
    task_name: "Your Task",
    begin_event_name: "Begin task",
    break_event_name: "Take a break"
  },
  displayNotificationFn: _displayNotification
};
