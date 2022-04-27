import { Component, OnInit, ViewChild } from '@angular/core';
import { PageLoadService } from 'shared/services/page-load.service';
import { User } from 'shared/interfaces/User';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecaptchaComponent } from 'ng-recaptcha';
import { SignupResendComponent } from '../signup/resend/resend.component';
import { trimSpaces } from 'shared/common/validators';
import { SiteSettings } from 'shared/interfaces/SiteSettings';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent implements OnInit {
  loading: boolean = true;
  user: User | undefined;
  siteSettings: SiteSettings | undefined;

  singupOk: boolean = false;
  message: string = '';

  hide: boolean = true;

  resend: number = 0;

  group = new FormGroup({
    _name: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
      Validators.minLength(2),
      trimSpaces(2),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
      Validators.minLength(6),
      trimSpaces(6),
    ]),
    passwordRepeat: new FormControl('', [this.passwordMatch]),
    email: new FormControl('', [Validators.required, Validators.email]),
    emailRepeat: new FormControl('', [this.emailMatch]),
  });

  passwordRepeatShow: boolean = false;
  emailRepeatShow: boolean = false;

  constructor(
    private pageLoad: PageLoadService,
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {}

  updateTmp() {
    PageLoadService.tmp_email = this.group.get('email')?.value;
    PageLoadService.tmp_pass = this.group.get('password')?.value;
  }

  emailMatch(control: AbstractControl): ValidationErrors | null {
    if (control.value !== PageLoadService.tmp_email) {
      return { emailMatch: true };
    }
    return null;
  }

  passwordMatch(control: AbstractControl): ValidationErrors | null {
    if (control.value !== PageLoadService.tmp_pass) {
      return { passwordMatch: true };
    }
    return null;
  }

  getErrorMessage(field: string) {
    if (field === '_name' && this.group.get('_name')?.hasError('required')) {
      return this.commonData.translate.transform(
        'account-signup-error-required-name'
      );
    } else if (
      field === '_name' &&
      this.group.get('_name')?.hasError('maxlength')
    ) {
      return this.commonData.translate.transform(
        'account-signup-error-name-max'
      );
    } else if (
      field === '_name' &&
      (this.group.get('_name')?.hasError('minlength') ||
        this.group.get('_name')?.hasError('trimSpaces'))
    ) {
      return this.commonData.translate.transform(
        'account-signup-error-name-min'
      );
    } else if (
      field === 'password' &&
      this.group.get('password')?.hasError('required')
    ) {
      return this.commonData.translate.transform(
        'account-signup-error-required-password'
      );
    } else if (
      field === 'password' &&
      this.group.get('password')?.hasError('maxlength')
    ) {
      return this.commonData.translate.transform(
        'account-signup-error-password-max'
      );
    } else if (
      field === 'password' &&
      (this.group.get('password')?.hasError('minlength') ||
        this.group.get('password')?.hasError('trimSpaces'))
    ) {
      return this.commonData.translate.transform(
        'account-signup-error-password-min'
      );
    } else if (
      field === 'email' &&
      this.group.get('email')?.hasError('required')
    ) {
      return this.commonData.translate.transform(
        'account-signup-error-required-email'
      );
    } else if (
      field === 'email' &&
      this.group.get('email')?.hasError('email')
    ) {
      return this.commonData.translate.transform(
        'account-signup-error-invalid-email'
      );
    } else if (
      field === 'passwordRepeat' &&
      this.group.get('password')?.value !==
        this.group.get('passwordRepeat')?.value
    ) {
      return this.commonData.translate.transform(
        'account-signup-error-password-reapeat'
      );
    } else if (
      field === 'emailRepeat' &&
      this.group.get('email')?.value !== this.group.get('emailRepeat')?.value
    ) {
      return this.commonData.translate.transform(
        'account-signup-error-email-reapeat'
      );
    }

    return '';
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

  signup() {
    if (
      !this.loading &&
      this.getErrorMessage('password').length === 0 &&
      this.getErrorMessage('passwordRepeat').length === 0 &&
      this.getErrorMessage('email').length === 0 &&
      this.getErrorMessage('emailRepeat').length === 0 &&
      this.getErrorMessage('_name').length === 0
    ) {
      this.pageLoad.loading.next(true);
      this.resend = 0;
      this.commonData
        .block('signup', {
          email: this.group.get('email')?.value,
          name: this.group.get('_name')?.value,
          password: this.group.get('password')?.value,
          captcha: this.captcha,
        })
        .subscribe((result) => {
          const err = this.commonData.translate.transform('data-cant-signup');
          if (result && Array.isArray(result.data) && result.data.length) {
            if (result.data[0].signup && result.data[0].signup === 'OK') {
              this.singupOk = true;
              this.message =
                this.commonData.translate.transform('data-signup-ok');
              this.snackbar.dismiss();
            } else if (result.data[0].signup && result.data[0].resend) {
              this.commonData.openSnackBarComponent(
                this.snackbar,
                SignupResendComponent,
                {
                  message: result.data[0].signup,
                  email: this.group.get('email')?.value,
                  send: true,
                }
              );
            } else if (result.data[0].signup) {
              this.commonData.openSnackBar(
                this.snackbar,
                result.data[0].signup
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

  ngOnInit(): void {
    this.pageLoad.loading.subscribe(
      (loading: boolean) => (this.loading = loading)
    );
    this.pageLoad.user.subscribe((user: User) => {
      this.user = user;
    });
    this.pageLoad.siteSettings.subscribe(
      (siteSettings: SiteSettings) => (this.siteSettings = siteSettings)
    );
  }
}
