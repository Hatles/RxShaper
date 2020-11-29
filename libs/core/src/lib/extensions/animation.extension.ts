import {Injectable} from "@angular/core";
import {RxShaperExtension, RxShaperHook} from "../decorators/extension.decorator";
import {CoreExtension} from "./core.extension";
import {CoreHooks, CoreHooksPriorities} from "./hooks/core.hooks";
import {animationFrameScheduler, combineLatest, fromEvent, Observable, of} from "rxjs";
import {distinctUntilChanged, filter, map, switchMap, takeUntil, tap, throttleTime} from "rxjs/operators";
import {
  AnimationStyle,
  ComponentBlockAnimationActionEffect,
  ComponentBlockAnimationActionEffectType,
  ComponentBlockAnimationActionProperties, ComponentBlockAnimationActionType,
  NormalizedAnimation
} from "../models/block";
import {fromIntersectionObserver, IntersectionStatus} from "../utils/fromIntersectionObserver";
import {BlockRendererService} from "../services/block-renderer.service";
import {sort} from "../utils/sort";
import {RxShaperService} from "../services/rxshaper.service";
import {RxShaperExtensionFunction} from "../models/extension";
import {RendererService} from "../services/renderer.service";
import {groupBy} from "../utils/groupBy";
import {anime} from "../utils/anime";

@Injectable()
@RxShaperExtension("rxshaper:core:animation")
export class AnimationExtension {

  constructor(private shaper: RxShaperService, private core: CoreExtension) {
  }

  @RxShaperHook({
    name: CoreHooks.Render,
    priority: CoreHooksPriorities.Animations
  })
  mapAnimationActions: RxShaperExtensionFunction = (shaper, shaperManager, renderer, properties, args) => {
    if (renderer.component.animationActions) {
      // const instance = this.componentRef.instance;
      Object.keys(renderer.component.animationActions).forEach(eventTypeName => {
        const animations = renderer.component.animationActions[eventTypeName];

        const normalizedAnimations: NormalizedAnimation[] = this.normalizeAnimations(animations);

        const {events, actionType} = this.buildAnimationEvents(eventTypeName, animations, renderer.componentRef.location.nativeElement, renderer, shaperManager);

        if (normalizedAnimations && events) {
          this.buildComponentAnimation(normalizedAnimations, events, actionType, renderer);
        }
      });
    }
  }


  private _eventTypes: ComponentBlockAnimationActionType[] = [
    {
      name: 'mousePos',
      progressive: true,
      timelines: {
        x: {
          min: 0,
          max: 1
        },
        y: {
          min: 0,
          max: 1
        }
      },
      build: el => fromEvent(el, 'mousemove')
        .pipe(
          // throttleTime(1000/60), // 60 fps
          throttleTime(0, animationFrameScheduler), // sync with frames

          map((e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width; // x position within the element.
            const y = (e.clientY - rect.top) / rect.height;  // y position within the element.
            return {x: x, y: y};
          }),
          filter(v => v.x >= 0 && v.x <= 1 && v.y >= 0 && v.y <= 1), // filter events out of element
        )
    },
    {
      name: 'mouseenter',
      progressive: false,
      build: (el) => fromEvent(el, 'mouseenter')
    },
    {
      name: 'mouseleave',
      progressive: false,
      build: (el) => fromEvent(el, 'mouseleave')
    },
    {
      name: 'enterviewport',
      progressive: false,
      // params: [name: , type: , options: , defaultValue: ] // params for visual form (formly)
      build: (el, options,  manager) => {
        const config: IntersectionObserverInit = {
          root: manager.viewport,
          rootMargin: `${options.marginTop || '0px'} ${options.marginRight || '0px'} ${options.marginBottom || '0px'} ${options.marginLeft || '0px'}`,
          threshold: options.threshold || 0
        };
        return fromIntersectionObserver(el, config)
          .pipe(
            tap(console.log),
            distinctUntilChanged(),
            filter(v => v === IntersectionStatus.Visible)
          )
          ;
      }
    }
  ];

  private buildAnimationEvents(eventTypeName: string, animations: ComponentBlockAnimationActionProperties, el: HTMLElement, renderer: BlockRendererService, shaperManager: RendererService): { events: Observable<{source: BlockRendererService, event: Observable<any>}[]>; actionType: ComponentBlockAnimationActionType } {
    const eventType = this._eventTypes.find(e => e.name === eventTypeName);
    const targetSelector = animations.target || 'self';


    if (eventType) {
      const targets = renderer.getBlocksChanges(targetSelector);
      const events = targets.pipe(map(ts => {
        return ts.map(t => ({source: t, event: eventType.build(t.componentRef.location.nativeElement, animations.options, shaperManager, this.shaper)}));
      }));
      return {events: events, actionType: eventType};
    }

    return null;
  }

  private normalizeAnimations(dirtyAnims: ComponentBlockAnimationActionProperties): NormalizedAnimation[] {
    // group animations and oder byr keyframe
    const allKeyFrames: { property: string, keyframe: number, effect: ComponentBlockAnimationActionEffect }[] = [];
    if (dirtyAnims.timelines) {
      const allKeyFramesTimelines: { property: string, keyframe: number, effect: ComponentBlockAnimationActionEffect }[] = Object
        .keys(dirtyAnims.timelines)
        .reduce((acc, property) => ([
            ...acc,
            ...dirtyAnims.timelines[property]
              .reduce((acc, t) => ([...acc, ...t.effects
                  .reduce((acc, e) => ([
                    ...acc,
                    ({property: property, keyframe: t.key, effect: e})
                  ]), [])
                ]), []
              )]),
          []);
      allKeyFrames.push(...allKeyFramesTimelines);
    }
    if (dirtyAnims.timeline) {
      const allKeyFramesTimelines: { property: string, keyframe: number, effect: ComponentBlockAnimationActionEffect }[] =
        dirtyAnims.timeline.reduce((acc, t) => ([...acc, ...t.effects
            .reduce((acc, e) => ([
              ...acc,
              ({property: null, keyframe: t.key, effect: e})
            ]), [])
          ]), []
        );
      allKeyFrames.push(...allKeyFramesTimelines);
    }

    // const timelines = Object.keys(dirtyAnims.timelines).map(key => ({property: key, timelines: dirtyAnims.timelines[key]})).reduce((acc, t) => ([...acc, t]), [] as {property: string, timelines: ComponentBlockAnimationTimelineActions}[]);
    // const allKeyFrames = timelines.reduce((acc, a) => ([...acc, ...a.timelines.effects.map(e => ({key: a.key, effect: e}))]), [] as {key: number, effect: ComponentBlockAnimationActionEffect}[]);
    const animations = groupBy(allKeyFrames, a => a.effect.type);
    const normalizedAnimations: NormalizedAnimation[] = [];
    animations.forEach((as, asType) => {
      const keyFramesGroupByTarget = groupBy(as, a => a.effect.target);
      const finalTargetsEffects: {
        target: string,
        properties: {
          property: string,
          effects: {
            keyframe: number,
            property: string,
            effect: ComponentBlockAnimationActionEffect
          }[]
        }[]
      }[] = [];
      keyFramesGroupByTarget.forEach((effects, target) => {
        const keyframesGroupByProperty = groupBy(effects, e => e.property);
        const properties: {
          property: string,
          effects: {
            keyframe: number,
            property: string,
            effect: ComponentBlockAnimationActionEffect
          }[]
        }[] = [];
        keyframesGroupByProperty.forEach((kf, prop) => {
          const orderedKeys = sort(kf, e => e.keyframe);
          properties.push({property: prop, effects: orderedKeys});
        });
        finalTargetsEffects.push({target: target, properties: properties});
      });
      const effectType = this.getEffectType(asType);

      normalizedAnimations.push({effectTypeName: asType, effectType: effectType, targets: finalTargetsEffects});
    });

    return normalizedAnimations;
  }



  // todo: replace with collection of default effects and component type effects
  private _effectTypes: ComponentBlockAnimationActionEffectType[] = [
    {
      name: 'opacity',
      progressive: true,
      buildAnimeFrame: (effect: ComponentBlockAnimationActionEffect) => {
        return {'opacity': effect.options.percent};
      }
    },
    {
      name: 'move',
      progressive: true,
      buildAnimeFrame: (effect: ComponentBlockAnimationActionEffect) => {
        const styles: AnimationStyle = {};
        if (effect.options.y) {
          styles.top = effect.options.y;
        }
        if (effect.options.x) {
          styles.left = effect.options.x;
        }
        return styles;
      }
    },
    {
      name: 'rotate',
      progressive: true,
      buildAnimeFrame: (effect: ComponentBlockAnimationActionEffect) => {
        const styles: AnimationStyle = {};
        if (effect.options.y) {
          styles.rotateY = effect.options.y;
        }
        if (effect.options.x) {
          styles.rotateX = effect.options.x;
        }
        if (effect.options.z) {
          styles.rotateZ = effect.options.z;
        }
        return styles;
      }
    }
  ];

  private getEffectType(name: string): ComponentBlockAnimationActionEffectType {
    return this._effectTypes.find(e => e.name === name);
  }

  private buildComponentAnimation(
    animations: NormalizedAnimation[], events: Observable<{ source: BlockRendererService; event: Observable<any> }[]>
    , actionType: ComponentBlockAnimationActionType, renderer: BlockRendererService) {

    const allEvents = events.pipe(switchMap(eventSources => {
      const finalEvents: Observable<any>[] =
        eventSources.reduce((acc1, eventSource) => {
          return [...acc1, ...animations.reduce((acc, a) => {
            return [...acc, ...a.targets.map(at => {

              const targetBlocks$ = eventSource.source.getBlocksChanges(at.target);

              const targetEvent = combineLatest([
                targetBlocks$.pipe(
                  map(targetBlocks => {
                    return targetBlocks
                      .filter(t => !!t)
                      .map(targetBlock => {

                        const target = targetBlock.componentRef.location.nativeElement;
                        const allAnims = at.properties.map(property => {
                          let prevKeyframe: number = 0;
                          const frames = property.effects.map(e => {
                            const duration = e.keyframe - prevKeyframe;
                            prevKeyframe = e.keyframe;
                            return ({...a.effectType.buildAnimeFrame(e.effect), duration: duration});
                          });
                          return {property: property.property, frames: frames};
                        });

                        // const parent = timeline({targets: target});
                        return allAnims.map(anim => {
                          // const builtAnim = (parent as any).add({
                          const builtAnim = anime({
                            autoplay: false,
                            targets: target,
                            keyframes: anim.frames,
                            duration: 1,
                            easing: 'linear'
                            // }, 0, true);
                          });
                          return {property: anim.property, player: builtAnim};
                        });

                      });
                  })
                ),
                eventSource.event
              ]).pipe(
                takeUntil(renderer.destroy),
                tap(([players, eventValue]) => {

                    if(actionType.progressive) {
                      players.forEach(player => {
                        player.forEach(p => {
                          p.player.seek(p.property ? eventValue[p.property] : eventValue);
                        });
                      });
                    }
                    else {
                      players.forEach(player => {
                        player.forEach(p => {
                          p.player.play();
                        });
                      });
                    }

                  }
                )
              );
              return targetEvent;
            })];
          }, [] as Observable<any>[])];
        }, []);

      return combineLatest(finalEvents);
    }));

    allEvents.pipe(takeUntil(renderer.destroy)).subscribe();
  }

}
