/*
 * anime.js v3.2.1
 * (c) 2020 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */

// Type definitions for animejs 3.1
// Project: http://animejs.com
// Definitions by: Andrew Babin     <https://github.com/A-Babin>
//                 supaiku0         <https://github.com/supaiku0>
//                 southrock         <https://github.com/southrock>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.4

type FunctionBasedParameter = (element: HTMLElement, index: number, length: number) => number;
type AnimeCallbackFunction = (anim: IAnimeInstance) => void;
type CustomEasingFunction = (el: HTMLElement, index: number, length: number) => ((time: number) => number);
// Allowing null is necessary because DOM queries may not return anything.
type AnimeTarget = string | object | HTMLElement | SVGElement | NodeList | null;

interface AnimeProperty {
  name: string,
  tweens: any,
}
type AnimeProperties = AnimeProperty[];

type EasingOptions =
  | "linear"
  | "easeInQuad"
  | "easeInCubic"
  | "easeInQuart"
  | "easeInQuint"
  | "easeInSine"
  | "easeInExpo"
  | "easeInCirc"
  | "easeInBack"
  | "easeInElastic"
  | "easeInBounce"
  | "easeOutQuad"
  | "easeOutCubic"
  | "easeOutQuart"
  | "easeOutQuint"
  | "easeOutSine"
  | "easeOutExpo"
  | "easeOutCirc"
  | "easeOutBack"
  | "easeOutElastic"
  | "easeOutBounce"
  | "easeInOutQuad"
  | "easeInOutCubic"
  | "easeInOutQuart"
  | "easeInOutQuint"
  | "easeInOutSine"
  | "easeInOutExpo"
  | "easeInOutCirc"
  | "easeInOutBack"
  | "easeInOutElastic"
  | "easeInOutBounce";
type DirectionOptions = "reverse" | "alternate" | "normal";

interface AnimeCallBack {
  begin?: AnimeCallbackFunction;
  change?: AnimeCallbackFunction;
  update?: AnimeCallbackFunction;
  complete?: AnimeCallbackFunction;
  loopBegin?: AnimeCallbackFunction;
  loopComplete?: AnimeCallbackFunction;
  changeBegin?: AnimeCallbackFunction;
  changeComplete?: AnimeCallbackFunction;
}

interface AnimeInstanceParams extends AnimeCallBack {
  loop?: number | boolean;
  autoplay?: boolean;
  direction?: DirectionOptions | string;
}

interface AnimeAnimParams extends AnimeCallBack {
  targets?: AnimeTarget | ReadonlyArray<AnimeTarget>;

  duration?: number | FunctionBasedParameter;
  delay?: number | FunctionBasedParameter;
  endDelay?: number | FunctionBasedParameter;
  elasticity?: number | FunctionBasedParameter;
  round?: number | boolean | FunctionBasedParameter;
  keyframes?: ReadonlyArray<AnimeAnimParams>;
  parent?: IAnimeInstance;

  easing?: EasingOptions | string | CustomEasingFunction | ((el: HTMLElement) => string);

  [AnyAnimatedProperty: string]: any;
}

interface AnimeParams extends AnimeInstanceParams, AnimeAnimParams {
  // Just need this to merge both Params interfaces.
}

interface IAnimeInstance extends AnimeCallBack {
  play(): void;

  pause(): void;

  restart(): void;

  reverse(): void;

  seek(time: number): void;

  tick(time: number): void;

  began: boolean;
  paused: boolean;
  completed: boolean;
  finished: Promise<void>;

  autoplay: boolean;
  currentTime: number;
  delay: number;
  direction: DirectionOptions;
  duration: number;
  loop: number | boolean;
  timelineOffset: number;
  progress: number;
  remaining: number | boolean;
  reversed: boolean;

  animatables: ReadonlyArray<AnimeAnimatable>;
  animations: ReadonlyArray<AnimeAnimation>;
}

interface AnimeAnimatable {
  target: AnimeTarget,
  id: number,
  total: number,
  transforms: any
}
interface AnimeAnimation {
  currentValue?: any;
  type: string,
  property: string,
  animatable: AnimeAnimatable,
  tweens: TweenSettings[],
  duration: number,
  delay: number,
  endDelay: number
}
interface AnimeTimings {
  duration: number,
  delay: number,
  endDelay: number
}

interface AnimeTimelineAnimParams extends AnimeAnimParams {
  timelineOffset: number | string | FunctionBasedParameter;
}

interface IAnimeTimelineInstance extends IAnimeInstance {
  add(params: AnimeAnimParams, timelineOffset?: string | number, returnChild?: boolean): IAnimeTimelineInstance | IAnimeInstance;
}

interface StaggerOptions {
  start?: number | string;
  direction?: 'normal' | 'reverse';
  easing?: CustomEasingFunction | string | EasingOptions;
  grid?: ReadonlyArray<number>;
  axis?: 'x' | 'y';
  from?: 'first' | 'last' | 'center' | number;
}

interface AnimeDecomposedValue {
    original: any,
    numbers: number[],
    strings: string[]
}

interface TweenSettings {
  value: any;
  start: number;
  end: number;
  duration: number,
  delay: number,
  endDelay: number,
  easing: (time: number) => number,
  round: number,
  from: AnimeDecomposedValue,
  to: AnimeDecomposedValue,
  isPath: boolean,
  isPathTargetInsideSVG: boolean,
  isColor: boolean
}

// Defaults

const defaultInstanceSettings: AnimeParams = {
  update: null,
  begin: null,
  loopBegin: null,
  changeBegin: null,
  change: null,
  changeComplete: null,
  loopComplete: null,
  complete: null,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0
};

const defaultTweenSettings: TweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)' as any,
  round: 0
} as TweenSettings;

const validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];

// Caching

const cache = {
  CSS: {},
  springs: {}
};

// Utils

function minMax(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

function applyArguments(func: (...args: any[]) => any, args: any[]) {
  return func(...args);
}

const is = {
  arr: function (a) {
    return Array.isArray(a);
  },
  obj: function (a) {
    return stringContains(Object.prototype.toString.call(a), 'Object');
  },
  pth: function (a) {
    return is.obj(a) && a.hasOwnProperty('totalLength');
  },
  svg: function (a) {
    return a instanceof SVGElement;
  },
  inp: function (a) {
    return a instanceof HTMLInputElement;
  },
  dom: function (a) {
    return a.nodeType || is.svg(a);
  },
  str: function (a) {
    return typeof a === 'string';
  },
  fnc: function (a) {
    return typeof a === 'function';
  },
  und: function (a) {
    return typeof a === 'undefined';
  },
  nil: function (a) {
    return is.und(a) || a === null;
  },
  hex: function (a) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
  },
  rgb: function (a) {
    return /^rgb/.test(a);
  },
  hsl: function (a) {
    return /^hsl/.test(a);
  },
  col: function (a) {
    return (is.hex(a) || is.rgb(a) || is.hsl(a));
  },
  key: function (a) {
    return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes';
  },
};

// Easings

function parseEasingParameters(string) {
  const match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(',').map(function (p) {
    return parseFloat(p);
  }) : [];
}

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

function spring(string, duration?) {

  const params = parseEasingParameters(string);
  const mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
  const stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
  const damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
  const velocity = minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const a = 1;
  const b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    let progress = duration ? (duration * t) / 1000 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) {
      return t;
    }
    return 1 - progress;
  }

  function getDuration() {
    const cached = cache.springs[string];
    if (cached) {
      return cached;
    }
    const frame = 1 / 6;
    let elapsed = 0;
    let rest = 0;
    while (true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) {
          break;
        }
      } else {
        rest = 0;
      }
    }
    const duration = elapsed * frame * 1000;
    cache.springs[string] = duration;
    return duration;
  }

  return duration ? solver : getDuration;

}

// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

function steps(steps) {
  if (steps === void 0) steps = 10;

  return function (t) {
    return Math.ceil((minMax(t, 0.000001, 1)) * steps) * (1 / steps);
  };
}

// BezierEasing https://github.com/gre/bezier-easing

const bezier = (function () {

  const kSplineTableSize = 11;
  const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  function A(aA1, aA2) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
  }

  function B(aA1, aA2) {
    return 3.0 * aA2 - 6.0 * aA1;
  }

  function C(aA1) {
    return 3.0 * aA1;
  }

  function calcBezier(aT, aA1, aA2) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
  }

  function getSlope(aT, aA1, aA2) {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
  }

  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    let currentX, currentT, i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
    return currentT;
  }

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (let i = 0; i < 4; ++i) {
      const currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) {
        return aGuessT;
      }
      const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  function bezier(mX1?: number, mY1?: number, mX2?: number, mY2?: number): (x: number) => number {

    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
      return;
    }
    const sampleValues = new Float32Array(kSplineTableSize);

    if (mX1 !== mY1 || mX2 !== mY2) {
      for (let i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX(aX) {

      let intervalStart = 0;
      let currentSample = 1;
      const lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }

      --currentSample;

      const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      const guessForT = intervalStart + dist * kSampleStepSize;
      const initialSlope = getSlope(guessForT, mX1, mX2);

      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }

    }

    return (x: number) => {
      if (mX1 === mY1 && mX2 === mY2) {
        return x;
      }
      if (x === 0 || x === 1) {
        return x;
      }
      return calcBezier(getTForX(x), mY1, mY2);
    };

  }

  return bezier;

})();

const penner = (function () {

  // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

  const eases = {
    linear: function () {
      return function (t) {
        return t;
      };
    }
  };

  const functionEasings = {
    Sine: function () {
      return function (t) {
        return 1 - Math.cos(t * Math.PI / 2);
      };
    },
    Circ: function () {
      return function (t) {
        return 1 - Math.sqrt(1 - t * t);
      };
    },
    Back: function () {
      return function (t) {
        return t * t * (3 * t - 2);
      };
    },
    Bounce: function () {
      return function (t) {
        let pow2, b = 4;
        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) {}
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
      };
    },
    Elastic: function (amplitude, period) {
      if (amplitude === void 0) amplitude = 1;
      if (period === void 0) period = .5;

      const a = minMax(amplitude, 1, 10);
      const p = minMax(period, .1, 2);
      return function (t) {
        return (t === 0 || t === 1) ? t :
          -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
      };
    }
  };

  const baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

  baseEasings.forEach(function (name, i) {
    functionEasings[name] = function () {
      return function (t) {
        return Math.pow(t, i + 2);
      };
    };
  });

  Object.keys(functionEasings).forEach(function (name) {
    const easeIn = functionEasings[name];
    eases['easeIn' + name] = easeIn;
    eases['easeOut' + name] = function (a, b) {
      return function (t) {
        return 1 - easeIn(a, b)(1 - t);
      };
    };
    eases['easeInOut' + name] = function (a, b) {
      return function (t) {
        return t < 0.5 ? easeIn(a, b)(t * 2) / 2 :
          1 - easeIn(a, b)(t * -2 + 2) / 2;
      };
    };
    eases['easeOutIn' + name] = function (a, b) {
      return function (t) {
        return t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 :
          (easeIn(a, b)(t * 2 - 1) + 1) / 2;
      };
    };
  });

  return eases;

})();

function parseEasings(easing, duration?) {
  if (is.fnc(easing)) {
    return easing;
  }
  const name = easing.split('(')[0];
  const ease = penner[name];
  const args = parseEasingParameters(easing);
  switch (name) {
    case 'spring' :
      return spring(easing, duration);
    case 'cubicBezier' :
      return applyArguments(bezier, args);
    case 'steps' :
      return applyArguments(steps, args);
    default :
      return applyArguments(ease, args);
  }
}

// Strings

function selectString(str) {
  try {
    const nodes = document.querySelectorAll(str);
    return nodes;
  } catch (e) {
    return;
  }
}

// Arrays

function filterArray(arr, callback) {
  const len = arr.length;
  const thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  const result = [];
  for (let i = 0; i < len; i++) {
    if (i in arr) {
      const val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  return result;
}

function flattenArray(arr) {
  return arr.reduce(function (a, b) {
    return a.concat(is.arr(b) ? flattenArray(b) : b);
  }, []);
}

function toArray(o) {
  if (is.arr(o)) {
    return o;
  }
  if (is.str(o)) {
    o = selectString(o) || o;
  }
  if (o instanceof NodeList || o instanceof HTMLCollection) {
    return [].slice.call(o);
  }
  return [o];
}

function arrayContains<T = any>(arr: T[], val: T): boolean {
  return arr.some(function (a) {
    return a === val;
  });
}

// Objects

function cloneObject<T = any>(o: T): T {
  // const clone = {};
  // for (const p in o) {
  //   clone[p] = o[p];
  // }
  // return clone;
  return {...o};
}

function replaceObjectProps<T = any>(o1: T, o2: any): T {
  const o = cloneObject(o1);
  for (const p in o1) {
    o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
  }
  return o;
}

function mergeObjects<T = any>(o1: T, o2: any): T {
  const o = cloneObject(o1);
  for (const p in o2) {
    o[p] = is.und(o1[p]) ? o2[p] : o1[p];
  }
  return o;
}

// Colors

function rgbToRgba(rgbValue: string): string {
  const rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
  return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
}

function hexToRgba(hexValue: string): string {
  const rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const hex = hexValue.replace(rgx, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });
  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const r = parseInt(rgb[1], 16);
  const g = parseInt(rgb[2], 16);
  const b = parseInt(rgb[3], 16);
  return ("rgba(" + r + "," + g + "," + b + ",1)");
}

function hslToRgba(hslValue: string): string {
  const hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
  const h = parseInt(hsl[1], 10) / 360;
  const s = parseInt(hsl[2], 10) / 100;
  const l = parseInt(hsl[3], 10) / 100;
  const a = hsl[4] || 1;

  function hue2rgb(p, q, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  }

  let r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return ("rgba(" + (r * 255) + "," + (g * 255) + "," + (b * 255) + "," + a + ")");
}

function colorToRgb(val: string): string {
  if (is.rgb(val)) {
    return rgbToRgba(val);
  }
  if (is.hex(val)) {
    return hexToRgba(val);
  }
  if (is.hsl(val)) {
    return hslToRgba(val);
  }
}

// Units

function getUnit(val: string | number): string {
  const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val as string);
  if (split) {
    return split[1];
  }
}

function getTransformUnit(propName: string): string {
  if (stringContains(propName, 'translate') || propName === 'perspective') {
    return 'px';
  }
  if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) {
    return 'deg';
  }
}

// Values

function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) {
    return val;
  }
  return val(animatable.target, animatable.id, animatable.total);
}

function getAttribute(el, prop) {
  return el.getAttribute(prop);
}

function convertPxToUnit(el, value, unit) {
  const valueUnit = getUnit(value);
  if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) {
    return value;
  }
  const cached = cache.CSS[value + unit];
  if (!is.und(cached)) {
    return cached;
  }
  const baseline = 100;
  const tempEl = document.createElement(el.tagName);
  const parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  const factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  const convertedUnit = factor * parseFloat(value);
  cache.CSS[value + unit] = convertedUnit;
  return convertedUnit;
}

function getCSSValue(el, prop, unit?) {
  if (prop in el.style) {
    const uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
    return unit ? convertPxToUnit(el, value, unit) : value;
  }
}

function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (!is.nil(getAttribute(el, prop)) || (is.svg(el) && el[prop]))) {
    return 'attribute';
  }
  if (is.dom(el) && arrayContains(validTransforms, prop)) {
    return 'transform';
  }
  if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) {
    return 'css';
  }
  if (el[prop] != null) {
    return 'object';
  }
}

function getElementTransforms(el) {
  if (!is.dom(el)) {
    return;
  }
  const str = el.style.transform || '';
  const reg = /(\w+)\(([^)]*)\)/g;
  const transforms = new Map();
  let m;
  while (m = reg.exec(str)) {
    transforms.set(m[1], m[2]);
  }
  return transforms;
}

function getTransformValue(el, propName, animatable, unit) {
  const defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
  const value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms['last'] = propName;
  }
  return unit ? convertPxToUnit(el, value, unit) : value;
}

function getOriginalTargetValue(target: AnimeTarget, propName: string, unit, animatable): string | number {
  switch (getAnimationType(target, propName)) {
    case 'transform':
      return getTransformValue(target, propName, animatable, unit);
    case 'css':
      return getCSSValue(target, propName, unit);
    case 'attribute':
      return getAttribute(target, propName);
    default:
      return target[propName] || 0;
  }
}

function getRelativeValue(to, from): string | number {
  const operator = /^(\*=|\+=|-=)/.exec(to);
  if (!operator) {
    return to;
  }
  const u: any = getUnit(to) || 0;
  const x: number = parseFloat(from);
  const y: number = parseFloat(to.replace(operator[0], ''));
  switch (operator[0][0]) {
    case '+':
      return (x + y) + u;
    case '-':
      return (x - y) + u;
    case '*':
      return (x * y) + u;
  }
}

function validateValue(val, unit) {
  if (is.col(val)) {
    return colorToRgb(val);
  }
  if (/\s/g.test(val)) {
    return val;
  }
  const originalUnit = getUnit(val);
  const unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) {
    return unitLess + unit;
  }
  return unitLess;
}

// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCircleLength(el) {
  return Math.PI * 2 * getAttribute(el, 'r');
}

function getRectLength(el) {
  return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
}

function getLineLength(el) {
  return getDistance(
    {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')},
    {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
  );
}

function getPolylineLength(el) {
  const points = el.points;
  let totalLength = 0;
  let previousPos;
  for (let i = 0; i < points.numberOfItems; i++) {
    const currentPos = points.getItem(i);
    if (i > 0) {
      totalLength += getDistance(previousPos, currentPos);
    }
    previousPos = currentPos;
  }
  return totalLength;
}

function getPolygonLength(el) {
  const points = el.points;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}

// Path animation

function getTotalLength(el) {
  if (el.getTotalLength) {
    return el.getTotalLength();
  }
  switch (el.tagName.toLowerCase()) {
    case 'circle':
      return getCircleLength(el);
    case 'rect':
      return getRectLength(el);
    case 'line':
      return getLineLength(el);
    case 'polyline':
      return getPolylineLength(el);
    case 'polygon':
      return getPolygonLength(el);
  }
}

function setDashoffset(el: HTMLElement | SVGElement | null): number {
  const pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
}

// Motion path

function getParentSvgEl(el) {
  let parentEl = el.parentNode;
  while (is.svg(parentEl)) {
    if (!is.svg(parentEl.parentNode)) {
      break;
    }
    parentEl = parentEl.parentNode;
  }
  return parentEl;
}

function getParentSvg(pathEl, svgData?) {
  const svg = svgData || {};
  const parentSvgEl = svg.el || getParentSvgEl(pathEl);
  const rect = parentSvgEl.getBoundingClientRect();
  const viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
  const width = rect.width;
  const height = rect.height;
  const viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox: viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width,
    h: height,
    vW: viewBox[2],
    vH: viewBox[3]
  };
}

function getPath(path: string | HTMLElement | SVGElement | null, percent?: number): (prop: string) => {
  el: HTMLElement | SVGElement,
    property: string,
    totalLength: number
} {
  const pathEl = is.str(path) ? selectString(path)[0] : path;
  const p = percent || 100;
  return function (property) {
    return {
      property: property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    };
  };
}

function getPathProgress(path, progress, isPathTargetInsideSVG) {
  function point(offset?) {
    if (offset === void 0) offset = 0;

    const l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  }

  const svg = getParentSvg(path.el, path.svg);
  const p = point();
  const p0 = point(-1);
  const p1 = point(+1);
  const scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
  const scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
  switch (path.property) {
    case 'x':
      return (p.x - svg.x) * scaleX;
    case 'y':
      return (p.y - svg.y) * scaleY;
    case 'angle':
      return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  }
}

// Decompose value

function decomposeValue(val, unit): AnimeDecomposedValue {
  // let rgx = /-?\d*\.?\d+/g; // handles basic numbers
  // let rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  const rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  const value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
  return {
    original: value,
    numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
    strings: (is.str(val) || unit) ? value.split(rgx) : []
  };
}

// Animatables

function parseTargets(targets) {
  const targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
  return filterArray(targetsArray, function (item, pos, self) {
    return self.indexOf(item) === pos;
  });
}

function getAnimatables(targets: AnimeTarget, manager: AnimeManager = null): AnimeAnimatable[] {
  const parsed = parseTargets(targets);
  let newAnimatable = true;
  return parsed.map(function (t, i) {
    let transforms;
    const childTransforms = getElementTransforms(t);
    if (manager) {
      const parentAnimatable = manager.animatables.find(a => a.target === t);
      if (parentAnimatable) {
        // for (let p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
        childTransforms.forEach((value, key) => parentAnimatable.transforms.list.set(key, value));
        // parentAnimatable.transforms.list = mergeObjects(parentAnimatable.transforms.list, childTransforms);
        transforms = parentAnimatable.transforms;
        newAnimatable = false;
      } else {
        transforms = {list: childTransforms};
      }
    } else {
      transforms = {list: childTransforms};
    }

    const animatable: AnimeAnimatable = {target: t, id: i, total: parsed.length, transforms: transforms};

    if (newAnimatable) {
      manager.registerAnimatable(t, transforms);
    }

    return animatable;
  });
}

// Properties

function normalizePropertyTweens(prop: any, tweenSettings: TweenSettings) {
  const settings = cloneObject(tweenSettings);
  // Override duration if easing is a spring
  if (/^spring/.test(settings.easing as any)) {
    settings.duration = spring(settings.easing) as any;
  }
  if (is.arr(prop)) {
    const l = prop.length;
    const isFromTo = (l === 2 && !is.obj(prop[0]));
    if (!isFromTo) {
      // Duration divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) {
        settings.duration = tweenSettings.duration / l;
      }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      prop = {value: prop};
    }
  }
  const propArray = is.arr(prop) ? prop : [prop];
  return propArray.map(function (v, i) {
    const obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
    // Default delay value should only be applied to the first tween
    if (is.und(obj.delay)) {
      obj.delay = !i ? tweenSettings.delay : 0;
    }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) {
      obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0;
    }
    return obj;
  }).map(function (k) {
    return mergeObjects(k, settings);
  });
}


function flattenKeyframes(keyframes) {
  const propertyNames = filterArray(flattenArray(keyframes.map(function (key) {
    return Object.keys(key);
  })), function (p) {
    return is.key(p);
  })
    .reduce(function (a, b) {
      if (a.indexOf(b) < 0) {
        a.push(b);
      }
      return a;
    }, []);
  const properties = {};
  const loop = function (i) {
    const propName = propertyNames[i];
    properties[propName] = keyframes.map(function (key) {
      const newKey: any = {};
      for (const p in key) {
        if (is.key(p)) {
          if (p == propName) {
            newKey.value = key[p];
          }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  };

  for (let i = 0; i < propertyNames.length; i++) loop(i);
  return properties;
}

function getProperties(tweenSettings: TweenSettings, params: AnimeParams): AnimeProperties {
  const properties = [];
  const keyframes = params.keyframes;
  if (keyframes) {
    params = mergeObjects(flattenKeyframes(keyframes), params);
  }
  for (const p in params) {
    if (is.key(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }
  return properties;
}

// Tweens

function normalizeTweenValues(tween: TweenSettings, animatable: AnimeAnimatable): TweenSettings {
  const t: TweenSettings = {} as TweenSettings;
  for (const p in tween) {
    let value = getFunctionValue(tween[p], animatable);
    if (is.arr(value)) {
      value = value.map(function (v) {
        return getFunctionValue(v, animatable);
      });
      if (value.length === 1) {
        value = value[0];
      }
    }
    t[p] = value;
  }
  t.duration = parseFloat(tween.duration as any);
  t.delay = parseFloat(tween.delay as any);
  return t;
}

function normalizeTweens(prop, animatable: AnimeAnimatable): TweenSettings[] {
  let previousTween;
  return prop.tweens.map(function (t) {
    const tween = normalizeTweenValues(t, animatable);
    const tweenValue = tween.value;
    let to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    const toUnit = getUnit(to);
    const originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    const previousValue = previousTween ? previousTween.to.original : originalValue;
    const from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    const fromUnit = getUnit(from) || getUnit(originalValue);
    const unit = toUnit || fromUnit;
    if (is.und(to)) {
      to = previousValue;
    }
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isPathTargetInsideSVG = tween.isPath && is.svg(animatable.target);
    tween.isColor = is.col(tween.from.original);
    if (tween.isColor) {
      tween.round = 1;
    }
    previousTween = tween;
    return tween;
  });
}

// Tween progress

const setProgressValue = {
  css: function (t, p, v) {
    return t.style[p] = v;
  },
  attribute: function (t, p, v) {
    return t.setAttribute(p, v);
  },
  object: function (t, p, v) {
    return t[p] = v;
  },
  transform: function (t, p, v, transforms, manual) {
    transforms.list.set(p, v);
    if (p === transforms.last || manual) {
      let str = '';
      transforms.list.forEach(function (value, prop) {
        str += prop + "(" + value + ") ";
      });
      t.style.transform = str;
    }
  }
};

// Set Value helper

function setTargetsValue(targets: AnimeTarget, properties: AnimeProperties): void {
  const animatables: AnimeAnimatable[] = getAnimatables(targets);
  animatables.forEach(function (animatable) {
    for (const property in properties) {
      const value = getFunctionValue(properties[property], animatable);
      const target = animatable.target;
      const valueUnit = getUnit(value);
      const originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      const unit = valueUnit || getUnit(originalValue);
      const to = getRelativeValue(validateValue(value, unit), originalValue);
      const animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, animatable.transforms, true);
    }
  });
}

// Animations

function createAnimation(animatable: AnimeAnimatable, prop: AnimeProperty): AnimeAnimation {
  const animType = getAnimationType(animatable.target, prop.name);
  if (animType) {
    const tweens = normalizeTweens(prop, animatable);
    const lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable: animatable,
      tweens: tweens,
      duration: lastTween.end,
      delay: tweens[0].delay,
      endDelay: lastTween.endDelay
    };
  }
}

function getAnimations(animatables: AnimeAnimatable[], properties): AnimeAnimation[] {
  return filterArray(flattenArray(animatables.map(function (animatable) {
    return properties.map(function (prop) {
      return createAnimation(animatable, prop);
    });
  })), function (a) {
    return !is.und(a);
  });
}

// Create Instance

function getInstanceTimings(animations: AnimeAnimation[], tweenSettings: TweenSettings): AnimeTimings {
  const animLength = animations.length;
  const getTlOffset = function (anim) {
    return anim.timelineOffset ? anim.timelineOffset : 0;
  };
  const timings: AnimeTimings = {
    duration: animLength ? Math.max(...animations.map(function (anim) {
      return getTlOffset(anim) + anim.duration;
    })) : tweenSettings.duration,

    delay: animLength ? Math.min(...animations.map(function (anim) {
      return getTlOffset(anim) + anim.delay;
    })) : tweenSettings.delay,

    endDelay: null
  };

  timings.endDelay = animLength ? timings.duration - Math.max(...animations.map(function (anim) {
    return getTlOffset(anim) + anim.duration - anim.endDelay;
  })) : tweenSettings.endDelay;

  return timings;
}

let instanceID = 0;

export type AnimeInstanceFactory<T extends AnimeInstance = AnimeInstance> = (anime: Anime<T>, params: AnimeParams) => T;

const createNewInstance: AnimeInstanceFactory = (anime: Anime, params: AnimeParams): AnimeInstance => {

  const instance = applyInstanceParams(anime, params, new AnimeInstance(anime));

  return instance;
};

function applyInstanceParams(anime: Anime, params: AnimeParams, instance: AnimeInstance): AnimeInstance {
  const instanceSettings: AnimeParams = replaceObjectProps(defaultInstanceSettings, params);
  const tweenSettings: TweenSettings = replaceObjectProps(defaultTweenSettings, params);
  const properties: AnimeProperties = getProperties(tweenSettings, params);
  const animatables: AnimeAnimatable[] = getAnimatables(params.targets, anime.manager);
  const animations: AnimeAnimation[] = getAnimations(animatables, properties);
  const timings: AnimeTimings = getInstanceTimings(animations, tweenSettings);
  const id = instanceID;
  instanceID++;

  const mergeParams = mergeObjects(instanceSettings, {
    id: id,
    children: [],
    animatables: animatables,
    animations: animations,
    duration: timings.duration,
    delay: timings.delay,
    endDelay: timings.endDelay
  });

  Object.assign(instance, mergeParams);

  return instance;
}

// Core

class Engine {
  raf;

  constructor(private manager: AnimeManager) {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }
  }

  play() {
    if (!this.raf && (!isDocumentHidden() || !this.manager.suspendWhenDocumentHidden) && this.manager.activeInstances.length > 0) {
      this.raf = requestAnimationFrame((arg) => this.step(arg));
    }
  }

  step(t?) {
    // memo on algorithm issue:
    // dangerous iteration over mutable `activeInstances`
    // (that collection may be updated from within callbacks of `tick`-ed animation instances)
    let activeInstancesLength = this.manager.activeInstances.length;
    let i = 0;
    while (i < activeInstancesLength) {
      const activeInstance = this.manager.activeInstances[i];
      if (!activeInstance.paused) {
        activeInstance.tick(t);
        i++;
      } else {
        this.manager.activeInstances.splice(i, 1);
        activeInstancesLength--;
      }
    }
    this.raf = i > 0 ? requestAnimationFrame((arg) => this.step(arg)) : undefined;
  }

  handleVisibilityChange() {
    if (!this.manager.suspendWhenDocumentHidden) {
      return;
    }

    if (isDocumentHidden()) {
      // suspend ticks
      this.raf = cancelAnimationFrame(this.raf);
    } else { // is back to active tab
      // first adjust animations to consider the time that ticks were suspended
      this.manager.activeInstances.forEach(
        (instance: any) => {
          return instance._onDocumentVisibility();
        }
      );
      this.play();
    }
  }
}

function isDocumentHidden() {
  return !!document && document.hidden;
}

// Public Instance

class AnimeInstance implements IAnimeInstance {
  anime: Anime

  animatables: ReadonlyArray<AnimeAnimatable> = [];
  animations: ReadonlyArray<AnimeAnimation> = [];
  autoplay: boolean;
  began: boolean;
  completed: boolean;
  currentTime: number;
  delay: number;
  direction: DirectionOptions;
  duration: number;
  finished: Promise<void>;
  loop: number | boolean;
  paused: boolean;
  progress: number;
  remaining: number | boolean;
  reversed: boolean;
  timelineOffset: number;

  passThrough: boolean;
  loopBegan: boolean;
  reversePlayback: boolean;
  changeBegan: boolean;
  changeCompleted: boolean;

  children: any[] = [];
  endDelay: number;

  constructor(anime: Anime) {
    this.anime = anime;
  }

  reset() {
    this.passThrough = false;
    this.currentTime = 0;
    this.progress = 0;
    this.paused = true;
    this.began = false;
    this.loopBegan = false;
    this.changeBegan = false;
    this.completed = false;
    this.changeCompleted = false;
    this.reversePlayback = false;
    this.reversed = this.direction === 'reverse';
    this.remaining = this.loop;

    const childrenLength = this.children.length;
    for (let i = childrenLength; i--;) {
      this.children[i].reset();
    }
    if (this.reversed && this.loop !== true || (this.direction === 'alternate' && this.loop === 1)) {
      (this.remaining as number)++;
    }
    this.anime.setAnimationsProgress(this.reversed ? this.duration : 0);
  }

  set(targets, properties) {
    setTargetsValue(targets, properties);
    return this;
  }

  tick(t) {
    this.anime.now = t;
    if (!this.anime.startTime) {
      this.anime.startTime = this.anime.now;
    }
    this.anime.setInstanceProgress((this.anime.now + (this.anime.lastTime - this.anime.startTime)) * this.anime.manager.speed);
  }

  seek(time) {
    this.anime.setInstanceProgress(this.anime.adjustTime(time));
  }

  pause() {
    this.paused = true;
    this.anime.resetTime();
  }

  play() {
    if (!this.paused) {
      return;
    }
    if (this.completed) {
      this.reset();
    }
    this.paused = false;
    this.anime.manager.activeInstances.push(this);
    this.anime.resetTime();
    this.anime.manager.engine.play();
  }

  reverse() {
    this.anime.toggleInstanceDirection();
    this.completed = this.reversed ? false : true;
    this.anime.resetTime();
  }

  restart() {
    this.reset();
    this.play();
  }

  remove(targets) {
    const targetsArray = parseTargets(targets);
    removeTargetsFromInstance(targetsArray, this);
  }
}

class Anime<TInstance extends AnimeInstance = AnimeInstance> {
  private instance: TInstance;
  private promise: Promise<void>;
  private resolve: () => void;

  startTime: number;
  now: number;
  lastTime: number;
  children: any[];
  childrenLength: number;

  constructor(public manager: AnimeManager, instanceFactory: AnimeInstanceFactory<TInstance>, params?: AnimeParams) {
    if (params === void 0) params = {};

    this.startTime = 0;
    this.lastTime = 0;
    this.now = 0;
    this.children = [];
    this.childrenLength = 0;
    this.resolve = null;

    this.instance = instanceFactory(this, params);
    this.promise = this.makePromise(this.instance);

    // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
    (this.instance as any)._onDocumentVisibility = () => this.resetTime();

    // Set Value helper

    this.instance.reset();

    if (this.instance.autoplay) {
      this.instance.play();
    }
  }

  getInstance(): TInstance {
    return this.instance;
  }

  makePromise(instance: IAnimeInstance): Promise<void> {
    const promise = window.Promise && new Promise<void>((_resolve) => {
      return this.resolve = _resolve;
    });
    this.instance.finished = promise;
    return promise;
  }

  toggleInstanceDirection() {
    const direction = this.instance.direction;
    if (direction !== 'alternate') {
      this.instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    this.instance.reversed = !this.instance.reversed;
    this.children.forEach((child) => {
      return child.reversed = this.instance.reversed;
    });
  }

  adjustTime(time) {
    return this.instance.reversed ? this.instance.duration - time : time;
  }

  resetTime() {
    this.startTime = 0;
    this.lastTime = this.adjustTime(this.instance.currentTime) * (1 / this.manager.speed);
  }

  seekChild(time, child) {
    if (child) {
      child.seek(time - child.timelineOffset);
    }
  }

  syncInstanceChildren(time) {
    if (!this.instance.reversePlayback) {
      for (let i = 0; i < this.childrenLength; i++) {
        this.seekChild(time, this.children[i]);
      }
    } else {
      for (let i$1 = this.childrenLength; i$1--;) {
        this.seekChild(time, this.children[i$1]);
      }
    }
  }

  setAnimationsProgress(insTime) {
    let i = 0;
    const animations = this.instance.animations;
    const animationsLength = animations.length;
    while (i < animationsLength) {
      const anim = animations[i];
      const animatable = anim.animatable;
      const tweens = anim.tweens;
      const tweenLength = tweens.length - 1;
      let tween = tweens[tweenLength];
      // Only check for keyframes if there is more than one tween
      if (tweenLength) {
        tween = filterArray(tweens, function (t) {
          return (insTime < t.end);
        })[0] || tween;
      }
      const elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      const eased: number = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      const strings = tween.to.strings;
      const round = tween.round;
      const numbers = [];
      const toNumbersLength = tween.to.numbers.length;
      let progress = (void 0);
      for (let n = 0; n < toNumbersLength; n++) {
        let value = (void 0);
        const toNumber = tween.to.numbers[n];
        const fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + (eased * (toNumber - fromNumber));
        } else {
          value = getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      // Manual Array.reduce for better performances
      const stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (let s = 0; s < stringsLength; s++) {
          const a = strings[s];
          const b = strings[s + 1];
          const n$1 = numbers[s];
          if (!isNaN(n$1)) {
            if (!b) {
              progress += n$1 + ' ';
            } else {
              progress += n$1 + b;
            }
          }
        }
      }
      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }

  setCallback(cb) {
    if (this.instance[cb] && !this.instance.passThrough) {
      this.instance[cb](this.instance);
    }
  }

  countIteration() {
    if (this.instance.remaining && this.instance.remaining !== true) {
      this.instance.remaining--;
    }
  }

  setInstanceProgress(engineTime) {
    const insDuration = this.instance.duration;
    const insDelay = this.instance.delay;
    const insEndDelay = insDuration - this.instance.endDelay;
    const insTime = this.adjustTime(engineTime);
    this.instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
    this.instance.reversePlayback = insTime < this.instance.currentTime;
    if (this.children) {
      this.syncInstanceChildren(insTime);
    }
    if (!this.instance.began && this.instance.currentTime > 0) {
      this.instance.began = true;
      this.setCallback('begin');
    }
    if (!this.instance.loopBegan && this.instance.currentTime > 0) {
      this.instance.loopBegan = true;
      this.setCallback('loopBegin');
    }
    if (insTime <= insDelay && this.instance.currentTime !== 0) {
      this.setAnimationsProgress(0);
    }
    if ((insTime >= insEndDelay && this.instance.currentTime !== insDuration) || !insDuration) {
      this.setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!this.instance.changeBegan) {
        this.instance.changeBegan = true;
        this.instance.changeCompleted = false;
        this.setCallback('changeBegin');
      }
      this.setCallback('change');
      this.setAnimationsProgress(insTime);
    } else {
      if (this.instance.changeBegan) {
        this.instance.changeCompleted = true;
        this.instance.changeBegan = false;
        this.setCallback('changeComplete');
      }
    }
    this.instance.currentTime = minMax(insTime, 0, insDuration);
    if (this.instance.began) {
      this.setCallback('update');
    }
    if (engineTime >= insDuration) {
      this.lastTime = 0;
      this.countIteration();
      if (!this.instance.remaining) {
        this.instance.paused = true;
        if (!this.instance.completed) {
          this.instance.completed = true;
          this.setCallback('loopComplete');
          this.setCallback('complete');
          if (!this.instance.passThrough && 'Promise' in window) {
            this.resolve();
            this.promise = this.makePromise(this.instance);
          }
        }
      } else {
        this.startTime = this.now;
        this.setCallback('loopComplete');
        this.instance.loopBegan = false;
        if (this.instance.direction === 'alternate') {
          this.toggleInstanceDirection();
        }
      }
    }
  }
}

// Remove targets from animation

function removeTargetsFromAnimations(targetsArray, animations) {
  for (let a = animations.length; a--;) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

function removeTargetsFromInstance(targetsArray, instance) {
  const animations = instance.animations;
  const children = instance.children;
  removeTargetsFromAnimations(targetsArray, animations);
  for (let c = children.length; c--;) {
    const child = children[c];
    const childAnimations = child.animations;
    removeTargetsFromAnimations(targetsArray, childAnimations);
    if (!childAnimations.length && !child.children.length) {
      children.splice(c, 1);
    }
  }
  if (!animations.length && !children.length) {
    instance.pause();
  }
}

function removeTargetsFromActiveInstances(targets: AnimeTarget | ReadonlyArray<AnimeTarget>): void {
  const targetsArray = parseTargets(targets);
  for (let i = activeInstances.length; i--;) {
    const instance = activeInstances[i];
    removeTargetsFromInstance(targetsArray, instance);
  }
}

// Stagger helpers

function stagger(val: number | string | ReadonlyArray<number | string>, params?: StaggerOptions): FunctionBasedParameter {
  if (params === void 0) params = {};

  const direction = params.direction || 'normal';
  const easing = params.easing ? parseEasings(params.easing) : null;
  const grid = params.grid;
  const axis = params.axis;
  const fromIndexStr = params.from || 0;
  const fromFirst = fromIndexStr === 'first';
  const fromCenter = fromIndexStr === 'center';
  const fromLast = fromIndexStr === 'last';
  const isRange = is.arr(val);
  const val1 = isRange ? parseFloat(val[0]) : parseFloat(val as string);
  const val2 = isRange ? parseFloat(val[1]) : 0;
  const unit = getUnit(isRange ? val[1] : val) || 0;
  const start = params.start || 0 + (isRange ? val1 : 0);
  let values = [];
  let maxValue = 0;
  return function (el, i, t) {
    let fromIndex: number;
    if (fromFirst) {
      fromIndex = 0;
    }
    else if (fromCenter) {
      fromIndex = (t - 1) / 2;
    }
    else if (fromLast) {
      fromIndex = t - 1;
    }
    else {
      fromIndex = fromIndexStr as number;
    }
    if (!values.length) {
      for (let index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          const fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
          const fromY = !fromCenter ? Math.floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
          const toX = index % grid[0];
          const toY = Math.floor(index / grid[0]);
          const distanceX = fromX - toX;
          const distanceY = fromY - toY;
          let value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === 'x') {
            value = -distanceX;
          }
          if (axis === 'y') {
            value = -distanceY;
          }
          values.push(value);
        }
        maxValue = Math.max(...values);
      }
      if (easing) {
        values = values.map(function (val) {
          return easing(val / maxValue) * maxValue;
        });
      }
      if (direction === 'reverse') {
        values = values.map(function (val) {
          return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val);
        });
      }
    }
    const spacing = isRange ? (val2 - val1) / maxValue : val1;
    return (start as any) + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
  };
}

// Timeline

export class AnimeTimelineInstance extends AnimeInstance implements IAnimeTimelineInstance {

  constructor(anime: Anime, private params: any) {
    super(anime);
  }

  add(instanceParams: AnimeAnimParams, timelineOffset?: string | number, returnChild = false): IAnimeTimelineInstance | IAnimeInstance {
    const tlIndex = this.anime.manager.activeInstances.indexOf(this);
    const children = this.children;
    if (tlIndex > -1) {
      activeInstances.splice(tlIndex, 1);
    }

    function passThrough(ins) {
      ins.passThrough = true;
    }

    for (let i = 0; i < children.length; i++) {
      passThrough(children[i]);
    }
    instanceParams.parent = this;
    const insParams: AnimeAnimParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, this.params));
    insParams.targets = insParams.targets || this.params.targets;
    const tlDuration = this.duration;
    insParams.autoplay = false;
    insParams.direction = this.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(this);
    this.seek(insParams.timelineOffset);
    const ins = this.anime.manager.anime(insParams);
    passThrough(ins);
    children.push(ins);
    const timings = getInstanceTimings(children, this.params);
    this.delay = timings.delay;
    this.endDelay = timings.endDelay;
    this.duration = timings.duration;
    this.seek(0);
    this.reset();
    if (this.autoplay) {
      this.play();
    }
    return returnChild ? ins : this;
  }
}

const createNewTimelineInstance: AnimeInstanceFactory<AnimeTimelineInstance> = (anime: Anime<AnimeTimelineInstance>, params: AnimeParams): AnimeTimelineInstance => {
  const instance = new AnimeTimelineInstance(anime, params);
  applyInstanceParams(anime, params, instance);
  return instance;
};

const activeInstances: AnimeManager[] = [];

class AnimeManager {

  speed = 1;
  suspendWhenDocumentHidden = true;
  activeInstances: IAnimeInstance[] = [];

  engine: Engine;

  animatables: {target: any, transforms: any}[] = [];


  constructor() {
    this.engine = new Engine(this);
    this.engine.play();

    activeInstances.push(this);
  }

  private _anime<T extends AnimeInstance = AnimeInstance>(instanceFactory?: AnimeInstanceFactory<T>, params?: AnimeParams): Anime<T> {
    return new Anime<T>(this, instanceFactory, params);
  }

  anime(params?: AnimeParams): IAnimeInstance {
    return this._anime(createNewInstance, params).getInstance() as IAnimeInstance;
  }

  timeline(params: AnimeParams | ReadonlyArray<IAnimeInstance>): AnimeTimelineInstance {
    if (params === void 0) params = {};

    const instance = this._anime(createNewTimelineInstance, params).getInstance();
    instance.duration = 0;

    return instance;
  }

  registerAnimatable(t: any, transforms: any) {
    this.animatables.push({target: t, transforms: transforms});
  }
}

const defaultManager = new AnimeManager();

function anime(params?: AnimeParams): IAnimeInstance {
  return defaultManager.anime(params);
}

function timeline(params: AnimeParams | ReadonlyArray<IAnimeInstance>): AnimeTimelineInstance {
  return defaultManager.timeline(params);
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const version = '3.2.1';


const running = activeInstances;
const remove = removeTargetsFromActiveInstances;
const get = getOriginalTargetValue;
const set = setTargetsValue;
const convertPx = convertPxToUnit;
const path = getPath;
const easing = parseEasings;

export {
  version,
  running,
  remove,
  get,
  set,
  convertPx,
  path,
  setDashoffset,
  stagger,
  easing,
  penner,
  random,
  AnimeManager,
  defaultManager,
  anime,
  timeline
};
