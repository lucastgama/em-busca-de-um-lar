import * as THREE from "three";
import { KeyDisplay } from "./utils";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CharacterControls } from "./characterControls";

let camera, scene, renderer;
const clock = new THREE.Clock();

let characterControls;
const keysPressed = {};

let mixer;

init();
animate();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0.1, 3, 4.5);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa8def0);
  scene.fog = new THREE.Fog(0xa0a0a0, 30, 2000);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-60, 100, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 50;
  dirLight.shadow.camera.bottom = -50;
  dirLight.shadow.camera.left = -50;
  dirLight.shadow.camera.right = 50;
  dirLight.shadow.camera.near = 0.8;
  dirLight.shadow.camera.far = 20;
  dirLight.shadow.mapSize.width = 40;
  dirLight.shadow.mapSize.height = 40;
  scene.add(dirLight);

  scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

  // ground
  // const mesh = new THREE.Mesh(
  //   new THREE.PlaneGeometry(120, 120,512,512),
  //   new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  // );
  // mesh.rotation.x = -Math.PI / 2;
  // mesh.receiveShadow = true;
  // scene.add(mesh);

  // const grid = new THREE.GridHelper(120, 120, 0x000000, 0x000000);
  // grid.material.opacity = 0.2;
  // grid.material.transparent = true;
  // scene.add(grid);

  const loader = new GLTFLoader();
  loader.load(
    "models/Soldier.glb",
    function (gltf) {
      const model = gltf.scene;
      model.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;
      });
      scene.add(model);

      const gltfAnimations = gltf.animations;
      const mixer = new THREE.AnimationMixer(model);
      const animationsMap = new Map();
      gltfAnimations
        .filter((a) => a.name != "TPose")
        .forEach((a) => {
          animationsMap.set(a.name, mixer.clipAction(a));
        });

      characterControls = new CharacterControls(
        model,
        mixer,
        animationsMap,
        controls,
        camera,
        "Idle"
      );
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.log("An error happened");
    }
  );

  //city
  loader.load(
    "models/cityChao.glb",
    function (gltf) {
      const city = gltf.scene;
      city.traverse(function (object) {
        if (object.isMesh) {
          object.receiveShadow = true;
          object.castShadow = true;
        }
      });
      city.receiveShadow = true;
      city.castShadow = true;
      city.position.set(0, 0, 0);
      scene.add(city);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.log("An error happened");
    }
  );

  // CONTROL KEYS
  const keyDisplayQueue = new KeyDisplay();
  document.addEventListener(
    "keydown",
    (event) => {
      keyDisplayQueue.down(event.key);
      if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle();
      } else {
        keysPressed[event.key.toLowerCase()] = true;
      }
    },
    false
  );
  document.addEventListener(
    "keyup",
    (event) => {
      keyDisplayQueue.up(event.key);
      keysPressed[event.key.toLowerCase()] = false;
    },
    false
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.5, 0);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (characterControls) {
    characterControls.update(delta, keysPressed);
  }

  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}
