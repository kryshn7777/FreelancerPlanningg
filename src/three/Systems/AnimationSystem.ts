export class AnimationSystem {
  private updatables: any[] = [];

  constructor() {}

  public register(object: any) {
    if (object.update) {
      this.updatables.push(object);
    }
  }

  public unregister(object: any) {
    this.updatables = this.updatables.filter(u => u !== object);
  }

  public update(deltaTime: number, elapsedTime: number) {
    for (const object of this.updatables) {
      object.update(deltaTime, elapsedTime);
    }
  }
}
