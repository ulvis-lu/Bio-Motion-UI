import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CanvasData,
  CanvasTestResult,
  TestData,
  UsersResult,
} from 'shared/interfaces/Canvas';
import { CommonDataService } from 'shared/services/common-data.service';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
})
export class QueryResultComponent implements OnInit {
  @Input() dialogData: any = {};

  loading: boolean = true;
  loadingOne: boolean = false;
  pageIdChecked: boolean = false;
  pageIdInvalid: boolean = false;

  taskCount = 0;
  usersCount = 0;

  users: UsersResult[] = [];
  tasks: CanvasData[] = [];

  testIds: any[] = [];
  testUsersIds: any[] = [];

  ids = new FormControl(0);
  usersIds = new FormControl(0);

  avg: any[] = [];

  constructor(
    private commonData: CommonDataService,
    private snackbar: MatSnackBar
  ) {}

  getTasks(id: number) {
    let tasks: CanvasTestResult[] = [];
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id) {
        tasks = this.users[i].result;
        break;
      }
    }
    return tasks;
  }

  openUser(id: number) {
    this.usersIds.setValue(id);
  }
  getData() {
    this.commonData
      .block('test-result', {
        id: this.dialogData.id,
        task: this.ids.value,
        user: this.usersIds.value,
      })
      .subscribe((result) => {
        this.pageIdChecked = true;
        if (result && Array.isArray(result.data) && result.data.length) {
          const d: TestData = result.data[0];
          this.taskCount = d.count;
          this.usersCount = d.users;
          this.users = d.result || [];

          if (!this.ids.value) {
            this.tasks = d.data || [];
            this.testIds = [
              {
                id: 0,
                name: this.commonData.translate.transform(
                  'test-result-option-all'
                ),
              },
            ];
            this.tasks.forEach((task: CanvasData) => {
              this.testIds.push({
                id: task.id,
                name: task.id,
              });
            });
          }
          if (!this.usersIds.value) {
            this.testUsersIds = [
              {
                id: 0,
                name: this.commonData.translate.transform(
                  'test-result-option-all'
                ),
              },
            ];
            this.users.forEach((user: UsersResult) => {
              this.testUsersIds.push({
                id: user.id,
                name: user.id,
              });
            });
          }

          let time = 0;
          let age = 0;
          let percentage = 0;
          let count = this.users.length ? this.users.length : 1;
          this.users.forEach((user: UsersResult) => {
            age += user.age;
            let percentageOk = 0;
            let percentageTotal = 0;
            user.result.forEach((result: CanvasTestResult) => {
              time += result.time;
              if (result.bioType === result.bioTypeResult) {
                percentageOk++;
              }
              percentageTotal++;
            });
            percentage +=
              (percentageOk / (percentageTotal ? percentageTotal : 1)) * 100;
          });
          this.avg = [
            {
              time: time / count,
              age: age / count,
              percentage: percentage / count,
            },
          ];
        } else {
          this.pageIdInvalid = true;
        }
        this.loading = false;
        this.loadingOne = false;
      });
  }

  @Output() close = new EventEmitter<any>();
  closeDialog(type: string = 'close') {
    this.close.emit({ type: type });
  }

  ngOnInit(): void {
    this.getData();
    this.ids.valueChanges.subscribe((item: any) => {
      this.loadingOne = true;
      this.getData();
    });
    this.usersIds.valueChanges.subscribe((item: any) => {
      this.loadingOne = true;
      this.getData();
    });
  }
}
