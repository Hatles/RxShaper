import { Component } from '@angular/core';
import {TestService} from "./test.service";

@Component({
  selector: 'test',
  template: `
    <span>{{testService.data}}</span>
    <a *ngFor="let d of testService.routes" [routerLink]="d.path">{{d.label}}</a>
    <a [routerLink]="'data12'">data 12</a>
    <a [routerLink]="'data22'">data 22</a>
    <a [routerLink]="'async'">async</a>
    <a [routerLink]="'asyncpage'">asyncpage</a>
    <a [routerLink]="'asyncpage2'">asyncpage2</a>
    <a [routerLink]="'http'">http</a>
    <router-outlet></router-outlet>
  `,
})
export class TestComponent {
  constructor(public testService: TestService) {
  }
}
