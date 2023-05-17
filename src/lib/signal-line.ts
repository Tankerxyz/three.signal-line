import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { LINE_TYPE } from '../constants';
import {Label, LabelOptions} from './label';
import {Signal, SignalOptions} from './signal';

/**
 * The options for a SignalLine.
 */
interface SignalLineOptions {
  linePath: THREE.Vector3[];
  lineType: LINE_TYPE;
  materialOptions: {
    color: number;
    opacity: number;
    blending: THREE.Blending;
    transparent: boolean;
    depthWrite: boolean;
    lineWidth: number;
  };
  isDebug: boolean;
}

/**
 * Represents a signal line in a three.js scene.
 */
export default class SignalLine {
  /**
   * The default options for a SignalLine.
   */
  public static defaultOptions: SignalLineOptions = {
    linePath: [],
    lineType: LINE_TYPE.NORMAL,
    materialOptions: {
      color: 0xffffff,
      opacity: 1.0,
      blending: THREE.NormalBlending,
      transparent: true,
      depthWrite: true,
      lineWidth: 2,
    },
    isDebug: false,
  };

  private readonly options: SignalLineOptions;
  private scene: THREE.Scene;
  private labels: Label[];
  private signals: Signal[];
  private lineGeometry: THREE.Geometry;
  private line: THREE.Mesh;

  /**
   * Creates a new instance of SignalLine.
   * @param options - The options for the SignalLine.
   * @param scene - The three.js scene to which the SignalLine belongs.
   */
  constructor(options: SignalLineOptions, scene: THREE.Scene) {
    this.options = {
      ...SignalLine.defaultOptions,
      ...options,
      materialOptions: {
        ...SignalLine.defaultOptions.materialOptions,
        ...options.materialOptions,
      },
    };

    if (this.options.linePath.length < 2) {
      throw new Error('linePath length must be greater than 2');
    }

    this.scene = scene;
    this.labels = [];
    this.signals = [];
    this.createLine();

    this.callIfDebug(() => {
      console.log('SignalLine: ', this);
    });

    this.update = this.update.bind(this);
  }

  /**
   * Gets the total length of the signal line.
   * @returns The length of the signal line.
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

  /**
   * Adds a label to the signal line.
   * @param labelOptions - The options for the label.
   * @returns The created label.
   */
  public addLabel(labelOptions: LabelOptions): Label {
    const label = new Label(
      {
        ...labelOptions,
        lineType: this.options.lineType,
      },
      this.lineGeometry
    );
    this.labels.push(label);

    this.line.add(label.text);

    return label;
  }

  /**
   * Removes a label from the signal line.
   * @param label - The label to remove. Can be an index or an instance of Label.
   */
  public removeLabel(label: number | Label): void {
    let index: number;
    if (label instanceof Label) {
      index = this.labels.indexOf(label);
    } else if (typeof label === 'number') {
      index = label;
    } else {
      throw new Error('You must pass a "number" or an instance of "Label"');
    }

    this.labels[index].dispose();
    this.labels.splice(index, 1);
  }

  /**
   * Calls a callback function if the isDebug option is enabled.
   * @param callback - The callback function to call.
   */
  public callIfDebug(callback: () => void): void {
    if (this.options.isDebug) {
      callback();
    }
  }

  /**
   * Sends a signal along the signal line.
   * @param options - The options for the signal.
   */
  public send(options: SignalOptions): void {
    const signal = new Signal(options, this.lineGeometry);
    this.signals.push(signal);

    this.callIfDebug(() => console.time('signal ' + signal.particleSystem.uuid));

    this.scene.add(signal.particleSystem);
  }

  /**
   * Updates the signal line and its components.
   */
  public update(): void {
    this.updateSignals();
    this.updateLabels();
  }

  /**
   * Disposes the signal line and its components.
   */
  public dispose(): void {
    if (this.signals.length) {
      this.signals.forEach((signal) => signal.dispose());
      this.signals = [];
    }

    this.line.geometry.dispose();
    this.line.material.dispose();
    this.line.parent.remove(this.line);
  }

  private createLine(): void {
    this.lineGeometry = new THREE.Geometry();

    let points = this.options.linePath;
    if (this.options.lineType === LINE_TYPE.CURVE) {
      if (this.options.linePath.length !== 3) {
        throw new Error(
          'linePath length must be 3 (1 - startPoint, 2 - midPoint, 3 - endPoint)'
        );
      }

      const curvePoints = new THREE.CatmullRomCurve3(this.options.linePath).getPoints(3);
      points = new THREE.CubicBezierCurve3(...curvePoints).getPoints(50);
    }

    this.lineGeometry.vertices.push(...points);

    const meshLine = new MeshLine();
    meshLine.setGeometry(this.lineGeometry, () => 1);

    const meshLineMaterial = new MeshLineMaterial({
      color: new THREE.Color(this.options.materialOptions.color),
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      opacity: this.options.materialOptions.opacity,
      lineWidth: this.options.materialOptions.lineWidth,
      transparent: true,
      depthTest: true,
      blending: THREE.NormalBlending,
      sizeAttenuation: true,
    });

    this.line = new THREE.Mesh(meshLine.geometry, meshLineMaterial);
    this.line.renderDepth = false;

    this.scene.add(this.line);
  }

  private updateSignals(): void {
    if (!this.signals.length) {
      return;
    }

    this.signals.slice().forEach((signal) => {
      signal.update();

      if (signal.isEnded) {
        this.callIfDebug(() => console.timeEnd('signal ' + signal.particleSystem.uuid));
        this.signals.splice(this.signals.indexOf(signal), 1);
      }
    });
  }

  private updateLabels(): void {
    if (!this.labels.length) {
      return;
    }

    this.labels.slice().forEach((label) => {
      label.update();
    });
  }
}
