
export interface BlockInput {
  type?: string, // Type of the trait
  label?: string, // The label you will see in Settings
  name: string, // The name of the attribute/property to use on component
  options?: { id: string, name: string}[]
}

export interface BlockOutput {
  type?: string, // Type of the trait
  label?: string, // The label you will see in Settings
  name: string, // The name of the attribute/property to use on component
  options?: { id: string, name: string}[]
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
  /**
   * Any options, must be consumed by an extension to add specific behaviour
   */
  // options?: {[key: string]: any}
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
  noBlock?: boolean;
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

export interface AngularComponentType extends ComponentType {
  tag: string;
}
