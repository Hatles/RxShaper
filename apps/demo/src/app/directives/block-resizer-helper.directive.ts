import {Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {animationFrameScheduler, Observable, Subject} from "rxjs";
import {debounceTime, map, throttleTime} from "rxjs/operators";
import {$e} from "codelyzer/angular/styles/chars";

export interface DragEvent {
  x: number;
  y: number;
}

@Directive({
  selector: '[rxshaperBlockResizerHelper]',
  exportAs: 'resizer'
})
export class BlockResizerHelperDirective implements OnInit, OnDestroy {

  @Output()
  drag: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();
  dragX: Observable<number> = this.drag.pipe(map(e => e.x));
  dragY: Observable<number> = this.drag.pipe(map(e => e.y));
  @Output()
  dragStart: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();
  dragEnd: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();
  private _drag: Subject<DragEvent> = new Subject<DragEvent>();
  private destroy: Subject<void> = new Subject<void>();

  @Input()
  throttleTime: number = 50;
  @Input()
  throttleFrame: boolean = true;

  private dragging: boolean = false;
  private startingPosition: DragEvent = null;

  constructor(public element: ElementRef) {
  }

  @HostListener('mousedown', ['$event']) onMouseDown($event: MouseEvent){
    $event.stopPropagation();
    this.dragging = true;
    this.startingPosition = toDragPosition($event);
    this.dragStart.emit(this.startingPosition);
  }

  @HostListener('window:mouseup', ['$event']) onMouseUpW($event: MouseEvent){
    if (this.dragging) {
      this.dragging = false;
      this.dragEnd.emit(toDragEvent(this.startingPosition, $event));
    }
  }

  @HostListener('window:mousemove', ['$event']) onMouseMove($event: MouseEvent){
    if (this.dragging) {
      this._drag.next(toDragEvent(this.startingPosition, $event));
    }
  }

  ngOnInit(): void {
    this._drag.pipe(
      this.throttleFrame ? throttleTime(0, animationFrameScheduler) : throttleTime(this.throttleTime)
    )
      .subscribe(e => this.drag.emit(e))
    ;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

}

function toDragPosition(e: MouseEvent): DragEvent {
  return {
    x: e.clientX,
    y: e.clientY
  };
}

function toDragEvent(start: DragEvent, e: MouseEvent): DragEvent {
  return {
    x: e.clientX - start.x,
    y: e.clientY - start.y
  };
}
