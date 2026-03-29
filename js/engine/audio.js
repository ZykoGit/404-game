import { SoundSynth } from '../procedural/soundSynth.js';

export class AudioSys {
  constructor(){
    this.synth = new SoundSynth();
  }

  async init(){
    await this.synth.init();
    this.synth.startDrone();
  }

  update(px, py, corruption){
    // map corruption to drone filter cutoff
    this.synth.setDroneIntensity(corruption / 100);
  }

  playJumpscare(){
    this.synth.jumpscareBurst();
  }

  playWhisper(){
    this.synth.whisper();
  }

  startChase(){
    this.synth.startChase();
  }
}
