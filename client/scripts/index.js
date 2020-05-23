var canvas = document.getElementById("mainCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.92;
canvas.height = canvas.clientHeight;
var context = canvas.getContext("2d");
var aspect = canvas.width / canvas.height;
var WIDTH = canvas.width;
var HEIGHT = canvas.height;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioctx = new AudioContext();
var graphNodes = [];

var freqAnalyserNumbers = [];
var waveformAnalyserNumbers = [];
var spectrogramAnalyserNumbers = [];

var LinearConvolver = function () {
    var node = audioctx.createConvolver();
    return node;
}

var WhiteNoise = function () {
    var node = audioctx.createScriptProcessor(4096, 1, 1);

    var lbuffer = new Float32Array(4096);
    var rbuffer = new Float32Array(4096);
    for (var i = 0; i < 4096; i++) {
        lbuffer[i] = Math.random() * 2 - 1;
        rbuffer[i] = Math.random() * 2 - 1;
    }
    var externBuffer = audioctx.createBuffer(2, 4096, 48000);
    externBuffer.copyToChannel(lbuffer, 0);
    externBuffer.copyToChannel(rbuffer, 1);
    node.externBuffer = externBuffer;

    node.onaudioprocess = function (e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < 4096; i++) {
            output[i] = Math.random() * 2 - 1;
        }
    }
    return node;
}

var Bitcrusher = function (bits, normFreq, bypass) {
    var phaser = 0, last = 0, step, length;
    this.node = audioctx.createScriptProcessor(4096, 1, 1);
    this.input = audioctx.createGain();
    this.output = audioctx.createGain();
    this.node.bits = bits;
    this.node.normFreq = normFreq;
    this.node.onaudioprocess = function (e) {
        var input = e.inputBuffer.getChannelData(0);
        var output = e.outputBuffer.getChannelData(0);
        step = Math.pow(1 / 2, this.bits);
        length = input.length;
        for (var i = 0; i < length; i++) {
            phaser += this.normFreq;
            if (phaser >= 1.0) {
                phaser -= 1.0;
                last = step * Math.floor(input[i] / step + 0.5);
            }
            output[i] = last;
        }
    }
    if (bypass){
        this.input.connect(this.output);
    }
    else {
        this.input.connect(this.node);
        this.node.connect(this.output);
    }
}

var Moog = function (cutoff, resonance, bypass) {
    var in1, in2, in3, in4, out1, out2, out3, out4;
    in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;
    var input, output, f, fb, i, length, inputFactor;
    this.node = audioctx.createScriptProcessor(4096, 1, 1);
    this.input = audioctx.createGain();
    this.output = audioctx.createGain();
    this.node.cutoff = cutoff;
    this.node.resonance = resonance;
    this.node.bypass = bypass;
    this.node.onaudioprocess = function (e) {
        input = e.inputBuffer.getChannelData(0);
        output = e.outputBuffer.getChannelData(0);
        f = this.cutoff * 1.16;
        inputFactor = 0.35013 * (f * f) * (f * f);
        fb = this.resonance * (1.0 - 0.15 * f * f);
        length = input.length;
        for (i = 0; i < length; i++) {
            input[i] -= out4 * fb;
            input[i] *= inputFactor;
            out1 = input[i] + 0.3 * in1 + (1 - f) * out1; // Pole 1
            in1 = input[i];
            out2 = out1 + 0.3 * in2 + (1 - f) * out2; // Pole 2
            in2 = out1;
            out3 = out2 + 0.3 * in3 + (1 - f) * out3; // Pole 3
            in3 = out2;
            out4 = out3 + 0.3 * in4 + (1 - f) * out4; // Pole 4
            in4 = out3;
            output[i] = out4;
        }
    }
    if (bypass) {
        this.input.connect(this.output);
    }
    else {
        this.input.connect(this.node);
        this.node.connect(this.output);
    }
}

var Panner = function (pan, bypass) {
    this.node = audioctx.createStereoPanner();
    this.node.pan.value = pan;
    this.node.bypass = bypass;
    this.input = audioctx.createGain();
    this.output = audioctx.createGain();

    if (bypass) {
        this.input.connect(this.output);
    }
    else {
        this.input.connect(this.node);
        this.node.connect(this.output);
    }
}

var FrequencyAnalyser = function (vNode) {
    var node = audioctx.createAnalyser();
    node.fftSize = highestPowerOf2(Math.round(vNode.fftSlider.value));
    console.log(node.fftSize + " " + audioctx.sampleRate.toString());
    node.vNode = vNode;

    var freqDomain = new Uint8Array(node.frequencyBinCount);
    var num = setInterval(function () {
        node.getByteFrequencyData(freqDomain);
        vNode.displayRedraw(freqDomain, node.frequencyBinCount, audioctx.sampleRate);
    }, Math.round(vNode.resolutionSlider.value));
    freqAnalyserNumbers.push(num);
    return node;
}

var WaveformAnalyser = function (vNode) {
    var smoothingTimeConstant = 0.85;
    var node = audioctx.createAnalyser();
    //node.smoothingTimeConstant = smoothingTimeConstant;
    node.fftSize = highestPowerOf2(Math.round(vNode.fftSlider.value));
    node.vNode = vNode;

    var timeDomain = new Uint8Array(node.frequencyBinCount);
    var num = setInterval(function () {
        node.getByteTimeDomainData(timeDomain);
        vNode.displayRedraw(timeDomain, node.frequencyBinCount);
    }, Math.round(vNode.resolutionSlider.value));
    waveformAnalyserNumbers.push(num);
    return node;
}

var SpectrogramAnalyser = function (vNode) {
    var smoothingTimeConstant = 0.85;
    var node = audioctx.createAnalyser();
    //node.smoothingTimeConstant = smoothingTimeConstant;
    node.fftSize = highestPowerOf2(vNode.display.h * 2);
    node.vNode = vNode;

    var freqDomain;
    var num = setInterval(function () {
        node.fftSize = highestPowerOf2(vNode.display.h * 2);
        freqDomain = new Uint8Array(node.frequencyBinCount);
        node.getByteFrequencyData(freqDomain);
        vNode.displayRedraw(freqDomain, node.frequencyBinCount);
    }, Math.round(vNode.resolutionSlider.value));
    spectrogramAnalyserNumbers.push(num);
    return node;
}

var CustomWave = function (waveformBuffer) {
    var seconds = 0.5;
    var audioBuffer = audioctx.createBuffer(1, audioctx.sampleRate * seconds, audioctx.sampleRate);
    var buffer = new Float32Array(audioctx.sampleRate * seconds);
    for (var i = 0, j = 0; i < buffer.length; i++ , j++) {
        if (j == waveformBuffer.length) { j = 0; }
        buffer[i] = (waveformBuffer[j]);
    }
    audioBuffer.copyToChannel(buffer, 0);
    var node = audioctx.createBufferSource();
    node.buffer = audioBuffer;
    node.loop = true;

    return node;
}

var Microphone = function (stream) {
    var node = audioctx.createMediaStreamSource(stream);
    return node;
}

var DrumSequencer = function (activations, pads, channels, channelTracks, bpm) {
    this.activations = activations;
    this.pads = pads;
    this.channels = channels;
    this.channelTracks = channelTracks;
    this.output = audioctx.createGain();
    // setup the sequencer
    this.noteTime;
    this.startTime;
    this.lastDrawTime = -1;
    this.LOOP_LENGTH = 16;
    this.rhythmIndex = 0;
    this.timeoutId = -1;
    this.tempo = bpm;
    this.TEMPO_MAX = 200;
    this.TEMPO_MIN = 40;
    this.TEMPO_STEP = 4;
}

DrumSequencer.prototype.playNote = function (buffer, noteTime) {
    var voice = audioctx.createBufferSource();
    voice.buffer = buffer;
    var currentLastNode = this.output;
    /*if (lowPassFilterNode.active) {
      lowPassFilterNode.connect(currentLastNode);
      currentLastNode = lowPassFilterNode;
    }
    if (convolver.active) {
      convolver.buffer = reverbImpulseResponse.buffer;
      convolver.connect(currentLastNode);
      currentLastNode = convolver;
    }*/
    voice.connect(currentLastNode);
    voice.start(noteTime);
}

DrumSequencer.prototype.schedule = function () {
    var currentTime = audioctx.currentTime;
    currentTime -= this.startTime;

    while (this.noteTime < currentTime + 0.200) {
        var contextPlayTime = this.noteTime + this.startTime;
        for (var i = 0; i < 8; i++) {
            if (this.activations[i] == 1) {
                var buffer = this.channelTracks[i];
                if (buffer != null) {
                    if (this.pads[i][this.rhythmIndex] == 1) {
                        this.playNote(buffer, contextPlayTime);
                    }
                }
            }
        }
        if (this.noteTime != this.lastDrawTime) {
            this.lastDrawTime = this.noteTime;
        }
        this.advanceNote();
    }
    this.timeoutId = requestAnimationFrame(this.schedule.bind(this));
}

DrumSequencer.prototype.advanceNote = function () {
    var secondsPerBeat = 60.0 / this.tempo;
    this.rhythmIndex++;
    if (this.rhythmIndex == this.LOOP_LENGTH) {
        this.rhythmIndex = 0;
    }
    //0.25 because each square is a 16th note
    this.noteTime += 0.25 * secondsPerBeat;
    // if (rhythmIndex % 2) {
    //     noteTime += (0.25 + kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    // } else {
    //     noteTime += (0.25 - kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    // }
}

DrumSequencer.prototype.handlePlay = function () {
    this.rhythmIndex = 0;
    this.noteTime = 0.0;
    this.startTime = audioctx.currentTime + 0.005;
    this.schedule();
}

DrumSequencer.prototype.handleStop = function () {
    cancelAnimationFrame(this.timeoutId);
}

function constructGraph(nodes) {
    if (nodes.length == 0) {
        return;
    }
    //construct the nodes
    for (var i = 0; i < nodes.length; i++) {
        switch (nodes[i].type) {
            case "AudioSource": {
                graphNodes[i] = audioctx.createBufferSource();
                graphNodes[i].buffer = nodes[i].inputBox.buffer;
                graphNodes[i].loop = true;
                break;
            }
            case "AudioDestination": {
                graphNodes[i] = audioctx.destination;
                break;
            }
            case "AudioMerger": {
                graphNodes[i] = audioctx.createGain();
                break;
            }
            case "LinearConvolver": {
                graphNodes[i] = new LinearConvolver();
                break;
            }
            case "WhiteNoise": {
                graphNodes[i] = new WhiteNoise();
                break;
            }
            case "Bitcrusher": {
                graphNodes[i] = new Bitcrusher(nodes[i].bitsSlider.value, nodes[i].normSlider.value, nodes[i].bypass);
                break;
            }
            case "Moog": {
                graphNodes[i] = new Moog(nodes[i].cutoffSlider.value, nodes[i].resonanceSlider.value, nodes[i].bypass);
                break;
            }
            case "Panner": {
                graphNodes[i] = new Panner(nodes[i].panSlider.value, nodes[i].bypass);
                break;
            }
            case "FrequencyAnalyser": {
                graphNodes[i] = new FrequencyAnalyser(nodes[i]);
                break;
            }
            case "WaveformAnalyser": {
                graphNodes[i] = new WaveformAnalyser(nodes[i]);
                break;
            }
            case "SpectrogramAnalyser": {
                graphNodes[i] = new SpectrogramAnalyser(nodes[i]);
                break;
            }
            case "Oscillator": {
                graphNodes[i] = audioctx.createOscillator();
                graphNodes[i].type = nodes[i].toggleGroup.activeValue.toLowerCase();
                graphNodes[i].frequency.setValueAtTime(nodes[i].freqSlider.value, audioctx.currentTime);
                graphNodes[i].detune.setValueAtTime(nodes[i].detuneSlider.value, audioctx.currentTime);
                break;
            }
            case "CustomWave": {
                graphNodes[i] = new CustomWave(nodes[i].waveformBuffer);
                break;
            }
            case "Microphone": {
                graphNodes[i] = new Microphone(nodes[i].stream);
                break;
            }
            case "DrumSequencer": {
                graphNodes[i] = new DrumSequencer(nodes[i].activations, nodes[i].pads, nodes[i].channels, nodes[i].channelTracks, nodes[i].bpm);
                break;
            }
            default: break;
        }
    }
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].connectedTo != null) {
            if (nodes[i].type == "LinearConvolver" && nodes[i].connectedTo.type == "LinearConvolver") {
                if (nodes[i].connectedTo.inputSampleNode.guid == nodes[i].guid) {
                    //graphNodes[i].convolver.connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)].convolver);
                    graphNodes[i].connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
                }
                else if (nodes[i].connectedTo.impulseRNode.guid == nodes[i].guid) {
                    //graphNodes[nodes.indexOf(nodes[i].connectedTo)].setIR(graphNodes[i].convolver.buffer);
                    graphNodes[nodes.indexOf(nodes[i].connectedTo)].buffer = graphNodes[i].buffer;

                }
            }
            else if (nodes[i].type == "LinearConvolver" && nodes[i].connectedTo.type == "AudioSource") {
                //console.log("current node is Convolve : " + i);
                //graphNodes[i].convolver.connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
                graphNodes[i].connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
                //console.log(typeof (graphNodes[i]) + "connected to " + typeof (graphNodes[nodes.indexOf(nodes[i].connectedTo)]));
            }
            else if (nodes[i].type == "AudioSource" && nodes[i].connectedTo.type == "LinearConvolver") {
                //console.log("later node is Convolve");
                //console.log(nodes[i].guid + " " + nodes[i].connectedTo.inputSampleNode.guid);
                //console.log(nodes[i].type + " " + nodes[i].connectedTo.inputSampleNode.type);
                if (nodes[i].guid == nodes[i].connectedTo.inputSampleNode.guid) {
                    //console.log("found to be in inputSample");
                    //console.log(graphNodes[i]);
                    //console.log(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
                    //graphNodes[i].connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)].convolver);
                    graphNodes[i].connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
                    //console.log(typeof (graphNodes[i]) + "connected to " + typeof (graphNodes[nodes.indexOf(nodes[i].connectedTo)].convolver));
                }
                else if (nodes[i].guid == nodes[i].connectedTo.impulseRNode.guid) {
                    //console.log("found to be in impulseResponse");
                    //graphNodes[nodes.indexOf(nodes[i].connectedTo)].setIR(nodes[i].inputBox.buffer);
                    graphNodes[nodes.indexOf(nodes[i].connectedTo)].buffer = nodes[i].inputBox.buffer;
                    //console.log("buffer set")
                }
            }
            else if (nodes[i].type == "WhiteNoise" && nodes[i].connectedTo.type == "LinearConvolver") {
                if (nodes[i].guid == nodes[i].connectedTo.inputSampleNode.guid) {
                    //graphNodes[i].connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)].convolver);
                    graphNodes[i].connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
                }
                else if (nodes[i].guid == nodes[i].connectedTo.impulseRNode.guid) {
                    //console.log(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
                    //graphNodes[nodes.indexOf(nodes[i].connectedTo)].setIR(graphNodes[i].externBuffer);
                    graphNodes[nodes.indexOf(nodes[i].connectedTo)].buffer = graphNodes[i].externBuffer;
                }
            }
            else if (nodes[i].type == "LinearConvolver" && nodes[i].connectedTo.type == "AudioDestination") {
                //graphNodes[i].convolver.connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
                graphNodes[i].connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
            }
            else if ((nodes[i].type == "Bitcrusher" || nodes[i].type == "Moog" || nodes[i].type == "Panner") && (nodes[i].connectedTo.type != "Bitcrusher" || nodes[i].connectedTo.type != "Moog" || nodes[i].connectedTo.type != "Panner")) {
                graphNodes[i].output.connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
            }
            else if ((nodes[i].type != "Bitcrusher" || nodes[i].type != "Moog" || nodes[i].type != "Panner") && (nodes[i].connectedTo.type == "Bitcrusher" || nodes[i].connectedTo.type == "Moog" || nodes[i].connectedTo.type == "Panner") && nodes[i].type != "DrumSequencer"){
                graphNodes[i].connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)].input);
            }
            else if ((nodes[i].type == "Bitcrusher" || nodes[i].type == "Moog" || nodes[i].type == "Panner") && (nodes[i].connectedTo.type == "Bitcrusher" || nodes[i].connectedTo.type == "Moog" || nodes[i].connectedTo.type == "Panner")){
                graphNodes[i].output.connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)].input);
            }
            else if (nodes[i].type == "DrumSequencer") {
                graphNodes[i].output.connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
            }
            else {
                //console.log(graphNodes[i]);
                //console.log(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
                graphNodes[i].connect(graphNodes[nodes.indexOf(nodes[i].connectedTo)]);
            }
        }
    }
    playGraph();
}

function playGraph() {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].type == "AudioSource" && nodes[i].connectedTo != null) {
            graphNodes[i].start(0);
        }
        else if (nodes[i].type == "Oscillator" && nodes[i].connectedTo != null){
            graphNodes[i].start();
        }
        else if (nodes[i].type == "CustomWave" && nodes[i].connectedTo != null) {
            graphNodes[i].start(0);
        }
        else if (nodes[i].type == "DrumSequencer" && nodes[i].connectedTo != null) {
            graphNodes[i].handlePlay();
        }
    }
}

function stopGraph() {
    for (var i = 0; i < freqAnalyserNumbers.length; i++){
        clearInterval(freqAnalyserNumbers[i]);
    }
    for (var i = 0; i < waveformAnalyserNumbers.length; i++) {
        clearInterval(waveformAnalyserNumbers[i]);
    }
    for (var i = 0; i < spectrogramAnalyserNumbers.length; i++) {
        clearInterval(spectrogramAnalyserNumbers[i]);
    }
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].type == "AudioSource" && nodes[i].connectedTo != null) {
            graphNodes[i].stop();
        }
        else if (nodes[i].type == "Oscillator" && nodes[i].connectedTo != null) {
            graphNodes[i].stop();
        }
        else if (nodes[i].type == "CustomWave" && nodes[i].connectedTo != null) {
            graphNodes[i].stop();
        }
        else if (nodes[i].type == "DrumSequencer" && nodes[i].connectedTo != null) {
            graphNodes[i].handleStop();
        }
    }
    graphNodes = [];
    audioctx.close();
    audioctx = new AudioContext();
    context.clearRect(0, 0, WIDTH, HEIGHT);
    ultimateRedraw();
    //stop audio
    //clear graphNodes
    //clear buffers
}

function highestPowerOf2(n) {
    var res = 0;
    for (var i = n; i >= 1; i--) 
    {
        if ((i & (i - 1)) == 0) {
            res = i;
            break;
        }
    }
    return ((res < 32) ? 32 : res );
}