import { Component, OnInit } from '@angular/core';
import { PageLoadService } from 'shared/services/page-load.service';
import { CommonDataService } from 'shared/services/common-data.service';
import { User } from 'shared/interfaces/User';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { trimSpaces } from 'shared/common/validators';

@Component({
  selector: 'app-account-info',
  templateUrl: './info.component.html',
})
export class InfoComponent implements OnInit {
  user: User | undefined;

  loading: boolean = false;

  group = new FormGroup({
    _name: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
      Validators.minLength(2),
      trimSpaces(2),
    ]),
    email: new FormControl({ value: '', disabled: true }),
  });

  getErrorMessage(field: string) {
    if (field === '_name' && this.group.get('_name')?.hasError('required')) {
      return this.commonData.translate.transform('account-error-required-name');
    } else if (
      field === '_name' &&
      this.group.get('_name')?.hasError('maxlength')
    ) {
      return this.commonData.translate.transform('account-error-name-max');
    } else if (
      field === '_name' &&
      (this.group.get('_name')?.hasError('minlength') ||
        this.group.get('_name')?.hasError('trimSpaces'))
    ) {
      return this.commonData.translate.transform('account-error-name-min');
    }

    return '';
  }

  account() {
    if (!this.loading && this.getErrorMessage('_name').length === 0) {
      this.pageLoad.loading.next(true);
      this.commonData
        .block('account-info', {
          name: this.group.get('_name')?.value,
        })
        .subscribe((result) => {
          const err = this.commonData.translate.transform('data-cant-save');
          if (result && Array.isArray(result.data) && result.data.length) {
            if (result.data[0].account && result.data[0].account === 'OK') {
              this.user = Object.assign(this.user, {
                name: this.group.get('_name')?.value,
              });
              this.pageLoad.user.next(this.user);
              this.commonData.openSnackBar(
                this.snackbar,
                this.commonData.translate.transform('data-saved'),
                2000,
                'snackbar-success'
              );
            } else if (result.data[0].account) {
              this.commonData.openSnackBar(
                this.snackbar,
                result.data[0].account
              );
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
      this.group.get('_name')?.setValue(this.user.name);
      this.group.get('email')?.setValue(this.user.email);
    });
  }
}
