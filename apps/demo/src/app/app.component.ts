import {Component, OnInit} from '@angular/core';
import { GetContentOptions } from '@builder.io/sdk';
import {BuilderService} from "@builder.io/angular";
import {BuilderifyService} from "./services/builderify.service";
import {ComponentBlock} from "./components/builder/builder.component";
// import components from "./data/components.json";
import {components} from "./data/components";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'app';
  options: GetContentOptions = {
    cacheSeconds: 1,
    prerender: false
  };

  data = {
    property: 'hello',
    fn: (text: string) => alert(text),
  };

  editor;
  components: ComponentBlock[];


  constructor(service: BuilderService, service2: BuilderifyService) {
    this.components = components;
  }

  load(event: any) {
    console.log('load', event);
  }

  error(event: any) {
    console.log('error', event);
  }
}
