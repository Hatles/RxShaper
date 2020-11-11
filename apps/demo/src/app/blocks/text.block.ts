import {
  Component,
  Input,
  ViewContainerRef
} from '@angular/core';
import {ComponentBuilder, Trait} from "../decorators/block.decorator";

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
