import THREE from 'three';

import { LINE_TYPE, POSITION } from "../constants";


/**
 * Represents a Label for @{SignalLine}.
 * Usage only from a SignalLine class.
 * @constructor
 * @param{LabelOptions} options - The options for line.
 * @param{THREE.Geometry} lineGeometry - Line Geometry object.
 */
export class Label {

  public static defaultOptions = {
    textOptions: {
      color: "red",
      text: "label",
      size: 5,
      _3d: false
    },
    positionOffsetY: 2,
    rotationOffsetY: null, // float
    camera: null, // THREE.Camera
    position: POSITION.CENTER
  }

  private lineGeometry: any;
  private options: any;
  public text: THREE.DText;

  constructor(options, lineGeometry) {
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

  public initLabel() {
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

  public getLabelPositionPoint() {
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

  private recenter() {
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

  public setFont(font) {
    this.text.setFont(font);
    this.recenter();
  }

  public setText(text) {
    this.text.setText(text);
    this.recenter();
  }

  public setSize(size) {
    this.text.setSize(size);
    this.recenter();
  }

  public dispose() {
    this.text.geometry.dispose();
    this.text.material.dispose();
    this.text.parent.remove(this.text);
  }

  public update() {
    if (this.options.camera) {
      this.text.lookAt(this.options.camera.position);
    }
  }
}
