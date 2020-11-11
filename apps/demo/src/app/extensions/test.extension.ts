import {BaseRxShaperExtension} from "./extension";
import {RxShaperService} from "../services/rxshaper.service";
import {BlockRendererService} from "../components/block-renderer/block-renderer.service";


export class TestExtension extends BaseRxShaperExtension {
  afterRender(shaper: RxShaperService, renderer: BlockRendererService) {
    console.log('TestExtension.afterRender');
  }
}
