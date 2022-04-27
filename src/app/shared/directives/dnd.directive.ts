import {
  Directive,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';

@Directive({
  selector: '[appDnd]',
})
export class DndDirective {
  el: any;
  constructor(el: ElementRef) {
    this.el = el;
  }
  @Output() files = new EventEmitter<any>();
  @HostListener('dragover', ['$event'])
  dragOver(event: any) {
    event.preventDefault();
    this.el?.nativeElement?.classList.add('drag-over');
  }
  @HostListener('dragleave', ['$event'])
  dragLeave(event: any) {
    event.preventDefault();
    this.el?.nativeElement?.classList.remove('drag-over');
  }
  @HostListener('drop', ['$event'])
  drop(event: any) {
    event.preventDefault();
    this.el?.nativeElement?.classList.remove('drag-over');
    this.files.emit(event.dataTransfer.files);
  }
}
