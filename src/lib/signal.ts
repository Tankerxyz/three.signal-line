import THREE from 'three';
import {
  defaultFragmentShader,
  defaultVertexShader,
  particleTextureBase64
} from "../constants";

/**
 * Options for the Signal class.
 */
export interface SignalOptions {
  color: string;
  speed: number;
  size: number;
  backwardMoving: boolean;
  opacity: number;
  particleTexture?: string;
}

export interface SignalUniforms {
  amplitude: { type: 'f'; value: number };
  pointColor: { type: 'c'; value: THREE.Color };
  opacity: { type: 'f'; value: number };
  texture: { value: THREE.Texture };
}

/**
 * Represents a signal in a three.js scene.
 */
export class Signal {
  /**
   * Default options for the Signal class.
   */
  private static defaultOptions: SignalOptions = {
    color: "#220099",
    speed: 250,
    size: 40,
    backwardMoving: false,
    opacity: 1.0,
  };

  /**
   * Default uniforms for the Signal class.
   */
  private static defaultUniforms: SignalUniforms = {
    amplitude: { type: "f", value: 1.0 },
    pointColor: { type: "c", value: new THREE.Color(0xffffff) },
    opacity: { type: "f", value: 1.0 },
    texture: {
      value: new THREE.TextureLoader().load(particleTextureBase64)
    }
  };

  private options: SignalOptions;
  private lineGeometry: THREE.Geometry;
  private geometry: THREE.BufferGeometry;

  private ticksPerSecond: number;
  private backwardMoving: boolean;
  private lerp: number;
  private index: number;
  private lerpStep: number;

  public particleSystem: THREE.Points;
  public isEnded: boolean;

  /**
   * Creates a new Signal instance.
   * @param options - The options for the Signal.
   * @param lineGeometry - The line geometry for the Signal.
   */
  constructor(options: SignalOptions, lineGeometry: any) {
    this.options = { ...Signal.defaultOptions, ...options };
    this.lineGeometry = lineGeometry;
    this.isEnded = false;
    this.ticksPerSecond = 60;
    this.backwardMoving = this.options.backwardMoving;
    this.lerp = 0;
    this.index = this.backwardMoving
      ? this.lineGeometry.vertices.length - 1
      : 0;

    this.initParticle();
    this.update = this.update.bind(this);
  }

  /**
   * Initializes the particle system.
   */
  private initParticle() {
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
      color: new THREE.Color(this.options.color),
    });

    const geometry = new THREE.BufferGeometry();
    const { curPoint, r, g, b } = this.getCurPointAndColor();

    const positions = [curPoint.x, curPoint.y, curPoint.z];
    const colors = [r, g, b];
    const sizes = [this.options.size];

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3).setDynamic(true)
    );
    geometry.setAttribute(
      "customColor",
      new THREE.Float32BufferAttribute(colors, 3)
    );
    geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1)
    );

    this.geometry = geometry;
    this.particleSystem = new THREE.Points(geometry, shaderMaterial);

    this.calculateNextLerpStep();
  }

  /**
   * Gets the current and next point of the line geometry.
   * @returns An object containing the current and next points.
   */
  private getCurPointAndColor() {
    const vertices = this.lineGeometry.vertices;
    const curPoint = vertices[this.index].clone();
    const nextPoint = vertices[this.getNextIndex()].clone();
    const { r, g, b } = new THREE.Color(this.options.color);

    return { curPoint, nextPoint, r, g, b };
  }

  /**
   * Calculates the next Lerp step between the current and next points.
   */
  private calculateNextLerpStep() {
    const { curPoint, nextPoint } = this.getCurPointAndColor();
    const lineLength = curPoint.distanceTo(nextPoint);
    const predictionTime = lineLength / this.options.speed;

    this.lerpStep = 1 / (predictionTime * this.ticksPerSecond);
  }

  /**
   * Gets the next index in the sequence.
   * @returns The next index.
   */
  private getNextIndex(): number {
    return this.backwardMoving ? this.index - 1 : this.index + 1;
  }

  /**
   * Updates the current index based on the direction of movement.
   */
  private updateCurIndex() {
    if (this.backwardMoving) {
      this.index--;
    } else {
      this.index++;
    }
  }

  /**
   * Checks if the signal is done moving.
   * @returns True if the signal is done moving, false otherwise.
   */
  private isSignalDone() {
    if (this.backwardMoving) {
      return this.index <= 0;
    } else {
      return this.index > this.lineGeometry.vertices.length - 2;
    }
  }

  /**
   * Updates the position of the object based on the current state of the animation.
   * If the animation has ended, this method disposes of the object and sets the isEnded flag to true.
   */
  public update() {
    if (this.isEnded) {
      return;
    }

    const position = this.geometry.getAttribute("position") as THREE.BufferAttribute;

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

    const { curPoint, nextPoint } = this.getCurPointAndColor();
    const { x, y, z } = curPoint.lerp(nextPoint, this.lerp);

    position.setXYZ(0, x, y, z);
    position.needsUpdate = true;
  }

  /**
   * Disposes of the particle system and its associated resources.
   */
  public dispose() {
    this.particleSystem.geometry.dispose();
    this.particleSystem.material.dispose();
    this.particleSystem.parent.remove(this.particleSystem);
  }
}

