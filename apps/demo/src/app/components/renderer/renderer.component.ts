import {Component, Input, OnInit} from '@angular/core';
import {ComponentBlock} from "../builder/builder.component";

@Component({
  selector: '[rxshaper-renderer]',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.scss']
})
export class RendererComponent implements OnInit {

  @Input()
  components: ComponentBlock[];

  constructor() { }

  ngOnInit(): void {
  }

}
