import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Color } from '@angular-material-components/color-picker';
import { MatSliderChange } from '@angular/material/slider';
import { BioMotionService } from 'shared/services/bio-motion.service';
import {
  Canvas,
  CanvasData,
  CanvasElement,
  TestData,
} from 'shared/interfaces/Canvas';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { PageLoadService } from 'shared/services/page-load.service';
import { ComponentCanDeactivate } from 'shared/guards/pending-changes.guard';
import { MatDialog } from '@angular/material/dialog';
import { DialogsComponent } from '../dialogs/dialogs.component';
import { CommonDataService } from 'shared/services/common-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trimSpaces } from 'shared/common/validators';
import { User } from 'shared/interfaces/User';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-motion-test',
  templateUrl: './motion-test.component.html',
})
export class MotionTestComponent
  implements OnInit, OnDestroy, ComponentCanDeactivate
{
  title: string = '';

  edit: boolean = true;
  public: number = 0;

  url = new FormControl({ value: '', disabled: true });

  testName = new FormControl('', [
    Validators.required,
    Validators.maxLength(100),
    Validators.minLength(2),
    trimSpaces(2),
  ]);
  testNameInit = '';
  @ViewChild('testNameInput') testNameInput: ElementRef | undefined;

  user: User | undefined;
  loading: boolean = true;
  firstLoad: boolean = false;
  noData: boolean = false;
  pageId: string | number | undefined;
  pageIdChecked: boolean = false;
  pageIdInvalid: boolean = false;

  taskCount = 0;
  taskCountMax = 50;

  bioSizeDefault = 50;
  noiseCountDefault = 0;
  noiseDirectionDefault = 45;
  bioTypeDefault = '1';
  placementXDefault = 50;
  placementYDefault = 50;
  sizeDefault = 4;
  colorDefault = new Color(255, 255, 255, 1);
  viewpointXDefault = 90;
  viewpointYDefault = 200;
  viewpointZDefault = 0;
  linesDefault = false;

  types: any[] = [
    {
      id: '1',
      name: this.commonData.translate.transform('test-biomotion-walking'),
    },
    {
      id: '2',
      name: this.commonData.translate.transform('test-biomotion-running'),
    },
    {
      id: '3',
      name: this.commonData.translate.transform('test-biomotion-jumping'),
    },
  ];
  canvas: Canvas[] = [];
  canvasInit: Canvas[] = [];
  canvasReference: CanvasElement[] = [];

  scrollElement$: Subscription | undefined;

  isChanges$: Subject<boolean>;

  constructor(
    private commonData: CommonDataService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private pageLoad: PageLoadService,
    private bioMotion: BioMotionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isChanges$ = new Subject<boolean>();
  }

  copyUrl() {
    this.commonData.openSnackBar(
      this.snackbar,
      this.commonData.translate.transform('test-link-copied'),
      2000,
      'snackbar-success'
    );
    navigator.clipboard.writeText(this.url.value);
    return false;
  }

  getErrorMessage(field: string) {
    if (field === 'testName' && this.testName.hasError('required')) {
      return this.commonData.translate.transform('test-error-required-name');
    } else if (field === 'testName' && this.testName.hasError('maxlength')) {
      return this.commonData.translate.transform('test-error-name-max');
    } else if (
      field === 'testName' &&
      (this.testName.hasError('minlength') ||
        this.testName.hasError('trimSpaces'))
    ) {
      return this.commonData.translate.transform('test-error-name-min');
    }

    return '';
  }

  bioTypeText(bioType: string) {
    let t = '';
    for (let i = 0; i < this.types.length; i++) {
      if (this.types[i].id === bioType) {
        t = this.types[i].name;
        break;
      }
    }
    return t;
  }

  testChanges(): boolean {
    if (this.pageId === 'new') {
      return !!this.taskCount;
    } else {
      if (this.testName.value !== this.testNameInit) {
        return true;
      }
      let inList, i, j, el1: Canvas, el2: Canvas;
      let idList: number[] = [];
      for (j = 0; j < this.canvas.length; j++) {
        el1 = this.canvas[j];
        inList = false;
        for (i = 0; i < this.canvasInit.length; i++) {
          el2 = this.canvasInit[i];
          if (el1.id === el2.id) {
            inList = true;
            if (
              el1.bioType.value !== el2.bioType.value ||
              el1.bioSize !== el2.bioSize ||
              el1.noiseCount !== el2.noiseCount ||
              el1.noiseDirection !== el2.noiseDirection ||
              el1.placementX !== el2.placementX ||
              el1.placementY !== el2.placementY ||
              el1.size !== el2.size ||
              el1.color.value.toRgba() !== el2.color.value.toRgba() ||
              el1.viewpointX !== el2.viewpointX ||
              el1.viewpointY !== el2.viewpointY ||
              el1.viewpointZ !== el2.viewpointZ
            ) {
              return true;
            }
          }
        }
        if (!inList) {
          return true;
        }
        idList.push(el1.id);
      }
      for (i = 0; i < this.canvasInit.length; i++) {
        el2 = this.canvasInit[i];
        inList = false;
        for (j = 0; j < idList.length; j++) {
          if (el2.id === idList[j]) {
            inList = true;
            break;
          }
        }
        if (!inList) {
          return true;
        }
      }
    }
    return false;
  }

  @HostListener('window:beforeunload')
  canDeactivateBrowser(): Observable<boolean> | boolean {
    if (this.testChanges()) {
      return false;
    }
    return true;
  }

  canDeactivate(): Observable<boolean> | boolean {
    this._confirm();
    return this.isChanges$;
  }
  _confirm() {
    if (this.testChanges()) {
      const dialogRef = this.dialog.open(DialogsComponent, {
        data: {
          dialogName: 'confirm-action',
          dialogData: {
            text: this.commonData.translate.transform(
              'test-leave-without-saving-changes'
            ),
          },
        },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res && res.type === 'confirm') {
          this.isChanges$.next(true);
        }
      });
    } else {
      setTimeout(() => {
        this.isChanges$.next(true);
      }, 10);
    }
  }

  ngOnDestroy(): void {
    this.bioMotion.clear();
    this.bioMotion.clearCanvas();
    if (this.scrollElement$) {
      this.scrollElement$.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.bioMotion.setSizes();
  }

  setValue(event: MatSliderChange, id: number, name: string) {
    for (let index = 0; index < this.canvas.length; index++) {
      if (this.canvas[index].id === id) {
        let object: any = this.canvas[index];
        object[name] = event.value || 0;
        object = this.canvasReference[index];
        object[name] = event.value || 0;
        break;
      }
    }
  }
  changeLines(event: MatSlideToggleChange, id: number) {
    for (let index = 0; index < this.canvas.length; index++) {
      if (this.canvas[index].id === id) {
        this.canvas[index].lines.setValue(event.checked || false);
        this.canvasReference[index].lines.setValue(event.checked || false);
        break;
      }
    }
  }
  changeSize(event: MatSliderChange, id: number) {
    for (let index = 0; index < this.canvas.length; index++) {
      if (this.canvas[index].id === id) {
        this.canvas[index].size = event.value || 0;
        this.canvasReference[index].size = event.value || 0;
        for (let j = 0; j < this.canvasReference[index].noise.length; j++) {
          this.canvasReference[index].noise[j].size =
            this.canvas[index].size + Math.random() * 3;
        }
        break;
      }
    }
  }

  addNextTask(
    params: Canvas = {
      id: 0,
      bioType: new FormControl(this.bioTypeDefault),
      bioSize: this.bioSizeDefault,
      noiseCount: this.noiseCountDefault,
      noiseDirection: this.noiseDirectionDefault,
      placementX: this.placementXDefault,
      placementY: this.placementYDefault,
      size: this.sizeDefault,
      color: new FormControl(this.colorDefault),
      viewpointX: this.viewpointXDefault,
      viewpointY: this.viewpointYDefault,
      viewpointZ: this.viewpointZDefault,
      lines: new FormControl(this.linesDefault),
    },
    scroll: boolean = true,
    init: boolean = false
  ) {
    this.taskCount++;
    params.id = this.taskCount;
    const canvas: Canvas[] = [params];
    this.canvas.push(canvas[0]);
    if (init) {
      this.canvasInit.push(Object.assign({}, canvas[0]));
    }
    this.canvasReference = this.bioMotion.init(canvas);
    if (scroll) {
      setTimeout(() => {
        const scrollTo =
          this.pageLoad.drawerContainer?.scrollable.getElementRef()
            .nativeElement.scrollHeight || 0;
        this.commonData.scrollToTop(scrollTo);
      }, 100);
    }
  }

  deleteTask(id: number) {
    const dialogRef = this.dialog.open(DialogsComponent, {
      data: {
        dialogName: 'confirm-action',
        dialogData: {
          text: this.commonData.translate.transform('test-delete-task'),
        },
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.type === 'confirm') {
        for (let i = 0; i < this.canvas.length; i++) {
          if (this.canvas[i].id === id) {
            this.canvas.splice(i, 1);
            this.canvasReference.splice(i, 1);
            break;
          }
        }
        this.taskCount--;
        for (let i = 0; i < this.canvas.length; i++) {
          this.canvas[i].id = i + 1;
          this.canvasReference[i].id = i + 1;
        }
      }
    });
  }

  resetTest() {
    this.taskCount = 0;
    this.canvas = [];
    this.canvasInit = [];
    this.canvasReference = [];
    this.testName.reset();
    this.testName.setValue('');
    this.testNameInit = '';
    this.url.reset();
  }

  saveTest() {
    this.testName.markAllAsTouched();
    if (this.testName.invalid) {
      this.testNameInput?.nativeElement.focus();
      this.commonData.scrollToTop();
    } else if (!this.loading && this.getErrorMessage('testName').length === 0) {
      this.pageLoad.loading.next(true);

      const data: any = [];
      this.canvas.forEach((item: Canvas) => {
        data.push({
          id: item.id,
          bioType: item.bioType.value,
          bioSize: item.bioSize,
          noiseCount: item.noiseCount,
          noiseDirection: item.noiseDirection,
          placementX: item.placementX,
          placementY: item.placementY,
          size: item.size,
          color: item.color.value.toRgba(),
          viewpointX: item.viewpointX,
          viewpointY: item.viewpointY,
          viewpointZ: item.viewpointZ,
        });
      });

      this.commonData
        .block('bio-save', {
          name: this.testName.value,
          id: this.pageId,
          data: data,
        })
        .subscribe((result) => {
          const err = this.commonData.translate.transform('data-cant-save');
          if (result && Array.isArray(result.data) && result.data.length) {
            if (
              result.data[0].bio &&
              result.data[0].tid &&
              result.data[0].bio === 'OK'
            ) {
              this.commonData.openSnackBar(
                this.snackbar,
                this.commonData.translate.transform('data-saved'),
                2000,
                'snackbar-success'
              );
              this.resetTest();
              this.router.navigateByUrl('/motion-test/' + result.data[0].tid);
            } else if (result.data[0].bio) {
              this.commonData.openSnackBar(this.snackbar, result.data[0].bio);
            } else {
              this.commonData.openSnackBar(this.snackbar, err);
            }
          } else {
            this.commonData.openSnackBar(this.snackbar, err);
          }
          this.pageLoad.loading.next(false);
        });
    }
  }

  actionTest(action: string) {
    let q = '';
    let p = '';
    switch (action) {
      case 'delete':
        q = this.commonData.translate.transform('test-delete-test');
        p = 'bio-delete';
        break;
      case 'public':
        q = this.commonData.translate.transform('test-public-test');
        p = 'bio-public';
        break;
      case 'unpublic':
        q = this.commonData.translate.transform('test-hide-test');
        p = 'bio-unpublic';
        break;
    }
    const dialogRef = this.dialog.open(DialogsComponent, {
      data: {
        dialogName: 'confirm-action',
        dialogData: {
          text: q,
        },
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.type === 'confirm') {
        this.pageLoad.loading.next(true);

        this.commonData
          .block(p, {
            id: this.pageId,
          })
          .subscribe((result) => {
            const err = this.commonData.translate.transform(
              'data-test-action-unsuccessful'
            );
            if (result && Array.isArray(result.data) && result.data.length) {
              if (result.data[0].bio && result.data[0].bio === 'OK') {
                this.commonData.openSnackBar(
                  this.snackbar,
                  this.commonData.translate.transform(
                    'data-test-action-successful'
                  ),
                  2000,
                  'snackbar-success'
                );
                switch (action) {
                  case 'delete':
                    this.resetTest();
                    this.router.navigateByUrl('/motion-test/my');
                    break;
                  case 'public':
                    this.public = 1;
                    break;
                  case 'unpublic':
                    this.public = 0;
                    break;
                }
              } else if (result.data[0].bio) {
                this.commonData.openSnackBar(this.snackbar, result.data[0].bio);
              } else {
                this.commonData.openSnackBar(this.snackbar, err);
              }
            } else {
              this.commonData.openSnackBar(this.snackbar, err);
            }
            this.pageLoad.loading.next(false);
          });
      }
    });
  }
  editTest() {
    //this.router.navigateByUrl('/motion-test/' + this.pageId + '?edit=1');
    this.edit = true;
    this.bioMotion.clearCanvas();
    this.canvasReference = this.bioMotion.init(this.canvas);
  }

  getData() {
    this.pageLoad.loading.next(true);
    this.commonData
      .block('bio-test', { id: this.pageId })
      .subscribe((result) => {
        this.pageIdChecked = true;
        if (result && Array.isArray(result.data) && result.data.length) {
          const d: TestData = result.data[0];
          this.public = d.public;
          this.url.setValue(this.commonData.mainUrl + '/test/' + this.pageId);
          this.testName.setValue(d.name);
          this.testNameInit = d.name;
          d.data.forEach((item: CanvasData) => {
            this.addNextTask(
              this.bioMotion.canvasData(item, this.linesDefault),
              false,
              true
            );
          });
        } else {
          this.pageIdInvalid = true;
        }
        this.pageLoad.loading.next(false);
      });
  }

  cancelTest() {
    this.resetTest();
    this.router.navigateByUrl('/motion-test/' + this.pageId);
  }

  ngOnInit(): void {
    this.pageId = this.pageLoad.pageId.getValue();

    if (this.pageId !== 'my') {
      this.pageLoad.loading.subscribe(
        (loading: boolean) => (this.loading = loading)
      );
      this.pageLoad.user.subscribe((user: User) => {
        this.user = user;
      });
    }

    if (this.pageId === 'new') {
      this.title = this.commonData.translate.transform('test-title-new-test');
      this.firstLoad = true;
    } else if (this.pageId === 'my') {
      //list component
    } else {
      if (typeof this.route.snapshot.queryParams['edit'] === 'undefined') {
        this.edit = false;
      }

      this.title = this.commonData.translate.transform('test-title-edit');
      if (this.pageId.length) {
        setTimeout(() => {
          this.getData();
        });
      } else {
        this.pageIdChecked = true;
      }
    }

    if (this.pageId !== 'my') {
      this.scrollElement$ = this.pageLoad.drawerContainer?.scrollable
        .elementScrolled()
        .subscribe((item: any) => {
          this.bioMotion.setScrollTop(item.target.scrollTop);
        });
    }
  }
}
