import { Component, OnInit, Inject } from '@angular/core';
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import { CommonDataService } from 'shared/services/common-data.service';

@Component({
  selector: 'app-signup-resend',
  templateUrl: './resend.component.html',
})
export class SignupResendComponent implements OnInit {
  constructor(
    private commonData: CommonDataService,
    public snacbarRef: MatSnackBarRef<SignupResendComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public d: any
  ) {}

  closeSnackbar() {
    this.snacbarRef.dismiss();
  }

  loading: boolean = false;

  send() {
    this.loading = true;

    this.commonData
      .block('signup-resend', {
        email: this.d.email,
      })
      .subscribe((result) => {
        const err = this.commonData.translate.transform(
          'data-cant-repeat-confirm-email'
        );
        if (result && Array.isArray(result.data) && result.data.length) {
          if (result.data[0].signup && result.data[0].signup === 'OK') {
            this.d.send = false;
            this.d.message = this.commonData.translate.transform(
              'data-confirm-email-repeated'
            );
          } else if (result.data[0].signup) {
            this.d.message = result.data[0].signup;
          } else {
            this.d.message = err;
          }
        } else {
          this.d.message = err;
        }
        this.loading = false;
      });
  }

  ngOnInit(): void {}
}
