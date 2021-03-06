import {RxShaperService} from "./rxshaper.service";
import {BlockRendererService} from "./block-renderer.service";
import {ViewContainerRef} from "@angular/core";

export interface BlockWrapper {
  wrap(container: ViewContainerRef, shaper: RxShaperService, renderer: BlockRendererService): ViewContainerRef
  unwrap(container: ViewContainerRef, shaper: RxShaperService, renderer: BlockRendererService): void
}
