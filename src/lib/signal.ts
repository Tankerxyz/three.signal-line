import THREE from 'three';
import {
  defaultFragmentShader,
  defaultVertexShader,
  particleTextureBase64
} from "../constants";

/**
 * Represents a signal for the signal line.
 * Usage only from a SignalLine class.
 * @constructor
 * @param{SignalOptions} options - The options for signal.
 * @param{THREE.Geometry} lineGeometry - Line Geometry object.
 */
export class Signal {

  public static defaultOptions = {
    color: "#220099",
    speed: 250,
    size: 40,
    backwardMoving: false,
    opacity: 1.0
  };

  public static defaultUniforms = {
    amplitude: { type: "f", value: 1.0 },
    pointColor: { type: "c", value: new THREE.Color(0xffffff) },
    opacity: { type: "f", value: 1.0 },
    texture: {
      value: new THREE.TextureLoader().load(particleTextureBase64)
    }
  }
  private options: any;
  private lineGeometry: any;
  private isEnded: boolean;
  private ticksPerSecond: number;
  private backwardMoving: boolean;
  private lerp: number;
  private index: number;
  public particleSystem: any;
  private geometry: THREE.BufferGeometry;
  private lerpStep: number;


  constructor(options, lineGeometry) {
    this.options = {
      ...Signal.defaultOptions,
      ...options
    };
    this.lineGeometry = lineGeometry;
    this.isEnded = false;
    this.ticksPerSecond = 60;
    this.backwardMoving = !!this.options.backwardMoving;
    this.lerp = 0;

    if (this.backwardMoving) {
      this.index = this.lineGeometry.vertices.length - 1;
    } else {
      this.index = 0;
    }

    this.initParticle();

    this.update = this.update.bind(this);
  }

  public initParticle() {
    const vertexShader = defaultVertexShader;
    const fragmentShader = defaultFragmentShader;
    const uniforms = { ...Signal.defaultUniforms };

    if (this.options.particleTexture) {
      uniforms.texture.value = new THREE.TextureLoader().load(
        this.options.particleTexture
      );
    }
    uniforms.opacity.value = this.options.opacity;

    const shaderMaterial = new THREE.PointsMaterial({
      map: uniforms.texture.value,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      opacity: this.options.opacity,
      size: this.options.size,
      color: new THREE.Color(this.options.color)
    });

    const geometry = new THREE.BufferGeometry();

    const {
      curPoint: { x, y, z }
    } = this.getCurAndNextPoint();
    const { r, g, b } = new THREE.Color(this.options.color);

    const positions = [x, y, z];
    const colors = [r, g, b];
    const sizes = [this.options.size];

    geometry.addAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3).setDynamic(true)
    );
    geometry.addAttribute(
      "customColor",
      new THREE.Float32BufferAttribute(colors, 3)
    );
    geometry.addAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    this.geometry = geometry;
    this.particleSystem = new THREE.Points(geometry, shaderMaterial);

    this.calculateNextLerpStep();
  }

  public getNextIndex() {
    return this.backwardMoving ? this.index - 1 : this.index + 1;
  }

  public getCurAndNextPoint() {
    const vertices = this.lineGeometry.vertices;
    const curPoint = vertices[this.index].clone();
    const nextPoint = vertices[this.getNextIndex()].clone();

    return { curPoint, nextPoint };
  }

  public calculateNextLerpStep() {
    const { curPoint, nextPoint } = this.getCurAndNextPoint();
    const lineLength = curPoint.distanceTo(nextPoint);
    const predictionTime = lineLength / this.options.speed;

    this.lerpStep = 1 / (predictionTime * this.ticksPerSecond);
  }

  public updateCurIndex() {
    if (this.backwardMoving) {
      this.index--;
    } else {
      this.index++;
    }
  }

  public isSignalDone() {
    if (this.backwardMoving) {
      return this.index <= 0;
    } else {
      return this.index > this.lineGeometry.vertices.length - 2;
    }
  }

  public update() {
    if (this.isEnded) { return; }
    const position = this.geometry.attributes.position;

    this.lerp += this.lerpStep;
    if (this.lerp >= 1) {
      this.lerp = 0;
      this.updateCurIndex();

      if (this.isSignalDone()) {
        this.dispose();

        this.isEnded = true;
        return;
      }

      this.calculateNextLerpStep();
    }

    const { curPoint, nextPoint } = this.getCurAndNextPoint();
    const { x, y, z } = curPoint.lerp(nextPoint, this.lerp);
    position.setXYZ(0, x, y, z);

    position.needsUpdate = true;
  }

  public dispose() {
    this.particleSystem.geometry.dispose();
    this.particleSystem.material.dispose();
    this.particleSystem.parent.remove(this.particleSystem);
  }
}
