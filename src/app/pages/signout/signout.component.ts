import { Component, OnInit } from '@angular/core';
import { CommonDataService } from 'shared/services/common-data.service';
import { PageLoadService } from 'shared/services/page-load.service';

@Component({
  selector: 'app-signout',
  templateUrl: './signout.component.html',
})
export class SignoutComponent implements OnInit {
  constructor(
    private pageLoad: PageLoadService,
    private commonData: CommonDataService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.pageLoad.loading.next(true);
      this.commonData.block('signout', {}).subscribe((result) => {
        this.commonData.setToken('EMPTY', 0, 0);
        document.location.href = this.commonData.mainUrl + '/';
      });
    });
  }
}
