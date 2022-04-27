import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
export interface DialogData {
  dialogName: string;
  dialogTitle?: string;
  dialogData?: any;
}

@Component({
  selector: 'app-dialogs',
  templateUrl: './dialogs.component.html',
})
export class DialogsComponent implements OnInit {
  closeDialog(event: any) {
    this.dialogRef.close(event);
  }

  xSmallScreen: boolean = false;
  smallScreen: boolean = false;
  mediumScreen: boolean = false;

  constructor(
    breakpointObserver: BreakpointObserver,
    public dialogRef: MatDialogRef<DialogsComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData
  ) {
    breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result) => {
        this.xSmallScreen =
          result.matches && result.breakpoints[Breakpoints.XSmall];
        this.smallScreen =
          result.matches && result.breakpoints[Breakpoints.Small];
        this.mediumScreen =
          result.matches && result.breakpoints[Breakpoints.Medium];
      });
  }

  ngOnInit(): void {}
}
