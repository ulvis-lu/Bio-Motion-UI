import { Component, OnInit, HostListener } from '@angular/core';
import { PageLoadService } from 'shared/services/page-load.service';
import { User } from 'shared/interfaces/User';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SiteSettings } from 'shared/interfaces/SiteSettings';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
})
export class SigninComponent implements OnInit {
  loading: boolean = true;
  user: User | undefined;
  siteSettings: SiteSettings | undefined;

  h: number = 0;
  menuH: number = 100;
  minH: number = 300;
  hide: boolean = true;

  group = new FormGroup({
    password: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    remember: new FormControl(false),
  });

  constructor(
    private pageLoad: PageLoadService,
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {}

  loadingFb: boolean = false;
  facebookInit: Promise<any> | undefined;
  fbLogin() {
    if (!this.loadingFb) {
      if (!this.facebookInit) {
        this.facebookInit = new Promise((resolve, reject) => {
          window['fbAsyncInit'] = () => {
            FB.init({
              appId: '226429306184164',
              cookie: true,
              xfbml: true,
              version: 'v12.0',
            });
            FB.getLoginStatus((response) => {
              if (response.status !== 'connected') {
                FB.login(
                  (response) => {
                    if (response.status === 'connected') {
                      resolve(response.authResponse);
                    } else {
                      reject();
                    }
                  },
                  { scope: 'public_profile,email' }
                );
              } else {
                resolve(response.authResponse);
              }
            });
          };
          ((d, s, id) => {
            let js: any,
              fjs: any = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
              return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = 'https://connect.facebook.net/lv_LV/sdk.js';
            fjs.parentNode.insertBefore(js, fjs);
          })(document, 'script', 'facebook-jssdk');
        });
      }
      this.loadingFb = true;
      const err = this.commonData.translate.transform(
        'data-cant-signin-facebook'
      );
      this.facebookInit
        .then((authResponse: { accessToken: string; userID: number }) => {
          this.commonData
            .block('signin', {
              accessToken: authResponse.accessToken,
              userID: authResponse.userID,
              remember: this.group.get('remember')?.value,
              login: 'facebook',
            })
            .subscribe((result) => {
              if (result && Array.isArray(result.data) && result.data.length) {
                if (result.data[0].token && result.data[0].uid) {
                  this.commonData.openSnackBar(
                    this.snackbar,
                    this.commonData.translate.transform('data-signin-ok'),
                    2000,
                    'snackbar-success'
                  );
                  this.commonData.setToken(
                    result.data[0].token,
                    result.data[0].uid,
                    result.data[0].remember
                  );
                  this.pageLoad.loading.next(true);
                  FB.logout(() => {
                    //izlogojam FB sesiju
                  });
                  document.location.href = this.commonData.mainUrl + '/';
                } else if (result.data[0].message) {
                  this.commonData.openSnackBar(
                    this.snackbar,
                    result.data[0].message
                  );
                } else {
                  this.commonData.openSnackBar(this.snackbar, err);
                }
              } else {
                this.commonData.openSnackBar(this.snackbar, err);
              }
              this.loadingFb = false;
            });
        })
        .catch(() => {
          this.commonData.openSnackBar(this.snackbar, err);
          this.loadingFb = false;
        });
    }
  }

  getErrorMessage(field: string) {
    if (
      field === 'password' &&
      this.group.get('password')?.hasError('required')
    ) {
      return this.commonData.translate.transform(
        'account-signin-error-required-password'
      );
    } else if (
      field === 'email' &&
      this.group.get('email')?.hasError('required')
    ) {
      return this.commonData.translate.transform(
        'account-signin-error-required-email'
      );
    } else if (
      field === 'email' &&
      this.group.get('email')?.hasError('email')
    ) {
      return this.commonData.translate.transform(
        'account-signin-error-invalid-email'
      );
    }
    return '';
  }
  signin() {
    if (
      !this.loading &&
      this.getErrorMessage('password').length === 0 &&
      this.getErrorMessage('email').length === 0
    ) {
      this.pageLoad.loading.next(true);
      this.commonData
        .block('signin', {
          email: this.group.get('email')?.value,
          password: this.group.get('password')?.value,
          remember: this.group.get('remember')?.value,
        })
        .subscribe((result) => {
          const err = this.commonData.translate.transform('data-cant-signin');
          if (result && Array.isArray(result.data) && result.data.length) {
            if (result.data[0].token && result.data[0].uid) {
              this.commonData.openSnackBar(
                this.snackbar,
                this.commonData.translate.transform('data-signin-ok'),
                2000,
                'snackbar-success'
              );
              this.commonData.setToken(
                result.data[0].token,
                result.data[0].uid,
                result.data[0].remember
              );
              this.pageLoad.loading.next(true);
              document.location.href = this.commonData.mainUrl + '/';
            } else if (result.data[0].message) {
              this.commonData.openSnackBar(
                this.snackbar,
                result.data[0].message
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

  setH() {
    this.h = Math.max(window.innerHeight - this.menuH, this.minH);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setH();
  }

  ngOnInit(): void {
    this.pageLoad.loading.subscribe(
      (loading: boolean) => (this.loading = loading)
    );
    this.pageLoad.siteSettings.subscribe(
      (siteSettings: SiteSettings) => (this.siteSettings = siteSettings)
    );
    this.pageLoad.user.subscribe((user: User) => (this.user = user));
    this.setH();
  }
}
