import {Type} from "@angular/core";
import {RxShaperService} from "../services/rxshaper.service";
import {AngularComponentType, BlockInput, BlockOutput} from "../services/component";

export type Trait = BlockInput | string;

export function ComponentBuilder(options: AngularComponentType) {
  options.type = 'angular';

  return buildComponent(options);
}

export function buildComponent(options: AngularComponentType) {
  return (component: Type<any>) => {
    addComponent({...options, class: component});
  };
}

export function addComponent(component: AngularComponentType) {
  // apply inputs and outputs
  component = mergeComponentProperties(component);

  const current = RxShaperService.Components.find(item => item.name === component.name);
  if (current) {
    // // FIXME: why does sometimes we get an extra post without class - probably
    // // from postMessage handler wrong in some place
    // if (current.class && !component.class) {
    //   return;
    // }
    RxShaperService.Components.splice(RxShaperService.Components.indexOf(current), 1, component);
  } else {
    // push new component type
    RxShaperService.Components.push(component);
  }
}

export function mergeComponentProperties(component: AngularComponentType): AngularComponentType {
  // set inputs
  const inputsStored = RxShaperService.InputsStore.find(item => item.class === component.class);
  const inputs = component.inputs ? [...component.inputs] : [];
  if (inputsStored) {
    // todo not push already set inputs
    inputs.push(...inputsStored.inputs);
  }

  // set outputs
  const outputsStored = RxShaperService.OutputsStore.find(item => item.class === component.class);
  const outputs = component.outputs ? [...component.outputs] : [];
  if (outputsStored) {
    // todo not push already set outputs
    outputs.push(...outputsStored.outputs);
  }

  return {...component, inputs: inputs, outputs: outputs};
}

export function Trait(options?: Trait) {

  // return Builder.Component(options);
  return buildComponentInput(options);
}

export function buildComponentInput(options?: Trait) {
  return (component: {constructor: Type<any>}|any, key: string) => {
    if (typeof options === 'string') {
      addComponentInput(component.constructor, key !== options ? {name: key, label: options} : {name: options});
    }
    else {
      addComponentInput(component.constructor, options || {name: key});
    }
  };
}
export function addComponentInput(component: Type<any>, options: BlockInput) {
  const current = RxShaperService.Components.find(item => item.class === component);

  if (current) {
    if (!current.inputs) {
      current.inputs = [];
    }
    current.inputs.push(options);
  }
  else {
    const currentStored = RxShaperService.InputsStore.find(item => item.class === component);
    if (currentStored) {
      currentStored.inputs.push(options);
    }
    else {
      RxShaperService.InputsStore.push({
        class: component,
        inputs: [options]
      });
    }
  }
}

export function BuilderBlockOutput(options?: Trait) {

  // return Builder.Component(options);
  return buildComponentOutput(options);
}

export function buildComponentOutput(options?: Trait) {
  return (component: {constructor: Type<any>}|any, key: string) => {
    if (typeof options === 'string') {
      addComponentOutput(component.constructor, key !== options ? {name: key, label: options} : {name: options});
    }
    else {
      addComponentOutput(component.constructor, options || {name: key});
    }
  };
}
export function addComponentOutput(component: Type<any>, options: BlockOutput) {
  const current = RxShaperService.Components.find(item => item.class === component);

  if (current) {
    if (!current.outputs) {
      current.outputs = [];
    }
    current.outputs.push(options);
  }
  else {
    const currentStored = RxShaperService.OutputsStore.find(item => item.class === component);
    if (currentStored) {
      currentStored.outputs.push(options);
    }
    else {
      RxShaperService.OutputsStore.push({
        class: component,
        outputs: [options]
      });
    }
  }
}
