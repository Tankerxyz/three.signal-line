import THREE from 'three';

import { LINE_TYPE, POSITION } from "../constants";

/**
 * The options for the Label constructor
 */
export interface LabelOptions {
  textOptions: {
    color: string;
    text: string;
    size: number;
    _3d: boolean;
  };
  lineType: LINE_TYPE;
  positionOffsetY: number;
  rotationOffsetY: number | null;
  camera: THREE.Camera | null;
  position: POSITION;
}

/**
 * Represents a Label for @{SignalLine}.
 * Usage only from a SignalLine class.
 */
export class Label {

  /**
   * Default options for the Label constructor
   */
  public static defaultOptions: LabelOptions = {
    textOptions: {
      color: "red",
      text: "label",
      size: 5,
      _3d: false
    },
    lineType: LINE_TYPE.NORMAL,
    positionOffsetY: 2,
    rotationOffsetY: null, // float
    camera: null, // THREE.Camera
    position: POSITION.CENTER
  }

  /**
   * The line geometry object
   */
  private lineGeometry: THREE.Geometry;

  /**
   * The label options
   */
  private options: LabelOptions;

  /**
   * The DText object for the label
   */
  public text: THREE.DText;

  /**
   * Creates a new Label object
   * @param options - The options for the label
   * @param lineGeometry - The line geometry object
   */
  constructor(options: LabelOptions, lineGeometry: THREE.Geometry) {
    this.options = {
      ...Label.defaultOptions,
      ...options,
      textOptions: {
        ...Label.defaultOptions.textOptions,
        ...options.textOptions
      }
    };

    this.lineGeometry = lineGeometry;
    this.initLabel();

    this.update = this.update.bind(this);
  }

  /**
   * Initializes the label object
   */
  public initLabel(): void {
    const vertices = this.lineGeometry.vertices;
    let pointA;
    let pointB;

    this.text = new THREE.DText({
      material: new THREE.MeshBasicMaterial({
        color: this.options.textOptions.color,
        side: THREE.DoubleSide
      }),
      ...this.options.textOptions
    });

    switch (this.options.position) {
      case POSITION.START:
        pointA = vertices[0].clone();
        pointB = vertices[1].clone();
        break;
      case POSITION.CENTER:
        this.lineGeometry.computeBoundingBox();
        pointA = this.lineGeometry.boundingBox.getCenter(new THREE.Vector3());
        pointB = vertices[vertices.length - 1].clone();
        break;
      case POSITION.END:
        pointA = vertices[vertices.length - 2].clone();
        pointB = vertices[vertices.length - 1].clone();
        break;
    }

    if (this.options.lineType === LINE_TYPE.CURVE) {
      // todo
      pointB = this.lineGeometry.vertices[
      this.lineGeometry.vertices.length - 1
        ].clone();
    }

    const up = new THREE.Vector3(1, 0, 0);
    const axis = new THREE.Vector3();
    const spline = new THREE.CatmullRomCurve3([pointA, pointB]);
    const tangent = spline.getTangent(0).normalize();
    const radians = Math.acos(up.dot(tangent));
    const posPoint = this.getLabelPositionPoint();

    axis.crossVectors(up, tangent).normalize();

    this.text.position.set(posPoint.x, posPoint.y, posPoint.z);
    this.text.rotation.y = radians;

    this.recenter();
  }

  /**
   * Returns the position point of the label
   * @returns The position point of the label
   */
  public getLabelPositionPoint(): THREE.Vector3 {
    const vertices = this.lineGeometry.vertices;

    switch (this.options.position) {
      case POSITION.START:
        return vertices[0].clone();
      case POSITION.CENTER:
        return {
          ...this.lineGeometry.boundingBox.getCenter(new THREE.Vector3()),
          y: this.lineGeometry.boundingBox.max.y
        };
      case POSITION.END:
        return vertices[vertices.length - 1].clone();
    }
  }

  /**
   * Recenters the label position
   */
  private recenter(): void {
    const posPoint = this.getLabelPositionPoint();
    const boxV = new THREE.Vector3();
    const halfBoxHeight =
      new THREE.Box3().setFromObject(this.text).getSize(boxV).y / 2;

    this.text.geometry.computeBoundingBox();
    this.text.geometry.center();
    this.text.position.y =
      posPoint.y + halfBoxHeight + this.options.positionOffsetY;

    if (this.options.rotationOffsetY) {
      this.text.rotation.y += this.options.rotationOffsetY;
    }
  }

  /**
   * Sets the font for the label
   * @param font - The font to be set
   */
  public setFont(font: any): void {
    this.text.setFont(font);
    this.recenter();
  }

  /**
   * Sets the text for the label
   * @param text - The text to be set
   */
  public setText(text: string): void {
    this.text.setText(text);
    this.recenter();
  }

  /**
   * Sets the size for the label
   * @param size - The size to be set
   */
  public setSize(size: number): void {
    this.text.setSize(size);
    this.recenter();
  }

  /**
   * Disposes the label object
   */
  public dispose(): void {
    this.text.geometry.dispose();
    this.text.material.dispose();
    this.text.parent.remove(this.text);
  }

  /**
   * Updates the label object
   */
  public update(): void {
    if (this.options.camera) {
      this.text.lookAt(this.options.camera.position);
    }
  }
}
