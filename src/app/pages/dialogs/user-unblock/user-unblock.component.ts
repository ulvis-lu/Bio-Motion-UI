import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-unblock',
  templateUrl: './user-unblock.component.html',
})
export class UserUnblockComponent implements OnInit {
  @Input() dialogData: any = {};

  constructor(
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {}

  unblockOk: boolean = false;
  message: string = '';

  loading: boolean = false;

  unblock() {
    if (!this.loading) {
      this.loading = true;
      this.commonData
        .block('unblock-user', {
          id: this.dialogData.id,
        })
        .subscribe((result) => {
          const err = this.commonData.translate.transform('data-cant-unblock');
          if (result && Array.isArray(result.data) && result.data.length) {
            if (result.data[0].unblock && result.data[0].unblock === 'OK') {
              this.unblockOk = true;
              this.message =
                this.commonData.translate.transform('data-unblocked');
              this.snackbar.dismiss();
            } else if (result.data[0].unblock) {
              this.commonData.openSnackBar(
                this.snackbar,
                result.data[0].unblock
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
