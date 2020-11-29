import {
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {BlockRendererService} from "../../services/block-renderer.service";
import {ComponentBlock} from "../../models/block";

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
