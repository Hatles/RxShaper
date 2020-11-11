import {Injectable, Type} from '@angular/core';
import {BlockInput, BlockOutput, ComponentType} from "./component";
import {RxShaperConfig, RxShaperTypes} from "./rxshaper.config";
import {RxShaperExtension, RxShaperExtensionFunction} from "../extensions/extension";
import {RxShaperExtensionOption} from "./rxshaper.options";
import {sort} from "../utils/sort";

@Injectable()
export class RxShaperService {
  // todo: remove static definition of component from decorators from here
  static OutputsStore: { class: Type<any>, outputs: BlockOutput[] }[] = [];
  static InputsStore: { class: Type<any>, inputs: BlockInput[] }[] = [];
  static Components: ComponentType[] = [];

  extensions: RxShaperExtensionOption[];

  constructor(public config: RxShaperConfig) {
    this.extensions = sort(this.config.extensions, e => e.priority);
  }

  public getComponentTypes(): RxShaperTypes {
    return this.config.types;
  }
  public getComponentType(name: string): ComponentType {
    if (!this.config.types[name]) {
      throw new Error(
        `[RxShaper Error] The type "${name}" could not be found. Please make sure that is registered through the RxShaperModule declaration.`,
      );
    }
    return this.config.types[name];
  }

  public getExtensions(): RxShaperExtensionOption[] {
    return this.config.extensions;
  }
  public getExtension(name: string): RxShaperExtension {
    const extension = this.config.extensions.find(e => e.name === name);
    if (!extension) {
      throw new Error(
        `[RxShaper Error] The extension "${name}" could not be found. Please make sure that is registered through the RxShaperModule declaration.`,
      );
    }
    return extension.extension;
  }
}
