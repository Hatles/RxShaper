import {Input, Type} from "@angular/core";

export interface AngularComponentType extends ComponentType {
  tag: string;
}

export interface ComponentType {
  /**
   * Name your component something unique, e.g. 'MyButton'. You can override built-in components
   * by registering a component with the same name, e.g. 'Text', to replace the built-in text component
   */
  name: string;
  description?: string;
  /**
   * Link to a documentation page for this component
   */
  docsLink?: string;
  image?: string;
  /**
   * Input schema for your component for users to fill in the options
   */
  inputs?: BlockInput[];
  outputs?: BlockOutput[];
  class?: any;
  type?: 'angular' | 'webcomponent' | 'react' | 'vue';
  defaultStyles?: { [key: string]: string };
  /**
   * Turn on if your component can accept children. Be sure to use in combination with
   * withChildren(YourComponent) like here
   * github.com/BuilderIO/builder/blob/master/examples/react-design-system/src/components/HeroWithChildren/HeroWithChildren.builder.js#L5
   */
  canHaveChildren?: boolean;
  fragment?: boolean;
  /**
   * Do not wrap a component in a dom element. Be sure to use {...props.attributes} with this option
   * like here github.com/BuilderIO/builder/blob/master/packages/react/src/blocks/forms/Input.tsx#L34
   */
  noWrap?: boolean;
  /**
   * Default children
   */
  // defaultChildren?: BuilderElement[];
  // defaults?: Partial<BuilderElement>;
  // hooks?: { [key: string]: string | Function };
  hideFromInsertMenu?: boolean;
  // For webcomponents
  tag?: string;
  static?: boolean;

  /**
   * Specify restrictions direct children must match
   */
  childRequirements?: {
    /** Message to show when this doesn't match, e.g. "Children of 'Columns' must be a 'Column'" */
    message: string;
    /** Simple way to say children must be a specific component name */
    component?: string;
    /**
     * More advanced - specify a MongoDB-style query (using sift.js github.com/crcn/sift.js)
     * of what the children objects should match, e.g.
     *
     * @example
     *  query: {
     *    // Child of this element must be a 'Button' or 'Text' component
     *    'component.name': { $in: ['Button', 'Text'] }
     *  }
     */
    query?: any;
  };

  /**
   * Specify restrictions any parent must match
   */
  requiresParent?: {
    /** Message to show when this doesn't match, e.g. "'Add to cart' buttons must be within a 'Product box'" */
    message: string;
    /** Simple way to say a parent must be a specific component name, e.g. 'Product box' */
    component?: string;

    /**
     * More advanced - specify a MongoDB-style query (using sift.js github.com/crcn/sift.js)
     * of what at least one parent in the parents hierarchy should match, e.g.
     *
     * @example
     *  query: {
     *    // Thils element must be somewhere inside either a 'Product box' or 'Collection' component
     *    'component.name': { $in: ['Product Box', 'Collection'] }
     *  }
     */
    query?: any;
  };

  /** not yet implemented */
  friendlyName?: string;
}
export interface BlockInput {
  type?: string, // Type of the trait
  label?: string, // The label you will see in Settings
  name: string, // The name of the attribute/property to use on component
  options?: { id: string, name: string}[]
}

export type Trait = BlockInput | string;

export function ComponentBuilder(options: AngularComponentType) {
  options.type = 'angular';

  // return Builder.Component(options);
  return buildComponent(options);
}

export const components: AngularComponentType[] = [];

export function buildComponent(options: AngularComponentType) {
  return (component: Type<any>) => {
    addComponent({...options, class: component});
  };
}

export function addComponent(component: AngularComponentType) {
  const current = components.find(item => item.name === component.name);
  if (current) {
    // // FIXME: why does sometimes we get an extra post without class - probably
    // // from postMessage handler wrong in some place
    // if (current.class && !component.class) {
    //   return;
    // }
    components.splice(this.components.indexOf(current), 1, component);
  } else {
    // set inputs
    const inputsStored = inputsStore.find(item => item.class === component.class);
    const inputs = component.inputs ? [...component.inputs] : [];
    if (inputsStored) {
      // todo not push already set inputs
      inputs.push(...inputsStored.inputs);
    }

    // set outputs
    const outputsStored = outputsStore.find(item => item.class === component.class);
    const outputs = component.outputs ? [...component.outputs] : [];
    if (outputsStored) {
      // todo not push already set outputs
      outputs.push(...outputsStored.outputs);
    }

    // push new component type
    components.push({...component, inputs: inputs, outputs: outputs});
  }
}

export const inputsStore: { class: Type<any>, inputs: BlockInput[] }[] = [];

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
  const current = components.find(item => item.class === component);

  if (current) {
    if (!current.inputs) {
      current.inputs = [];
    }
    current.inputs.push(options);
  }
  else {
    const currentStored = inputsStore.find(item => item.class === component);
    if (currentStored) {
      currentStored.inputs.push(options);
    }
    else {
      inputsStore.push({
        class: component,
        inputs: [options]
      });
    }
  }
}

export interface BlockOutput {
  type?: string, // Type of the trait
  label?: string, // The label you will see in Settings
  name: string, // The name of the attribute/property to use on component
  options?: { id: string, name: string}[]
}

export const outputsStore: { class: Type<any>, outputs: BlockOutput[] }[] = [];

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
  const current = components.find(item => item.class === component);

  if (current) {
    if (!current.outputs) {
      current.outputs = [];
    }
    current.outputs.push(options);
  }
  else {
    const currentStored = outputsStore.find(item => item.class === component);
    if (currentStored) {
      currentStored.outputs.push(options);
    }
    else {
      outputsStore.push({
        class: component,
        outputs: [options]
      });
    }
  }
}
