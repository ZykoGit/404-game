export class SoundSynth {
  constructor(){
    this.ctx = null;
    this.drone = null;
    this.droneGain = null;
    this.master = null;
  }

  async init(){
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);

    // drone
    this.drone = this.ctx.createOscillator();
    this.drone.type = 'sawtooth';
    this.drone.frequency.value = 40;
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.02;
    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 400;
    this.drone.connect(droneFilter);
    droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.master);
    this.drone.start();
  }

  startDrone(){
    // already started in init
  }

  setDroneIntensity(t){
    // t in [0,1]
    const cutoff = 200 + t * 3000;
    // find filter node (assume first child)
    try {
      const filter = this.drone.context ? this.drone.context : null;
    } catch(e){}
    // modulate gain for tension
    this.droneGain.gain.linearRampToValueAtTime(0.02 + t * 0.08, this.ctx.currentTime + 0.1);
  }

  jumpscareBurst(){
    const o = this.ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = 120;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    o.connect(g);
    g.connect(this.master);
    o.start();
    g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(1.0, this.ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
    o.stop(this.ctx.currentTime + 0.4);
  }

  whisper(){
    // short noise burst using buffer
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<bufferSize;i++){
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.2;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = 0.0;
    src.connect(g);
    g.connect(this.master);
    src.start();
    g.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.01);
    g.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.35);
  }

  startChase(){
    // quick pulse to signal chase
    this.jumpscareBurst();
    // increase drone intensity
    this.setDroneIntensity(0.9);
  }
}
