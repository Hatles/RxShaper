import { Component } from '@angular/core';
import {TestService} from "./test.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'test',
  template: '<span>{{data}}</span>',
})
export class DataComponent {
  data: string;
  constructor(public route: ActivatedRoute) {
    this.data = route.snapshot.data.data;
  }
}
