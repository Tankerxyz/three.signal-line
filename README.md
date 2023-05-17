----
[![NPM version](https://img.shields.io/npm/v/typescript-starter.svg)](https://www.npmjs.com/package/three.signal-line)
[![Codecov](https://img.shields.io/codecov/c/github/tankerxyz/three.signal-line.svg)](https://codecov.io/gh/tankerxyz/three.signal-line)
[![CircleCI](https://img.shields.io/circleci/project/github/Tankerxyz/three.signal-line/master.svg)](https://circleci.com/gh/Tankerxyz/three.signal-line/tree/master)
[![GitHub stars](https://img.shields.io/github/stars/tankerxyz/three.signal-line.svg?style=social&logo=github&label=Stars)](https://github.com/tankerxyz/three.signal-line)

# Three.Signal-Line

[Three.Signal-Line](https://github.com/Tankerxyz/three.signal-line) is a JavaScript package that provides a signal line component for the popular 3D rendering library, Three.js. It allows you to create animated signal lines in your Three.js scenes with customizable colors, speeds, sizes, and more.

## Features

- **Animated Signal Lines**: Create visually appealing animated signal lines in your Three.js scenes.
- **Customizable Options**: Control the appearance and behavior of signal lines with customizable options such as color, speed, size, opacity, and texture.
- **Backward Movement**: Choose whether the signal lines move forward or backward along their paths.
- **Texture Support**: Apply textures to signal lines for enhanced visual effects.
- **Smooth Animation**: Signal lines smoothly transition between points, creating fluid animations.
- **Easy Integration**: The package integrates seamlessly with Three.js, making it easy to incorporate signal lines into your existing Three.js projects.

## The package also have nice some things:

* Backwards compatibility for Node.js-style (CommonJS) imports
* Both strict and flexible [typescript configurations](config/tsconfig.json) available
* Collocated, atomic, concurrent unit tests with [AVA](https://github.com/avajs/ava)
* Source-mapped code coverage reports with [nyc](https://github.com/istanbuljs/nyc)
* Configurable code coverage testing (for continuous integration)
* Automatic linting and formatting using [TSLint](https://github.com/palantir/tslint) and [Prettier](https://prettier.io/)
* Automatically check for known vulnerabilities in your dependencies with [`nsp`](https://github.com/nodesecurity/nsp)


## Installation

You can install Three.Signal-Line via npm or yarn:

```bash
npm install three.signal-line
```

or

```bash
yarn add three.signal-line
```

## Usage

To use Three.Signal-Line, you need to have Three.js already set up in your project. Once you have imported the required dependencies, you can create a signal line by providing the necessary options and a line geometry:

```javascript
import * as THREE from 'three';
import { SignalLine } from 'three.signal-line';

// Create a line geometry for the signal line
const lineGeometry = new THREE.Geometry();
lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
lineGeometry.vertices.push(new THREE.Vector3(100, 0, 0));

// Define the options for the signal line
const options = {
  color: '#ff0000',
  speed: 200,
  size: 30,
  backwardMoving: false,
  opacity: 0.5,
  particleTexture: 'path/to/texture.png',
};

// Create a new signal line
const signal = new SignalLine(options, lineGeometry);

// Add the signal line to your Three.js scene
scene.add(signal.particleSystem);
```

You can update the signal line's position by calling the `update` method in your animation loop:

```javascript
function animate() {
  requestAnimationFrame(animate);

  // Update the position of the signal line
  signal.update();

  // Render the scene
  renderer.render(scene, camera);
}
```

## Documentation
You can find the full documentation on the [website](https://tankerxyz.github.io/three.signal-line).


## Examples
You can see full example in this [demo](https://j36nl7zoow.csb.app/).

![Example](./example.gif)

or you can try to send it by yourself in another simple [demo](https://jp0zq82rry.csb.app/).

## Conclusion

With Three.Signal-Line, you can easily create animated signal lines to enhance the visual experience of your Three.js scenes. Whether you need to visualize data flows, create special effects, or add dynamic elements to your 3D environments, Three.Signal-Line provides a flexible and customizable solution. Explore the package documentation and examples to unleash your creativity and bring your Three.js projects to life with stunning signal lines.
