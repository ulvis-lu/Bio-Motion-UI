import { Component, OnInit } from '@angular/core';
import { PageLoadService } from 'shared/services/page-load.service';
import { User } from 'shared/interfaces/User';
import { FormGroup } from '@angular/forms';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogsComponent } from '../../dialogs/dialogs.component';

@Component({
  selector: 'app-account-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  loading: boolean = true;
  user: User | undefined;

  group = new FormGroup({});

  getErrorMessage(field: string) {
    return '';
  }

  account() {
    if (!this.loading) {
      this.pageLoad.loading.next(true);
      this.commonData.block('account-settings', {}).subscribe((result) => {
        const err = this.commonData.translate.transform('data-cant-save');
        if (result && Array.isArray(result.data) && result.data.length) {
          if (result.data[0].account && result.data[0].account === 'OK') {
            this.commonData.openSnackBar(
              this.snackbar,
              this.commonData.translate.transform('data-saved'),
              2000,
              'snackbar-success'
            );

            this.user = Object.assign(this.user, {});
            this.pageLoad.user.next(this.user);
          } else if (result.data[0].account) {
            this.commonData.openSnackBar(this.snackbar, result.data[0].account);
          } else {
            this.commonData.openSnackBar(this.snackbar, err);
          }
        } else {
          this.commonData.openSnackBar(this.snackbar, err);
        }
        this.pageLoad.loading.next(false);
      });
    }
  }

  deleteAccount() {
    const dialogRef = this.dialog.open(DialogsComponent, {
      data: {
        dialogName: 'account-delete',
        dialogData: {},
      },
    });
    dialogRef.afterClosed().subscribe((res) => {});
  }

  constructor(
    private dialog: MatDialog,
    private pageLoad: PageLoadService,
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.pageLoad.loading.subscribe(
      (loading: boolean) => (this.loading = loading)
    );
    this.pageLoad.user.subscribe((user: User) => {
      this.user = user;
    });
  }
}
