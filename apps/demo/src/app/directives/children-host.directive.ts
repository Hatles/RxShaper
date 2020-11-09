import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[rxshaperChildrenHost]'
})
export class ChildrenHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
