import {CoreExtension} from "./core.extension";
import {BindingExtension} from "./binding.extension";
import {ActionExtension} from "./action.extension";
import {AnimationExtension} from "./animation.extension";
import {ScriptExtension} from "./script.extension";
import {ClassAndAttrExtension} from "./class-and-attr.extension";
import {StyleExtension} from "./style.extension";
import {OptionsExtension} from "./options.extension";

export const defaultExtensions = [
  CoreExtension,
  OptionsExtension,
  BindingExtension,
  ActionExtension,
  AnimationExtension,
  ScriptExtension,
  ClassAndAttrExtension,
  StyleExtension,
];
