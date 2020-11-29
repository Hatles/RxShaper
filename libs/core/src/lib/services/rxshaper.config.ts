import {ComponentType} from "../models/component";
import {RXSHAPER_OPTIONS, RxShaperExtensionOption, RxShaperOptions, RxShaperWrapperOption} from "../models/options";
import {Inject, Injectable, Optional, SkipSelf} from "@angular/core";

export type RxShaperTypes = { [name: string]: ComponentType };

@Injectable()
export class RxShaperConfig {

  types: RxShaperTypes = {};
  extensions: RxShaperExtensionOption[] = [];
  wrappers: RxShaperWrapperOption[] = [];

  constructor(@Optional() @SkipSelf() private parent: RxShaperConfig, @Inject(RXSHAPER_OPTIONS) options: RxShaperOptions[]) {
    options.forEach((o) => this.addOptions(o));
  }

  addOptions(options: RxShaperOptions) {
    if (options.types)
    {
      this.addTypes(options.types);
    }
    if (options.extensions)
    {
      this.addExtensions(options.extensions);
    }
    if (options.wrappers)
    {
      this.addWrappers(options.wrappers);
    }
  }

  addTypes(types: ComponentType[]) {
    types.forEach((t) => this.addType(t));
  }

  addType(type: ComponentType) {
    this.types[type.name] = type;
  }

  addExtensions(extensions: RxShaperExtensionOption[]) {
    extensions.forEach((t) => this.addExtension(t));
  }

  addExtension(extension: RxShaperExtensionOption) {
    const current = this.extensions.find(e => e.name === extension.name);

    if (current) {
      this.extensions.splice(this.extensions.indexOf(current), 1, extension);
    }
    else {
      this.extensions.push(extension);
    }
  }

  addWrappers(wrappers: RxShaperWrapperOption[]) {
    wrappers.forEach((t) => this.addWrapper(t));
  }

  addWrapper(wrapper: RxShaperWrapperOption) {
    const current = this.wrappers.find(e => e.name === wrapper.name);

    if (current) {
      this.wrappers.splice(this.wrappers.indexOf(current), 1, wrapper);
    }
    else {
      this.wrappers.push(wrapper);
    }
  }
}
