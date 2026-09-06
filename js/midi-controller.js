/**
 * StudioMaster Pro - Web MIDI Controller Integration & MIDI Learn System
 */

export class MidiController {
  constructor(engine, app) {
    this.engine = engine;
    this.app = app;
    this.midiAccess = null;
    this.inputs = [];
    this.isSupported = 'requestMIDIAccess' in navigator;
    this.isLearning = false;
    this.learningTarget = null; // { type, channelId, param, element }
    this.mappings = new Map(); // Key: `channel:ccNumber` -> Target definition
  }

  async init() {
    if (!this.isSupported) {
      console.warn('Web MIDI API is not supported in this browser.');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.midiAccess.onstatechange = (e) => this.onStateChange(e);
      this.refreshInputs();
      return true;
    } catch (err) {
      console.warn('Web MIDI Access denied or unavailable:', err);
      return false;
    }
  }

  refreshInputs() {
    if (!this.midiAccess) return;
    this.inputs = [];
    const inputs = this.midiAccess.inputs.values();
    for (let input of inputs) {
      this.inputs.push(input);
      input.onmidimessage = (msg) => this.handleMidiMessage(msg);
    }
  }

  onStateChange(e) {
    this.refreshInputs();
  }

  handleMidiMessage(event) {
    const [status, data1, data2] = event.data;
    const command = status >> 4;
    const midiChannel = status & 0xf;

    // 0xB is Control Change (CC)
    if (command === 0x0b) {
      const cc = data1;
      const val = data2; // 0 to 127
      const normVal = val / 127; // 0.0 to 1.0

      const key = `${midiChannel}:${cc}`;

      // If in MIDI Learn Mode, capture this CC
      if (this.isLearning && this.learningTarget) {
        this.mappings.set(key, { ...this.learningTarget });
        this.app.showToast(`MIDI Mapped: CC ${cc} -> ${this.learningTarget.param}`, 'success');
        this.stopMidiLearn();
        return;
      }

      // Execute bound parameter action
      if (this.mappings.has(key)) {
        const target = this.mappings.get(key);
        this.applyParameterValue(target, normVal);
      }
    }
  }

  startMidiLearn(target) {
    this.isLearning = true;
    this.learningTarget = target;
    this.app.showToast(`Gerakkan fader / knob fisik pada MIDI controller untuk memetakan "${target.param}"`, 'info');
  }

  stopMidiLearn() {
    this.isLearning = false;
    this.learningTarget = null;
  }

  applyParameterValue(target, normVal) {
    const { type, channelId, param } = target;

    if (type === 'master') {
      if (param === 'volume') {
        const gain = normVal * 1.5; // up to +3.5dB
        this.engine.setMasterGain(gain);
        this.app.updateMasterFaderUI(normVal);
      }
      return;
    }

    const channel = this.engine.channels.find(ch => ch.id === channelId);
    if (!channel) return;

    switch (param) {
      case 'volume':
        channel.setGain(normVal * 1.5);
        this.app.updateChannelFaderUI(channelId, normVal);
        break;
      case 'pan':
        channel.setPan(normVal * 2 - 1); // -1 to +1
        this.app.updateKnobUI(channelId, 'pan', normVal);
        break;
      case 'low':
        channel.setEQLow(normVal * 30 - 15); // -15 to +15dB
        this.app.updateKnobUI(channelId, 'eqLow', normVal);
        break;
      case 'mid':
        channel.setEQMid(normVal * 30 - 15);
        this.app.updateKnobUI(channelId, 'eqMid', normVal);
        break;
      case 'high':
        channel.setEQHigh(normVal * 30 - 15);
        this.app.updateKnobUI(channelId, 'eqHigh', normVal);
        break;
      case 'sendReverb':
        channel.setSendReverb(normVal);
        this.app.updateKnobUI(channelId, 'sendReverb', normVal);
        break;
      case 'sendDelay':
        channel.setSendDelay(normVal);
        this.app.updateKnobUI(channelId, 'sendDelay', normVal);
        break;
    }
  }
}
