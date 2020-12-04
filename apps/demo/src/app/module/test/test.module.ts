import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Route, RouterModule, ROUTES} from "@angular/router";
import {TestComponent} from "./test.component";
import {RouteData, TestService} from "./test.service";
import {of} from "rxjs";
import {delay, tap} from "rxjs/operators";
import {DataComponent} from "./data.component";
import {DYNAMIC_MODULE_INITIALIZER} from "@hatles/ngx-dynamic-router";


export function dynamicInitializer(testService: TestService) {
  return () => {
    return of('test_initializer').pipe(delay(1000), tap(data => testService.data = data));
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
    return of(routes).pipe(delay(1000), tap(r => testService.routes = r));
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
    RouterModule.forChild([])
  ],
  providers: [
    TestService,
    {provide: DYNAMIC_MODULE_INITIALIZER, multi: true, useFactory: dynamicInitializer, deps: [TestService]},
    {provide: DYNAMIC_MODULE_INITIALIZER, multi: true, useFactory: dynamicInitializerRoutes, deps: [TestService]},
    {provide: ROUTES, multi: true, useFactory: routesFactory, deps: [TestService]}
  ]
})
export class TestModule { }
