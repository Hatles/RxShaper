import {
  Component,
  ComponentFactoryResolver,
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
import {RxShaperService} from "../../services/rxshaper.service";
import {DOCUMENT} from "@angular/common";
import {BlockRendererService} from "./block-renderer.service";

@Component({
  selector: 'rxshaper-block-renderer',
  templateUrl: './block-renderer.component.html',
  styleUrls: ['./block-renderer.component.scss']
})
export class BlockRendererComponent implements OnInit, OnDestroy {

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
    // private container: ViewContainerRef,
    // private resolver: ComponentFactoryResolver,
    // private injector: Injector,
    // private renderer: Renderer2,
    // @Inject(DOCUMENT) private document: Document,
    // private builder: RxShaperService,
    // @Optional() @SkipSelf() private parent?: BlockRendererDirective
    service: BlockRendererService
  ) {
    // this.service = new BlockRendererService(container, resolver, injector, renderer, document, builder, parent ? parent.service : null);
    this.service = service;
  }

  ngOnInit(): void {
    this.service.onInit(this.component);
  }

  ngOnDestroy(): void {
    this.service.onDestroy();
  }
}
