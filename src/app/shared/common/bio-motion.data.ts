import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BioType } from 'shared/interfaces/Canvas';
import { CommonDataService } from 'shared/services/common-data.service';
@Injectable({
  providedIn: 'root',
})
export class BioMotionData {
  bioTypes: BioType[] = [];
  constructor(
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {
    const err = 'Neizdevās iegūt bioloģiskās kustības datus.';
    this.commonData.block('bio-data', {}).subscribe((result) => {
      if (result && Array.isArray(result.data) && result.data.length) {
        result.data.forEach((item: any) => {
          if (Array.isArray(item) && item.length === 4) {
            this.addBio(item[0], item[1], item[2], item[3]);
          }
        });
      } else {
        this.commonData.openSnackBar(this.snackbar, err);
      }
    });
  }
  getBioTypes(): BioType[] {
    return this.bioTypes;
  }

  addBio(
    data: number[][],
    lines: number[][],
    dotCount: number,
    id: number
  ): void {
    const dotsNew: number[][] = [];
    data.forEach((item: number[]) => {
      dotsNew.push(item);
    });
    this.bioTypes.push({
      id: id,
      dots: data,
      dotsNew: dotsNew,
      lines: lines,
      dotCount: data.length ? dotCount : 0,
      totalPosition: data.length / dotCount,
      currentPosition: 0,
      timer: 0,
    });
  }
}
