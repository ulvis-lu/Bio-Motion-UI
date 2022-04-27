import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-account-delete',
  templateUrl: './account-delete.component.html',
})
export class AccountDeleteComponent implements OnInit {
  @Input() dialogData: any = {};
  constructor(
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {}

  loading: boolean = false;

  accountDelete() {
    if (!this.loading) {
      this.loading = true;
      this.commonData.block('account-delete', {}).subscribe((result) => {
        const err = this.commonData.translate.transform(
          'data-cant-delete-account'
        );
        if (result && Array.isArray(result.data) && result.data.length) {
          if (result.data[0].delete && result.data[0].delete === 'OK') {
            location.href = '/';
            this.snackbar.dismiss();
          } else if (result.data[0].delete) {
            this.commonData.openSnackBar(this.snackbar, result.data[0].delete);
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
