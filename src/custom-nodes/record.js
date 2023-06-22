import { FlowConnect, Node, TerminalType } from "flow-connect";

export class Record extends Node {
  static DefaultState = { file: null };
  chunks = [];
  button = null;

  setupIO() {
    this.addTerminals([
      { type: TerminalType.IN, name: "in", dataType: "audio" },
      { type: TerminalType.OUT, name: "out", dataType: "audio" },
    ]);
  }
  created(options) {
    this.audioCtx = this.flow.flowConnect.audioContext;
    const { width = 160, name = "Record", state = {}, style = {} } = options;

    this.name = name;
    this.width = width;
    this.state = { ...Record.DefaultState, ...state };
    this.style = { ...{ rowHeight: 10, spacing: 10 }, ...style };

    this.recorderDestination = this.audioCtx.createMediaStreamDestination();
    this.recorder = new MediaRecorder(this.recorderDestination.stream);

    this.inGain = this.audioCtx.createGain();
    this.outGain = this.audioCtx.createGain();
    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.inGain.connect(this.recorderDestination);
    this.inGain.connect(this.outGain);

    this.setupUI();
    this.setupListeners();
  }
  process() {}

  setupUI() {
    this.button = this.createUI("core/button", { text: "Download" });
    this.button.on("click", () => {
      const downloader = document.createElement("a");
      document.body.appendChild(downloader);
      downloader.style.display = "none";
      const url = URL.createObjectURL(this.state.file);
      downloader.href = url;
      downloader.download = "recorder.ogg";
      downloader.click();
      URL.revokeObjectURL(url);
      downloader.remove();
    });
    this.ui.append([this.button]);
  }
  setupListeners() {
    this.watch("file", () => {
      if (!this.state.file) {
        this.button.disabled = true;
      } else {
        this.button.disabled = false;
      }
    });

    this.recorder.ondataavailable = (e) => {
      this.chunks.push(e.data);
    };
    this.recorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" });
      this.state.file = new File([blob], "recorded.ogg");
      this.chunks = [];
    };
    this.flow.on("start", () => {
      this.recorder.start();
    });
    this.flow.on("stop", () => {
      this.recorder.stop();
    });

    this.outputs[0].on("connect", (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on("disconnect", (_inst, _connector, _start, end) =>
      this.outputs[0].ref.disconnect(end.ref)
    );
  }
}

FlowConnect.register({ type: "node", name: "audio/record" }, Record);
