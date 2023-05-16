import THREE from 'three';
import { MeshLine, MeshLineMaterial } from "three.meshline";
import { LINE_TYPE } from "../constants";
import { Label } from "./label";
import { Signal } from "./signal";


/**
 * Represents a Signal Line.
 * @constructor
 * @param{SignalLineOptions} options - The options for signalLine.
 * @param{THREE.Scene} scene - Three.js Scene object.
 */
export default class SignalLine {
  public static defaultOptions = {
    linePath: [],
    lineType: LINE_TYPE.NORMAL,
    materialOptions: {
      color: 0xffffff,
      opacity: 1.0,
      blending: THREE.NormalBlending,
      transparent: true,
      depthWrite: true,
      lineWidth: 2
    },
    isDebug: false
  }
  private readonly options;

  private scene: any;

  private labels;

  private signals;
  private lineGeometry: THREE.Geometry;
  private line: THREE.Mesh;

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
    this.createLine();

    this.callIfDebug(() => {
      console.log("SignalLine: ", this);
    });

    this.update = this.update.bind(this);
  }

  /**
   * Calculates Vertices in the line and returns the number of length
   *
   * ### Example (es module)
   * ```js
   * import SignalLine from '@tankerxyz/SignalLine'
   * console.log(SignalLine.getLineLength());
   * // => 8
   * ```
   *
   * ### Example (commonjs)
   * ```js
   * var SignalLine = require('@tankerxyz/SignalLine');
   * console.log(SignalLine.getLineLength());
   * // => 8
   * ```
   *
   * @returns       Returns the length of vertices geometry from line.
   * @anotherNote   uses for condition for calculating.
   */
  public getLineLength(): number {
    let sum = 0;
    const vertices = this.lineGeometry.vertices;

    for (let i = 0; i < vertices.length - 1; ++i) {
      const curPoint = vertices[i];
      const nextPoint = vertices[i + 1];

      sum += curPoint.distanceTo(nextPoint);
    }

    return sum;
  }

  public addLabel(labelOptions = {}) {
    const label = new Label(
      {
        ...labelOptions,
        lineType: this.options.lineType
      },
      this.lineGeometry
    );
    this.labels.push(label);

    this.line.add(label.text);

    return label;
  }

  // index or instance
  public removeLabel(label) {
    let index;
    if (label instanceof Label) {
      index = this.labels.indexOf(label);
    } else if (typeof index === "number") {
      index = label;
    } else {
      throw new Error('You must to pass "number" or instance of "Label"');
    }

    this.labels[index].dispose();
    this.labels.splice(index, 1);
  }

  public callIfDebug(callback): void {
    this.options.isDebug && callback();
  }

  /**
   * using from out to sending signals handling by code.
   * Usage only from a SignalLine class.
   * @param{SignalOptions} options - The options for signal.
   * @returns
   */
  public send(options): void {
    const signal = new Signal(options, this.lineGeometry);
    this.signals.push(signal);

    this.callIfDebug(() =>
      console.time("signal " + signal.particleSystem.uuid)
    );

    this.scene.add(signal.particleSystem);
  }

  public update(): void {
    this.updateSignals();
    this.updateLabels();
  }

  private updateLabels(): void {
    if (!this.labels.length) { return; }

    this.labels.slice().forEach(label => {
      label.update();
    });
  }

  /**
   * Destructuring for line and all depends from it variables
   *
   * ### Example (es module)
   * ```js
   * import SignalLine from '@tankerxyz/SignalLine'
   * SignalLine.dispose();
   * // => disposing is done;
   * ```
   *
   * ### Example (commonjs)
   * ```js
   * var SignalLine = require('@tankerxyz/SignalLine');
   * SignalLine.dispose();
   * // => disposing is done;
   * ```
   *
   * @returns       Returns the length of vertices geometry from line.
   * @anotherNote   uses for condition for calculating.
   */
  public dispose(): void {
    if (this.signals.length) {
      this.signals.forEach(signal => signal.dispose());
      this.signals = [];
    }

    this.line.geometry.dispose();
    this.line.material.dispose();
    this.line.parent.remove(this.line);
  }

  private createLine() {
    this.lineGeometry = new THREE.Geometry();

    let points = this.options.linePath;
    if (this.options.lineType === LINE_TYPE.CURVE) {
      if (this.options.linePath.length !== 3) {
        throw new Error(
          "linePath .length must be 3 (1 - startPoint, 2 - midPoint, 3 - endPoint)"
        );
      }

      const curvePoints = new THREE.CatmullRomCurve3(
        this.options.linePath
      ).getPoints(3);
      points = new THREE.CubicBezierCurve3(...curvePoints).getPoints(50);
    }

    this.lineGeometry.vertices.push(...points);

    const meshLine = new MeshLine();
    meshLine.setGeometry(this.lineGeometry, () => 1);

    const meshLineMaterial = new MeshLineMaterial({
      color: new THREE.Color(this.options.materialOptions.color),
      // @todo pass the resolution
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      opacity: this.options.materialOptions.opacity,
      lineWidth: this.options.materialOptions.lineWidth,
      transparent: true,
      depthTest: true,
      blending: THREE.NormalBlending,
      sizeAttenuation: true
    });

    this.line = new THREE.Mesh(meshLine.geometry, meshLineMaterial);
    this.line.renderDepth = false;

    this.scene.add(this.line);

    // @todo add labels as an options param array and call the addLabel method
  }

  private updateSignals(): void {
    if (!this.signals.length) { return; }

    this.signals.slice().forEach(signal => {
      signal.update();

      if (signal.isEnded) {
        this.callIfDebug(() =>
          console.timeEnd("signal " + signal.particleSystem.uuid)
        );
        this.signals.splice(this.signals.indexOf(signal), 1);
      }
    });
  }
}
