import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'data',
  template: '<span>{{data}}</span>',
})
export class DataComponent {
  data: string;
  constructor(public route: ActivatedRoute) {
    this.data = route.snapshot.data.data;
  }
}
