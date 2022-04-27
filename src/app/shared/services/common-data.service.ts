import { Injectable } from '@angular/core';
import {
  HttpHeaders,
  HttpResponse,
  HttpEventType,
  HttpEvent,
} from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { CommonDataResult } from 'shared/interfaces/CommonDataResult';
import { Settings } from 'shared/settings';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageLoadService } from 'shared/services/page-load.service';
import { TranslatePipe } from 'shared/pipes/translate.pipe';

@Injectable({
  providedIn: 'root',
})
export class CommonDataService {
  public apiUrl: string | undefined;
  public mainUrl: string | undefined;
  public nodeUrl: string | undefined;

  public token: string | undefined;
  public uid: string | undefined;
  private httpOptions: any = {};

  constructor(
    private settings: Settings,
    private pageLoad: PageLoadService,
    private http: HttpClient,
    public translate: TranslatePipe
  ) {
    this.apiUrl = settings.apiUrl;
    this.mainUrl = settings.mainUrl;

    let token = sessionStorage.getItem('_t');
    let uid = sessionStorage.getItem('_u');
    if (token && uid && !Number.isNaN(parseInt(uid))) {
      this.token = token;
      this.uid = parseInt(uid) + '';
    } else {
      token = localStorage.getItem('_t');
      uid = localStorage.getItem('_u');
      if (token && uid && !Number.isNaN(parseInt(uid))) {
        this.token = token;
        this.uid = parseInt(uid) + '';
      } else {
        this.token = 'EMPTY';
        this.uid = '0';
      }
    }

    const language = this.pageLoad.language.getValue();
    this.httpOptions = {
      headers: new HttpHeaders({
        Authorization: this.token,
        Uid: this.uid,
        Language: language,
      }),
    };
  }

  clearHeader(httpOptions: any) {
    httpOptions['params'] = {};
    httpOptions['reportProgress'] = false;
    httpOptions['observe'] = '';
    httpOptions['responseType'] = '';
  }

  setToken(token: string, uid: number, remember: number) {
    this.token = token;
    this.uid = uid + '';
    if (token === 'EMPTY') {
      localStorage.removeItem('_t');
      localStorage.removeItem('_u');
      sessionStorage.removeItem('_t');
      sessionStorage.removeItem('_u');
    } else {
      if (remember) {
        localStorage.setItem('_t', token);
        localStorage.setItem('_u', uid + '');
        sessionStorage.removeItem('_t');
        sessionStorage.removeItem('_u');
      } else {
        sessionStorage.setItem('_t', token);
        sessionStorage.setItem('_u', uid + '');
        localStorage.removeItem('_t');
        localStorage.removeItem('_u');
      }
    }
  }

  block(page: string, pageData: any): Observable<CommonDataResult> {
    let url: string | undefined;
    let method: string = 'get';
    let postData: any = {};
    this.clearHeader(this.httpOptions);

    switch (page) {
      case 'account':
      case 'activity':
        url = this.apiUrl + '/user/' + page + '/';
        this.httpOptions['params'] = pageData;
        break;

      case 'account-info':
      case 'account-settings':
      case 'account-delete':
        method = 'post';
        url = this.apiUrl + '/user/' + page + '/';
        postData = JSON.stringify(pageData);
        break;

      case 'validate-token':
        method = 'post';
        url = this.apiUrl + '/auth/' + page + '/';
        postData = JSON.stringify({ token: this.token, uid: this.uid });
        break;

      case 'signin':
      case 'signup':
      case 'signup-resend':
      case 'signout':
      case 'validate-id':
      case 'recover':
        method = 'post';
        url = this.apiUrl + '/auth/' + page + '/';
        postData = JSON.stringify(pageData);
        break;

      case 'bio-data':
      case 'bio-tests':
      case 'bio-test':
      case 'test':
      case 'test-result':
      case 'get-site-settings':
        url = this.apiUrl + '/page/' + page + '/';
        this.httpOptions['params'] = pageData;
        break;

      case 'bio-save':
      case 'bio-delete':
      case 'bio-public':
      case 'bio-unpublic':
      case 'bio-start':
        method = 'post';
        url = this.apiUrl + '/page/' + page + '/';
        postData = JSON.stringify(pageData);
        break;

      case 'admin-users':
      case 'admin-user':
      case 'admin-feedbacks':
        url = this.apiUrl + '/admin/' + page + '/';
        this.httpOptions['params'] = pageData;
        break;
      case 'admin-confirm-user':
      case 'unblock-user':
      case 'block-user':
      case 'set-site-settings':
        method = 'post';
        url = this.apiUrl + '/admin/' + page + '/';
        postData = JSON.stringify(pageData);
        break;
    }

    if (url) {
      this.httpOptions['observe'] = 'response';
      return (
        method === 'get'
          ? this.http.get<CommonDataResult>(url, this.httpOptions)
          : this.http.post<CommonDataResult>(url, postData, this.httpOptions)
      ).pipe(
        map((response: any) => {
          const items = response['body'];
          const status = response['status'];
          if (status !== 200) {
            this.pageLoad.loadingStatuss.next(0);
            return {
              data: [],
            };
          } else {
            this.pageLoad.loadingStatuss.next(200);
            return items;
          }
        }),
        catchError((err) => {
          console.log(err);
          this.errorStatusCode(err.status);
          this.pageLoad.loadingStatuss.next(0);
          return of({
            data: [],
          });
        })
      );
    } else {
      this.pageLoad.loadingStatuss.next(0);
      return of({
        data: [],
      });
    }
  }

  downloadFile(page: string, id: any, fileName: string): void {
    this.clearHeader(this.httpOptions);
    const url = this.apiUrl + '/downloads/' + page + '/?id=' + id;
    this.httpOptions['responseType'] = 'arraybuffer';
    this.httpOptions['observe'] = 'response';
    this.http
      .get<any>(url, this.httpOptions)
      .pipe(
        map((item: any) => {
          return [
            new Blob([item['body']], {
              type: item['headers'].get('content-type'),
            }),
          ];
        }),
        catchError((err) => {
          console.log(err);
          this.errorStatusCode(err.status);
          this.pageLoad.loadingStatuss.next(0);
          return of([{}]);
        })
      )
      .subscribe((d: any) => {
        const url = window.URL.createObjectURL(d[0]);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  errorStatusCode(code: number) {
    if (code === 401) {
      //nederīga sesija
      document.location.href = this.mainUrl + '/';
    }
  }

  scrollToTop(top: number = 0) {
    if (this.pageLoad.drawerContainer) {
      this.pageLoad.drawerContainer.scrollable.scrollTo({ top: top });
    }
  }

  openSnackBar(
    snackbar: MatSnackBar,
    message: string,
    duration: number = 0,
    panelClass: string = 'snackbar-error',
    action: string = this.translate.transform('button-close')
  ) {
    snackbar.open(message, action, {
      duration: duration,
      panelClass: panelClass,
    });
  }

  openSnackBarComponent(
    snackbar: MatSnackBar,
    component: any,
    data: any,
    duration: number = 0,
    panelClass: string = 'snackbar-error'
  ) {
    snackbar.openFromComponent(component, {
      data: data,
      duration: duration,
      panelClass: panelClass,
    });
  }
}
