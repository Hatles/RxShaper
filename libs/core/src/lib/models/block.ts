import {Observable} from "rxjs";
import {RendererService} from "../services/renderer.service";
import {RxShaperService} from "../services/rxshaper.service";

// export type ComponentBlockStyle<Theme = DefaultTheme, ClassKey extends string = string> = Styles<Theme, {}, ClassKey>;

export interface ComponentBlockStyle {
  [key: string]: string | number
}

export interface ComponentBlockStyles {
  large?: ComponentBlockStyle;
  medium?: ComponentBlockStyle;
  small?: ComponentBlockStyle;
  custom?: string;
}

export type ComponentBlockContainerLayout = 'row' | 'column' | 'grid';

export interface ComponentBlockBindings {
  [key: string]: string
}

export interface ComponentBlockActions {
  [key: string]: string
}

export interface ComponentBlockAnimationActionType {
  name: string, // mousePos, scroll, ... click, enter, leave
  label?: string,
  progressive: boolean // mouse pos and scroll are progressives, click, enter, leave are not progressive
  timelines?: {
    [key:string]: ComponentBlockAnimationActionTypeTimeline
  },
  timeline?: ComponentBlockAnimationActionTypeTimeline,
  build: (el: HTMLElement, options: any, manager: RendererService, shaper: RxShaperService) => Observable<any>
}

export interface ComponentBlockAnimationActionTypeTimeline {
  label?: string, // for ui
  symbol?: string, // for ui
  min?: number, // default 0
  max?: number // default 100
  values?: string|number;
}

export interface ComponentBlockAnimationActions {
  [key: string]: ComponentBlockAnimationActionProperties
}

export interface ComponentBlockAnimationActionProperties {
  options?: any
  timelines?: ComponentBlockAnimationTimelineActions
  timeline?: ComponentBlockAnimationAction[],
  target?: ComponentBlockSelector // default is self
}

export interface ComponentBlockAnimationTimelineActions {
  [key: string]: ComponentBlockAnimationAction[]
}

export type ComponentBlockAnimationActionKeyframe = number;

/**
 * progress must be between 0 and 1
 */
export interface ComponentBlockAnimationActionEffectType {
  buildAnimeFrame: (effect: ComponentBlockAnimationActionEffect) => AnimationStyle;
  name: string,
  progressive: boolean
}
export type ComponentBlockSelector = 'children' | 'parent' | 'self' | 'root' | string;
// export type AnimationStyle = '*' | {
//   [key: string]: string | number;
// } | Array<'*' | {
//   [key: string]: string | number;
// }>;
export type AnimationStyle = {
  [key: string]: string | number;
};

export interface ComponentBlockAnimationActionEffect {
  type: string, // action type: script, cssproperty(, move, rotate, opacity, etc...), ...
  target: ComponentBlockSelector, // children | parent | self | #id
  options?: any
}

export interface ComponentBlockAnimationAction {
  key: ComponentBlockAnimationActionKeyframe,
  effects: ComponentBlockAnimationActionEffect[],
}

export interface NormalizedAnimation {
  effectTypeName: string,
  effectType: ComponentBlockAnimationActionEffectType,
  targets: {
    target: string,
    properties: {
      property: string,
      effects: {keyframe: number, effect: ComponentBlockAnimationActionEffect}[]
    }[]
  }[]
}

const testAction: ComponentBlockAnimationActions = {
  'mousePos': {
    timelines: {
      x: [
        {
          key: 0,
          effects: [{
            type: 'opacity',
            target: 'parent',
            options: {
              percent: 50
            }
          }]
        },
        {
          key: 100,
          effects: [{
            type: 'opacity',
            target: 'parent',
            options: {
              percent: 100
            }
          }]
        }
      ]
    }
  }
};

export interface ComponentBlock {
  type: string;
  id?: string;
  class?: string[];
  attributes?: {[key:string]: string};
  options?: any
  children?: ComponentBlock[]
  childrenContainerLayout?: ComponentBlockContainerLayout
  bindings?: ComponentBlockBindings
  actions?: ComponentBlockActions
  animationActions?: ComponentBlockAnimationActions
  style?: ComponentBlockStyles
  script?: string
}
