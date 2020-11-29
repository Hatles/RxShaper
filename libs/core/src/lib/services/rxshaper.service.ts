import {Injectable, Injector, Type} from '@angular/core';
import {BlockInput, BlockOutput, ComponentType} from "../models/component";
import {RxShaperConfig, RxShaperTypes} from "./rxshaper.config";
import {RxShaperExtension} from "../models/extension";
import {RxShaperExtensionNormalized, RxShaperExtensionOption} from "../models/options";
import {sort} from "../utils/sort";
import {RxShaperHook} from "../models/hook";

@Injectable()
export class RxShaperService {
  // todo: remove static definition of component from decorators from here
  static OutputsStore: { class: Type<any>, outputs: BlockOutput[] }[] = [];
  static InputsStore: { class: Type<any>, inputs: BlockInput[] }[] = [];
  static Components: ComponentType[] = [];
  static HooksStore: { class: Type<any>, hooks: RxShaperHook[] }[] = [];
  static Extensions: RxShaperExtension[] = [];
  static getExtension(type: any): RxShaperExtension {
    return this.Extensions.find(e => e.class === type);
  }

  extensions: RxShaperExtensionOption[];
  normalizedExtensions: RxShaperExtensionNormalized[];

  constructor(public config: RxShaperConfig, private injector: Injector) {
    this.extensions = sort(this.config.extensions, e => e.priority);
  }

  private normalizeExtensions() {
    if (!this.normalizedExtensions) {
      this.normalizedExtensions = this.extensions.map(e => this.normalizeExtension(e));
    }
  }

  private normalizeExtension(extension: RxShaperExtensionOption): RxShaperExtensionNormalized {
    let normalizedExtension: RxShaperExtensionNormalized = {
      name: null,
      hooks: null,
    };
    if(extension instanceof Type) {
      const extensionDef = RxShaperService.getExtension(extension);
      normalizedExtension.extension = extensionDef;
      normalizedExtension.name = extensionDef.name;
      normalizedExtension.priority = extensionDef.priority;
      normalizedExtension.type = extension;
    }
    else {
      normalizedExtension = {
        ...normalizedExtension,
        ...extension
      };
    }
    if (!normalizedExtension.extension) {
      normalizedExtension.extension = RxShaperService.getExtension(normalizedExtension.type);
    }
    if (!normalizedExtension.instance) {
      normalizedExtension.instance = this.buildExtensionInstance(normalizedExtension);
    }

    normalizedExtension.hooks = this.normalizeHooks(normalizedExtension.extension.hooks);

    return normalizedExtension;
  }

  private normalizeHooks(hooks: RxShaperHook[]) : {[key:string]: RxShaperHook[]} {
    const normalizedHooks = hooks.reduce((acc, h) => {
      return {...acc, [h.name]: [...(acc[h.name] || []), h]};
    }, {} as {[key:string]: RxShaperHook[]});

    Object.keys(normalizedHooks).forEach(hookName => {
      normalizedHooks[hookName] = sort(normalizedHooks[hookName], h => h.priority);
    });

    return normalizedHooks;
  }

  private buildExtensionInstance(extension: RxShaperExtensionOption): any {
    return this.injector.get(extension.type);
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

  triggerHook(hook: string, ...args: any[]) {
    console.log('Trigger hook:', hook);
    this.normalizeExtensions();
    this.normalizedExtensions.forEach(e => this.triggerExtensionHook(hook, e, args));
  }

  private triggerExtensionHook(hook: string, extension: RxShaperExtensionNormalized, args: any[]) {
    console.log('Run extension hooks:', extension.name);
    extension.extension.hooks.filter(h => h.name === hook).forEach(h => {
      console.log('Run extension hook:', h.target);
      extension.instance[h.target](...args);
    });
  }
}
