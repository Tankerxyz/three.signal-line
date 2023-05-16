import THREE from 'three';

export enum LINE_TYPE {
  NORMAL = "line",
  CURVE = "curve"
};

class SignalLine {
  private readonly options;

  private scene: any;

  private labels;

  private signals;


  public static defaultOptions = {
    linePath: [],
    lineType: LINE_TYPE.NORMAL,
    materialOptions: {
      color: 0xffffff,
      opacity: 1.0,
      blending: THREE.NormalBlending,
      transparent: true,
      depthWrite: true,
      linewidth: 2
    },
    isDebug: false
  }

  constructor(options, scene) {
    this.options = {
      ...SignalLine.defaultOptions,
      ...options,
      materialOptions: {
        ...SignalLine.defaultOptions.materialOptions,
        ...options.materialOptions
      }
    };

    if (this.options.linePath.length < 2) {
      throw new Error("linePath .length must be greater than 2");
    }

    this.scene = scene;
    this.labels = [];
    this.signals = [];
    this._createLine();

    this.callIfDebug(() => {
      console.log("SignalLine: ", this);
    });

    this.update = this.update.bind(this);
  }

  public getLineLength(lineGeometry) {
    // const sum = 0;
    //
    // const vertices = this.lineGeometry.vertices;
    // for (const i = 0; i < vertices.length - 1; ++i) {
    //   const curPoint = vertices[i];
    //   const nextPoint = vertices[i + 1];
    //
    //   sum += curPoint.distanceTo(nextPoint);
    // }
    //
    // return sum;
  }

  private void _createLine() {
    // this.lineGeometry = new THREE.Geometry();
    //
    // const points = this.options.linePath;
    // if (this.options.lineType === SignalLine.LINE_TYPE.CURVE) {
    //   if (this.options.linePath.length !== 3) {
    //     throw new Error(
    //       "linePath .length must be 3 (1 - startPoint, 2 - midPoint, 3 - endPoint)"
    //     );
    //   }
    //
    //   const curvePoints = new THREE.CatmullRomCurve3(
    //     this.options.linePath
    //   ).getPoints(3);
    //   points = new THREE.CubicBezierCurve3(...curvePoints).getPoints(50);
    // }
    //
    // this.lineGeometry.vertices.push(...points);
    //
    // const meshLine = new THREE.MeshLine();
    // meshLine.setGeometry(this.lineGeometry, () => 1);
    //
    // const meshLineMaterial = new THREE.MeshLineMaterial({
    //   color: new THREE.Color(this.options.materialOptions.color),
    //   // @todo pass the resolution
    //   resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    //   opacity: this.options.materialOptions.opacity,
    //   lineWidth: this.options.materialOptions.linewidth,
    //   transparent: true,
    //   depthTest: true,
    //   blending: THREE.NormalBlending,
    //   sizeAttenuation: true
    // });
    //
    // this.line = new THREE.Mesh(meshLine.geometry, meshLineMaterial);
    // this.line.renderDepth = false;
    //
    // this.scene.add(this.line);

    // @todo add labels as an options param array and call the addLabel method
  }

  public addLabel(labelOptions = {}) {
    // const label = new Label(
    //   {
    //     ...labelOptions,
    //     lineType: this.options.lineType
    //   },
    //   this.lineGeometry
    // );
    // this.labels.push(label);
    //
    // this.line.add(label.text);
    //
    // return label;
  }

  // index or instance
  public removeLabel(label) {
    // const index;
    // if (label instanceof Label) {
    //   index = this.labels.indexOf(label);
    // } else if (typeof index === "number") {
    //   index = label;
    // } else {
    //   throw new Error('You must to pass "number" or instance of "Label"');
    // }
    //
    // this.labels[index].dispose();
    // this.labels.splice(index, 1);
  }

  public callIfDebug(callback) {
    this.options.isDebug && callback();
  }

  public send(options) {
    // const signal = new Signal(options, this.lineGeometry);
    // this.signals.push(signal);
    //
    // this.callIfDebug(() =>
    //   console.time("signal " + signal.particleSystem.uuid)
    // );
    //
    // this.scene.add(signal.particleSystem);
  }

  private _updateSignals() {
    // if (!this.signals.length) { return; }
    //
    // this.signals.slice().forEach(signal => {
    //   signal.update();
    //
    //   if (signal.isEnded) {
    //     this.callIfDebug(() =>
    //       console.timeEnd("signal " + signal.particleSystem.uuid)
    //     );
    //     this.signals.splice(this.signals.indexOf(signal), 1);
    //   }
    // });
  }

  private _updateLabels() {
    // if (!this.labels.length) { return; }
    //
    // this.labels.slice().forEach(label => {
    //   label.update();
    // });
  }

  public update() {
    this._updateSignals();
    this._updateLabels();
  }

  public dispose() {
    if (this.signals.length) {
      this.signals.forEach(signal => signal.dispose());
      this.signals = [];
    }

    // this.line.geometry.dispose();
    // this.line.material.dispose();
    // this.line.parent.remove(this.line);
  }
}


