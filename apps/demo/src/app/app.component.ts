import {Component, OnInit} from '@angular/core';
import { GetContentOptions } from '@builder.io/sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'app';
  options: GetContentOptions = {
    cacheSeconds: 1,
  };

  data = {
    property: 'hello',
    fn: (text: string) => alert(text),
  };

  editor;

  load(event: any) {
    console.log('load', event);
  }

  error(event: any) {
    console.log('error', event);
  }
}
