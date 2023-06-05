# MIDI Humanizer

A tool to randomize note starts, durations, tempo drift, and velocities in a MIDI file.

[⭐️ Open the App ⭐️](https://vincerubinetti.github.io/midi-humanizer/)

<img width="300" src="https://raw.githubusercontent.com/vincerubinetti/midi-humanizer/main/public/screenshot.jpg?raw=true" />

When writing music in a [DAW](https://en.wikipedia.org/wiki/Digital_audio_workstation), you often sequence in notes perfectly snapped to the grid.
Sometimes you might want to add some randomness to make it sound more like a human played them.
Unfortunately, many DAWs provide little or no controls to do this automatically.

This tool provides more controls for "humanizing" a MIDI performance, including a "drift" parameter which simulates tempo drifting over time.
It can't truly replace a real human performance, but it can be used as a starting point for further tweaking, and also works fine for background rhythms.
It is best used in close conjunction with your DAW, going back and forth with its MIDI import and export for individual patterns/phrases.

This tool is not meant to [replace a DAW](https://en.wikipedia.org/wiki/Inner-platform_effect), it is only meant to fill a specific hole in functionality.
Things that DAWs can already do adequately – like song editing, individual note editing, instrument playback, etc. – are not part of this tool.
Pitch humanization is also not supported at this time.
