import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {BlockRendererService} from "../services/block-renderer.service";
import {ComponentBlock} from "../models/block";

@Directive({
  selector: '[rxshaperBlockRenderer]',
  providers: [BlockRendererService]
})
export class BlockRendererDirective implements OnInit, OnDestroy {

  @Input()
  component: ComponentBlock;

  @Input()
  root: boolean;

  service: BlockRendererService;

  /**
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
    this.service.onInit(this.component, this.root);
  }

  ngOnDestroy(): void {
    this.service.onDestroy();
  }
}
