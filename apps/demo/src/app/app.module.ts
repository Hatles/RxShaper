import {BrowserModule} from '@angular/platform-browser';
import {
  Compiler, Component,
  ComponentFactoryResolver, Injectable, InjectionToken,
  Injector, ModuleWithProviders,
  NgModule,
  NgModuleFactory, NgModuleFactoryLoader,
  NgModuleRef, Provider,
  StaticProvider, SystemJsNgModuleLoader
} from '@angular/core';
import {
  LoadChildren,
  PRIMARY_OUTLET,
  Route,
  Router,
  RouterModule,
  RouterPreloader,
  Routes,
  ROUTES
} from '@angular/router';

import {AppComponent} from './app.component';
import {FooComponent} from './foo.component';
import {CustomThingComponent} from "./custom-thing.component";
import {BuilderComponent} from './components/builder/builder.component';
import {BlockComponent} from './components/block/block.component';
import {ChildrenHostDirective} from './directives/children-host.directive';
import {RXSHAPER_OPTIONS, RxShaperCoreModule, RxShaperOptions} from "@rxshaper/core";
import {TextBlock} from "./blocks/text.block";
import {BoxBlock} from "./blocks/box.block";
import {WrapperTestComponent} from "./components/wrapper-test/wrapper-test.component";
import {TestWrapper} from "./services/test.wrapper";
import {WrapperBlockBoundingsComponent} from './components/wrapper-block-boundings/wrapper-block-boundings.component';
import {BlockResizerHelperDirective} from './directives/block-resizer-helper.directive';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BarComponent} from "./bar.component";
import {JitCompilerFactory} from "@angular/platform-browser-dynamic";
import {DynamicRouterModule} from "./module/dynamic/dynamic-router.module";

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
    extensions: [],
  };
}

export function buildCompilerFactory(factory: JitCompilerFactory): Compiler {
  return factory.createCompiler();
}

export function buildRoutesFactory(compiler: Compiler): Routes {
  return [
    {
      path: 'foo',
      component: FooComponent,
    },
    {
      path: 'bar',
      component: BarComponent,
    },
    {
      path: 'test',
      loadChildren: () => {
        return import('./module/test/test.module')
          .then(m => m.TestModule)
          .then(t => {
            return t;
          })
          ;
      },
    }
  ];
}

@NgModule({
  declarations: [WrapperTestComponent, BoxBlock, TextBlock, BlockComponent, AppComponent, FooComponent, BarComponent, CustomThingComponent, BuilderComponent, ChildrenHostDirective, WrapperBlockBoundingsComponent, BlockResizerHelperDirective],
  entryComponents: [CustomThingComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // required for animations
    RouterModule.forRoot([
      // {
      //   path: '**',
      //   component: FooComponent,
      // },
    ]),
    DynamicRouterModule.forRoot(),
    RxShaperCoreModule.forRoot(),
  ],
  providers: [
    TestWrapper,
    {provide: RXSHAPER_OPTIONS, multi: true, useFactory: defaultRxShaperConfig, deps: []},
    {provide: RXSHAPER_OPTIONS, multi: true, useFactory: buildRxShaperConfig, deps: [TestWrapper]},
    // {provide: JitCompiler, useFactory: buildCompilerFactory, deps: [JitCompilerFactory]},
    {provide: ROUTES, multi: true, useFactory: buildRoutesFactory, deps: [Compiler]}
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    // ComponentBuilder({tag: 'block', name: 'Block', canHaveChildren: true})(BlockComponent); // temp fix for aot prod compilation
  }
}
