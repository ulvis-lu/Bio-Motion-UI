import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class Settings {
  public static email: string = 'info@biomotion.info';
  public static phone: string = '+371 26882084';

  mainUrl: string = environment.mainUrl;
  apiUrl: string = environment.apiUrl;
}
