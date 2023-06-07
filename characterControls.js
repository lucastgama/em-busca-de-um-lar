export class CharacterControls {
  model;
  mixer;
  animationsMap;
  orbitControl;
  camera;

  //state
  toggleRun = true;
  currentAction;

  constructor(
    model,
    mixer,
    animationsMap,
    orbitControl,
    camera,
    currentAction
  ) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.currentAction = currentAction;
    this.animationsMap.forEach((value, key) => {
      if (key == currentAction) {
        value.play();
      }
    });
    this.orbitControl = orbitControl;
    this.camera = camera;
  }

  switchRunToggle() {
    this.toggleRun = !this.toggleRun;
  }

  update(delta, keypress) {
    this.mixer.update(delta);
  }
}
