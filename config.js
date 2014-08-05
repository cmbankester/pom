exec = require('child_process').exec

/**
 * _displayNotification
 * Displays a notification to the user via notification center
 * @param    {event} String -- One of ['begin', 'break', 'end']
 * @param    {opts} Object -- {task_name: String, break_duration: Number}
 * @callback {cb} (err, text_response)
 * @return   {void(0)}
*/
_displayNotification = function(event, opts, cb)
{
  var subtitle = (function() {
    switch (event) {
      case "begin":
      case "start":
        return "Begin Task";
      case "break":
        duration = opts.break_duration
        if (duration > 120 || duration % 60 === 0)
          return "Take a Break for " + (Math.round(duration / 60)) + "m";
        else
          return "Take a Break for " + (duration + "s");
      case "end":
      case "stop":
        return "Stop Task";
    }
  })();

  var osascript_cmd = 'display notification "' + opts.task_name + '" with title "Pom Timer" subtitle "' + subtitle + '" sound name "Beep"';
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
    task_name: "Your Task"
  },
  displayNotificationFn: _displayNotification
};
