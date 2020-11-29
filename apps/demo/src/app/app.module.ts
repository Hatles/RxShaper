import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {AppComponent} from './app.component';
import {FooComponent} from './foo.component';
import {CustomThingComponent} from "./custom-thing.component";
import {BuilderComponent} from './components/builder/builder.component';
import {BlockComponent} from './components/block/block.component';
import {ChildrenHostDirective} from './directives/children-host.directive';
import {TestExtension} from "./extensions/test.extension";
import {RXSHAPER_OPTIONS, RxShaperCoreModule, RxShaperOptions} from "@rxshaper/core";
import {TextBlock} from "./blocks/text.block";
import {BoxBlock} from "./blocks/box.block";
import {WrapperTestComponent} from "./components/wrapper-test/wrapper-test.component";
import {TestWrapper} from "./services/test.wrapper";
import {WrapperBlockBoundingsComponent} from './components/wrapper-block-boundings/wrapper-block-boundings.component';
import {BlockResizerHelperDirective} from './directives/block-resizer-helper.directive';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

export function buildRxShaperConfig(wrapper: TestWrapper): RxShaperOptions {
  const rxShaperConfig: RxShaperOptions = {
    types: [],
    extensions: [
      // {name: 'test', priority: 1, extension: new TestExtension()}
    ],
    wrappers: [
      {name: 'test', priority: 1, wrapper: wrapper}
    ]
  };
  return rxShaperConfig;
}

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
  declarations: [WrapperTestComponent, BoxBlock, TextBlock, BlockComponent, AppComponent, FooComponent, CustomThingComponent, BuilderComponent, ChildrenHostDirective, WrapperBlockBoundingsComponent, BlockResizerHelperDirective],
  entryComponents: [CustomThingComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // required for animations
    RouterModule.forRoot([
      {
        path: '**',
        component: FooComponent,
      },
    ]),
    RxShaperCoreModule.forRoot(),
  ],
  providers: [
    TestWrapper,
    { provide: RXSHAPER_OPTIONS, multi: true, useFactory: defaultRxShaperConfig, deps: [] },
    { provide: RXSHAPER_OPTIONS, multi: true, useFactory: buildRxShaperConfig, deps: [TestWrapper] },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    // ComponentBuilder({tag: 'block', name: 'Block', canHaveChildren: true})(BlockComponent); // temp fix for aot prod compilation
  }
}
