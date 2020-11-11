import { BrowserModule } from '@angular/platform-browser';
import {ComponentFactoryResolver, NgModule} from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { FooComponent } from './foo.component';
import {CustomThingComponent} from "./custom-thing.component";
import { BuilderComponent } from './components/builder/builder.component';
import { BlockComponent } from './components/block/block.component';
import { ChildrenHostDirective } from './directives/children-host.directive';
import { RendererComponent } from './components/renderer/renderer.component';
import { BlockRendererComponent } from './components/block-renderer/block-renderer.component';
import {BlockRendererDirective} from "./components/block-renderer/block-renderer.directive";
import {defaultRxShaperConfig, RxShaperModule} from "./module/rxshaper.module";
import {TestExtension} from "./extensions/test.extension";
import {RXSHAPER_OPTIONS, RxShaperOptions} from "./services/rxshaper.options";
import {TextBlock} from "./blocks/text.block";
import {BoxBlock} from "./blocks/box.block";
import {WrapperTestComponent} from "./components/wrapper-test/wrapper-test.component";
import {TestWrapper} from "./services/test.wrapper";
import { WrapperBlockBoundingsComponent } from './components/wrapper-block-boundings/wrapper-block-boundings.component';

export function buildRxShaperConfig(wrapper: TestWrapper): RxShaperOptions {
  const rxShaperConfig: RxShaperOptions = {
    types: [],
    extensions: [
      {name: 'test', priority: 1, extension: new TestExtension()}
    ],
    wrappers: [
      {name: 'test', priority: 1, wrapper: wrapper}
    ]
  };
  return rxShaperConfig;
}


@NgModule({
  declarations: [WrapperTestComponent, BoxBlock, TextBlock, BlockComponent, AppComponent, FooComponent, CustomThingComponent, BuilderComponent, ChildrenHostDirective, RendererComponent, BlockRendererComponent, BlockRendererDirective, WrapperBlockBoundingsComponent],
  entryComponents: [CustomThingComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: '**',
        component: FooComponent,
      },
    ]),
    // RxShaperModule.forRoot(rxShaperConfig),
    RxShaperModule.forRoot({}),
  ],
  providers: [
    TestWrapper,
    { provide: RXSHAPER_OPTIONS, multi: true, useFactory: buildRxShaperConfig, deps: [TestWrapper] },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    // ComponentBuilder({tag: 'block', name: 'Block', canHaveChildren: true})(BlockComponent); // temp fix for aot prod compilation
  }
}
