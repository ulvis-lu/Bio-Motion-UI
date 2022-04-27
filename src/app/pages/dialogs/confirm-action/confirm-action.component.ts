import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-confirm-action',
  templateUrl: './confirm-action.component.html',
})
export class ConfirmActionComponent implements OnInit {
  @Input() dialogData: any = {};

  constructor() {}

  confirmAction() {
    this.closeDialog('confirm');
  }

  @Output() close = new EventEmitter<any>();
  closeDialog(type: string = 'close') {
    this.close.emit({ type: type });
  }

  ngOnInit(): void {}
}
