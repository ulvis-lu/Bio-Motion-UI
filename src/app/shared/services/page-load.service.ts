import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDrawerContainer } from '@angular/material/sidenav';
import { User } from 'shared/interfaces/User';
import { SiteSettings } from 'shared/interfaces/SiteSettings';

@Injectable({
  providedIn: 'root',
})
export class PageLoadService {
  public loading = new BehaviorSubject(false);
  public loadingStatuss = new BehaviorSubject(200);

  public language = new BehaviorSubject('lv');

  public textSize = new BehaviorSubject(0);

  public user = new BehaviorSubject<User>({
    data: {},
  });
  public userActivity = new BehaviorSubject(false);

  public siteSettings = new BehaviorSubject<SiteSettings>({
    allowReg: 0,
    allowAuth: 0,
    closeMenu: false,
  });

  public pageId = new BehaviorSubject('');
  public pageName = new BehaviorSubject('');

  public drawerContainer: MatDrawerContainer | undefined;

  public static tmp_email: string = '';
  public static tmp_pass: string = '';

  constructor() {
    const locale = localStorage.getItem('_locale');
    switch (locale) {
      case 'lv':
      case 'en':
        this.language.next(locale);
        break;
    }
  }
}
