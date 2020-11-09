import {Injectable, Type} from '@angular/core';
import {BlockInput, BlockOutput, ComponentType} from "./component";

@Injectable()
export class RxShaperService {
  static OutputsStore: { class: Type<any>, outputs: BlockOutput[] }[] = [];
  static InputsStore: { class: Type<any>, inputs: BlockInput[] }[] = [];

  static Components: ComponentType[] = [];

  private get components(): ComponentType[] {
    return RxShaperService.Components;
  }

  public getComponentTypes(): ComponentType[] {
    return this.components;
  }
  public getComponentType(name: string): ComponentType {
    return this.components.find(c => c.name === name);
  }
}
