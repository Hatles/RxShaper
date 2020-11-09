import {
  Component,
  ComponentFactoryResolver, Directive,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  SkipSelf,
  ViewContainerRef
} from '@angular/core';
import {ComponentBlock} from "../builder/builder.component";
import {BuilderifyService} from "../../services/rxshaper.service";
import {DOCUMENT} from "@angular/common";
import {BlockRendererService} from "./block-renderer.service";

@Directive({
  selector: '[rxshaperBlockRenderer]'
})
export class BlockRendererDirective implements OnInit, OnDestroy {

  @Input()
  component: ComponentBlock;

  service: BlockRendererService;

  /**
   * @param container
   * @param resolver
   * @param injector
   * @param renderer
   * @param document
   * @param builder
   * @param parent
   */
  constructor(
    private container: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document,
    private builder: BuilderifyService,
    @Optional() @SkipSelf() private parent?: BlockRendererDirective
  ) {
    this.service = new BlockRendererService(container, resolver, injector, renderer, document, builder, parent ? parent.service : null);
  }

  ngOnInit(): void {
    this.service.onInit(this.component);
  }

  ngOnDestroy(): void {
    this.service.onDestroy()
  }
}
