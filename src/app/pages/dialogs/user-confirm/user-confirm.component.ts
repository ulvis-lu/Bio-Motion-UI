import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-confirm',
  templateUrl: './user-confirm.component.html',
})
export class UserConfirmComponent implements OnInit {
  @Input() dialogData: any = {};

  constructor(
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {}

  confirmOk: boolean = false;
  message: string = '';

  loading: boolean = false;

  _confirm() {
    if (!this.loading) {
      this.loading = true;
      this.commonData
        .block('admin-confirm-user', {
          id: this.dialogData.id,
        })
        .subscribe((result) => {
          const err = this.commonData.translate.transform('data-cant-confirm');
          if (result && Array.isArray(result.data) && result.data.length) {
            if (result.data[0].confirm && result.data[0].confirm === 'OK') {
              this.confirmOk = true;
              this.message =
                this.commonData.translate.transform('data-confirm');
              this.snackbar.dismiss();
            } else if (result.data[0].confirm) {
              this.commonData.openSnackBar(
                this.snackbar,
                result.data[0].confirm
              );
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

  ngOnInit(): void {}
}
