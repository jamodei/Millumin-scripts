// EOS_Column_Gate
// Listens for Eos cue triggers over OSC (e.g. /lx/cue/M5 or /lx/cue M5)
// and launches the Millumin column with that name ONLY if it exists in the
// project. Cues with no matching column are ignored, so the current media
// keeps playing instead of stopping.
//
// The cue name is extracted from the whole OSC event, not just the value,
// because Millumin may reduce a text argument to [1].
//
// Eos output string:  /lx/cue/M%1   (cue 5 -> /lx/cue/M5 -> column "M5")
//
// Setup:
//  - Run this script on an independent layer at startup.
//  - Use the "Refresh column list" button after adding or renaming columns.
//  - Don't send Eos to /action/launchColumn directly, or the built-in handler
//    will bypass this gate.
//  - Column names must follow the pattern PREFIX + number, e.g. M5 or M5.5.
//  - The log(text) line in onOSCEvent is left on purpose: it shows exactly
//    what Millumin receives, which helps when testing a new setup. Comment it
//    out if you want a quieter log during a show.

var CUE_ADDRESS = "/lx/cue";
var COLUMN_PREFIX = "M";
var MAX_COLUMNS = 300;  // upper bound on columns to scan
var MAX_GAP = 25;       // stop after this many empty/unnamed columns in a row
var columnNames = {};   // lowercase name -> real column name
var cueRegex = new RegExp("\\b" + COLUMN_PREFIX + "[0-9]+(?:\\.[0-9]+)?", "i");

function refreshColumnNames()
{
  columnNames = {};
  var gap = 0;
  for (var i = 1; i <= MAX_COLUMNS && gap < MAX_GAP; i++)
  {
    var n = Millumin.getColumnName(i);
    if (n !== undefined && n !== null && ("" + n) !== "")
    {
      columnNames[("" + n).toLowerCase()] = "" + n;
      gap = 0;
    }
    else
    {
      gap++;
    }
  }
  log("Column list refreshed: " + Object.keys(columnNames).length + " named columns");
}

// Scan once when the script starts
refreshColumnNames();

// Manual refresh button, shown in the properties view
Parameter.createButton("Refresh column list", function() { refreshColumnNames(); });

onOSCEvent = function(event)
{
  var text = JSON.stringify(event);
  log(text);   // shows everything Millumin gives us; useful for testing setup

  // Only react to our own address
  if (text.toLowerCase().indexOf(CUE_ADDRESS.toLowerCase()) === -1) { return; }

  // Pull the cue name (e.g. M5) out of the event
  var match = text.match(cueRegex);
  if (!match)
  {
    log("No cue name found in event, ignoring");
    return;
  }

  var requested = match[0];
  var realName = columnNames[requested.toLowerCase()];

  if (realName)
  {
    Millumin.launchColumn(realName);
  }
  else
  {
    log("No column named " + requested + ", ignoring (hit Refresh if you just added it)");
  }
}
