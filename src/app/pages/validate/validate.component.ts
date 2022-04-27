import { Component, OnInit, Input } from '@angular/core';
import { CommonDataService } from 'shared/services/common-data.service';
import { PageLoadService } from 'shared/services/page-load.service';
@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
})
export class ValidateComponent implements OnInit {
  message: string = '';
  type: number = 0;

  constructor(
    private pageLoad: PageLoadService,
    private commonData: CommonDataService
  ) {}

  goData() {
    if (this.type === 1) {
      document.location.href = this.commonData.mainUrl + '/signin';
    }
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.pageLoad.loading.next(true);
      this.commonData
        .block('validate-id', { id: this.pageLoad.pageId.getValue() })
        .subscribe((result) => {
          const err = this.commonData.translate.transform(
            'validation-code-invalid'
          );
          if (result && Array.isArray(result.data) && result.data.length) {
            if (result.data[0].validate) {
              if (result.data[0].type) {
                this.type = result.data[0].type;
              }
              if (this.type === 2 && result.data[0].validate === 'OK') {
                this.message = err;
              } else {
                this.message = result.data[0].validate;
              }
            } else {
              this.message = err;
            }
          } else {
            this.message = err;
          }
          this.pageLoad.loading.next(false);
        });
    });
  }
}
