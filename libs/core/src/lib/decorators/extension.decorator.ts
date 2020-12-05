import {Type} from "@angular/core";
import {RxShaperService} from "../services/rxshaper.service";
import {RxShaperHook} from "../models/hook";
import {RxShaperExtension} from "../models/extension";


export function RxShaperExtension(options: RxShaperExtension | string) {
  if (typeof options === 'string')
  {
    const extension: RxShaperExtension = {
      name: options,
      type: 'angular'
    };
    return buildExtension(extension);
  }

  options.type = 'angular';
  return buildExtension(options);
}

export function buildExtension(options: RxShaperExtension) {
  return (extension: Type<any>) => {
    addExtension({...options, class: extension});
  };
}

export function addExtension(extension: RxShaperExtension) {
  // apply hooks and outputs
  extension = mergeExtensionProperties(extension);

  const current = RxShaperService.Extensions.find(item => item.name === extension.name);
  if (current) {
    // // FIXME: why does sometimes we get an extra post without class - probably
    // // from postMessage handler wrong in some place
    // if (current.class && !extension.class) {
    //   return;
    // }
    RxShaperService.Extensions.splice(RxShaperService.Extensions.indexOf(current), 1, extension);
  } else {
    // push new extension type
    RxShaperService.Extensions.push(extension);
  }
}

export function mergeExtensionProperties(extension: RxShaperExtension): RxShaperExtension {
  // set hooks
  const hooksStored = RxShaperService.HooksStore.find(item => item.class === extension.class);
  const hooks = extension.hooks ? [...extension.hooks] : [];
  if (hooksStored) {
    // todo not push already set hooks
    hooks.push(...hooksStored.hooks);
  }

  return {...extension, hooks: hooks};
}

export function RxShaperHook(options?: RxShaperHook | string) {
  return buildExtensionHook(options);
}

export function buildExtensionHook(options?: RxShaperHook | string) {
  return (extension: {constructor: Type<any>}|any, key: string) => {
    if (typeof options === 'string') {
      addExtensionHook(extension.constructor, {name: options, target: key});
    }
    else {
      addExtensionHook(extension.constructor, {name: key, ...(options || {}), target: key});
    }
  };
}
export function addExtensionHook(extension: Type<any>, options: RxShaperHook) {
  const current = RxShaperService.Extensions.find(item => item.class === extension);

  if (current) {
    if (!current.hooks) {
      current.hooks = [];
    }
    current.hooks.push(options);
  }
  else {
    const currentStored = RxShaperService.HooksStore.find(item => item.class === extension);
    if (currentStored) {
      currentStored.hooks.push(options);
    }
    else {
      RxShaperService.HooksStore.push({
        class: extension,
        hooks: [options]
      });
    }
  }
}
