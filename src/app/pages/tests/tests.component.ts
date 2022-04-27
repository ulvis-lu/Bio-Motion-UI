import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'shared/interfaces/User';
import { CommonDataService } from 'shared/services/common-data.service';
import { PageLoadService } from 'shared/services/page-load.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogsComponent } from '../dialogs/dialogs.component';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
})
export class TestsComponent implements OnInit {
  title: string = '';

  user: User | undefined;
  loading: boolean = true;
  firstLoad: boolean = false;
  noData: boolean = false;
  pageId: string | number | undefined;

  itemsPerPage = 10;
  currentPage = 1;
  totalItems = 0;
  pageChange(page: number) {
    this.commonData.scrollToTop();
    this.getDataList(page);
  }

  tests: any[] = [];

  constructor(
    private dialog: MatDialog,
    private commonData: CommonDataService,
    private pageLoad: PageLoadService,
    private router: Router
  ) {}

  openPage(id: any, start: boolean) {
    if (start) {
      const win = window.open(
        '/test/' + id,
        'test' + id,
        'width=' +
          window.screen.availWidth +
          ',height=' +
          window.screen.availHeight
      );
      win?.focus();
    } else {
      this.router.navigateByUrl('/motion-test/' + id);
    }
  }

  openResult(id: any, name: string) {
    this.dialog.open(DialogsComponent, {
      data: {
        dialogName: 'query-result',
        dialogData: {
          id: id,
          name: name,
        },
      },
    });
  }

  openDownload(id: any) {
    this.commonData.downloadFile('test', id, 'test_' + id + '.zip');
  }

  getDataList(page: number) {
    if (!this.loading) {
      this.pageLoad.loading.next(true);
      this.currentPage = page;
      this.commonData
        .block('bio-tests', {
          page: page,
          inPage: this.itemsPerPage,
          my: this.pageId === 'my' ? 1 : 0,
        })
        .subscribe((result) => {
          this.firstLoad = true;
          if (result && Array.isArray(result.data) && result.data.length) {
            if (
              result.data[0].tests &&
              typeof result.data[0].total !== 'undefined'
            ) {
              this.totalItems = result.data[0].total;
              this.tests = result.data[0].tests;
              if (!this.tests.length) {
                this.noData = true;
              } else {
                this.noData = false;
              }
            } else {
              this.noData = true;
              this.totalItems = 0;
              this.tests = [];
            }
          } else {
            this.noData = true;
            this.totalItems = 0;
            this.tests = [];
          }
          this.pageLoad.loading.next(false);
        });
    }
  }

  ngOnInit(): void {
    this.pageId = this.pageLoad.pageId.getValue();
    this.pageLoad.loading.subscribe(
      (loading: boolean) => (this.loading = loading)
    );
    this.pageLoad.user.subscribe((user: User) => {
      this.user = user;
    });

    if (this.pageId === 'my') {
      this.title = this.commonData.translate.transform('tests-my');
    } else {
      this.title = this.commonData.translate.transform('tests-newest');
    }

    setTimeout(() => {
      this.getDataList(1);
    });
  }
}
