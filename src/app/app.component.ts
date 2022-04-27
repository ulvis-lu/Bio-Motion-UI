import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { PageLoadService } from 'shared/services/page-load.service';
import { CommonDataService } from 'shared/services/common-data.service';
import { Menu } from 'shared/interfaces/Menu';
import { User } from 'shared/interfaces/User';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawerContainer } from '@angular/material/sidenav';

import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonDataResult } from 'shared/interfaces/CommonDataResult';
import { SiteSettings } from 'shared/interfaces/SiteSettings';

import { MatDialog } from '@angular/material/dialog';
import { DialogsComponent } from 'pages/dialogs/dialogs.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, AfterViewInit {
  newWindow: boolean = false;

  firstLoad: boolean = false;
  loading: boolean = false;
  loadingStatuss: number = 200;

  siteSettings: SiteSettings | undefined;

  opened: boolean = false;
  drawerStyle: any = 'over';

  xSmallScreen: boolean = false;
  smallScreen: boolean = false;
  mediumScreen: boolean = false;

  title: string = 'BioMotion';

  footerText: string = '© ' + new Date().getFullYear();

  user: User = {
    id: 0,
    data: {},
  };

  menuItems: Menu[] = [
    {
      name: this.commonData.translate.transform('menu-home'),
      url: '/',
      icon: 'home',
      type: 1,
      count: 'none',
    },
    {
      name: this.commonData.translate.transform('menu-motion-test-new'),
      url: '/motion-test/new',
      icon: 'playlist_add',
      type: 2,
      count: 'none',
    },
    {
      name: this.commonData.translate.transform('menu-motion-test-my'),
      url: '/motion-test/my',
      icon: 'playlist_add_check',
      type: 2,
      count: 'none',
    },
    {
      name: this.commonData.translate.transform('menu-administration'),
      url: '/admin/default',
      icon: 'admin_panel_settings',
      type: 3,
      count: 'none',
    },
    {
      name: this.commonData.translate.transform('menu-users'),
      url: '/admin/users',
      icon: 'people',
      type: 3,
      count: 'none',
      color: 'side-intend',
    },
    {
      name: this.commonData.translate.transform('menu-settings'),
      url: '/admin/settings',
      icon: 'settings',
      type: 3,
      count: 'none',
      color: 'side-intend',
    },
  ];

  constructor(
    breakpointObserver: BreakpointObserver,
    private pageLoad: PageLoadService,
    private commonData: CommonDataService,
    public router: Router,
    public route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result: any) => {
        this.xSmallScreen =
          result.matches && result.breakpoints[Breakpoints.XSmall];
        this.smallScreen =
          result.matches && result.breakpoints[Breakpoints.Small];
        this.mediumScreen =
          result.matches && result.breakpoints[Breakpoints.Medium];
        this.menuType();
      });
  }

  menuType() {
    if (
      !this.xSmallScreen &&
      !this.smallScreen &&
      !this.siteSettings?.closeMenu
    ) {
      this.drawerStyle = 'side';
      this.opened = true;
    } else {
      this.drawerStyle = 'over';
      if (this.siteSettings?.closeMenu) {
        this.opened = false;
      }
    }
  }

  menuAllow(item: Menu): boolean {
    let r: boolean = true;
    if (typeof item.allow !== 'undefined') {
      r = !!item.allow;
    }
    return r;
  }

  displayCount(count: any) {
    if (count) {
      if (count > 9) {
        return '9+';
      } else {
        return count;
      }
    }
    return null;
  }

  @ViewChild('drawerContainer') drawerContainer: MatDrawerContainer | undefined;

  ngAfterViewInit() {
    if (this.drawerContainer) {
      this.pageLoad.drawerContainer = this.drawerContainer;
    }
  }

  itemFn(item: any) {
    switch (item.fn) {
      // case 'dialogName':
      //   this.dialog.open(DialogsComponent, {
      //     data: {
      //       dialogName: 'dialogName-dialog',
      //       dialogData: {},
      //     },
      //   });
      //   break;
      default:
        if (this.xSmallScreen || this.smallScreen) {
          this.opened = false;
        }
        break;
    }
  }

  url: string = '';
  checkUrlParts() {
    this.url = this.router.url;

    this.pageLoad.pageName.next('');
    this.pageLoad.pageId.next('');

    const urlMap: string = this.router.url.split('?')[0];
    const urlParts: string[] = urlMap.split('/');
    if (urlParts[2] && !urlParts[3]) {
      this.pageLoad.pageName.next(urlParts[1]);
      this.pageLoad.pageId.next(urlParts[2]);
    } else if (urlParts[2] && urlParts[3]) {
      this.pageLoad.pageName.next(urlParts[2]);
      this.pageLoad.pageId.next(urlParts[3]);
    }
  }

  checkMenuUrl(url: string): boolean {
    if (
      url?.indexOf('/admin/default') !== 0 &&
      (url === this.url ||
        (this.url?.indexOf('/admin/default') === 0 &&
          url?.indexOf('/admin/users') === 0) ||
        (this.url?.indexOf('/admin/user') === 0 &&
          url?.indexOf('/admin/users') === 0))
    ) {
      return true;
    }
    return false;
  }

  langSuffix(): string {
    if (this.lang === 'LV') {
      return 'lv';
    }
    if (this.lang === 'EN') {
      return 'gb';
    }
    return '';
  }
  lang: string = '';
  changeLanguage(lang: string) {
    localStorage.setItem('_locale', lang);
    location.reload();
  }

  validateToken(time: number) {
    setTimeout(() => {
      this.commonData
        .block('validate-token', {})
        .subscribe((result: CommonDataResult) => {
          if (
            result &&
            Array.isArray(result.data) &&
            result.data.length &&
            result.data[0].token &&
            result.data[0].uid
          ) {
            this.commonData.setToken(
              result.data[0].token,
              result.data[0].uid,
              result.data[0].remember
            );
          } else {
            this.commonData.setToken('EMPTY', 0, 0);
            document.location.href = this.commonData.mainUrl + '/';
          }
        });
      this.validateToken(120);
    }, time * 1000);
  }

  getSettings() {
    this.commonData.block('get-site-settings', {}).subscribe((result) => {
      if (result && Array.isArray(result.data) && result.data.length) {
        this.pageLoad.siteSettings.next(result.data[0]);
      }
    });
  }

  getActivity() {
    this.commonData
      .block('activity', {})
      .subscribe((result: CommonDataResult) => {
        if (result && Array.isArray(result.data) && result.data.length) {
          const user = Object.assign(this.user, { data: result.data[0].data });
          this.pageLoad.user.next(user);
        }
      });
  }

  getData() {
    this.pageLoad.loading.next(true);
    this.commonData
      .block('account', {})
      .subscribe((result: CommonDataResult) => {
        if (result && Array.isArray(result.data) && result.data.length) {
          this.pageLoad.user.next(result.data[0]);
          if (result.data[0].id) {
            this.validateToken(120);
          }
          this.firstLoad = true;
        }
        this.pageLoad.loading.next(false);
      });
  }

  ngOnInit(): void {
    if (window.opener) {
      this.newWindow = true;
    }

    this.lang = this.pageLoad.language.getValue().toLocaleUpperCase();

    this.pageLoad.loading.subscribe((loading: boolean) => {
      this.loading = loading;
    });

    this.pageLoad.loadingStatuss.subscribe(
      (loadingStatuss: number) => (this.loadingStatuss = loadingStatuss)
    );

    this.pageLoad.siteSettings.subscribe((siteSettings: SiteSettings) => {
      this.siteSettings = siteSettings;
      this.menuType();
    });

    this.pageLoad.user.subscribe((user: User) => (this.user = user));

    this.pageLoad.userActivity.subscribe((ua: boolean) => {
      if (ua) {
        this.getActivity();
      }
    });

    document.title = this.title;
    this.footerText = '© ' + this.title + ' ' + new Date().getFullYear();

    this.getData();
    this.getSettings();

    this.checkUrlParts();
    // override the route reuse strategy
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkUrlParts();
      }
    });
  }
}
