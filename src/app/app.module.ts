import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'shared/shared.module';
import { PagesModule } from 'pages/pages.module';
import { Page404Component } from './page404/page404.component';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent, Page404Component],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    PagesModule,
    SharedModule,
    RouterModule.forRoot([{ path: '**', component: Page404Component }], {
      relativeLinkResolution: 'legacy',
      onSameUrlNavigation: 'reload',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
