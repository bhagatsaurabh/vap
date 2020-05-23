var drumContext = new AudioContext() || webkitAudioContext();
var toolboxContainer = document.getElementById("toolboxContainer");          // Reference to div element containing all draggable node div's
var drumSequencerContainer = document.getElementById("drumSequencerContainer");
var dSPlayStop = document.getElementById("playStop");
var bpmInput = document.getElementById("bpmInput");
var isDSPlaying = false;
var currDSNode = null;
var output = drumContext.createGain();
output.connect(drumContext.destination);
var padElements = [[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
                   [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
                   [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
                   [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
                   [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
                   [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
                   [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
                   [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]];
for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 16; j++) {
        padElements[i][j] = document.getElementById((i + 1) + "_" + (j + 1));
    }
}
var samples = ["crash", "kick", "snare", "openhat", "tom", "clap", "perc", "shaker", "cowbell", "ride", "hihat"];
var xhrs = [];
var decodedSamples = {};
var selectionOptions = document.getElementById("selectionOptions");
var selectionCells = [null, null, null, null, null, null, null, null];
for (var i = 0; i < selectionCells.length; i++){
    selectionCells[i] = document.getElementById("selectionCell" + (i+1));
}
var activationCells = [null, null, null, null, null, null, null, null];
for (var i = 0; i < activationCells.length; i++){
    activationCells[i] = document.getElementById("a" + (i+1));
}
var isSelectionOpened = false, isPlaying = false;
var currSelection = null;
var activations = [1, 1, 1, 1, 1, 1, 1, 1];
var pads = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
var noteTime;
var startTime;
var lastDrawTime = -1;
var LOOP_LENGTH = 16;
var rhythmIndex = 0;
var timeoutId;
var testBuffer = null;
var tempo = 90;
var TEMPO_MAX = 200;
var TEMPO_MIN = 40;
var TEMPO_STEP = 4;
for (var i = 0; i < samples.length; i++) {
    xhrs[i] = new XMLHttpRequest();
    xhrs[i].open("GET", "../drumsamples/" + samples[i] + ".wav", true);
    xhrs[i].responseType = "arraybuffer";
    xhrs[i].sampleName = samples[i];
    xhrs[i].onload = function () {
        var sampleName = this.sampleName
        drumContext.decodeAudioData(this.response, function (decoded) {
            decodedSamples[sampleName] = decoded;
        });
    }
    xhrs[i].onerror = function (err) {
        console.log(err);
    }
    xhrs[i].send();
}

function selectionClicked(element) {
    currSelection = element;
    if (!isSelectionOpened) {
        selectionOptions.style.opacity = "1";
        selectionOptions.style.pointerEvents = "all";
    }
    isSelectionOpened = !isSelectionOpened;
}

function selectionSelected(e) {
    if (isSelectionOpened) {
        currSelection.innerHTML = e.innerHTML;
        currDSNode.channels[parseInt(currSelection.id.substring(13)) - 1] = e.innerHTML.toLowerCase();
        currDSNode.channelTracks[parseInt(currSelection.id.substring(13)) - 1] = decodedSamples[e.innerHTML.toLowerCase()];
    }
    isSelectionOpened = false;
    selectionOptions.style.opacity = "0";
    selectionOptions.style.pointerEvents = "none";
}
function activationClicked(e) {
    if (activations[parseInt(e.id.substring(1)) - 1] == 0) {
        e.style.backgroundColor = "#76ee00";
        activations[parseInt(e.id.substring(1)) - 1] = 1;
        if (currDSNode != null) currDSNode.activations[parseInt(e.id.substring(1)) - 1] = 1;
    }
    else {
        e.style.backgroundColor = "#eee";
        activations[parseInt(e.id.substring(1)) - 1] = 0;
        if (currDSNode != null) currDSNode.activations[parseInt(e.id.substring(1)) - 1] = 0;
    }
}
function padClicked(e) {
    var id = e.id.split("_");
    if (pads[parseInt(id[0]) - 1][parseInt(id[1]) - 1] == 0) {
        e.style.opacity = "1";
        pads[parseInt(id[0]) - 1][parseInt(id[1]) - 1] = 1;
        currDSNode.pads[parseInt(id[0]) - 1][parseInt(id[1]) - 1] = 1;
    }
    else {
        e.style.opacity = "0.2";
        pads[parseInt(id[0]) - 1][parseInt(id[1]) - 1] = 0;
        currDSNode.pads[parseInt(id[0]) - 1][parseInt(id[1]) - 1] = 0;
    }
}

function playClicked() {
    if (!isPlaying) {
        handlePlay();
    }
    else {
        handleStop();
    }
    isPlaying = !isPlaying;
}

function playNote(buffer, noteTime) {
    var voice = drumContext.createBufferSource();
    voice.buffer = buffer;

    var currentLastNode = output;
    /*if (lowPassFilterNode.active) {
      lowPassFilterNode.connect(currentLastNode);
      currentLastNode = lowPassFilterNode;
    }
    if (convolver.active) {
      convolver.buffer = reverbImpulseResponse.buffer;
      convolver.connect(currentLastNode);
      currentLastNode = convolver;
    }*/
    voice.connect(output);
    voice.start(noteTime);
}

function schedule() {
    var currentTime = drumContext.currentTime;
    currentTime -= startTime;

    while (noteTime < currentTime + 0.200) {
        var contextPlayTime = noteTime + startTime;

        for (var i = 0; i < 8; i++) {
            if (activations[i] == 1) {
                //check the innerHTML of current selectionCell
                var buffer = decodedSamples[selectionCells[i].innerHTML.toLowerCase()];
                if (buffer != null) {
                    if (pads[i][rhythmIndex] == 1) {
                        playNote(buffer, contextPlayTime);
                    }
                }
            }
        }
        if (noteTime != lastDrawTime) {
            lastDrawTime = noteTime;
            drawPlayhead(rhythmIndex);
        }
        advanceNote();
    }
    timeoutId = requestAnimationFrame(schedule);
}

function drawPlayhead(xindex) {
    var lastIndex = (xindex + LOOP_LENGTH - 1) % LOOP_LENGTH;
    for (var i = 0; i < 8; i++) {
        padElements[i][xindex].className = "padCellPlaying";
        padElements[i][lastIndex].className = "padCell";
    }
}

function bpmInputCheck(x) {
    if (x.value == "") {
        tempo = 90;
        if (currDSNode != null) currDSNode.tempo = tempo;
    }
    else if (isNaN(parseInt(x.value))) {
        x.value = "90";
        tempo = 90;
        if (currDSNode != null) currDSNode.tempo = tempo;
    }
    else {
        if (parseInt(x.value) > 240) {
            x.value = "240";
            tempo = 240;
            if (currDSNode != null) currDSNode.tempo = tempo;
        }
        else {
            tempo = parseInt(x.value);
            console.log(tempo);
            if (currDSNode != null) currDSNode.tempo = tempo;
        }
    }
}

function advanceNote() {
    var secondsPerBeat = 60.0 / tempo;
    rhythmIndex++;
    if (rhythmIndex == LOOP_LENGTH) {
        rhythmIndex = 0;
    }
    //0.25 because each square is a 16th note
    noteTime += 0.25 * secondsPerBeat;
    // if (rhythmIndex % 2) {
    //     noteTime += (0.25 + kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    // } else {
    //     noteTime += (0.25 - kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    // }
}

function handlePlay(event) {
    rhythmIndex = 0;
    noteTime = 0.0;
    startTime = drumContext.currentTime + 0.005;
    schedule();
}

function handleStop(event) {
    cancelAnimationFrame(timeoutId);
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 16; j++) {
            padElements[i][j].className = "padCell";
        }
    }
}

var playOption = document.getElementById("play");                            // Reference to div containing Play icon
var stopOption = document.getElementById("stop");                            // Reference to div containing Stop icon
var speakerIcon = document.createElement("img");                             // <img> used for loading speaker icon
speakerIcon.crossOrigin = "Anonymous";
speakerIcon.src = "images/speaker.png";
var noiseIcon = document.createElement("img");                               // <img> used for loading noise icon
noiseIcon.crossOrigin = "Anonymous";
noiseIcon.src = "images/noise.png";
var micIcon = document.createElement("img");                                 // <img> used for loading mic icon
micIcon.crossOrigin = "Anonymous";
micIcon.src = "images/microphone.png";
var sequencerIcon = document.createElement("img");
sequencerIcon.crossOrigin = "Anonymous";
sequencerIcon.src = "images/sequencer.png";

var gSFactor = 1.0;                                                          // variable to hold scaling factor based on mouse scroll direction (1.0 - default, 1.1 - scroll up, 0.9 - scroll down)
var globalTootipFontSize = WIDTH * 0.012;                                    // variable to hold font size of tooltip displayed above of every node
var globalTerminalOffset = WIDTH * 0.01;                                     // variable to hold general purpose offset distance used in multiple scenarios
var globalBaseHeight = WIDTH * 0.1 * 0.25;                                   // variable to hold height of single cell in multi cell nodes
var globalToggleButtonRadius = WIDTH * 0.007;                                // default radius of togglebutton
var globalConnectorBezeirOffset = WIDTH * 0.06;                              // default value representing the distance up to which the connector's start and end curves should last relative to its start and end coords
var globalConnectorWidth = WIDTH * 0.006;                                    // default value of width of connector wire
var globalScaleRatio = 1; //experimental                                     // value to hold ratio of current width (of any node) to its original width (default) to keep track how far the nodes are scaled since the beginning
var downScaleStep = 0.9;                                                     // how much to down scale in one unit of mouse scroll down
var upScaleStep = 1.1;                                                       // how much to up scale in one unit of mouse scroll up

var isToolboxOpened = false;                                                 // represents current status of toolbar div (hided or shown)
var isPlaying = false;                                                       // playing status

var nodes = [];                                                              // array of nodes currently on grid
var connectors = [];                                                         // array of connectors currently on grid

var terminalStartFlag = 0;                                                   // represents if a terminal of one node is clicked and is ready to be connected to another node
var currentConnector = null;                                                 // holds current connector reference in the process of connecting a connector

var nodeDragFlag = 0;                                                        // represents if a node is being dragged or is about to be dragged
var currentDragNode = null;                                                  // holds current node being dragged
var dragDelta = { x: 0, y: 0 };                                              // holds offset of current node's center position to the position of cursor on the node used to drag it (to keep things away form jumping around during node drag, ensures smooth drag)

var sliderDragFlag = 0;                                                      // represents status of a slider being slided
var currSlider = null;                                                       // reference to current slider being slided

var panStart = { x: 0, y: 0 };                                               // start coords of cursor during grid pan
var panDelta = { x: 0, y: 0 };                                               // delta distace between start and current cursor coords during grid pan
var panFlag = 0;                                                             // represents if the grid is being panned

var isDrawing = 0;                                                           // represents if something is being drawn on the custom wave node canvas area
var currDrawingNode = null;                                                  // reference to current custom wave node
var startSample = { x: null, y: null };                                      // start position of waveform drawn on the custom wave node
var minYSample = 100000;                                                     // just a upper limit to store minimum y coord of the waveform drawn

var monoHotnessScale = chroma.scale(['#000000', '#ffffff'], [0, 1]);         // monochrome scale for spectrogram node
var multiHotnessScale = chroma.scale(['#000000', '#ff0000', '#ffff00', '#ffffff'], [0, .25, .75, 1]);   // multicolor scale for spectrogram node

var currNodeInContextMenu = null;                                            // current node on which context menu is opened (right clicked)
var currentContextMenu = null;                                               // reference to context menu drawn
var isContextMenuOpened = false;                                             // status of context menu being drawn or not (opened or not)

var mousePos = {                                                             // holds current mouse position on grid
    x: 0,
    y: 0
};

//  Object to display Context menu on right click on any node
//  Params: (x, y) coords pivot-center
var ContextMenu = function (x, y, width, baseHeight, operations) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.baseHeight = baseHeight;
    this.radius = this.baseHeight / 3;
    this.noOfOptions = operations.length;
    this.operations = operations;
    this.fontSize = this.baseHeight * 0.45;
    this.height = this.baseHeight * this.noOfOptions;
    this.draw();
}

ContextMenu.prototype.draw = function () {
    //check for canvas bounds, update x, y
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#696969";
    context.lineWidth = "0";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();
    context.font = this.fontSize + "px arial";
    context.shadowBlur = 0;
    context.fillStyle = "#000";
    for (var i = 0; i < this.noOfOptions; i++){
        context.fillText(this.operations[i], this.x - context.measureText(this.operations[i]).width / 2, this.y + this.baseHeight * i + (this.fontSize / 3));
    }   
}

// calls specific function on the node under context passing the operation to be performed
ContextMenu.prototype.clicked = function (x, y) {
    var resultOption = Math.floor((y - (this.y - this.baseHeight / 2)) / this.baseHeight);
    currNodeInContextMenu.executeContextOption(this.operations[resultOption]);
}

//  Object to display Group of radio buttons
//  Params: (x, y) coords pivot-leftcenter
//          index - default activated radio button
var ToggleGroup = function (x, y, width, height, values, index) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.values = values;
    this.noOfToggles = values.length;
    this.toggles = [];
    for (var i = 0; i < this.noOfToggles; i++){
        this.toggles.push({x: 0, y: 0});
    }
    this.togglesWidth = (this.height / 2) * 0.8;
    this.togglesHeight = (this.height / 2) * 0.8;
    this.activeValue = this.values[index];
    this.redraw();
}

ToggleGroup.prototype.redraw = function () {

    this.togglesWidth = (this.height / 2) * 0.8;
    this.togglesHeight = (this.height / 2) * 0.8;

    for (var i = 0; i < this.noOfToggles; i++) {
        this.toggles[i].x = this.x + (i * (this.width / this.noOfToggles)) + (this.width / (2 * this.noOfToggles));
        this.toggles[i].y = this.y;
    }
    resetContextAttr();
    context.lineStyle = "#000";
    for (var i = 0; i < this.noOfToggles; i++){
        context.beginPath();
        if (this.values[i] == this.activeValue) {
            context.fillStyle = "#00ff00";
        }
        else {
            context.fillStyle = "#ff0000";
        }
        context.rect(this.toggles[i].x - this.togglesWidth / 2, this.toggles[i].y - this.togglesHeight / 2, this.togglesWidth, this.togglesHeight);
        context.fill();
        context.stroke();
    }
}

//  Changes currently active radio button if clicked under their bounds
ToggleGroup.prototype.clicked = function (x, y) {
    for (var i = 0; i < this.noOfToggles; i++){
        if (x > (this.toggles[i].x - this.togglesWidth / 2) && x < (this.toggles[i].x + this.togglesWidth / 2) && y > (this.toggles[i].y - this.togglesHeight / 2) && y < (this.toggles[i].y + this.togglesHeight / 2)) {
            this.activeValue = this.values[i];
            context.clearRect(0, 0, WIDTH, HEIGHT);
            ultimateRedraw();
            break;
        }
    }
}

//  Object to display Slider
//  Params: x1 start x coord
//          x2 end x coord
//          y coord
//          pivot-leftcenter
var Slider = function (x1, x2, y, value, thumbRadius, railHeight, min, max) {
    this.x1 = x1;
    this.x2 = x2;
    this.y = y;
    this.value = value;
    this.min = min;
    this.max = max;
    this.length = this.x2 - this.x1;
    this.thumbRadius = thumbRadius;
    this.railHeight = railHeight;
    this.thumbPosition = { x: 0, y: 0 };
    this.thumbPosition.x = ((this.value - this.min) / (this.max - this.min)) * (this.x2 - this.x1) + this.x1;
    this.thumbPosition.y = this.y + this.railHeight;
    this.redraw();
}

Slider.prototype.redraw = function () {
    context.beginPath();
    resetContextAttr();
    context.lineStyle = "#d4d4d4ff";
    context.lineWidth = "1";
    context.fillStyle = "#d4d4d4ff";
    context.rect(this.x1, this.y + this.railHeight / 2, this.x2 - this.x1, this.railHeight);
    context.fill();
    context.stroke();
    context.beginPath();
    resetContextAttr();
    context.shadowColor = "#000";
    context.shadowBlur = 5;
    context.fillStyle = "#000000ff";
    context.strokeStyle = "#000";
    this.thumbPosition.x = ((this.value - this.min) / (this.max - this.min)) * (this.x2 - this.x1) + this.x1;
    this.thumbPosition.y = this.y + this.railHeight;
    context.arc(this.thumbPosition.x, this.thumbPosition.y, this.thumbRadius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
}

//  Change current slider value on slide
Slider.prototype.slide = function (x) {
    if (x < this.x1) {
        this.value = this.min;
    }
    else if (x > this.x2) {
        this.value = this.max
    }
    else {
        this.value = ((x - this.x1) / (this.x2 - this.x1)) * (this.max - this.min) + this.min;
    }
}

//  On/Off Button
//  Params: (x, y) coords pivot-center
var ToggleButton = function (x, y, radius, parent) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.parent = parent;
    this.redraw();
}

ToggleButton.prototype.redraw = function () {
    context.beginPath();
    resetContextAttr();
    if (this.parent.bypass) {
        context.shadowColor = "#00ff00";
        context.fillStyle = "#00ff00ff";
    }
    else {
        context.shadowColor = "#ff0000";
        context.fillStyle = "#ff0000ff";
    }
    context.shadowBlur = 5;
    context.strokeStyle = "#000";
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    context.beginPath();
    context.arc(this.x, this.y, this.radius * 0.6, 0, 2 * Math.PI);
    context.stroke();
}

//  Toggle current status (on/off)
ToggleButton.prototype.clicked = function () {
    if (this.parent.bypass) {
        this.parent.bypass = 0;
    }
    else {
        this.parent.bypass = 1;
    }
    context.clearRect(0, 0, WIDTH, HEIGHT);
    ultimateRedraw();
}

//  Object to display Nodes name on top
//  Params: (x, y) coords pivot-center
//          text to display
var Tooltip = function (x, y, text, parent) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.parent = parent;
    this.redraw();
}

Tooltip.prototype.redraw = function () {
    context.beginPath();
    resetContextAttr();
    context.font = globalTootipFontSize + "px Arial";
    context.fillStyle = "#ffffffff";
    context.fillText(this.text, this.x - context.measureText(this.text).width / 2, this.y);
}

//  Object to dsiplay simple clickable button
//  Params: (x, y) coords pivot-center
var SimpleButton = function (x, y, width, height, text, parent) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.parent = parent;
    this.redraw();
}

SimpleButton.prototype.clicked = function () {
    this.parent.noOfCells = this.parent.noOfCells + 1;
    this.parent.height = this.parent.baseHeight * this.parent.noOfCells;
    this.parent.y = this.parent.y + this.parent.baseHeight / 2;
    if (this.parent.type == "AudioMerger") {
        var newTerm = new Terminal(this.parent.inputTerminals[this.parent.inputTerminals.length - 1].x, this.parent.inputTerminals[this.parent.inputTerminals.length - 1].y + this.parent.baseHeight, this.parent.inputTerminals[this.parent.inputTerminals.length - 1].radius, "in", this.parent);
        this.parent.inputTerminals.push(newTerm);
    }
    context.clearRect(0, 0, WIDTH, HEIGHT);
    ultimateRedraw();
}

SimpleButton.prototype.redraw = function () {
    context.beginPath();
    resetContextAttr();
    context.lineStyle = "#000000ff";
    context.lineWidth = "1";
    context.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    context.stroke();
    var fontSize = (this.height * 0.7);
    context.font = fontSize + "px Arial";
    context.fillText(this.text, this.x - context.measureText(this.text).width / 2, this.y + this.height / 2 - (fontSize / 3));
}

//  Object to display Terminals
//  Params: (x, y) coords pivot-center
//          type-in/out/buffer/stream
var Terminal = function (x, y, radius, type, parent) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.type = type;
    this.parent = parent;
    this.guid = getNewGUID();
    this.redraw();
    this.isAssociated = false;
    this.connector = null;
}

Terminal.prototype.clicked = function () {
    if (terminalStartFlag == 0) {
        if (this.type != "in" && this.type != "buffer") {
            //console.log("not in or buffer");
            if (this.isAssociated) {
                //console.log("terminal already associated");
                this.isAssociated = false;
                this.connector.terminalEnd.isAssociated = false;
                this.connector.terminalEnd.connector = null;
                this.parent.connectedTo = null;
                connectors.splice(connectors.indexOf(this.connector), 1);
                this.connector = null;
                //console.log("spliced this terminal");
            }
            currentConnector = new Connector(this, this.parent);
            //console.log(currentConnector);
        }
        else {
            return;
        }
        terminalStartFlag = 1;
    }
    else if (terminalStartFlag == 1) {
        if (currentConnector.terminalStart.guid == this.guid || currentConnector.terminalStart.type == this.type) {
            //console.log("same type");
            currentConnector.terminalStart.connector = null;
            currentConnector.terminalStart.parent.connectedTo = null;
            currentConnector = null;
            context.clearRect(0, 0, WIDTH, HEIGHT);
            ultimateRedraw();
        }
        else {
            //console.log("not same type");
            currentConnector.connection(this, this.parent);
        }
        terminalStartFlag = 0;
    }
}

Terminal.prototype.redraw = function () {
    context.beginPath();
    resetContextAttr();
    if (this.type == "out") {
        context.shadowColor = "#adff2f";
        context.fillStyle = "#adff2fff";
    }
    else if (this.type == "in") {
        context.shadowColor = "#ff0000";
        context.fillStyle = "#ff0000ff";
    }
    else if (this.type == "buffer") {
        context.shadowColor = "#ffa500"
        context.fillStyle = "#ffa500ff";
    }
    else if (this.type == "stream") {
        context.shadowColor = "#4d4dff"
        context.fillStyle = "#4d4dffff";
    }
    context.shadowBlur = 5;
    context.strokeStyle = "#000";
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
}

//  Object to display connector wires
//  Params: reference to terminal and terminal's node on which connector wire is initiated
var Connector = function (terminalStart, terminalStartNode) {
    this.terminalStart = terminalStart;
    this.terminalStartNode = terminalStartNode;
    this.x1 = terminalStart.x;
    this.y1 = terminalStart.y;
    this.guid = getNewGUID();
}

Connector.prototype.redraw = function (x2, y2) {
    context.beginPath();
    this.x1 = this.terminalStart.x;
    this.y1 = this.terminalStart.y;
    this.x2 = x2;
    this.y2 = y2;
    this.x11 = this.x1 + globalConnectorBezeirOffset;
    this.y11 = this.y1;
    this.x22 = this.x2 - globalConnectorBezeirOffset;
    this.y22 = this.y2;
    this.xmid = (this.x11 + this.x22) / 2;
    this.ymid = (this.y11 + this.y22) / 2;
    context.moveTo(this.x1, this.y1);
    context.quadraticCurveTo(this.x11, this.y11, this.xmid, this.ymid);
    context.moveTo(this.xmid, this.ymid);
    context.quadraticCurveTo(this.x22, this.y22, this.x2, this.y2);
    resetContextAttr();
    context.strokeStyle = "#7fff0088";
    context.lineWidth = Math.round(globalConnectorWidth).toString();
    context.lineCap = "round";
    context.shadowColor = "#7fff00";
    context.shadowBlur = 5;
    context.stroke();
}

//  Handle Operations on connecting the wire to another node
Connector.prototype.connection = function (terminalEnd, terminalEndNode) {
    if (terminalEnd.type == "buffer" && (this.terminalStartNode.type == "LinearConvolver" || this.terminalStartNode.type == "AudioMerger" || this.terminalStartNode.type == "Microphone" || this.terminalStartNode.type == "DrumSequencer" || this.terminalStartNode.type == "Bitcrusher" || this.terminalStartNode.type == "Moog" || this.terminalStartNode.type == "Panner")) {
        //console.log("mismatch");
        currentConnector.terminalStart.connector = null;
        currentConnector = null;
        context.clearRect(0, 0, WIDTH, HEIGHT);
        ultimateRedraw();
        return;
    }
    else {
        if (/*terminalEndNode.type == "AudioDestination" && */terminalEnd.connector != null) {
            //console.log("terminal end already connected");
            var guid = terminalEnd.connector.guid;
            terminalEnd.connector.terminalStartNode.connectedTo = null;
            terminalEnd.connector.terminalStart.isAssociated = false;
            terminalEnd.connector.terminalStart.connector = null;
            terminalEnd.isAssociated = false;
            connectors.splice(connectors.indexOf(terminalEnd.connector, 1));
            terminalEnd.connector = null;
        }
        if (terminalEndNode.type == "LinearConvolver") {
            if (terminalEndNode.inputSampleTerminal.guid == terminalEnd.guid) {
                //console.log("terminal end is convolver inputsample");
                terminalEndNode.inputSampleNode = this.terminalStart.parent;
            }
            else if (terminalEndNode.impulseResponseTerminal.guid == terminalEnd.guid) {
                //console.log("terminal end is convolver impulseresponse");
                terminalEndNode.impulseRNode = this.terminalStart.parent;
            }
        }
        this.terminalEnd = terminalEnd;
        this.terminalEndNode = terminalEndNode;
        this.x2 = terminalEnd.x;
        this.y2 = terminalEnd.y;
        this.terminalStart.isAssociated = true;
        this.terminalEnd.isAssociated = true;
        this.terminalStart.connector = this;
        this.terminalEnd.connector = this;
        this.terminalStart.parent.connectedTo = this.terminalEnd.parent;

        connectors.push(currentConnector);
        //console.log("pushed connector");
        //console.log(currentConnector);
        currentConnector = null;
        context.clearRect(0, 0, WIDTH, HEIGHT);
        ultimateRedraw();
    }
}

//  Object to display file input
//  holds the uploaded file
var InputBox = function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.assocHTMLInput = document.createElement("input");
    this.assocHTMLInput.id = getNewGUID();
    this.assocHTMLInput.type = "file";
    this.assocHTMLInput.parent = this;
    this.file = null;
    this.buffer = null;
    this.fileName = null;
    this.assocHTMLInput.accept = "audio/*";
    this.assocHTMLInput.onchange = function (event) {
        var fileReader = new FileReader();
        fileReader.parent = this;
        this.parent.fileName = event.path[0].files[0].name.substring(0, event.path[0].files[0].name.toString().lastIndexOf("."));
        if (this.parent.fileName.length > 15) {
            this.parent.fileName = this.parent.fileName.substring(0, 6) + "..." + this.parent.fileName.substring(this.parent.fileName.length - 6, this.parent.fileName.length);
        }
        fileReader.readAsArrayBuffer(event.path[0].files[0]);
        fileReader.onload = function (e) {
            this.parent.parent.file = e.target.result;
            audioctx.parent = this;
            audioctx.decodeAudioData(e.target.result, function (buffer) {
                this.parent.parent.parent.buffer = buffer;
            });
            context.clearRect(0, 0, WIDTH, HEIGHT);
            ultimateRedraw();
        }
        
    }
    this.redraw();
}

InputBox.prototype.clicked = function () {
    this.assocHTMLInput.click();
}

InputBox.prototype.redraw = function () {
    context.beginPath();
    resetContextAttr();
    context.lineStyle = "#000000ff";
    context.lineWidth = "1";
    context.rect(this.x, this.y, this.width, this.height);
    var fontSize = this.height * 0.45;
    context.font = fontSize + "px Arial";
    context.fillText(this.fileName, this.x + this.width / 2 - context.measureText(this.fileName).width / 2, this.y + this.height / 2 + (fontSize / 3));
    context.stroke();
}

var DrumSequencerNode = function (x, y, width, height, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.width = width;
    this.height = height;
    this.type = "DrumSequencer";
    this.activations = [1, 1, 1, 1, 1, 1, 1, 1];
    this.pads = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    this.channels = ["kick", "snare", "openhat", "hihat", "clap", "tom", "shaker", "perc"];
    this.channelTracks = [decodedSamples["kick"], decodedSamples["snare"], decodedSamples["openhat"], decodedSamples["hihat"], decodedSamples["clap"], decodedSamples["tom"], decodedSamples["shaker"], decodedSamples["perc"]];
    this.bpm = 90;
    this.guid = getNewGUID();
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.draw();
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Drum Sequencer", this);
    this.connectedTo = null;
}

DrumSequencerNode.prototype.scale = function () {
    this.width *= gSFactor;
    this.height *= gSFactor;
}

DrumSequencerNode.prototype.draw = function () {
    context.beginPath();
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    context.fillStyle = "#dedede66";
    context.fill();
    context.stroke();
    context.drawImage(sequencerIcon, this.x - (this.height * 0.7) / 2, this.y - (this.height * 0.7) / 2, this.height * 0.7, this.height * 0.7);
}

DrumSequencerNode.prototype.redraw = function () {
    this.draw();
    //recalculate x, y
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

DrumSequencerNode.prototype.clicked = function (x, y) {
    if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

DrumSequencerNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - (this.width / 2)) && x < (this.x + (this.width / 2) + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2))
        return true;
    return false;
}

DrumSequencerNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.connectedTo != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var AudioSourceNode = function (x, y, width, height, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.width = width;
    this.height = height;
    this.radius = (this.height) / 4;
    this.type = "AudioSource";
    this.guid = getNewGUID();
    this.fontSize = this.height * 0.3;
    this.originalWidth = width;
    this.scaleRatio = 1;
    context.font = "bold " + this.fontSize + "px Arial";
    this.draw();
    this.inputBox = new InputBox(this.x - this.width / 2 + context.measureText("File : ").width + this.width * 0.1, this.y - (this.height * 0.6 / 2), this.width - (context.measureText("File : ").width + this.width * 0.1) - this.width * 0.1, this.height * 0.6);
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Audio Source", this);
    this.connectedTo = null;
}

AudioSourceNode.prototype.scale = function () {
    this.width *= gSFactor;
    this.height *= gSFactor;
    this.radius = (this.height) / 4;
    this.fontSize = this.height * 0.3;
}

AudioSourceNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();
    context.font = "bold " + this.fontSize + "px arial";
    context.fillStyle = "#000000bb";
    context.shadowBlur = 0;
    context.fillText("File : ", this.x - this.width / 2 + this.width * 0.1, this.y + (this.fontSize / 3));
}

AudioSourceNode.prototype.redraw = function () {
    this.draw();
    //recalculate x, y
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    context.font = "bold " + this.fontSize + "px Arial";
    this.inputBox.x = this.x - this.width / 2 + context.measureText("File : ").width + this.width * 0.1;
    this.inputBox.y = this.y - (this.height * 0.6 / 2);
    this.inputBox.width = this.width - (context.measureText("File : ").width + this.width * 0.1) - this.width * 0.1;
    this.inputBox.height = this.height * 0.6;
    this.inputBox.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

AudioSourceNode.prototype.clicked = function (x, y) {
    if (x > this.inputBox.x && x < (this.inputBox.x + this.inputBox.width) && y > (this.inputBox.y) && y < (this.inputBox.y + this.inputBox.height)) {
        this.inputBox.clicked();
    }
    else if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

AudioSourceNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - (this.width / 2)) && x < (this.x + (this.width / 2) + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2))
        return true;
    return false;
}

AudioSourceNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.connectedTo != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var AudioDestinationNode = function (x, y, radius, order) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.order = order;
    this.type = "AudioDestination";
    this.guid = getNewGUID();
    this.originalRadius = this.radius;
    this.scaleRatio = 1;
    this.inputTerminal = new Terminal(this.x - this.radius - globalTerminalOffset, this.y, globalTerminalOffset / 2, "in", this);
    this.tooltip = new Tooltip(this.x, this.y - this.radius - globalTerminalOffset, "Audio Destination", this);
    this.draw();
    this.connectedTo = null;
}

AudioDestinationNode.prototype.scale = function () {
    this.radius *= gSFactor;
}

AudioDestinationNode.prototype.draw = function () {
    context.beginPath();
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 5;
    context.fillStyle = "#ff000066";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    resetContextAttr();
    context.drawImage(speakerIcon, this.x - (this.radius / 1.5) / 2, this.y - this.radius / 2, this.radius / 1.5, this.radius);
}

AudioDestinationNode.prototype.redraw = function () {
    this.draw();
    this.inputTerminal.x = this.x - this.radius - globalTerminalOffset;
    this.inputTerminal.y = this.y;
    this.inputTerminal.radius = globalTerminalOffset / 2;
    this.inputTerminal.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.radius - globalTerminalOffset;
    this.tooltip.redraw();
    this.scaleRatio = this.radius / this.originalRadius;
}

AudioDestinationNode.prototype.clicked = function (x, y) {
    if (x > (this.inputTerminal.x - this.inputTerminal.radius) && x < (this.inputTerminal.x + this.inputTerminal.radius) && y > (this.inputTerminal.y - this.inputTerminal.radius) && y < (this.inputTerminal.y + this.inputTerminal.radius)) {
        this.inputTerminal.clicked();
    }
}

AudioDestinationNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.radius - globalTerminalOffset - this.inputTerminal.radius) && x < (this.x + this.radius) && y > (this.y - this.radius) && y < (this.y + this.radius))
        return true;
    return false;
}

AudioDestinationNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.inputTerminal.connector != null) {
            currNodeInContextMenu.inputTerminal.connector.terminalStart.isAssociated = false;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.connector = null;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.parent.connectedTo = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.inputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var AudioMergerNode = function (x, y, width, order) {
    this.x = x;
    this.y = y;
    this.baseHeight = globalBaseHeight;
    this.noOfCells = 2;
    this.width = width;
    this.height = this.baseHeight * this.noOfCells;
    this.radius = this.baseHeight / 4;
    this.order = order;
    this.type = "AudioMerger";
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.guid = getNewGUID();
    this.draw();
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Audio Merger", this);
    this.addButton = new SimpleButton(this.x, this.y - (this.height / 2) + (this.baseHeight * this.noOfCells) - this.baseHeight / 2, this.width * 0.8, this.baseHeight * 0.6, "Add", this);
    this.inputTerminals = [];
    this.inputTerminals.push(new Terminal(this.x - this.width / 2 - globalTerminalOffset, y - this.height / 2 + ((this.noOfCells - 1) * this.baseHeight) - this.baseHeight / 2, globalTerminalOffset / 2, "in", this));
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.connectedTo = null;
}

AudioMergerNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();
}

AudioMergerNode.prototype.scale = function () {
    this.baseHeight = globalBaseHeight;
    this.width *= gSFactor;
    this.height = this.baseHeight * this.noOfCells;
    this.radius = this.baseHeight / 4;
}

AudioMergerNode.prototype.redraw = function () {
    this.draw();
    //recalculate x, y for components
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    //redraw button
    this.addButton.x = this.x;
    this.addButton.y = this.y - (this.height / 2) + (this.baseHeight * this.noOfCells) - this.baseHeight / 2;
    this.addButton.width = this.width * 0.8;
    this.addButton.height = this.baseHeight * 0.6;
    this.addButton.redraw();
    //redraw inputTerminals
    for (var i = 0; i < this.noOfCells - 1; i++){
        this.inputTerminals[i].x = this.x - this.width / 2 - globalTerminalOffset;
        this.inputTerminals[i].y = this.y - this.height / 2 + (this.baseHeight * (i + 1)) - this.baseHeight / 2;
        this.inputTerminals[i].radius = globalTerminalOffset / 2;
        this.inputTerminals[i].redraw();
    }
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

AudioMergerNode.prototype.clicked = function (x, y) {
    if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
    else if (x < (this.x - this.width / 2)) {
        //check for all inputTerminals
        for (var i = 0; i < this.noOfCells - 1; i++) {
            if (x > (this.inputTerminals[i].x - this.inputTerminals[i].radius) && x < (this.inputTerminals[i].x + this.inputTerminals[i].radius) && y > (this.inputTerminals[i].y - this.inputTerminals[i].radius) && y < (this.inputTerminals[i].y + this.inputTerminals[i].radius)) {
                this.inputTerminals[i].clicked();
            }
        }
    }
    else if (x > (this.addButton.x - this.addButton.width / 2) && x < (this.addButton.x + this.addButton.width / 2) && y > (this.addButton.y - this.addButton.height / 2) && y < (this.addButton.y + this.addButton.height / 2)) {
        this.addButton.clicked();
    }
}

AudioMergerNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2 - globalTerminalOffset - this.inputTerminals[0].radius) && x < (this.x + this.width / 2 + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

AudioMergerNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        for (var i = 0; i < currNodeInContextMenu.inputTerminals.length; i++) {
            if (currNodeInContextMenu.inputTerminals[i].connector != null) {
                currNodeInContextMenu.inputTerminals[i].connector.terminalStart.isAssociated = false;
                currNodeInContextMenu.inputTerminals[i].connector.terminalStart.connector = null;
                currNodeInContextMenu.inputTerminals[i].connector.terminalStart.parent.connectedTo = null;
                connectors.splice(connectors.indexOf(currNodeInContextMenu.inputTerminals[i].connector), 1);
            }
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var LinearConvolveNode = function (x, y, width, order) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 2;
    this.radius = this.height / 4;
    this.fontSize = this.baseHeight * 0.4;
    this.order = order;
    this.type = "LinearConvolver";
    this.guid = getNewGUID();
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.draw();
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Linear Convolver", this);
    this.inputSampleTerminal = new Terminal(this.x - this.width / 2 - globalTerminalOffset, this.y - this.baseHeight / 2, globalTerminalOffset / 2, "in", this);
    this.impulseResponseTerminal = new Terminal(this.x - this.width / 2 - globalTerminalOffset, this.y + this.baseHeight / 2, globalTerminalOffset / 2, "buffer", this);
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.inputSampleNode = null;
    this.impulseRNode = null;
    this.connectedTo = null;
}

LinearConvolveNode.prototype.scale = function () {
    this.baseHeight = globalBaseHeight;
    this.width *= gSFactor;
    this.height = this.baseHeight * 2;
    this.radius = this.height / 4;
    this.fontSize = this.baseHeight * 0.4;
}

LinearConvolveNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();
    resetContextAttr();
    context.font = this.fontSize + "px Arial";
    context.fillText("Input Sample", this.x - this.width / 2 + globalTerminalOffset, this.y - this.baseHeight / 2 + (this.fontSize / 3));
    context.fillText("Impulse Response", this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight / 2 + (this.fontSize / 3));
}

LinearConvolveNode.prototype.redraw = function () {
    this.draw();
    //recalculate x, y for components
    this.inputSampleTerminal.x = this.x - this.width / 2 - globalTerminalOffset;
    this.inputSampleTerminal.y = this.y - this.baseHeight / 2;
    this.inputSampleTerminal.radius = globalTerminalOffset / 2;
    this.inputSampleTerminal.redraw();
    this.impulseResponseTerminal.x = this.x - this.width / 2 - globalTerminalOffset;
    this.impulseResponseTerminal.y = this.y + this.baseHeight / 2;
    this.impulseResponseTerminal.radius = globalTerminalOffset / 2;
    this.impulseResponseTerminal.redraw();
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

LinearConvolveNode.prototype.clicked = function (x, y) {
    if (x > (this.inputSampleTerminal.x - this.inputSampleTerminal.radius) && x < (this.inputSampleTerminal.x + this.inputSampleTerminal.radius) && y > (this.inputSampleTerminal.y - this.inputSampleTerminal.radius) && y < (this.inputSampleTerminal.y + this.inputSampleTerminal.radius)) {
        this.inputSampleTerminal.clicked();
    }
    else if (x > (this.impulseResponseTerminal.x - this.impulseResponseTerminal.radius) && x < (this.impulseResponseTerminal.x + this.impulseResponseTerminal.radius) && y > (this.impulseResponseTerminal.y - this.impulseResponseTerminal.radius) && y < (this.impulseResponseTerminal.y + this.impulseResponseTerminal.radius)) {
        this.impulseResponseTerminal.clicked();
    }
    else if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

LinearConvolveNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2 - globalTerminalOffset - this.inputSampleTerminal.radius) && x < (this.x + this.width / 2 + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

LinearConvolveNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        if (currNodeInContextMenu.inputSampleTerminal.connector != null) {
            currNodeInContextMenu.inputSampleTerminal.connector.terminalStart.isAssociated = false;
            currNodeInContextMenu.inputSampleTerminal.connector.terminalStart.connector = null;
            currNodeInContextMenu.inputSampleTerminal.connector.terminalStart.parent.connectedTo = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.inputSampleTerminal.connector), 1);
        }
        if (currNodeInContextMenu.impulseResponseTerminal.connector != null) {
            currNodeInContextMenu.impulseResponseTerminal.connector.terminalStart.isAssociated = false;
            currNodeInContextMenu.impulseResponseTerminal.connector.terminalStart.connector = null;
            currNodeInContextMenu.impulseResponseTerminal.connector.terminalStart.parent.connectedTo = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.impulseResponseTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var WhiteNoiseNode = function (x, y, width, height, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.width = width;
    this.height = height;
    this.radius = this.height / 4;
    this.type = "WhiteNoise";
    this.guid = getNewGUID();
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.draw();
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "White Noise Generator", this);
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.connectedTo = null;
}

WhiteNoiseNode.prototype.scale = function () {
    this.width *= gSFactor;
    this.height *= gSFactor;
    this.radius = this.height / 4;
}

WhiteNoiseNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();
    resetContextAttr();
    context.drawImage(noiseIcon, this.x - (this.height * 0.6) / 2, this.y - (this.height * 0.6) / 2, this.height * 0.6, this.height * 0.6);
}

WhiteNoiseNode.prototype.redraw = function () {
    this.draw(this.x, this.y, this.width, this.height, this.radius);
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

WhiteNoiseNode.prototype.clicked = function (x, y) {
    if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

WhiteNoiseNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2) && x < (this.x + this.width / 2 + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

WhiteNoiseNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var BitcrusherNode = function (x, y, width, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 3;
    this.width = width;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.type = "Bitcrusher";
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.bypass = 0;
    this.defaults = true;
    this.draw();
    this.sliderMultiParam = this.baseHeight * 0.3; // same value for slider railheight, thumbradius and adjustment offset
    this.bitsSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y - this.baseHeight - this.sliderMultiParam, 4, this.sliderMultiParam, this.sliderMultiParam, 1, 16);
    this.normSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y - this.sliderMultiParam, 0.1, this.sliderMultiParam, this.sliderMultiParam, 0.0001, 1.0);
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Bitcrusher", this);
    this.inputTerminal = new Terminal(this.x - this.width / 2 - globalTerminalOffset, this.y, globalTerminalOffset / 2, "in", this);
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.toggleButton = new ToggleButton(this.x + this.width / 2 - this.width * 0.1, this.y + this.baseHeight, globalToggleButtonRadius, this);
    this.connectedTo = null;
}

BitcrusherNode.prototype.scale = function () {
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 3;
    this.radius = this.baseHeight / 4;
    this.width *= gSFactor;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
}

BitcrusherNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();

    context.font = "bold " + this.fontSize + "px Arial";
    context.fillStyle = "#000000bb";
    context.shadowBlur = 0;
    context.fillText("Bits : " + ((this.defaults) ? 4 : Math.round(this.bitsSlider.value)), this.x - this.width / 2 + globalTerminalOffset, this.y - this.baseHeight + (this.fontSize / 3));
    var normString;
    if (!this.defaults) normString = this.normSlider.value.toString();
    context.fillText("NormFreq : " + ((this.defaults) ? 0.1 : normString.slice(0, ((normString.indexOf(".") != -1) ? ((normString.slice(normString.indexOf(".")).length < 5) ? normString.length : normString.indexOf(".") + 5) : normString.length))), this.x - this.width / 2 + globalTerminalOffset, this.y + (this.fontSize / 3));
    context.fillText("Bypass : " + ((this.bypass) ? "Yes" : "No"), this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight + (this.fontSize / 3));
    this.defaults = false;
}

BitcrusherNode.prototype.redraw = function () {
    this.draw();
    this.inputTerminal.x = this.x - this.width / 2 - globalTerminalOffset;
    this.inputTerminal.y = this.y;
    this.inputTerminal.radius = globalTerminalOffset / 2;
    this.inputTerminal.redraw();
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.toggleButton.x = this.x + this.width / 2 - this.width * 0.1;
    this.toggleButton.y = this.y + this.baseHeight;
    this.toggleButton.radius = globalToggleButtonRadius;
    this.toggleButton.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.bitsSlider.x1 = this.x;
    this.bitsSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.bitsSlider.y = this.y - this.baseHeight - this.sliderMultiParam;
    this.bitsSlider.thumbRadius = this.sliderMultiParam;
    this.bitsSlider.railHeight = this.sliderMultiParam;
    this.bitsSlider.redraw();
    this.normSlider.x1 = this.x;
    this.normSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.normSlider.y = this.y - this.sliderMultiParam;
    this.normSlider.thumbRadius = this.sliderMultiParam;
    this.normSlider.railHeight = this.sliderMultiParam;
    this.normSlider.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

BitcrusherNode.prototype.clicked = function (x, y) {
    if (x > (this.toggleButton.x - this.toggleButton.radius) && x < (this.toggleButton.x + this.toggleButton.radius) && y > (this.toggleButton.y - this.toggleButton.radius) && y < (this.toggleButton.y + this.toggleButton.radius)) {
        this.toggleButton.clicked();
    }
    else if (x > (this.inputTerminal.x - this.inputTerminal.radius) && x < (this.inputTerminal.x + this.inputTerminal.radius) && y > (this.inputTerminal.y - this.inputTerminal.radius) && y < (this.inputTerminal.y + this.inputTerminal.radius)) {
        this.inputTerminal.clicked();
    }
    else if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

BitcrusherNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2 - globalTerminalOffset - this.inputTerminal.radius) && x < (this.x + this.width / 2 + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

BitcrusherNode.prototype.checkSliderBounds = function (x, y) {
    if (x > this.bitsSlider.x1 && x < this.bitsSlider.x2 && y > (this.bitsSlider.y - this.bitsSlider.railHeight / 2 + this.bitsSlider.railHeight) && y < (this.bitsSlider.y + this.bitsSlider.railHeight / 2 + this.bitsSlider.railHeight)) {
        return this.bitsSlider;
    }
    if (x > this.normSlider.x1 && x < this.normSlider.x2 && y > (this.normSlider.y - this.normSlider.railHeight / 2 + this.normSlider.railHeight) && y < (this.normSlider.y + this.normSlider.railHeight / 2 + this.normSlider.railHeight)) {
        return this.normSlider;
    }
}

BitcrusherNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        if (currNodeInContextMenu.inputTerminal.connector != null) {
            currNodeInContextMenu.inputTerminal.connector.terminalStart.isAssociated = false;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.connector = null;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.parent.connectedTo = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var MoogfilterNode = function (x, y, width, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 3;
    this.width = width;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.type = "Moog";
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.bypass = 0;
    this.defaults = true;
    this.draw();
    this.sliderMultiParam = this.baseHeight * 0.3;
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Moog Filter", this);
    this.inputTerminal = new Terminal(this.x - this.width / 2 - globalTerminalOffset, this.y, globalTerminalOffset / 2, "in", this);
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.toggleButton = new ToggleButton(this.x + this.width / 2 - this.width * 0.1, this.y + this.baseHeight, globalToggleButtonRadius, this);
    this.cutoffSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y - this.baseHeight - this.sliderMultiParam, 0.065, this.sliderMultiParam, this.sliderMultiParam, 0.0001, 1.0);
    this.resonanceSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y - this.sliderMultiParam, 3.5, this.sliderMultiParam, this.sliderMultiParam, 0, 4.0);
    this.connectedTo = null;
}

MoogfilterNode.prototype.scale = function () {
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 3;
    this.width *= gSFactor;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
}

MoogfilterNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();

    context.font = "bold " + this.fontSize + "px Arial";
    context.fillStyle = "#000000bb";
    context.shadowBlur = 0;
    var normString;
    if (!this.defaults) normString = this.cutoffSlider.value.toString();
    context.fillText("Cutoff : " + ((this.defaults) ? 0.065 : normString.slice(0, ((normString.indexOf(".") != -1) ? ((normString.slice(normString.indexOf(".")).length < 5) ? normString.length : normString.indexOf(".") + 5) : normString.length))), this.x - this.width / 2 + globalTerminalOffset, this.y - this.baseHeight + (this.fontSize / 3));
    if (!this.defaults) normString = this.resonanceSlider.value.toString();
    context.fillText("Resonance : " + ((this.defaults) ? 3.5 : normString.slice(0, ((normString.indexOf(".") != -1) ? ((normString.slice(normString.indexOf(".")).length < 2) ? normString.length : normString.indexOf(".") + 2) : normString.length))), this.x - this.width / 2 + globalTerminalOffset, this.y + (this.fontSize / 3));
    context.fillText("Bypass : " + ((this.bypass) ? "Yes" : "No"), this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight + (this.fontSize / 3));
    this.defaults = false;
}

MoogfilterNode.prototype.redraw = function () {
    this.draw();
    this.inputTerminal.x = this.x - this.width / 2 - globalTerminalOffset;
    this.inputTerminal.y = this.y;
    this.inputTerminal.radius = globalTerminalOffset / 2;
    this.inputTerminal.redraw();
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.toggleButton.x = this.x + this.width / 2 - this.width * 0.1;
    this.toggleButton.y = this.y + this.baseHeight;
    this.toggleButton.radius = globalToggleButtonRadius;
    this.toggleButton.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.cutoffSlider.x1 = this.x;
    this.cutoffSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.cutoffSlider.y = this.y - this.baseHeight - this.sliderMultiParam;
    this.cutoffSlider.thumbRadius = this.sliderMultiParam;
    this.cutoffSlider.railHeight = this.sliderMultiParam;
    this.cutoffSlider.redraw();
    this.resonanceSlider.x1 = this.x;
    this.resonanceSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.resonanceSlider.y = this.y - this.sliderMultiParam;
    this.resonanceSlider.thumbRadius = this.sliderMultiParam;
    this.resonanceSlider.railHeight = this.sliderMultiParam;
    this.resonanceSlider.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

MoogfilterNode.prototype.clicked = function (x, y) {
    if (x > (this.toggleButton.x - this.toggleButton.radius) && x < (this.toggleButton.x + this.toggleButton.radius) && y > (this.toggleButton.y - this.toggleButton.radius) && y < (this.toggleButton.y + this.toggleButton.radius)) {
        this.toggleButton.clicked();
    }
    else if (x > (this.inputTerminal.x - this.inputTerminal.radius) && x < (this.inputTerminal.x + this.inputTerminal.radius) && y > (this.inputTerminal.y - this.inputTerminal.radius) && y < (this.inputTerminal.y + this.inputTerminal.radius)) {
        this.inputTerminal.clicked();
    }
    else if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

MoogfilterNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2 - globalTerminalOffset - this.inputTerminal.radius) && x < (this.x + this.width / 2 + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

MoogfilterNode.prototype.checkSliderBounds = function (x, y) {
    if (x > this.cutoffSlider.x1 && x < this.cutoffSlider.x2 && y > (this.cutoffSlider.y - this.cutoffSlider.railHeight / 2 + this.cutoffSlider.railHeight) && y < (this.cutoffSlider.y + this.cutoffSlider.railHeight / 2 + this.cutoffSlider.railHeight)) {
        return this.cutoffSlider;
    }
    if (x > this.resonanceSlider.x1 && x < this.resonanceSlider.x2 && y > (this.resonanceSlider.y - this.resonanceSlider.railHeight / 2 + this.resonanceSlider.railHeight) && y < (this.resonanceSlider.y + this.resonanceSlider.railHeight / 2 + this.resonanceSlider.railHeight)) {
        return this.resonanceSlider;
    }
}

MoogfilterNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        if (currNodeInContextMenu.inputTerminal.connector != null) {
            currNodeInContextMenu.inputTerminal.connector.terminalStart.isAssociated = false;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.connector = null;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.parent.connectedTo = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var PannerNode = function (x, y, width, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.width = width;
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 2;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
    this.type = "Panner";
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.bypass = 0;
    this.defaults = true;
    this.draw();
    this.panSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y - this.baseHeight / 2 - this.sliderMultiParam, 0, this.sliderMultiParam, this.sliderMultiParam, -1.0, 1.0);
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Panner", this);
    this.inputTerminal = new Terminal(this.x - this.width / 2 - globalTerminalOffset, this.y, globalTerminalOffset / 2, "in", this);
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.toggleButton = new ToggleButton(this.x + this.width / 2 - this.width * 0.1, this.y + this.baseHeight / 2, globalToggleButtonRadius, this);
    this.connectedTo = null;
}

PannerNode.prototype.scale = function () {
    this.baseHeight = globalBaseHeight;
    this.width *= gSFactor;
    this.height = this.baseHeight * 2;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
}

PannerNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();

    context.font = "bold " + this.fontSize + "px Arial";
    context.fillStyle = "#000000bb";
    context.shadowBlur = 0;
    var normString;
    if (!this.defaults) {
        if (this.panSlider.value < 0) normString = "L High";
        else if (this.panSlider.value > 0) normString = "R High";
        else normString = "Balance";
    }
    context.fillText("Pan : " + ((this.defaults) ? "Balance" : normString), this.x - this.width / 2 + globalTerminalOffset, this.y - this.baseHeight / 2 + (this.fontSize / 3));
    context.fillText("Bypass : " + ((this.bypass) ? "Yes" : "No"), this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight / 2 + (this.fontSize / 3));
    this.defaults = false;
}

PannerNode.prototype.redraw = function () {
    this.draw();
    this.inputTerminal.x = this.x - this.width / 2 - WIDTH * 0.01;
    this.inputTerminal.y = this.y;
    this.inputTerminal.radius = globalTerminalOffset / 2;
    this.inputTerminal.redraw();
    this.outputTerminal.x = this.x + this.width / 2 + WIDTH * 0.01;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.toggleButton.x = this.x + this.width / 2 - this.width * 0.1;
    this.toggleButton.y = this.y + this.baseHeight / 2;
    this.toggleButton.radius = globalToggleButtonRadius;
    this.toggleButton.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.panSlider.x1 = this.x;
    this.panSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.panSlider.y = this.y - this.baseHeight / 2 - this.sliderMultiParam;
    this.panSlider.thumbRadius = this.sliderMultiParam;
    this.panSlider.railHeight = this.sliderMultiParam;
    this.panSlider.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

PannerNode.prototype.clicked = function (x, y) {
    if (x > (this.toggleButton.x - this.toggleButton.radius) && x < (this.toggleButton.x + this.toggleButton.radius) && y > (this.toggleButton.y - this.toggleButton.radius) && y < (this.toggleButton.y + this.toggleButton.radius)) {
        this.toggleButton.clicked();
    }
    else if (x > (this.inputTerminal.x - this.inputTerminal.radius) && x < (this.inputTerminal.x + this.inputTerminal.radius) && y > (this.inputTerminal.y - this.inputTerminal.radius) && y < (this.inputTerminal.y + this.inputTerminal.radius)) {
        this.inputTerminal.clicked();
    }
    else if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

PannerNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2 - globalTerminalOffset - this.inputTerminal.radius) && x < (this.x + this.width / 2 + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

PannerNode.prototype.checkSliderBounds = function (x, y) {
    if (x > this.panSlider.x1 && x < this.panSlider.x2 && y > (this.panSlider.y - this.panSlider.railHeight / 2 + this.panSlider.railHeight) && y < (this.panSlider.y + this.panSlider.railHeight / 2 + this.panSlider.railHeight)) {
        return this.panSlider;
    }
}

PannerNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        if (currNodeInContextMenu.inputTerminal.connector != null) {
            currNodeInContextMenu.inputTerminal.connector.terminalStart.isAssociated = false;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.connector = null;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.parent.connectedTo = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var FrequencyAnalyserNode = function (x, y, width, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 8;
    this.width = width;
    this.type = "FrequencyAnalyser";
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
    this.display = { x: this.x - this.width / 2 + globalTerminalOffset, y: this.y - this.height / 2 + this.baseHeight / 2, w: this.width - globalTerminalOffset * 2, h: this.baseHeight * 5 };
    this.defaults = true;
    this.draw();
    this.resolutionSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y + this.baseHeight * 2.5 - this.sliderMultiParam - this.sliderMultiParam, 50, this.sliderMultiParam, this.sliderMultiParam, 10, 1000);
    this.fftSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y + this.baseHeight * 3.5 - this.sliderMultiParam - this.sliderMultiParam, 1024, this.sliderMultiParam, this.sliderMultiParam, 32, 32768);
    this.inputTerminal = new Terminal(this.x - this.width / 2 - globalTerminalOffset, this.y, globalTerminalOffset / 2, "in", this);
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Frequency Analyser", this);
    this.connectedTo = null;
}

FrequencyAnalyserNode.prototype.scale = function () {
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 8;
    this.width *= gSFactor;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
}

FrequencyAnalyserNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();

    context.beginPath();
    resetContextAttr();
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.lineStyle = "#000";
    context.rect(this.display.x, this.display.y, this.display.w, this.display.h);
    context.fillStyle = "#000";
    context.fill();
    context.stroke();

    context.font = this.fontSize + "px Arial";
    var normString;
    if (!this.defaults) {
        normString = Math.round(this.resolutionSlider.value);
    }
    context.fillText("Resolution : " + ((this.defaults) ? "50" : normString), this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight * 2.5 - (this.fontSize / 3));
    if (!this.defaults) {
        normString = highestPowerOf2(Math.round(this.fftSlider.value));
    }
    context.fillText("FFT Size : " + ((this.defaults) ? "1024" : normString), this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight * 3.5 - (this.fontSize / 3));
    this.defaults = false;
}

FrequencyAnalyserNode.prototype.redraw = function () {
    //recalculate display parameters
    this.display.x = this.x - this.width / 2 + globalTerminalOffset;
    this.display.y = this.y - this.height / 2 + this.baseHeight / 2;
    this.display.w = this.width - globalTerminalOffset * 2;
    this.display.h = this.baseHeight * 5;
    this.draw();
    this.inputTerminal.x = this.x - this.width / 2 - globalTerminalOffset;
    this.inputTerminal.y = this.y;
    this.inputTerminal.radius = globalTerminalOffset / 2;
    this.inputTerminal.redraw();
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.resolutionSlider.x1 = this.x;
    this.resolutionSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.resolutionSlider.y = this.y + this.baseHeight * 2.5 - this.sliderMultiParam - this.sliderMultiParam;
    this.resolutionSlider.thumbRadius = this.sliderMultiParam;
    this.resolutionSlider.railHeight = this.sliderMultiParam;
    this.resolutionSlider.redraw();
    this.fftSlider.x1 = this.x;
    this.fftSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.fftSlider.y = this.y + this.baseHeight * 3.5 - this.sliderMultiParam - this.sliderMultiParam;
    this.fftSlider.thumbRadius = this.sliderMultiParam;
    this.fftSlider.railHeight = this.sliderMultiParam;
    this.fftSlider.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

FrequencyAnalyserNode.prototype.checkDisplayBounds = function (x, y) {
    if (x > this.display.x && x < (this.display.x + this.display.w) && y > this.display.y && y < (this.display.y + this.display.h)) {
        return true;
    }
    return false;
}

FrequencyAnalyserNode.prototype.clicked = function (x, y) {
    if (x > (this.inputTerminal.x - this.inputTerminal.radius) && x < (this.inputTerminal.x + this.inputTerminal.radius) && y > (this.inputTerminal.y - this.inputTerminal.radius) && y < (this.inputTerminal.y + this.inputTerminal.radius)) {
        this.inputTerminal.clicked();
    }
    else if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

FrequencyAnalyserNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2 - globalTerminalOffset - this.inputTerminal.radius) && x < (this.x + this.width / 2 + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

FrequencyAnalyserNode.prototype.displayRedraw = function (frequencyData, frequencyBinCount, sampleRate) {
    context.clearRect(this.display.x, this.display.y, this.display.w, this.display.h);
    resetContextAttr();
    var value, percent, height, offset, barWidth, hue, indexOfDecimal, freq;

    for (var i = 0; i < frequencyBinCount; i++) {
        value = frequencyData[i];
        percent = value / 256;
        height = this.display.h * percent;
        offset = this.display.h - height - 1;
        barWidth = this.display.w / frequencyBinCount;
        hue = i / frequencyBinCount * 360;
        context.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        context.fillRect(this.display.x + i * barWidth, this.display.y + offset, barWidth, height);
        if (this.checkDisplayBounds(mousePos.x, mousePos.y)) {
            resetContextAttr();
            context.font = "11px Arial";
            context.fillStyle = "#fff";
            freq = ((Math.floor(((mousePos.x - this.display.x) / this.display.w) * frequencyBinCount) * sampleRate) / (frequencyBinCount * 2)).toString();
            indexOfDecimal = freq.indexOf(".");
            if (indexOfDecimal != -1) freq = freq.substring(0, freq.indexOf("."));
            context.fillText(freq + " Hz", mousePos.x, mousePos.y);
        }
    }
}

FrequencyAnalyserNode.prototype.checkSliderBounds = function (x, y) {
    if (x > this.resolutionSlider.x1 && x < this.resolutionSlider.x2 && y > (this.resolutionSlider.y - this.resolutionSlider.railHeight / 2 + this.resolutionSlider.railHeight) && y < (this.resolutionSlider.y + this.resolutionSlider.railHeight / 2 + this.resolutionSlider.railHeight)) {
        return this.resolutionSlider;
    }
    if (x > this.fftSlider.x1 && x < this.fftSlider.x2 && y > (this.fftSlider.y - this.fftSlider.railHeight / 2 + this.fftSlider.railHeight) && y < (this.fftSlider.y + this.fftSlider.railHeight / 2 + this.fftSlider.railHeight)) {
        return this.fftSlider;
    }
}

FrequencyAnalyserNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        if (currNodeInContextMenu.inputTerminal.connector != null) {
            currNodeInContextMenu.inputTerminal.connector.terminalStart.isAssociated = false;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.connector = null;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.parent.connectedTo = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.inputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var WaveformAnalyserNode = function (x, y, width, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 8;
    this.width = width;
    this.type = "WaveformAnalyser";
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
    this.display = { x: this.x - this.width / 2 + globalTerminalOffset, y: this.y - this.height / 2 + this.baseHeight / 2, w: this.width - globalTerminalOffset * 2, h: this.baseHeight * 5 };
    this.defaults = true;
    this.draw();
    this.resolutionSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y + this.baseHeight * 2.5 - this.sliderMultiParam - this.sliderMultiParam, 50, this.sliderMultiParam, this.sliderMultiParam, 10, 1000);
    this.fftSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y + this.baseHeight * 3.5 - this.sliderMultiParam - this.sliderMultiParam, 1024, this.sliderMultiParam, this.sliderMultiParam, 32, 32768);
    this.inputTerminal = new Terminal(this.x - this.width / 2 - globalTerminalOffset, this.y, globalTerminalOffset / 2, "in", this);
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Waveform Analyser", this);
    this.connectedTo = null;
}

WaveformAnalyserNode.prototype.scale = function () {
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 8;
    this.width *= gSFactor;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
}

WaveformAnalyserNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();

    context.beginPath();
    resetContextAttr();
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.lineStyle = "#000";
    context.rect(this.display.x, this.display.y, this.display.w, this.display.h);
    context.fillStyle = "#000";
    context.fill();
    context.stroke();

    context.font = this.fontSize + "px Arial";
    var normString;
    if (!this.defaults) {
        normString = Math.round(this.resolutionSlider.value);
    }
    context.fillText("Resolution : " + ((this.defaults) ? "50" : normString), this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight * 2.5 - (this.fontSize / 3));
    if (!this.defaults) {
        normString = highestPowerOf2(Math.round(this.fftSlider.value));
    }
    context.fillText("FFT Size : " + ((this.defaults) ? "1024" : normString), this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight * 3.5 - (this.fontSize / 3));

    this.defaults = false;
}

WaveformAnalyserNode.prototype.redraw = function () {
    //recalculate display parameters
    this.display.x = this.x - this.width / 2 + globalTerminalOffset;
    this.display.y = this.y - this.height / 2 + this.baseHeight / 2;
    this.display.w = this.width - globalTerminalOffset * 2;
    this.display.h = this.baseHeight * 5;
    this.draw(this.x, this.y, this.width, this.height, this.radius);
    this.inputTerminal.x = this.x - this.width / 2 - globalTerminalOffset;
    this.inputTerminal.y = this.y;
    this.inputTerminal.radius = globalTerminalOffset / 2;
    this.inputTerminal.redraw();
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.resolutionSlider.x1 = this.x;
    this.resolutionSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.resolutionSlider.y = this.y + this.baseHeight * 2.5 - this.sliderMultiParam - this.sliderMultiParam;
    this.resolutionSlider.thumbRadius = this.sliderMultiParam;
    this.resolutionSlider.railHeight = this.sliderMultiParam;
    this.resolutionSlider.redraw();
    this.fftSlider.x1 = this.x;
    this.fftSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.fftSlider.y = this.y + this.baseHeight * 3.5 - this.sliderMultiParam - this.sliderMultiParam;
    this.fftSlider.thumbRadius = this.sliderMultiParam;
    this.fftSlider.railHeight = this.sliderMultiParam;
    this.fftSlider.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

WaveformAnalyserNode.prototype.clicked = function (x, y) {
    if (x > (this.inputTerminal.x - this.inputTerminal.radius) && x < (this.inputTerminal.x + this.inputTerminal.radius) && y > (this.inputTerminal.y - this.inputTerminal.radius) && y < (this.inputTerminal.y + this.inputTerminal.radius)) {
        this.inputTerminal.clicked();
    }
    else if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

WaveformAnalyserNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2 - globalTerminalOffset - this.inputTerminal.radius) && x < (this.x + this.width / 2 + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

WaveformAnalyserNode.prototype.displayRedraw = function (waveformData, frequencyBinCount) {
    context.clearRect(this.display.x, this.display.y, this.display.w, this.display.h);
    var value, percent, height, offset, barWidth;
    resetContextAttr();
    context.fillStyle = '#fff';
    context.lineStyle = "#fff";
    context.strokeStyle = "#fff";

    value = waveformData[0];
    percent = value / 256;
    height = this.display.h * percent;
    offset = this.display.h - height - 1;
    barWidth = this.display.w / frequencyBinCount;
    context.beginPath();
    context.moveTo(this.display.x, this.display.y + offset);

    for (var i = 1; i < frequencyBinCount; i++) {
        value = waveformData[i];
        percent = value / 256;
        height = this.display.h * percent;
        offset = this.display.h - height - 1;
        barWidth = this.display.w / frequencyBinCount;
        context.lineTo(this.display.x + i * barWidth, this.display.y + offset);
    }
    context.stroke();
}

WaveformAnalyserNode.prototype.checkSliderBounds = function (x, y) {
    if (x > this.resolutionSlider.x1 && x < this.resolutionSlider.x2 && y > (this.resolutionSlider.y - this.resolutionSlider.railHeight / 2 + this.resolutionSlider.railHeight) && y < (this.resolutionSlider.y + this.resolutionSlider.railHeight / 2 + this.resolutionSlider.railHeight)) {
        return this.resolutionSlider;
    }
    if (x > this.fftSlider.x1 && x < this.fftSlider.x2 && y > (this.fftSlider.y - this.fftSlider.railHeight / 2 + this.fftSlider.railHeight) && y < (this.fftSlider.y + this.fftSlider.railHeight / 2 + this.fftSlider.railHeight)) {
        return this.fftSlider;
    }
}

WaveformAnalyserNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        if (currNodeInContextMenu.inputTerminal.connector != null) {
            currNodeInContextMenu.inputTerminal.connector.terminalStart.isAssociated = false;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.connector = null;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.parent.connectedTo = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.inputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var SpectrogramAnalyserNode = function (x, y, width, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 8;
    this.width = width;
    this.type = "SpectrogramAnalyser";
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
    this.specIndex = -1;
    this.display = { x: this.x - this.width / 2 + globalTerminalOffset, y: this.y - this.height / 2 + this.baseHeight / 2, w: this.width - globalTerminalOffset * 2, h: this.baseHeight * 5 };
    this.displayCanvas = document.createElement("canvas");
    this.displayContext = this.displayCanvas.getContext("2d");
    this.displayCanvas.width = this.display.w;
    this.displayCanvas.height = this.display.h;
    this.defaults = true;
    this.draw();
    this.resolutionSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y + this.baseHeight * 2.5 - this.sliderMultiParam - this.sliderMultiParam, 50, this.sliderMultiParam, this.sliderMultiParam, 10, 1000);
    this.toggleGroup = new ToggleGroup(this.x, this.y + this.baseHeight * 3.5 - this.baseHeight / 3, this.width / 2 - globalTerminalOffset, this.baseHeight, ["Mono", "Multi"], 0);
    this.inputTerminal = new Terminal(this.x - this.width / 2 - globalTerminalOffset, this.y, globalTerminalOffset / 2, "in", this);
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Spectrogram Analyser", this);
    this.connectedTo = null;
}

SpectrogramAnalyserNode.prototype.scale = function () {
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 8;
    this.width *= gSFactor;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
}

SpectrogramAnalyserNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();

    context.beginPath();
    resetContextAttr();
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.lineStyle = "#000";
    context.rect(this.display.x, this.display.y, this.display.w, this.display.h);
    context.fillStyle = "#000";
    context.fill();
    context.stroke();
    context.font = this.fontSize + "px Arial";

    var normString;
    if (!this.defaults) {
        normString = Math.round(this.resolutionSlider.value);
    }
    context.fillText("Resolution : " + ((this.defaults) ? "50" : normString), this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight * 2.5 - (this.fontSize / 3));
    context.fillText("Mode : " + ((this.defaults) ? "Mono" : this.toggleGroup.activeValue), this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight * 3.5 - (this.fontSize / 3));
    this.defaults = false;
}

SpectrogramAnalyserNode.prototype.redraw = function () {
    //recalculate display parameters
    this.display.x = this.x - this.width / 2 + globalTerminalOffset;
    this.display.y = this.y - this.height / 2 + this.baseHeight / 2;
    this.display.w = this.width - globalTerminalOffset * 2;
    this.display.h = this.baseHeight * 5;
    this.displayCanvas.width = this.display.w;
    this.displayCanvas.height = this.display.h;
    this.draw();
    this.inputTerminal.x = this.x - this.width / 2 - globalTerminalOffset;
    this.inputTerminal.y = this.y;
    this.inputTerminal.radius = globalTerminalOffset / 2;
    this.inputTerminal.redraw();
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.resolutionSlider.x1 = this.x;
    this.resolutionSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.resolutionSlider.y = this.y + this.baseHeight * 2.5 - this.sliderMultiParam - this.sliderMultiParam;
    this.resolutionSlider.thumbRadius = this.sliderMultiParam;
    this.resolutionSlider.railHeight = this.sliderMultiParam;
    this.resolutionSlider.redraw();
    this.toggleGroup.x = this.x;
    this.toggleGroup.y = this.y + this.baseHeight * 3.5 - this.baseHeight / 3;
    this.toggleGroup.width = this.width / 2 - globalTerminalOffset;
    this.toggleGroup.height = this.baseHeight;
    this.toggleGroup.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

SpectrogramAnalyserNode.prototype.clicked = function (x, y) {
    if (x > (this.inputTerminal.x - this.inputTerminal.radius) && x < (this.inputTerminal.x + this.inputTerminal.radius) && y > (this.inputTerminal.y - this.inputTerminal.radius) && y < (this.inputTerminal.y + this.inputTerminal.radius)) {
        this.inputTerminal.clicked();
    }
    else if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
    else if (x > (this.toggleGroup.x) && x < (this.toggleGroup.x + this.toggleGroup.width) && y > (this.toggleGroup.y - this.toggleGroup.height / 2) && y < (this.toggleGroup.y + this.toggleGroup.height / 2)) {
        this.toggleGroup.clicked(x, y);
    }
}

SpectrogramAnalyserNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2 - globalTerminalOffset - this.inputTerminal.radius) && x < (this.x + this.width / 2 + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

SpectrogramAnalyserNode.prototype.displayRedraw = function (freqData, frequencyBinCount) {
    resetContextAttr();
    for (var i = 0; i < freqData.length; i++) {
        if (this.toggleGroup.activeValue == "Mono") {
            this.displayContext.fillStyle = monoHotnessScale(freqData[i] / 256).hex();
        }
        else {
            this.displayContext.fillStyle = multiHotnessScale(freqData[i] / 256).hex();
        }
        this.displayContext.fillRect(this.displayCanvas.width - 1, this.displayCanvas.height - i, 1, 1);
    }
    var imageData = this.displayContext.getImageData(1, 0, this.displayCanvas.width - 1, this.displayCanvas.height);
    this.displayContext.putImageData(imageData, 0, 0, 0, 0, this.displayCanvas.width, this.displayCanvas.height);
    context.drawImage(this.displayCanvas, this.display.x, this.display.y);
}

SpectrogramAnalyserNode.prototype.checkSliderBounds = function (x, y) {
    if (x > this.resolutionSlider.x1 && x < this.resolutionSlider.x2 && y > (this.resolutionSlider.y - this.resolutionSlider.railHeight / 2 + this.resolutionSlider.railHeight) && y < (this.resolutionSlider.y + this.resolutionSlider.railHeight / 2 + this.resolutionSlider.railHeight)) {
        return this.resolutionSlider;
    }
}

SpectrogramAnalyserNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        if (currNodeInContextMenu.inputTerminal.connector != null) {
            currNodeInContextMenu.inputTerminal.connector.terminalStart.isAssociated = false;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.connector = null;
            currNodeInContextMenu.inputTerminal.connector.terminalStart.parent.connectedTo = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.inputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var OscillationNode = function (x, y, width, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 3;
    this.width = width;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
    this.type = "Oscillator";
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.defaults = true;
    this.draw();
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Oscillator", this);
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.toggleGroup = new ToggleGroup(this.x - globalTerminalOffset, this.y - this.baseHeight + globalTerminalOffset / 2, this.width / 2 + globalTerminalOffset, this.baseHeight, ["Sine", "Square", "Sawtooth", "Triangle"], 0);
    this.freqSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y - this.sliderMultiParam, 440, this.sliderMultiParam, this.sliderMultiParam, 20, 20000);
    this.detuneSlider = new Slider(this.x, this.x + this.width / 2 - globalTerminalOffset, this.y + this.baseHeight - this.sliderMultiParam, 0, this.sliderMultiParam, this.sliderMultiParam, 0, 100);
    this.connectedTo = null;
}

OscillationNode.prototype.scale = function () {
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 3;
    this.width *= gSFactor;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
}

OscillationNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();

    var fontSize = 12;
    context.font = "bold " + this.fontSize + "px Arial";
    context.fillStyle = "#000000bb";
    context.shadowBlur = 0;
    if (!this.defaults) context.fillText("Type : " + this.toggleGroup.activeValue, this.x - this.width / 2 + globalTerminalOffset, this.y - this.baseHeight + (this.fontSize / 3));
    else context.fillText("Type : Sine", this.x - this.width / 2 + globalTerminalOffset, this.y - this.baseHeight + (this.fontSize / 3));
    var normString;
    if (!this.defaults) normString = this.freqSlider.value.toString();
    context.fillText("Frequency : " + ((this.defaults) ? 440 : normString.slice(0, ((normString.indexOf(".") != -1) ? ((normString.slice(normString.indexOf(".")).length < 3) ? normString.length : normString.indexOf(".") + 3) : normString.length))), this.x - this.width / 2 + globalTerminalOffset, this.y + (this.fontSize / 3));
    if (!this.defaults) normString = this.detuneSlider.value.toString();
    context.fillText("Detune : " + ((this.defaults) ? 0 : normString.slice(0, ((normString.indexOf(".") != -1) ? ((normString.slice(normString.indexOf(".")).length < 0) ? normString.length : normString.indexOf(".") + 0) : normString.length))), this.x - this.width / 2 + globalTerminalOffset, this.y + this.baseHeight + (this.fontSize / 3));
    this.defaults = false;
}

OscillationNode.prototype.redraw = function () {
    this.draw();
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    this.toggleGroup.x = this.x - globalTerminalOffset;
    this.toggleGroup.y = this.y - this.baseHeight + globalTerminalOffset / 2;
    this.toggleGroup.width = this.width / 2 + globalTerminalOffset;
    this.toggleGroup.height = this.baseHeight;
    this.toggleGroup.redraw();
    this.freqSlider.x1 = this.x;
    this.freqSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.freqSlider.y = this.y - this.sliderMultiParam;
    this.freqSlider.thumbRadius = this.sliderMultiParam;
    this.freqSlider.railHeight = this.sliderMultiParam;
    this.freqSlider.redraw();
    this.detuneSlider.x1 = this.x;
    this.detuneSlider.x2 = this.x + this.width / 2 - globalTerminalOffset;
    this.detuneSlider.y = this.y + this.baseHeight - this.sliderMultiParam;
    this.detuneSlider.thumbRadius = this.sliderMultiParam;
    this.detuneSlider.railHeight = this.sliderMultiParam;
    this.detuneSlider.redraw();
    this.scaleRatio = this.width / this.originalWidth;
}

OscillationNode.prototype.clicked = function (x, y) {
    if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
    else if (x > (this.toggleGroup.x) && x < (this.toggleGroup.x + this.toggleGroup.width) && y > (this.toggleGroup.y - this.toggleGroup.height / 2) && y < (this.toggleGroup.y + this.toggleGroup.height / 2)) {
        this.toggleGroup.clicked(x, y);
    }
}

OscillationNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2) && x < (this.x + this.width / 2 + globalTerminalOffset + globalTerminalOffset / 2) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

OscillationNode.prototype.checkSliderBounds = function (x, y) {
    if (x > this.freqSlider.x1 && x < this.freqSlider.x2 && y > (this.freqSlider.y - this.freqSlider.railHeight / 2 + this.freqSlider.railHeight) && y < (this.freqSlider.y + this.freqSlider.railHeight / 2 + this.freqSlider.railHeight)) {
        return this.freqSlider;
    }
    if (x > this.detuneSlider.x1 && x < this.detuneSlider.x2 && y > (this.detuneSlider.y - this.detuneSlider.railHeight / 2 + this.detuneSlider.railHeight) && y < (this.detuneSlider.y + this.detuneSlider.railHeight / 2 + this.detuneSlider.railHeight)) {
        return this.detuneSlider;
    }
}

OscillationNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var CustomWaveNode = function (x, y, width, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 6;
    this.width = width;
    this.type = "CustomWave";
    this.originalWidth = width;
    this.scaleRatio = 1;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
    this.canvas = { x: this.x - this.width / 2 + globalTerminalOffset, y: this.y - this.height / 2 + this.baseHeight / 2, w: this.width - globalTerminalOffset * 2, h: this.baseHeight * 5 };
    this.defaults = true;
    this.canvasBuffer = [];
    this.waveformBuffer = [];
    this.draw();
    //components
    this.outputTerminal = new Terminal(this.x + this.width / 2 + globalTerminalOffset, this.y, globalTerminalOffset / 2, "out", this);
    this.tooltip = new Tooltip(this.x, this.y - this.height / 2 - globalTerminalOffset, "Custom Waveform", this);
    this.connectedTo = null;
}

CustomWaveNode.prototype.scale = function () {
    this.baseHeight = globalBaseHeight;
    this.height = this.baseHeight * 6;
    this.width *= gSFactor;
    this.radius = this.baseHeight / 4;
    this.fontSize = this.baseHeight * 0.35;
    this.sliderMultiParam = this.baseHeight * 0.3;
}

CustomWaveNode.prototype.draw = function () {
    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.fillStyle = "#dedede66";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.fill();
    context.stroke();

    context.beginPath();
    resetContextAttr();
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.lineStyle = "#000";
    context.rect(this.canvas.x, this.canvas.y, this.canvas.w, this.canvas.h);
    context.fillStyle = "#000";
    context.fill();
    context.stroke();
    this.defaults = false;
}

CustomWaveNode.prototype.redraw = function () {
    //recalculate display parameters
    this.canvas.x = this.x - this.width / 2 + globalTerminalOffset;
    this.canvas.y = this.y - this.height / 2 + this.baseHeight / 2;
    this.canvas.w = this.width - globalTerminalOffset * 2;
    this.canvas.h = this.baseHeight * 5;
    this.draw();
    this.outputTerminal.x = this.x + this.width / 2 + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.height / 2 - globalTerminalOffset;
    this.tooltip.redraw();
    if (this.canvasBuffer.length != 0) {
        context.beginPath();
        resetContextAttr();
        context.strokeStyle = "#fff";
        context.lineStyle = "#fff";
        context.moveTo(this.canvas.x + this.canvasBuffer[0].x * this.canvas.w, this.canvas.y + this.canvasBuffer[0].y * this.canvas.h);
        for (var i = 1; i < this.canvasBuffer.length; i++){
            context.lineTo(this.canvas.x + this.canvasBuffer[i].x * this.canvas.w, this.canvas.y + this.canvasBuffer[i].y * this.canvas.h);
        }
        context.stroke();
    }
    this.scaleRatio = this.width / this.originalWidth;
}

CustomWaveNode.prototype.clicked = function (x, y) {
    if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

CustomWaveNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.width / 2) && x < (this.x + this.width / 2 + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.height / 2) && y < (this.y + this.height / 2)) {
        return true;
    }
    return false;
}

CustomWaveNode.prototype.checkCanvasBounds = function (x, y) {
    if (x > this.canvas.x && x < (this.canvas.x + this.canvas.w) && y > this.canvas.y && y < (this.canvas.y + this.canvas.h)) {
        return true;
    }
    return false;
}

CustomWaveNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

var MicrophoneNode = function (x, y, radius, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.radius = radius;
    this.type = "Microphone";
    this.originalRadius = radius;
    this.scaleRatio = 1;
    this.draw();
    this.outputTerminal = new Terminal(this.x + this.radius + globalTerminalOffset, this.y, globalTerminalOffset / 2, "stream", this);
    this.tooltip = new Tooltip(this.x, this.y - this.radius - globalTerminalOffset, "Microphone", this);
    this.connectedTo = null;
    this.stream = null;
    window.micNode = this;
    navigator.getUserMedia({ audio: true }, function (stream) {
        window.micNode.stream = stream;
    }, function () {
        alert("Error In Acquiring Microphone !");
        console.log(arguments);
    });
}

MicrophoneNode.prototype.scale = function () {
    this.radius *= gSFactor;
}

MicrophoneNode.prototype.draw = function () {
    context.beginPath();
    resetContextAttr();
    context.shadowColor = "#ffffff";
    context.shadowBlur = 5;
    context.fillStyle = "#ffa50066";
    context.lineWidth = "1";
    context.strokeStyle = "#000";
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    context.drawImage(micIcon, this.x - (this.radius * 0.7) / 2, this.y - (this.radius * 0.8) / 2, this.radius * 0.7, this.radius * 0.8);
}

MicrophoneNode.prototype.redraw = function () {
    this.draw();
    this.outputTerminal.x = this.x + this.radius + globalTerminalOffset;
    this.outputTerminal.y = this.y;
    this.outputTerminal.radius = globalTerminalOffset / 2;
    this.outputTerminal.redraw();
    this.tooltip.x = this.x;
    this.tooltip.y = this.y - this.radius - globalTerminalOffset;
    this.tooltip.redraw();
    this.scaleRatio = this.radius / this.originalRadius;
}

MicrophoneNode.prototype.clicked = function (x, y) {
    if (x > (this.outputTerminal.x - this.outputTerminal.radius) && x < (this.outputTerminal.x + this.outputTerminal.radius) && y > (this.outputTerminal.y - this.outputTerminal.radius) && y < (this.outputTerminal.y + this.outputTerminal.radius)) {
        this.outputTerminal.clicked();
    }
}

MicrophoneNode.prototype.checkBounds = function (x, y) {
    if (x > (this.x - this.radius) && x < (this.x + this.radius + globalTerminalOffset + this.outputTerminal.radius) && y > (this.y - this.radius) && y < (this.y + this.radius))
        return true;
    return false;
}

MicrophoneNode.prototype.executeContextOption = function (option) {
    if (option == "Delete") {
        if (currNodeInContextMenu.outputTerminal.connector != null) {
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.isAssociated = false;
            currNodeInContextMenu.outputTerminal.connector.terminalEnd.connector = null;
            connectors.splice(connectors.indexOf(currNodeInContextMenu.outputTerminal.connector), 1);
        }
        nodes.splice(nodes.indexOf(currNodeInContextMenu), 1);
        currNodeInContextMenu = null;
    }
}

function toolboxClicked() {
    isToolboxOpened = !isToolboxOpened;
    if (isToolboxOpened) {
        toolboxContainer.style.left = "0";
    }
    else {
        toolboxContainer.style.left = "-20%";
    }
}

function playClicked() {
    if (!isPlaying) {
        isPlaying = !isPlaying;
        playOption.style.opacity = ".5";
        stopOption.style.opacity = "1";

        constructGraph(nodes);
    }
}

function stopClicked() {
    if (isPlaying) {
        isPlaying = !isPlaying;
        playOption.style.opacity = "1";
        stopOption.style.opacity = ".5";

        stopGraph();
    }
}

document.addEventListener("dragstart", function (event) {   
    event.dataTransfer.setData("Text", event.target.innerHTML);
});

canvas.addEventListener("dragover", function () {
    event.preventDefault();
}, true);

canvas.addEventListener("drop", function () {

    globalScaleRatio = (nodes.length > 0) ? nodes[0].scaleRatio : 1;

    event.preventDefault();
    var draggedItemText = event.dataTransfer.getData("Text");
    var pos = getMousePos(canvas, event);

    //experimental
    /*
    var persistentScale = 1;
    if (globalScaleDelta < 0) {
        persistentScale = Math.pow(downScaleStep, Math.abs(globalScaleDelta));
    }
    else if (globalScaleDelta > 0) {
        persistentScale = Math.pow(upScaleStep, Math.abs(globalScaleDelta));
    }
    console.log(globalScaleDelta);
    */
    //experimental

    if (draggedItemText == "Audio Source") {
        var newAudioSource = new AudioSourceNode(pos.x, pos.y, WIDTH * 0.15 * globalScaleRatio, WIDTH * 0.1 * 0.4 * globalScaleRatio, nodes.length);
        nodes.push(newAudioSource);
    }
    else if (draggedItemText == "Audio Destination") {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].type == "AudioDestination") return;
        }
        var newAudioDestination = new AudioDestinationNode(pos.x, pos.y, WIDTH * 0.03 * globalScaleRatio, nodes.length);
        nodes.push(newAudioDestination);
    }
    else if (draggedItemText == "Audio Merger") {
        var newAudioMerger = new AudioMergerNode(pos.x, pos.y, WIDTH * 0.15 * globalScaleRatio, nodes.length);
        nodes.push(newAudioMerger);
    }
    else if (draggedItemText == "Linear Convolver") {
        var newLinearConvolver = new LinearConvolveNode(pos.x, pos.y, WIDTH * 0.15 * globalScaleRatio, nodes.length);
        nodes.push(newLinearConvolver);
    }
    else if (draggedItemText == "White Noise") {
        var newWhiteNoise = new WhiteNoiseNode(pos.x, pos.y, WIDTH * 0.075 * globalScaleRatio, WIDTH * 0.1 * 0.3 * globalScaleRatio, nodes.length);
        nodes.push(newWhiteNoise);
    }
    else if (draggedItemText == "Bitcrusher") {
        var newBitcrusher = new BitcrusherNode(pos.x, pos.y, WIDTH * 0.2 * globalScaleRatio, nodes.length);
        nodes.push(newBitcrusher);
    }
    else if (draggedItemText == "Moog Filter") {
        var newMoogfilter = new MoogfilterNode(pos.x, pos.y, WIDTH * 0.2 * globalScaleRatio, nodes.length);
        nodes.push(newMoogfilter);
    }
    else if (draggedItemText == "Panner") {
        var newPanner = new PannerNode(pos.x, pos.y, WIDTH * 0.2 * globalScaleRatio, nodes.length);
        nodes.push(newPanner);
    }
    else if (draggedItemText == "Frequency Analyser") {
        var newFAnalyser = new FrequencyAnalyserNode(pos.x, pos.y, WIDTH * 0.25 * globalScaleRatio, nodes.length);
        nodes.push(newFAnalyser);
    }
    else if (draggedItemText == "Waveform Analyser") {
        var newWAnalyser = new WaveformAnalyserNode(pos.x, pos.y, WIDTH * 0.25 * globalScaleRatio, nodes.length);
        nodes.push(newWAnalyser);
    }
    else if (draggedItemText == "Spectrogram Analyser") {
        var newSAnalyser = new SpectrogramAnalyserNode(pos.x, pos.y, WIDTH * 0.25 * globalScaleRatio, nodes.length);
        nodes.push(newSAnalyser);
    }
    else if (draggedItemText == "Oscillator") {
        var newOscillator = new OscillationNode(pos.x, pos.y, WIDTH * 0.2 * globalScaleRatio, nodes.length);
        nodes.push(newOscillator);
    }
    else if (draggedItemText == "Custom Wave") {
        var newCustomWave = new CustomWaveNode(pos.x, pos.y, WIDTH * 0.25 * globalScaleRatio, nodes.length);
        nodes.push(newCustomWave);
    }
    else if (draggedItemText == "Microphone") {
        var newMicrophone = new MicrophoneNode(pos.x, pos.y, WIDTH * 0.03 * globalScaleRatio, nodes.length);
        nodes.push(newMicrophone);
    }
    else if (draggedItemText == "Drum Sequencer") {
        var newDSequencer = new DrumSequencerNode(pos.x, pos.y, WIDTH * 0.08 * globalScaleRatio, WIDTH * 0.04 * globalScaleRatio, nodes.length);
        nodes.push(newDSequencer);
    }
    console.log(draggedItemText);
}, true);

canvas.addEventListener("click", function () { }, true);

canvas.addEventListener("dblclick", function (e) {
    var inbounds = [];
    var pos = getMousePos(canvas, e);
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].checkBounds(pos.x, pos.y)) inbounds.push(nodes[i]);
    }
    var highestOrder = Math.max.apply(Math, inbounds.map(function (o) { return o.order; }));
    var node = inbounds.find(function (o) { return o.order == highestOrder; });
    if (node != null) {
        if (node.type == "DrumSequencer") {
            currDSNode = node;
            // load/display configuration from currDSNode to Global Drum Sequencer UI
            // set activations
            for (var i = 0; i < 8; i++){
                activations[i] = currDSNode.activations[i];
                if (activations[i] == 1) {
                    activationCells[i].style.backgroundColor = "#76ee00";
                }
                else {
                    activationCells[i].style.backgroundColor = "#eee";
                }
            }
            //set channelTracks
            for (var i = 0; i < 8; i++){
                selectionCells[i].innerHTML = currDSNode.channels[i].substring(0, 1).toUpperCase() + currDSNode.channels[i].substring(1).toLowerCase();
            }
            //set pads
            for (var i = 0; i < 8; i++){
                for (var j = 0; j < 16; j++){
                    pads[i][j] = currDSNode.pads[i][j];
                    if (pads[i][j] == 1) {
                        padElements[i][j].style.opacity = "1";
                    }
                    else {
                        padElements[i][j].style.opacity = "0.2";
                    }
                }
            }
            drumSequencerContainer.style.top = "0";
            isDSOpened = true;
        }
    }
}, true);

canvas.addEventListener("mousewheel", function (e) {
    if (e.wheelDelta < 0) {
        gSFactor = downScaleStep;
        //globalScaleDelta -= 1; //experimental
    }
    else if (e.wheelDelta > 0) {
        gSFactor = upScaleStep;
        //globalScaleDelta += 1; //experimental
    }
    //console.log(gSFactor);
    var pos = getMousePos(canvas, e);

    globalTootipFontSize *= gSFactor;
    globalTerminalOffset *= gSFactor;
    globalBaseHeight *= gSFactor;
    globalToggleButtonRadius *= gSFactor;
    globalConnectorBezeirOffset *= gSFactor;
    globalConnectorWidth *= gSFactor;

    var distance, slope, sine, cosine;

    for (var i = 0; i < nodes.length; i++){
        if (nodes[i].x > pos.x && nodes[i].y > pos.y){
            nodes[i].x = (pos.x + gSFactor * (Math.abs(pos.x - nodes[i].x)));
            nodes[i].y = (pos.y + gSFactor * (Math.abs(pos.y - nodes[i].y)));
        }
        else if (nodes[i].x > pos.x && nodes[i].y < pos.y){
            nodes[i].x = (pos.x + gSFactor * (Math.abs(pos.x - nodes[i].x)));
            nodes[i].y = (pos.y - gSFactor * (Math.abs(pos.y - nodes[i].y)));
        }
        else if (nodes[i].x < pos.x && nodes[i].y > pos.y){
            nodes[i].x = (pos.x - gSFactor * (Math.abs(pos.x - nodes[i].x)));
            nodes[i].y = (pos.y + gSFactor * (Math.abs(pos.y - nodes[i].y)));
        }
        else if (nodes[i].x < pos.x && nodes[i].y < pos.y){
            nodes[i].x = (pos.x - gSFactor * (Math.abs(pos.x - nodes[i].x)));
            nodes[i].y = (pos.y - gSFactor * (Math.abs(pos.y - nodes[i].y)));
        }
    }

    for (var i = 0; i < nodes.length; i++){
        nodes[i].scale();
    }

    context.clearRect(0, 0, WIDTH, HEIGHT);
    ultimateRedraw();
}, true);

canvas.addEventListener("mousedown", function (event) {
    if (event.which == 1) {
        //console.log("mousedown");
        var inbounds = [];
        var pos = getMousePos(canvas, event);
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].checkBounds(pos.x, pos.y)) inbounds.push(nodes[i]);
        }
        var highestOrder = Math.max.apply(Math, inbounds.map(function (o) { return o.order; }));
        var node = inbounds.find(function (o) { return o.order == highestOrder; });
        if ((node != null) && (nodeDragFlag == 0) && !isContextMenuOpened) {
            currentDragNode = node;
            if (node.type == "CustomWave" && node.checkCanvasBounds(pos.x, pos.y)) {
                isDrawing = 1;
                startSample = { x: pos.x, y: pos.y };
                currDrawingNode = node;
                currDrawingNode.canvasBuffer = [];
                currDrawingNode.waveformBuffer = [];
                context.clearRect(node.canvas.x, node.canvas.y, node.canvas.w, node.canvas.h);
                context.beginPath();
                resetContextAttr();
                context.strokeStyle = "#fff";
                context.lineStyle = "#fff";
                currDrawingNode.canvasBuffer.push({ x: (pos.x - currDrawingNode.canvas.x) / currDrawingNode.canvas.w, y: (pos.y - currDrawingNode.canvas.y) / currDrawingNode.canvas.h });
                context.moveTo(pos.x, pos.y);
            }
            dragDelta.x = currentDragNode.x - pos.x;
            dragDelta.y = currentDragNode.y - pos.y;
        }
        if (node != null && (node.type == "Bitcrusher" || node.type == "Moog" || node.type == "Panner" || node.type == "Oscillator" || node.type == "FrequencyAnalyser" || node.type == "WaveformAnalyser" || node.type == "SpectrogramAnalyser")) {
            var slider = null;
            if ((slider = node.checkSliderBounds(pos.x, pos.y)) != null) {
                currSlider = slider;
                sliderDragFlag = 1;
            }
        }
        if (node == null) {
            panStart.x = pos.x;
            panStart.y = pos.y;
            panFlag = 1;
        }
    }
}, true);

canvas.addEventListener("mousemove", function (event) {
    //console.log("mousemove");
    mousePos = getMousePos(canvas, event);
    if (terminalStartFlag == 1) {
        context.clearRect(0, 0, WIDTH, HEIGHT);
        currentConnector.redraw(mousePos.x, mousePos.y);
        ultimateRedraw();
    }
    if (currentDragNode != null && sliderDragFlag == 0 && isDrawing == 0 && !isContextMenuOpened) {
        nodeDragFlag = 1;
        currentDragNode.x = mousePos.x + dragDelta.x;
        currentDragNode.y = mousePos.y + dragDelta.y;
        context.clearRect(0, 0, WIDTH, HEIGHT);
        ultimateRedraw();
    }
    if (sliderDragFlag == 1) {
        currSlider.slide(mousePos.x);
        context.clearRect(0, 0, WIDTH, HEIGHT);
        ultimateRedraw();
    }
    if (panFlag == 1) {
        panDelta.x = mousePos.x - panStart.x;
        panDelta.y = mousePos.y - panStart.y;
        panStart.x = mousePos.x;
        panStart.y = mousePos.y;
        //redraw everything according to panDelta
        context.clearRect(0, 0, WIDTH, HEIGHT);
        ultimateRedrawWithDelta(panDelta);
    }
    if (isDrawing == 1) {
        var pos = { x: 0, y: 0 };
        if (mousePos.x > (currDrawingNode.canvas.x + currDrawingNode.canvas.w)) {
            pos.x = currDrawingNode.canvas.x + currDrawingNode.canvas.w;
        }
        else if (mousePos.x < currDrawingNode.canvas.x) {
            pos.x = currDrawingNode.canvas.x;
        }
        else {
            pos.x = mousePos.x;
        }
        if (mousePos.y > (currDrawingNode.canvas.y + currDrawingNode.canvas.h)) {
            pos.y = currDrawingNode.canvas.y + currDrawingNode.canvas.h;
        }
        else if (mousePos.y < currDrawingNode.canvas.y) {
            pos.y = currDrawingNode.canvas.y;
        }
        else {
            pos.y = mousePos.y;
        }
        if (pos.y < minYSample) {
            minYSample = pos.y;
        }
        currDrawingNode.canvasBuffer.push({ x: (pos.x - currDrawingNode.canvas.x) / currDrawingNode.canvas.w, y: (pos.y - currDrawingNode.canvas.y) / currDrawingNode.canvas.h });
        context.lineTo(pos.x, pos.y);
        context.stroke();
    }
}, true);

canvas.addEventListener("mouseup", function (event) {
    var pos = getMousePos(canvas, event);
    if (event.which == 1) {
        //console.log("mouseup");
        if (nodeDragFlag == 1) {
            //console.log("node drag ended");
            //node was being dragged
            currentDragNode = null;
            nodeDragFlag = 0;
        }
        else if (sliderDragFlag == 1) {
            //console.log("slider drag ended");
            //slider was being dragged
            sliderDragFlag = 0;
            currSlider = null;
            currentDragNode = null;
            context.clearRect(0, 0, WIDTH, HEIGHT);
            ultimateRedraw();
        }
        else if (panFlag == 1) {
            panFlag = 0;
            panDelta.x = panDelta.y = panStart.x = panStart.y = 0;
        }
        else if (isDrawing == 1) {
            //map drawing to waveform buffer
            console.log("Sampling...");
            //blocking message
            outer: for (var i = startSample.x; i < pos.x; i++) {
                inner: for (var j = minYSample; j < (currDrawingNode.canvas.y + currDrawingNode.canvas.h); j++) {
                    if (context.getImageData(i, j, 1, 1).data[0] == 255) {
                        currDrawingNode.waveformBuffer.push(2 * ((currDrawingNode.canvas.h - (j - currDrawingNode.canvas.y)) / currDrawingNode.canvas.h) - 1);
                        break inner;
                    }
                }
            }
            console.log("Sampling Done");

            currDrawingNode = null;
            minYSample = 100000;
            startSample = { x: null, y: null };
            isDrawing = 0;
            currentDragNode = null;
            context.stroke();
        }
        else {
            //something is not being dragged (which means something is clicked)
            if (isContextMenuOpened) {
                if (pos.x > (currentContextMenu.x - currentContextMenu.width / 2) && pos.x < (currentContextMenu.x + currentContextMenu.width / 2) && pos.y > (currentContextMenu.y - currentContextMenu.height / 2) && pos.y < (currentContextMenu.y + currentContextMenu.height / 2)) {
                    currentContextMenu.clicked(pos.x, pos.y);
                }
                isContextMenuOpened = false;
                currentContextMenu = null;
                currNodeInContextMenu = null;
                context.clearRect(0, 0, WIDTH, HEIGHT);
                ultimateRedraw();
                return;
            }
            var inbounds = [];
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].checkBounds(pos.x, pos.y)) inbounds.push(nodes[i]);
            }
            var highestOrder = Math.max.apply(Math, inbounds.map(function (o) { return o.order; }));
            var node = inbounds.find(function (o) { return o.order == highestOrder; });
            if (node != null) node.clicked(pos.x, pos.y);
            currentDragNode = null;
        }
    }
    else if (event.which == 3) {
        if (isContextMenuOpened) {
            context.clearRect(0, 0, WIDTH, HEIGHT);
            ultimateRedraw();
        }
        isContextMenuOpened = true;
        var inbounds = [];
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].checkBounds(pos.x, pos.y)) inbounds.push(nodes[i]);
        }
        var highestOrder = Math.max.apply(Math, inbounds.map(function (o) { return o.order; }));
        var node = inbounds.find(function (o) { return o.order == highestOrder; });
        if (node != null){
            currNodeInContextMenu = node;
            currentContextMenu = new ContextMenu(pos.x, pos.y, WIDTH * 0.07, WIDTH * 0.07 * 0.25, ["Delete"]);
        }
    }
}, true);

canvas.addEventListener("contextmenu", function () { event.preventDefault(); }, true);

function ultimateRedraw() {
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].redraw();
    }
    for (var i = 0; i < connectors.length; i++) {
        connectors[i].redraw(connectors[i].terminalEnd.x, connectors[i].terminalEnd.y);
    }
}

function ultimateRedrawWithDelta(delta) {
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].x = nodes[i].x + delta.x;
        nodes[i].y = nodes[i].y + delta.y;
        nodes[i].redraw();
    }
    for (var i = 0; i < connectors.length; i++) {
        connectors[i].redraw(connectors[i].terminalEnd.x, connectors[i].terminalEnd.y);
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getNewGUID() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function resetContextAttr() {
    context.shadowColor = "#000";
    context.shadowBlur = 0;
    context.fillStyle = "#000";
    context.strokeStyle = "#000";
    context.lineWidth = "1";
    context.lineCap = "butt";
    context.font = "15px Arial";
    context.lineStyle = "#000";
}

function dSPlayStopClicked() {
    if (!isDSPlaying) {
        dSPlayStop.style.backgroundImage = "url('../images/stop.png')";
        handlePlay();
    }
    else {
        dSPlayStop.style.backgroundImage = "url('../images/play.png')";
        handleStop();
    }
    isDSPlaying = !isDSPlaying;
}

function dSCloseClicked() {
    if (isDSOpened) {
        drumSequencerContainer.style.top = "-70%";
        if (isDSPlaying) {
            dSPlayStop.style.backgroundImage = "url('../images/play.png')";
            isDSPlaying = false;
            handleStop();
        }
    }
}