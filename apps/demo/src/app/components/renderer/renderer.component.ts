import {Component, Input, OnInit} from '@angular/core';
import {ComponentBlock} from "../builder/builder.component";
import {RendererService} from "./renderer.service";

@Component({
  selector: '[rxshaper-renderer]',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.scss'],
  providers: [
    RendererService
  ]
})
export class RendererComponent implements OnInit {

  @Input()
  components: ComponentBlock[];

  constructor() { }

  ngOnInit(): void {

  }

}
