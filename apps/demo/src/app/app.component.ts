import {Component} from '@angular/core';
import {RxShaperService} from "./services/rxshaper.service";
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

  data = {
    property: 'hello',
    fn: (text: string) => alert(text),
  };

  editor;
  components: ComponentBlock[];


  constructor(service: RxShaperService) {
    this.components = components;
  }

  load(event: any) {
    console.log('load', event);
  }

  error(event: any) {
    console.log('error', event);
  }
}
