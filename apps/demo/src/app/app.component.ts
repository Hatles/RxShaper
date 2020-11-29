import {Component, ElementRef, ViewChild} from '@angular/core';
import {components} from "./data/components";
import {ComponentBlock} from "@rxshaper/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'app';

  data = {
    property: 'hello',
    fn: (text: string) => alert(text),
  };

  editor;
  components: ComponentBlock[];

  @ViewChild("builder", {read: ElementRef, static: true})
  builderRef: ElementRef;

  constructor() {
    this.components = components;
  }

  load(event: any) {
    console.log('load', event);
  }

  error(event: any) {
    console.log('error', event);
  }
}
