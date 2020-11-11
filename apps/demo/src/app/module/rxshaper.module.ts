import {RXSHAPER_OPTIONS, RxShaperOptions} from "../services/rxshaper.options";
import {ModuleWithProviders, NgModule} from "@angular/core";
import {RxShaperConfig} from "../services/rxshaper.config";
import {RxShaperService} from "../services/rxshaper.service";
import {BoxBlock} from "../blocks/box.block";
import {TextBlock} from "../blocks/text.block";
import {BlockComponent} from "../components/block/block.component";

export function defaultRxShaperConfig(): RxShaperOptions {
  return {
    types: [
      // ...RxShaperService.Components
      {
        name: 'Block',
        class: BlockComponent,
        inputs: [
          {name: 'test'}
        ],
        outputs: [
          {name: 'doSomething'}
        ]
      },
      {
        name: 'Box',
        class: BoxBlock,
        canHaveChildren: true,
        noBlock: true,
      },
      {
        name: 'Text',
        class: TextBlock,
        noBlock: true,
        inputs: [
          {name: 'text'}
        ],
      }
    ],
    extensions: [
    ],
  };
}

@NgModule({
  declarations: [],
  exports: [],
  imports: [],
})
export class RxShaperModule {
  static forRoot(config: RxShaperOptions = {}): ModuleWithProviders<RxShaperModule> {
    return {
      ngModule: RxShaperModule,
      providers: [
        { provide: RXSHAPER_OPTIONS, multi: true, useFactory: defaultRxShaperConfig, deps: [] },
        { provide: RXSHAPER_OPTIONS, useValue: config, multi: true },
        RxShaperConfig,
        RxShaperService,
      ],
    };
  }

  static forChild(config: RxShaperOptions = {}): ModuleWithProviders<RxShaperModule> {
    return {
      ngModule: RxShaperModule,
      providers: [{ provide: RXSHAPER_OPTIONS, useValue: config, multi: true },
        RxShaperConfig,
        RxShaperService
      ],
    };
  }

  constructor() {
  }
}
