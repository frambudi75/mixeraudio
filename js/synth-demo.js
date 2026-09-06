/**
 * StudioMaster Pro - Built-in Multi-Track Demo Project Synthesizer
 * Generates lossless studio-quality multi-track audio stems directly in-browser.
 */

export class SynthDemo {
  /**
   * Synthesize a complete 4-track electronic/funk demo project
   */
  static async generateDemoStems(audioCtx, bpm = 120, bars = 8) {
    const sampleRate = audioCtx.sampleRate;
    const secondsPerBeat = 60 / bpm;
    const totalDuration = secondsPerBeat * 4 * bars; // 8 bars total
    const length = Math.floor(sampleRate * totalDuration);

    const offlineCtx = new OfflineAudioContext(2, length, sampleRate);

    // Track 1: Drums & Percussion (Kick, Snare, Hi-Hats)
    const drumsBuffer = await this.renderDrumsTrack(offlineCtx, bpm, bars, sampleRate);

    // Track 2: 808 & Funk Bassline
    const bassBuffer = await this.renderBassTrack(offlineCtx, bpm, bars, sampleRate);

    // Track 3: Synth Pad / Chords
    const chordsBuffer = await this.renderChordsTrack(offlineCtx, bpm, bars, sampleRate);

    // Track 4: Lead Synth Melody / Arp
    const leadBuffer = await this.renderLeadTrack(offlineCtx, bpm, bars, sampleRate);

    return [
      { name: '01 DRUMS', buffer: drumsBuffer, color: '#06b6d4', fader: 0.9, pan: 0 },
      { name: '02 BASS', buffer: bassBuffer, color: '#8b5cf6', fader: 0.85, pan: 0 },
      { name: '03 CHORDS', buffer: chordsBuffer, color: '#f59e0b', fader: 0.75, pan: -0.3 },
      { name: '04 LEAD SYNTH', buffer: leadBuffer, color: '#10b981', fader: 0.75, pan: 0.3 }
    ];
  }

  static async renderDrumsTrack(ctx, bpm, bars, sampleRate) {
    const beatSec = 60 / bpm;
    const totalBeats = bars * 4;
    const buffer = ctx.createBuffer(2, Math.floor(sampleRate * beatSec * totalBeats), sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let beat = 0; beat < totalBeats; beat++) {
      const beatTime = beat * beatSec;
      const beatSample = Math.floor(beatTime * sampleRate);

      // Kick on 1, 2, 3, 4 (Four on the floor)
      this.addKick(left, right, beatSample, sampleRate);

      // Snare / Clap on 2 and 4
      if (beat % 2 === 1) {
        this.addSnare(left, right, beatSample, sampleRate);
      }

      // 16th note Hi-Hats
      for (let sub = 0; sub < 4; sub++) {
        const hatSample = Math.floor((beatTime + sub * (beatSec / 4)) * sampleRate);
        const isOpen = sub === 2;
        this.addHiHat(left, right, hatSample, sampleRate, isOpen);
      }
    }
    return buffer;
  }

  static addKick(left, right, startSample, sampleRate) {
    const duration = 0.35;
    const numSamples = Math.min(left.length - startSample, Math.floor(sampleRate * duration));
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const freq = 130 * Math.exp(-t * 24) + 45; // Pitch sweep
      const env = Math.exp(-t * 12);
      const val = Math.sin(2 * Math.PI * freq * t) * env * 0.9;
      left[startSample + i] += val;
      right[startSample + i] += val;
    }
  }

  static addSnare(left, right, startSample, sampleRate) {
    const duration = 0.25;
    const numSamples = Math.min(left.length - startSample, Math.floor(sampleRate * duration));
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const tone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 20) * 0.4;
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 16) * 0.5;
      const val = (tone + noise) * 0.8;
      left[startSample + i] += val;
      right[startSample + i] += val;
    }
  }

  static addHiHat(left, right, startSample, sampleRate, isOpen = false) {
    const duration = isOpen ? 0.18 : 0.05;
    const numSamples = Math.min(left.length - startSample, Math.floor(sampleRate * duration));
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * (isOpen ? 22 : 65)) * 0.25;
      left[startSample + i] += noise;
      right[startSample + i] += noise;
    }
  }

  static async renderBassTrack(ctx, bpm, bars, sampleRate) {
    const beatSec = 60 / bpm;
    const totalBeats = bars * 4;
    const buffer = ctx.createBuffer(2, Math.floor(sampleRate * beatSec * totalBeats), sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // Bassline Progression (F, Ab, Eb, Bb)
    const notes = [43.65, 51.91, 38.89, 58.27]; // F1, G#1, D#1, A#1

    for (let bar = 0; bar < bars; bar++) {
      const noteFreq = notes[bar % notes.length];
      for (let beat = 0; beat < 4; beat++) {
        const beatSample = Math.floor((bar * 4 + beat) * beatSec * sampleRate);
        const duration = beatSec * 0.85;
        const numSamples = Math.min(left.length - beatSample, Math.floor(sampleRate * duration));

        for (let i = 0; i < numSamples; i++) {
          const t = i / sampleRate;
          const env = Math.exp(-t * 3.5);
          // Fundamental + Saturation Harmonic
          const val = (Math.sin(2 * Math.PI * noteFreq * t) + 0.3 * Math.sin(4 * Math.PI * noteFreq * t)) * env * 0.7;
          left[beatSample + i] += val;
          right[beatSample + i] += val;
        }
      }
    }
    return buffer;
  }

  static async renderChordsTrack(ctx, bpm, bars, sampleRate) {
    const beatSec = 60 / bpm;
    const totalBeats = bars * 4;
    const buffer = ctx.createBuffer(2, Math.floor(sampleRate * beatSec * totalBeats), sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // Chords (Fm7, Abmaj7, Eb7, Bbm7)
    const chords = [
      [174.61, 207.65, 261.63, 311.13], // F3, Ab3, C4, Eb4
      [207.65, 261.63, 311.13, 392.00], // Ab3, C4, Eb4, G4
      [155.56, 196.00, 233.08, 277.18], // Eb3, G3, Bb3, Db4
      [233.08, 277.18, 349.23, 415.30]  // Bb3, Db4, F4, Ab4
    ];

    for (let bar = 0; bar < bars; bar++) {
      const chord = chords[bar % chords.length];
      const startSample = Math.floor(bar * 4 * beatSec * sampleRate);
      const duration = beatSec * 3.8;
      const numSamples = Math.min(left.length - startSample, Math.floor(sampleRate * duration));

      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const env = Math.sin((t / duration) * Math.PI) * 0.25;
        let sampleL = 0;
        let sampleR = 0;

        chord.forEach((freq, idx) => {
          // Warm detuned sawtooth/sine pad
          const detune = (idx % 2 === 0 ? 1.003 : 0.997);
          const s1 = Math.sin(2 * Math.PI * freq * t);
          const s2 = Math.sin(2 * Math.PI * (freq * detune) * t);
          sampleL += (s1 + s2) * 0.5 * env;
          sampleR += (s1 - s2) * 0.5 * env;
        });

        left[startSample + i] += sampleL;
        right[startSample + i] += sampleR;
      }
    }
    return buffer;
  }

  static async renderLeadTrack(ctx, bpm, bars, sampleRate) {
    const beatSec = 60 / bpm;
    const totalBeats = bars * 4;
    const buffer = ctx.createBuffer(2, Math.floor(sampleRate * beatSec * totalBeats), sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const scale = [349.23, 392.00, 415.30, 523.25, 622.25, 698.46]; // Fm Pentatonic

    for (let step = 0; step < totalBeats * 4; step++) {
      const stepTime = step * (beatSec / 4);
      const startSample = Math.floor(stepTime * sampleRate);
      const noteFreq = scale[(step * 3) % scale.length];
      const duration = (beatSec / 4) * 0.8;
      const numSamples = Math.min(left.length - startSample, Math.floor(sampleRate * duration));

      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 18);
        const val = Math.sin(2 * Math.PI * noteFreq * t) * env * 0.35;
        left[startSample + i] += val;
        right[startSample + i] += val;
      }
    }
    return buffer;
  }
}
