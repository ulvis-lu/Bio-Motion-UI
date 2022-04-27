import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PageLoadService } from 'shared/services/page-load.service';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'shared/interfaces/User';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  blocked: boolean = false;
  q = new FormControl('');

  users: any[] = [];

  user: User | undefined;
  loading: boolean = true;
  firstLoad: boolean = false;
  noData: boolean = false;

  openPage(id: any) {
    window.open('/admin/user/' + id);
  }

  itemsPerPage = 10;
  currentPage = 1;
  totalItems = 0;
  pageChange(page: number) {
    this.commonData.scrollToTop();
    this.getData(page);
  }

  onSearch(event: any) {
    if (
      (event instanceof KeyboardEvent && event.key === 'Enter') ||
      event instanceof MouseEvent ||
      event === null
    ) {
      this.getData(this.currentPage);
    }
  }

  paramsChanges(event: any, param: string) {
    switch (param) {
      case 'blocked':
        this.blocked = event.checked;
        break;
    }
    this.onSearch(null);
  }

  constructor(
    private pageLoad: PageLoadService,
    private commonData: CommonDataService,
    private snackbar: MatSnackBar,
    private router: Router
  ) {}

  getData(page: number) {
    if (!this.loading) {
      this.pageLoad.loading.next(true);
      this.currentPage = page;
      this.commonData
        .block('admin-users', {
          q: this.q.value,
          b: this.blocked ? 1 : 0,
          page: page,
          inPage: this.itemsPerPage,
        })
        .subscribe((result) => {
          this.firstLoad = true;
          if (result && Array.isArray(result.data) && result.data.length) {
            if (
              result.data[0].users &&
              typeof result.data[0].total !== 'undefined'
            ) {
              this.totalItems = result.data[0].total;
              this.users = result.data[0].users;
              if (!this.users.length) {
                this.noData = true;
              } else {
                this.noData = false;
              }
            } else {
              this.noData = true;
              this.totalItems = 0;
              this.users = [];
            }
          } else {
            this.noData = true;
            this.totalItems = 0;
            this.users = [];
          }
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
    setTimeout(() => {
      this.getData(1);
    });
  }
}
