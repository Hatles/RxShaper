import {RxShaperExtensionFunction} from "@rxshaper/core";
import {RxShaperExtension, RxShaperHook} from "../../../../../libs/core/src/lib/decorators/extension.decorator";

@RxShaperExtension('TEST')
export class TestExtension {
  @RxShaperHook()
  afterRender: RxShaperExtensionFunction = (shaper, shaperManager, renderer, properties, args) => {
    console.log('TestExtension.afterRender');
  }
}
