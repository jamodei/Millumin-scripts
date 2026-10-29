# EOS_Column_Gate

A Millumin 5 script that lets an ETC Eos lighting console trigger Millumin columns over OSC **without stopping playback when a cue has no matching column**.

## The problem

Millumin's built-in `/action/launchColumn` stops the current column if you ask it to launch one that doesn't exist (an unknown name or an out-of-range index). If your lighting cues outnumber your video cues, every light-only cue blacks out the video.

## What this does

1. Listens for OSC messages on a custom address (`/lx/cue`).
2. Pulls the cue name (for example `M5`) out of the OSC event.
3. Checks it against the names of the columns that actually exist in the project.
4. Launches the column only if it exists; otherwise ignores the cue and logs it.

## Setup

**Eos**

In the cue's OSC output, send the cue number as part of the address, using your own address rather than Millumin's built-in one:

```
/lx/cue/M%1
```

Eos fills in `%1` with the cue number, so cue 5 sends `/lx/cue/M5`. The `M` prefix keeps the name text, so Millumin treats it as a column name and not an index.

**Millumin**

1. Add `EOS_Column_Gate.js` to the project library (Scripts group).
2. Put it on an independent layer and start it as part of your show startup. The layer's light icon stays green while it listens.
3. Name your columns to match the Eos cue numbers, e.g. cue 5 -> column `M5`, cue 5.5 -> `M5.5`.
4. Use the **Refresh column list** button (in the script's properties) after adding or renaming columns.

## Notes

- Don't send Eos to `/action/launchColumn` directly, or Millumin's built-in handler will bypass the gate.
- Column names must be the prefix plus a number with an optional decimal (`M5`, `M5.5`). Change `COLUMN_PREFIX` at the top of the script to use a different prefix.
- Matching is case-insensitive; column names should be unique.
- The script scans column names by index (up to `MAX_COLUMNS`, stopping after `MAX_GAP` empty ones in a row) at startup and when you press refresh.
- `onOSCEvent` logs every event (`log(text)`) on purpose, so you can see exactly what Millumin receives while testing your setup. Comment that line out if you want a quieter log during a show.

## Why the cue name is read from the whole event

When a text argument like `M1` is sent as an OSC value, Millumin's script event can hand the script a reduced value (`[1]`), so reading `event.values[0]` doesn't give back the full name. Putting the name in the address (`/lx/cue/M5`) avoids that, and the script searches the whole event text for the pattern, so both `/lx/cue/M5` and `/lx/cue M5` are accepted.

## References

- [Millumin OSC documentation (v5)](https://github.com/anome/millumin-dev-kit/wiki/OSC-documentation)
- [Millumin scripting help](https://help.millumin.com/docs/connect/scripts/)

## License

CC0 1.0 Universal. Use it however you like.
