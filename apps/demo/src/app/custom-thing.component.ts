import {Component, Input} from "@angular/core";

@Component({
  selector: 'custom-thing',
  template: 'Hello: {{name}}',
})
export class CustomThingComponent {
  @Input()
  name = '';
}
