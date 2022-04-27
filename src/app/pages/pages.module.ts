import { NgModule } from '@angular/core';
import { SharedModule } from 'shared/shared.module';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SigninComponent } from './signin/signin.component';
import { SignoutComponent } from './signout/signout.component';
import { SignupComponent } from './signup/signup.component';
import { SignupResendComponent } from './signup/resend/resend.component';
import { ValidateComponent } from './validate/validate.component';
import { PasswordRecoverComponent } from './password-recover/password-recover.component';
import { InfoComponent } from './account/info/info.component';
import { SettingsComponent } from './account/settings/settings.component';
import { DialogsComponent } from './dialogs/dialogs.component';
import { NeedToLoginComponent } from './dialogs/need-to-login/need-to-login.component';
import { AccountDeleteComponent } from './dialogs/account-delete/account-delete.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';
import { AdminUserComponent } from './admin/admin-user/admin-user.component';
import { Page404Component } from 'app/page404/page404.component';
import { UserConfirmComponent } from './dialogs/user-confirm/user-confirm.component';
import { UserBlockComponent } from './dialogs/user-block/user-block.component';
import { UserUnblockComponent } from './dialogs/user-unblock/user-unblock.component';
import { SiteSettingsComponent } from './admin/site-settings/site-settings.component';

import { ConfirmActionComponent } from './dialogs/confirm-action/confirm-action.component';
import { MotionTestComponent } from './motion-test/motion-test.component';
import { PendingChangesGuard } from 'shared/guards/pending-changes.guard';
import { TestComponent } from './test/test.component';
import { TestsComponent } from './tests/tests.component';
import { QueryResultComponent } from './dialogs/query-result/query-result.component';

@NgModule({
  declarations: [
    HomeComponent,
    SigninComponent,
    SignoutComponent,
    SignupComponent,
    SignupResendComponent,
    ValidateComponent,
    PasswordRecoverComponent,
    InfoComponent,
    SettingsComponent,
    DialogsComponent,
    NeedToLoginComponent,
    AccountDeleteComponent,

    ContactsComponent,
    AdminUsersComponent,
    AdminUserComponent,
    UserConfirmComponent,
    UserBlockComponent,
    UserUnblockComponent,
    SiteSettingsComponent,
    ConfirmActionComponent,
    MotionTestComponent,
    TestComponent,
    TestsComponent,
    QueryResultComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'signin',
        component: SigninComponent,
      },
      {
        path: 'signout',
        component: SignoutComponent,
      },
      {
        path: 'signup',
        component: SignupComponent,
      },
      {
        path: 'validate/:h',
        component: ValidateComponent,
      },
      {
        path: 'password-recover',
        component: PasswordRecoverComponent,
      },
      {
        path: 'password-recover/:h',
        component: PasswordRecoverComponent,
      },
      {
        path: 'account/info',
        component: InfoComponent,
      },
      {
        path: 'account/settings',
        component: SettingsComponent,
      },

      {
        path: 'contacts',
        component: ContactsComponent,
      },

      {
        path: 'motion-test/:id',
        component: MotionTestComponent,
        canDeactivate: [PendingChangesGuard],
      },

      {
        path: 'test/:id',
        component: TestComponent,
      },

      {
        path: 'admin',
        children: [
          { path: 'default', component: AdminUsersComponent },
          { path: 'users', component: AdminUsersComponent },
          { path: 'user/:id', component: AdminUserComponent },
          { path: 'settings', component: SiteSettingsComponent },
          { path: '**', component: Page404Component },
        ],
      },
    ]),
  ],
  providers: [PendingChangesGuard],
})
export class PagesModule {}
