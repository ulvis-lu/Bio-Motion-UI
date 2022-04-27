import { Component, OnInit } from '@angular/core';
import { Settings } from 'shared/settings';
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
})
export class ContactsComponent implements OnInit {
  email: string = '';
  phone: string = '';
  constructor() {}

  ngOnInit(): void {
    this.email = Settings.email;
    this.phone = Settings.phone;
  }
}
