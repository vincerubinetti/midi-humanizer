# MIDI Humanizer

A tool to randomize note starts, durations, tempo drift, and velocities in a MIDI file.

[⭐️ Open the App ⭐️](https://vincerubinetti.github.io/midi-humanizer/)

## Motivation

When writing music in a [DAW](https://en.wikipedia.org/wiki/Digital_audio_workstation), you often want to sequence in notes on the grid for convenience, but still want them to sound like a human played them.
Unfortunately, many DAWs have little or no tools to do this.
For example, currently FL Studio allows you to randomize note velocities, but not start times or durations.

This tool provides more controls for "humanizing" a MIDI performance, including a "drift" parameter which simulates the average tempo drifting over time.
It can't truly replace a real human performance, but it can be used as a starting point for further tweaking, and also works fine for background rhythms.

## Limitations

This tool is not meant to [replace a daw](https://en.wikipedia.org/wiki/Inner-platform_effect); it's only meant to fill a hole in functionality.
It is meant to be used back and forth with your DAW's MIDI export and import.
Things that DAWs can already do adequately - like song editing, individual note editing, instrument playback, etc. - are not part of this tool.
Pitch humanization is also not supported at this time.
