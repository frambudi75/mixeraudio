# System Architecture & Audio Graph

## 1. High-Level Architecture

StudioMaster Pro dibangun dengan arsitektur **Client-Side DSP Engine** menggunakan Web Audio API native dan didukung oleh **Lightweight REST API (PHP)** untuk penyimpanan project dan aset audio.

```
+-------------------------------------------------------------------------+
|                        BROWSER CLIENT INTERFACE                         |
|                                                                         |
|  +--------------------+  +----------------------+  +-----------------+  |
|  |   Mixing Console   |  | Studio Equalizer &   |  | 16-Pad Sampler  |  |
|  |   Channel Strips   |  |     DSP FX Suite     |  |   Soundboard    |  |
|  +--------------------+  +----------------------+  +-----------------+  |
|            |                        |                       |           |
|  +-------------------------------------------------------------------+  |
|  |                 StudioApp Controller (js/app.js)                  |  |
|  +-------------------------------------------------------------------+  |
|            |                        |                       |           |
|  +-------------------+   +---------------------+   +-----------------+  |
|  | AudioRouting (I/O)|   | DspSuite (18 Presets|   | Web MIDI Engine |  |
|  +-------------------+   +---------------------+   +-----------------+  |
|                                     |                                   |
|  +-------------------------------------------------------------------+  |
|  |                 AudioEngine Core (Web Audio Graph)                |  |
|  +-------------------------------------------------------------------+  |
|            |                                                |           |
|  +--------------------+                            +-----------------+  |
|  | Realtime 60FPS     |                            | Lossless WAV    |  |
|  | Visualizer Canvas  |                            | Stem Exporter   |  |
|  +--------------------+                            +-----------------+  |
+-------------------------------------------------------------------------+
                                    | HTTP REST Fetch
                                    v
+-------------------------------------------------------------------------+
|                    PHP BACKEND SERVER (XAMPP / aaPanel)                 |
|                                                                         |
|  - api/upload.php       -> Handler upload audio multi-format            |
|  - api/projects.php     -> CRUD session project JSON                    |
|  - api/list_audio.php   -> Scan media audio di folder uploads/          |
|  - uploads/             -> Media storage                                |
|  - projects/            -> Session presets storage                      |
+-------------------------------------------------------------------------+
```

---

## 2. Web Audio DSP Signal Flow (Routing Graph)

Setiap channel strip dan master bus mengikuti alur sinyal pemrosesan berikut:

```
[AUDIO SOURCE] (File Buffer / Live Mic / App Audio / Synth)
      |
      v
 [Trim / Gain] (+/- 24dB)
      |
      v
 [Low-Cut Filter] (Biquad Highpass 20Hz - 400Hz)
      |
      v
 [3-Band Parametric EQ] (Low Shelf -> Sweep Mid -> High Shelf)
      |
      v
 [Channel Compressor & Noise Gate]
      |
      v
 [Phase Invert Node]
      |
      v
 [Stereo Panner Node] (-1.0 to +1.0)
      |
      +---> [Aux 1 Send] ---> [Convolution Studio Reverb] --+
      |                                                     |
      +---> [Aux 2 Send] ---> [Stereo Tape Delay] ----------+
      |                                                     |
      v                                                     |
 [Channel Fader]                                            |
      |                                                     |
      v                                                     |
 [Mute Gate / Solo Logic]                                   |
      |                                                     |
      +---> [Dual VU Meter Analysers] (L/R)                 |
      |                                                     |
      v                                                     v
================================================================
                    SUMMING MASTER BUS
================================================================
      |
      v
 [Master Preamp Boost] (50% - 200%)
      |
      v
 [10-Band Graphic Studio Equalizer] (32Hz - 16kHz)
      |
      v
 [Deep Sub-Bass Enhancer] (Low Shelf 50Hz)
      |
      v
 [High Air Treble Enhancer] (High Shelf 14kHz)
      |
      v
 [8D Spatial Binaural Orbit Panner]
      |
      v
 [Auto Volume Leveling Compressor]
      |
      v
 [Master 5-Band EQ] (60Hz - 12kHz)
      |
      v
 [Master Glue Compressor]
      |
      v
 [Brickwall Limiter] (Ceiling -0.5 dB)
      |
      v
 [Master Volume Fader]
      |
      +---> [Audio Destination / Selected Output Jack] (setSinkId)
      +---> [Master FFT Spectrum Analyser (2048 Bin)]
      +---> [Stereo Vectorscope / Phase Goniometer Splitter]
      +---> [MediaStreamDestination for Mix Recording]
```

---

## 3. Struktur File & Modul

- **`index.php`**: Single-Page Console Application interface.
- **`css/`**:
  - `main.css`: Theme system, typography, transport, base tokens.
  - `mixer.css`: Strip faders, knobs, LED segment VU meters.
  - `visualizers.css`: Spectrum canvas, vectorscope, soundboard layout.
  - `dsp-suite.css`: 10-band EQ, ambient noise cards, and preset grid.
- **`js/`**:
  - `app.js`: Main controller & DOM orchestrator.
  - `audio-engine.js`: Master bus audio graph & transport clock.
  - `audio-channel.js`: Track strip class with full DSP chain.
  - `audio-effects.js`: Reverb impulse generator, EQ, Tape delay DSP.
  - `audio-routing.js`: Hardware device enumeration & app audio capture.
  - `dsp-suite.js`: 18 Studio presets, 10-band EQ, 8D audio engine.
  - `auto-ducking.js`: Sidechain voice detector & music volume fader.
  - `vocal-fx.js`: Noise gate, de-esser, chorus, autotune scale maps.
  - `audio-visualizer.js`: 60 FPS spectrum & vectorscope canvas renderers.
  - `audio-recorder.js`: PCM 16-Bit WAV encoder & stem batch exporter.
  - `synth-demo.js`: OfflineContext multi-track stem synthesizer.
  - `sample-pads.js`: Soundboard with synthetic sound generator.
  - `midi-controller.js`: Web MIDI API controller mapping engine.
