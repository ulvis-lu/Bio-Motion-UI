import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PageLoadService } from 'shared/services/page-load.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonDataService } from 'shared/services/common-data.service';
import { RecaptchaComponent } from 'ng-recaptcha';
import { User } from 'shared/interfaces/User';
import { trimSpaces } from 'shared/common/validators';

@Component({
  selector: 'app-password-recover',
  templateUrl: './password-recover.component.html',
})
export class PasswordRecoverComponent implements OnInit {
  loading: boolean = true;
  user: User | undefined;

  pageId: string = '';
  pageIdChecked: boolean = false;
  pageIdInvalid: boolean = false;

  pRecoverOk: boolean = false;
  message: string = '';

  h: number = 0;
  menuH: number = 100;
  minH: number = 300;
  hide: boolean = true;

  group = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  groupPassword = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
      Validators.minLength(6),
      trimSpaces(6),
    ]),
    passwordRepeat: new FormControl('', [this.passwordMatch]),
  });

  updateTmp() {
    PageLoadService.tmp_pass = this.groupPassword.get('password')?.value;
  }

  passwordMatch(control: AbstractControl): ValidationErrors | null {
    if (control.value !== PageLoadService.tmp_pass) {
      return { passwordMatch: true };
    }
    return null;
  }

  getErrorMessage(field: string) {
    if (field === 'email' && this.group.get('email')?.hasError('required')) {
      return this.commonData.translate.transform(
        'account-pr-error-required-email'
      );
    } else if (
      field === 'email' &&
      this.group.get('email')?.hasError('email')
    ) {
      return this.commonData.translate.transform(
        'account-pr-error-invalid-email'
      );
    } else if (
      field === 'password' &&
      this.groupPassword.get('password')?.hasError('required')
    ) {
      return this.commonData.translate.transform(
        'account-pr-error-required-password'
      );
    } else if (
      field === 'password' &&
      this.groupPassword.get('password')?.hasError('maxlength')
    ) {
      return this.commonData.translate.transform(
        'account-pr-error-password-max'
      );
    } else if (
      field === 'password' &&
      (this.groupPassword.get('password')?.hasError('minlength') ||
        this.groupPassword.get('password')?.hasError('trimSpaces'))
    ) {
      return this.commonData.translate.transform(
        'account-pr-error-password-min'
      );
    } else if (
      field === 'passwordRepeat' &&
      this.groupPassword.get('password')?.value !==
        this.groupPassword.get('passwordRepeat')?.value
    ) {
      return this.commonData.translate.transform(
        'account-pr-error-password-reapeat'
      );
    }

    return '';
  }

  goData() {
    document.location.href = this.commonData.mainUrl + '/signin';
  }

  pRecover() {
    if (this.pageId.length && !this.pageIdInvalid) {
      if (
        !this.loading &&
        this.getErrorMessage('password').length === 0 &&
        this.getErrorMessage('passwordRepeat').length === 0
      ) {
        this.pageLoad.loading.next(true);
        this.commonData
          .block('recover', {
            password: this.groupPassword.get('password')?.value,
            id: this.pageId,
          })
          .subscribe((result) => {
            const err = this.commonData.translate.transform(
              'data-cant-password-recover'
            );
            if (result && Array.isArray(result.data) && result.data.length) {
              if (result.data[0].recover && result.data[0].recover === 'OK') {
                this.pRecoverOk = true;
                this.message = this.commonData.translate.transform(
                  'data-password-recovered'
                );
                this.snackbar.dismiss();
              } else if (result.data[0].recover) {
                this.commonData.openSnackBar(
                  this.snackbar,
                  result.data[0].recover
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
    } else {
      if (!this.loading && this.getErrorMessage('email').length === 0) {
        this.pageLoad.loading.next(true);
        this.commonData
          .block('recover', {
            email: this.group.get('email')?.value,
            captcha: this.captcha,
          })
          .subscribe((result) => {
            const err = this.commonData.translate.transform(
              'data-cant-password-recover-email'
            );
            if (result && Array.isArray(result.data) && result.data.length) {
              if (result.data[0].recover && result.data[0].recover === 'OK') {
                this.pRecoverOk = true;
                this.message = this.commonData.translate.transform(
                  'data-password-recovered-email'
                );
                this.snackbar.dismiss();
              } else if (result.data[0].recover) {
                this.commonData.openSnackBar(
                  this.snackbar,
                  result.data[0].recover
                );
              } else {
                this.commonData.openSnackBar(this.snackbar, err);
              }
            } else {
              this.commonData.openSnackBar(this.snackbar, err);
            }
            this.reset();
            this.pageLoad.loading.next(false);
          });
      }
    }
  }

  @ViewChild('captchaEl') captchaEl: RecaptchaComponent | undefined;

  captcha: string = '';
  resolved(captcha: string) {
    this.captcha = captcha;
  }
  reset() {
    this.captcha = '';
    if (this.captchaEl) {
      this.captchaEl.reset();
    }
  }

  constructor(
    private pageLoad: PageLoadService,
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setH();
  }

  activeUser(): boolean {
    if (this.user && this.user.id) {
      return true;
    }
    return false;
  }

  setH() {
    this.h = Math.max(window.innerHeight - this.menuH, this.minH);
  }

  ngOnInit(): void {
    this.setH();

    this.pageId = this.pageLoad.pageId.getValue();
    this.pageLoad.loading.subscribe(
      (loading: boolean) => (this.loading = loading)
    );
    this.pageLoad.user.subscribe((user: User) => {
      this.user = user;
      if (this.activeUser()) {
        this.group.get('email')?.setValue(this.user.email);
        this.group.get('email')?.disable();
      }
    });

    if (this.pageId.length) {
      setTimeout(() => {
        this.pageLoad.loading.next(true);
        this.commonData
          .block('validate-id', { id: this.pageId })
          .subscribe((result) => {
            this.pageIdChecked = true;
            if (result && Array.isArray(result.data) && result.data.length) {
              if (
                result.data[0].validate &&
                result.data[0].validate === 'OK' &&
                result.data[0].type &&
                result.data[0].type === 2
              ) {
                //OK
              } else if (result.data[0].validate) {
                this.pageIdInvalid = true;
                this.commonData.openSnackBar(
                  this.snackbar,
                  result.data[0].validate
                );
              } else {
                this.pageIdInvalid = true;
              }
            } else {
              this.pageIdInvalid = true;
            }
            this.pageLoad.loading.next(false);
          });
      });
    } else {
      this.pageIdChecked = true;
    }
  }
}
