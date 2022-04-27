import { Component, Input, OnInit } from '@angular/core';
import { PageLoadService } from 'shared/services/page-load.service';
import { User } from 'shared/interfaces/User';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogsComponent } from '../../dialogs/dialogs.component';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
})
export class AdminUserComponent implements OnInit {
  pageId: string = '';
  pageIdChecked: boolean = false;
  pageIdInvalid: boolean = false;

  user: User | undefined;
  loading: boolean = true;

  name: string = '';
  email: string = '';
  statuss: number = 0;
  uid: string = '';
  onlineTime: string = '';
  signinTime: string = '';
  singupTime: string = '';
  blocked: any[] = [];

  constructor(
    private pageLoad: PageLoadService,
    public commonData: CommonDataService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  _confirm() {
    const dialogRef = this.dialog.open(DialogsComponent, {
      data: {
        dialogName: 'user-confirm',
        dialogData: {
          name: this.name,
          id: this.pageId,
        },
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.type === 'confirm') {
        this.getData();
      }
    });
  }

  block() {
    const dialogRef = this.dialog.open(DialogsComponent, {
      data: {
        dialogName: 'user-block',
        dialogData: {
          name: this.name,
          id: this.pageId,
        },
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.type === 'block') {
        this.getData();
      }
    });
  }
  unblock() {
    const dialogRef = this.dialog.open(DialogsComponent, {
      data: {
        dialogName: 'user-unblock',
        dialogData: {
          name: this.name,
          id: this.pageId,
        },
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.type === 'unblock') {
        this.getData();
      }
    });
  }

  getData() {
    this.pageLoad.loading.next(true);
    this.commonData
      .block('admin-user', { id: this.pageId })
      .subscribe((result) => {
        this.pageIdChecked = true;
        if (result && Array.isArray(result.data) && result.data.length) {
          this.name = result.data[0].name;
          this.email = result.data[0].email;
          this.statuss = result.data[0].statuss;

          this.uid = result.data[0].uid;

          this.signinTime = result.data[0].signinTime;
          this.singupTime = result.data[0].singupTime;

          this.onlineTime = result.data[0].onlineTime;

          this.blocked = result.data[0].blocked;
        } else {
          this.pageIdInvalid = true;
        }
        this.pageLoad.loading.next(false);
      });
  }

  ngOnInit(): void {
    this.pageLoad.loading.subscribe(
      (loading: boolean) => (this.loading = loading)
    );
    this.pageLoad.user.subscribe((user: User) => {
      this.user = user;
    });
    this.pageId = this.pageLoad.pageId.getValue();
    if (this.pageId.length) {
      setTimeout(() => {
        this.getData();
      });
    } else {
      this.pageIdChecked = true;
    }
  }
}
