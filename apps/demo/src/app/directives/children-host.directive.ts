import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[builderifyChildrenHost]'
})
export class ChildrenHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
