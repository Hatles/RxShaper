import {Component, Input} from "@angular/core";
import {BuilderBlock} from "@builder.io/angular";

@Component({
  selector: 'custom-thing',
  template: 'Hello: {{name}}',
})
export class CustomThingComponent {
  @Input()
  name = '';
}

BuilderBlock({
  tag: 'custom-thing',
  name: 'Custom thing',
  inputs: [
    {
      name: 'name',
      type: 'string',
    },
  ],
})(CustomThingComponent);
