import { Component, OnInit } from '@angular/core';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import { User } from 'shared/interfaces/User';
import { PageLoadService } from 'shared/services/page-load.service';

@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
})
export class SiteSettingsComponent implements OnInit {
  user: User | undefined;
  loading: boolean = true;
  firstLoad: boolean = false;
  noData: boolean = false;

  group = new FormGroup({
    allowReg: new FormControl(false),
    allowAuth: new FormControl(false),
  });

  constructor(
    private pageLoad: PageLoadService,
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {}

  save() {
    if (!this.loading) {
      this.pageLoad.loading.next(true);
      this.commonData
        .block('set-site-settings', {
          allowReg: this.group.get('allowReg')?.value ? 1 : 0,
          allowAuth: this.group.get('allowAuth')?.value ? 1 : 0,
        })
        .subscribe((result) => {
          const err = this.commonData.translate.transform('data-cant-save');
          if (result && Array.isArray(result.data) && result.data.length) {
            if (result.data[0].save && result.data[0].save === 'OK') {
              this.commonData.openSnackBar(
                this.snackbar,
                this.commonData.translate.transform('data-saved'),
                2000,
                'snackbar-success'
              );
            } else if (result.data[0].save) {
              this.commonData.openSnackBar(this.snackbar, result.data[0].save);
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

  getData() {
    this.pageLoad.loading.next(true);
    this.commonData.block('get-site-settings', {}).subscribe((result) => {
      this.firstLoad = true;
      if (result && Array.isArray(result.data) && result.data.length) {
        this.group
          .get('allowReg')
          ?.setValue(result.data[0].allowReg ? true : false);
        this.group
          .get('allowAuth')
          ?.setValue(result.data[0].allowAuth ? true : false);

      } else {
        this.noData = true;
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
    setTimeout(() => {
      this.getData();
    });
  }
}
