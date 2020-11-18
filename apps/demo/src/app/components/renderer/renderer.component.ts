import {Component, ElementRef, InjectionToken, Input, OnInit, Self} from '@angular/core';
import {ComponentBlock} from "../builder/builder.component";
import {RendererService, RXSHAPER_VIEWPORT} from "./renderer.service";

export function shaperViewportFactory(component: RendererComponent): HTMLElement | any {
  return component.elementRef.nativeElement;
}

@Component({
  selector: '[rxshaper-renderer]',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.scss'],
  providers: [
    RendererService,
    {provide: RXSHAPER_VIEWPORT, useFactory: shaperViewportFactory, deps: [RendererComponent]}
  ]
})
export class RendererComponent implements OnInit {

  @Input()
  components: ComponentBlock[];

  constructor(public elementRef: ElementRef<any>) {
  }

  ngOnInit(): void {}
}
