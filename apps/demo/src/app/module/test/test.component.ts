import { Component } from '@angular/core';
import {TestService} from "./test.service";

@Component({
  selector: 'test',
  template: '<span>{{testService.data}}</span><a *ngFor="let d of testService.routes" [routerLink]="d.path">{{d.label}}</a><router-outlet></router-outlet>',
})
export class TestComponent {
  constructor(public testService: TestService) {
  }
}
