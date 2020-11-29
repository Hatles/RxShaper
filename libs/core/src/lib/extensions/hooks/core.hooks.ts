export enum CoreHooks {
  PreInit = "core.pre_init",
  Init = "core.init",
  PostInit = "core.post_init",
  Render = "core.render",
  RenderChildren = "core.render_children",
  Destroy = "core.destroy",
}

export enum CoreHooksPriorities {
  Options,
  Bindings,
  Actions,
  Animations,
  Scripts,
  ClassAndAttr,
  Style,
}
