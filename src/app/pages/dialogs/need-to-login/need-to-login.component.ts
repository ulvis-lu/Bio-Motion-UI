import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-need-to-login',
  templateUrl: './need-to-login.component.html',
})
export class NeedToLoginComponent implements OnInit {
  @Input() dialogData: any = {};
  constructor(public router: Router) {}
  @Output() close = new EventEmitter<any>();
  closeDialog(type: string = 'close') {
    this.close.emit({ type: type });
  }
  goData() {
    this.router.navigateByUrl('/signin');
    this.closeDialog();
  }
  ngOnInit(): void {}
}
