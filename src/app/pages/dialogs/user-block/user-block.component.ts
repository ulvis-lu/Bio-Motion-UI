import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trimSpaces } from 'shared/common/validators';

@Component({
  selector: 'app-user-block',
  templateUrl: './user-block.component.html',
})
export class UserBlockComponent implements OnInit {
  @Input() dialogData: any = {};

  constructor(
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {}

  blockOk: boolean = false;
  message: string = '';

  days: number[] = [];
  mins: number[] = [];
  hours: number[] = [];

  loading: boolean = false;

  group = new FormGroup({
    _desc: new FormControl('', [
      Validators.required,
      Validators.maxLength(250),
      Validators.minLength(10),
      trimSpaces(10),
    ]),
    blockOption: new FormControl('1'),
    days: new FormControl(null),
    hours: new FormControl(null),
    mins: new FormControl(null),
  });

  getErrorMessage(field: string) {
    if (field === '_desc' && this.group.get('_desc')?.hasError('required')) {
      return this.commonData.translate.transform(
        'user-error-required-block-reason'
      );
    } else if (
      field === '_desc' &&
      this.group.get('_desc')?.hasError('maxlength')
    ) {
      return this.commonData.translate.transform('user-error-block-reason-max');
    } else if (
      field === '_desc' &&
      (this.group.get('_desc')?.hasError('minlength') ||
        this.group.get('_desc')?.hasError('trimSpaces'))
    ) {
      return this.commonData.translate.transform('user-error-block-reason-min');
    }

    return '';
  }

  block() {
    if (!this.loading && this.getErrorMessage('_desc').length === 0) {
      this.loading = true;
      this.commonData
        .block('block-user', {
          _desc: this.group.get('_desc')?.value,
          type: this.group.get('blockOption')?.value,
          days: this.group.get('days')?.value
            ? this.group.get('days')?.value
            : 0,
          mins: this.group.get('mins')?.value
            ? this.group.get('mins')?.value
            : 0,
          hours: this.group.get('hours')?.value
            ? this.group.get('hours')?.value
            : 0,
          id: this.dialogData.id,
        })
        .subscribe((result) => {
          const err = this.commonData.translate.transform('data-cant-block');
          if (result && Array.isArray(result.data) && result.data.length) {
            if (result.data[0].block && result.data[0].block === 'OK') {
              this.blockOk = true;
              this.message =
                this.commonData.translate.transform('data-blocked');
              this.snackbar.dismiss();
            } else if (result.data[0].block) {
              this.commonData.openSnackBar(this.snackbar, result.data[0].block);
            } else {
              this.commonData.openSnackBar(this.snackbar, err);
            }
          } else {
            this.commonData.openSnackBar(this.snackbar, err);
          }
          this.loading = false;
        });
    }
  }

  @Output() close = new EventEmitter<any>();
  closeDialog(type: string = 'close') {
    this.close.emit({ type: type });
  }

  ngOnInit(): void {
    for (let i = 0; i <= 30; i++) {
      this.days.push(i);
    }
    for (let i = 0; i <= 60; i++) {
      this.mins.push(i);
    }
    for (let i = 0; i <= 24; i++) {
      this.hours.push(i);
    }
  }
}
