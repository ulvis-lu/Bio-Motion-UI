import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { PageLoadService } from 'shared/services/page-load.service';
import { LV } from 'shared/locale/lv';
import { EN } from 'shared/locale/en';

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  constructor(private pageLoad: PageLoadService) {}
  transform(value: any, ...args: any[]): any {
    const language = this.pageLoad.language.getValue();
    let v: any = {};
    switch (language) {
      case 'en':
        v = EN.values;
        break;
      default:
        v = LV.values;
        break;
    }
    if (typeof v[value] !== 'undefined') {
      return v[value];
    }
    return value; //notranslate
  }
}
