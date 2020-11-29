import {
  Component,
  Input,
} from '@angular/core';
import {ComponentBuilder, Trait} from "@rxshaper/core";

@Component({
  selector: 'p[rxshaper-block-text]',
  template: '{{text}}'
})
@ComponentBuilder({tag: 'text', name: 'Text', canHaveChildren: false, noBlock: true})
export class TextBlock {
  @Trait()
  @Input()
  text: string;
}
