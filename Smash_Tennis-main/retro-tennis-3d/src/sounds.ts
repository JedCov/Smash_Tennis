import * as Tone from 'tone';

let synth: Tone.Synth | null = null;
let noiseSynth: Tone.NoiseSynth | null = null;

const initAudio = async () => {
    if (Tone.context.state !== 'running') {
        await Tone.context.resume();
    }
    if (!synth) {
        synth = new Tone.Synth({
            oscillator: { type: 'square' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 }
        }).toDestination();
    }
    if (!noiseSynth) {
        noiseSynth = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
        }).toDestination();
    }
};

export const playHitSound = async () => {
    await initAudio();
    synth?.triggerAttackRelease('C3', '16n');
};

export const playWallSound = async () => {
    await initAudio();
    synth?.triggerAttackRelease('G2', '16n');
};

export const playScoreSound = async () => {
    await initAudio();
    synth?.triggerAttackRelease('C4', '8n');
    setTimeout(() => synth?.triggerAttackRelease('E4', '8n'), 100);
    setTimeout(() => synth?.triggerAttackRelease('G4', '4n'), 200);
};

export const playMissSound = async () => {
    await initAudio();
    noiseSynth?.triggerAttackRelease('16n');
};
