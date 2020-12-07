import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Route, RouterModule, ROUTES} from "@angular/router";
import {TestComponent} from "./test.component";
import {RouteData, TestService} from "./test.service";
import {of} from "rxjs";
import {delay, map} from "rxjs/operators";
import {DataComponent} from "./data.component";
import {
  ASYNC_ITEMS, AsyncItemRegistry,
  provideAsyncInitializer, returnAsyncItem, transformAsyncItems, DYNAMIC_MODULE_INITIALIZER, NgxDynamicRouterModule
} from "@hatles/ngx-dynamic-router";
import {ASYNC_PAGES, provideAsyncPageInitializer, RxPagerModule, PAGES} from "@hatles/rxpager";
import {HttpPageLoader} from "../../../../../../libs/common/rxpager/src/lib/loaders/http-page-loader";


export function dynamicInitializer(testService: TestService) {
  return () => {
    return of('test_initializer').pipe(delay(1000), map(data => {
      testService.data = data;
      return null;
    }));
  };
}
export function dynamicInitializerRoutes(testService: TestService) {
  return () => {
    const routes: RouteData[] = [
      {
        path: 'data1',
        label: "Data 1",
        data: 'data_1'
      },
      {
        path: 'data2',
        label: "Data 2",
        data: 'data_2'
      }
    ];
    return of(routes).pipe(delay(1000), map(r => {
      testService.routes = r;
      return null;
    }));
  };
}
export function routesFactory(testService: TestService): Route[] {
    const children: Route[] = testService.routes.map(d => {
      return {
        path: d.path,
        component: DataComponent,
        data: {
          data: d.data
        }
      };
    });

    return [
      {
        path: '',
        component: TestComponent,
        children: children
      }
    ];
}

@NgModule({
  declarations: [TestComponent, DataComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    NgxDynamicRouterModule.forChild(),
    RxPagerModule.forChild([
        {
          path: 'data12',
          component: 'data',
          options: {
            data: 'data12'
          }
        },
        {
          path: 'data22',
          component: 'data',
          options: {
            data: 'data22'
          }
        },
      ],
      {
        components: [
          {
            name: 'data',
            type: DataComponent,
          }
        ],
        loaders: [
          {type: HttpPageLoader, options: {url: '/assets/pages.json'}}
        ]
      }),
  ],
  providers: [
    TestService,
    {provide: DYNAMIC_MODULE_INITIALIZER, multi: true, useFactory: dynamicInitializer, deps: [TestService]},
    {provide: DYNAMIC_MODULE_INITIALIZER, multi: true, useFactory: dynamicInitializerRoutes, deps: [TestService]},
    {provide: ROUTES, multi: true, useFactory: routesFactory, deps: [TestService]},

    // provideAsyncInitializer(ROUTES, true),
    {
      provide: ASYNC_ITEMS, useValue: () => returnAsyncItem(ROUTES, [{
        path: 'async',
        component: DataComponent,
        data: {
          data: 'async'
        }
      }], true), multi: true,
    },
    {provide: ROUTES, useFactory: (registry: AsyncItemRegistry) => transformAsyncItems(registry, ROUTES, true), deps: [AsyncItemRegistry], multi: true},

    // provideAsyncInitializer(PAGES, true),
    {
      provide: ASYNC_ITEMS, useValue: () => returnAsyncItem(PAGES, [{
        path: 'asyncpage',
        component: 'data',
        options: {
          data: 'asyncpage'
        }
      }], true), multi: true,
    },
    {provide: PAGES, useFactory: (registry: AsyncItemRegistry) => transformAsyncItems(registry, PAGES, true), deps: [AsyncItemRegistry], multi: true},

    // provideAsyncPageInitializer(),
    {provide: ASYNC_PAGES, useValue: () => [{
        path: 'asyncpage2',
        component: 'data',
        options: {
          data: 'asyncpage2'
        }
      }], multi: true},
  ]
})
export class TestModule { }
