import { Injectable } from '@angular/core';
import {components, ComponentType} from "../decorators/block.decorator";

@Injectable()
export class BuilderifyService {
  private get components(): ComponentType[] {
    return components;
  }

  public getComponentTypes(): ComponentType[] {
    return this.components;
  }
  public getComponentType(name: string): ComponentType {
    return this.components.find(c => c.name === name);
  }
}
