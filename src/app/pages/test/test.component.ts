import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Canvas,
  CanvasData,
  CanvasElement,
  TestData,
  CanvasTestResult,
} from 'shared/interfaces/Canvas';
import { SiteSettings } from 'shared/interfaces/SiteSettings';
import { BioMotionService } from 'shared/services/bio-motion.service';
import { CommonDataService } from 'shared/services/common-data.service';
import { PageLoadService } from 'shared/services/page-load.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
})
export class TestComponent implements OnInit, OnDestroy {
  title: string = '';
  loading: boolean = true;

  newWindow: boolean = false;
  windowSize: number = 0;

  pageId: string | number | undefined;
  pageIdChecked: boolean = false;
  pageIdInvalid: boolean = false;

  taskCount = 0;

  canvas: Canvas[] = [];
  canvasInit: Canvas[] = [];
  canvasReference: CanvasElement[] = [];

  start: boolean = false;
  siteSettings: SiteSettings | undefined;

  testCounter: number = 0;
  testInfo: boolean = true;

  bioType = new FormControl('0');
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
    {
      id: '4',
      name: this.commonData.translate.transform('test-biomotion-other'),
    },
  ];
  nextDisabled: boolean = true;

  timer: number = 0;
  timerId: any;
  testResult: CanvasTestResult[] = [];

  group = new FormGroup({
    sex: new FormControl(null, [Validators.required]),
    age: new FormControl(null, [Validators.required]),
    hobbies: new FormControl(null, [Validators.maxLength(200)]),
    profession: new FormControl(null, [Validators.maxLength(200)]),
    comments: new FormControl(null, [Validators.maxLength(200)]),
  });

  sexes: any[] = [
    { id: 1, name: this.commonData.translate.transform('test-sex-man') },
    { id: 2, name: this.commonData.translate.transform('test-sex-woman') },
  ];
  ages: number[] = [];

  testFinished: boolean = false;

  textSize: number = 0;

  textList: any = {
    hobbies: [
      'button-hobby-computer-game',
      'button-hobby-sport-activities',
      'button-hobby-programming',
      'button-hobby-dancing',
    ],

    profession: ['button-profession-it'],
  };

  constructor(
    private commonData: CommonDataService,
    private snackbar: MatSnackBar,
    private pageLoad: PageLoadService,
    private bioMotion: BioMotionService
  ) {}

  addToField(text: string, field: string) {
    let el = this.group.get(field)?.value || '';
    if (el.length) {
      el = el + ', ';
    }
    el = el + this.commonData.translate.transform(text);
    this.group.get(field)?.setValue(el);
    for (let i = 0; i < this.textList[field].length; i++) {
      if (this.textList[field][i] === text) {
        this.textList[field].splice(i, 1);
        break;
      }
    }
  }

  testWidth(w: number) {
    if (window.screen.availWidth > w) {
      return true;
    }

    return false;
  }

  changeWindowSize(size: number) {
    if (size === this.windowSize) {
      this.windowSize = 0;
    } else {
      this.windowSize = size;
    }
    let w: number = window.screen.availWidth;
    let h: number = window.screen.availHeight;
    switch (this.windowSize) {
      case 1:
        w = 1600;
        h = 900 + (window.outerHeight - window.innerHeight);
        break;
      case 2:
        w = 1200;
        h = 675 + (window.outerHeight - window.innerHeight);
        break;
      case 3:
        w = 800;
        h = 450 + (window.outerHeight - window.innerHeight);
        break;
    }
    if (window.screen.availWidth < w || window.screen.availHeight < h) {
      w = window.screen.availWidth;
      h = window.screen.availHeight;
    }
    window.resizeTo(w, h);
  }

  getErrorMessage(field: string) {
    if (field === 'sex' && this.group.get('sex')?.hasError('required')) {
      return this.commonData.translate.transform('test-error-required-sex');
    } else if (field === 'age' && this.group.get('age')?.hasError('required')) {
      return this.commonData.translate.transform('test-error-required-age');
    } else if (
      field === 'hobbies' &&
      this.group.get('hobbies')?.hasError('maxlength')
    ) {
      return this.commonData.translate.transform('test-error-hobbies-max');
    } else if (
      field === 'profession' &&
      this.group.get('profession')?.hasError('maxlength')
    ) {
      return this.commonData.translate.transform('test-error-profession-max');
    } else if (
      field === 'comments' &&
      this.group.get('comments')?.hasError('maxlength')
    ) {
      return this.commonData.translate.transform('test-error-comments-max');
    }

    return '';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.bioMotion.setSizes();
  }

  getData() {
    this.pageLoad.loading.next(true);
    this.commonData.block('test', { id: this.pageId }).subscribe((result) => {
      this.pageIdChecked = true;
      if (result && Array.isArray(result.data) && result.data.length) {
        const d: TestData = result.data[0];
        this.title = d.name;
        this.taskCount = d.count;
        d.data.forEach((item: CanvasData) => {
          this.canvasInit.push(this.bioMotion.canvasData(item, false));
        });

        this.bioType.valueChanges.subscribe((item: any) => {
          this.nextDisabled = item === '0';
          this.testResult[this.testResult.length - 1].bioType = item;
        });
      } else {
        this.pageIdInvalid = true;
      }
      this.pageLoad.loading.next(false);
    });
  }

  endTests() {
    this.group.markAllAsTouched();
    if (
      this.testCounter >= this.taskCount &&
      !this.loading &&
      this.getErrorMessage('sex').length === 0 &&
      this.getErrorMessage('age').length === 0 &&
      this.getErrorMessage('hobbies').length === 0 &&
      this.getErrorMessage('profession').length === 0 &&
      this.getErrorMessage('comments').length === 0
    ) {
      this.pageLoad.loading.next(true);

      this.commonData
        .block('bio-start', {
          id: this.pageId,
          data: this.testResult,
          sex: this.group.get('sex')?.value,
          age: this.group.get('age')?.value,
          hobbies: this.group.get('hobbies')?.value,
          profession: this.group.get('profession')?.value,
          comments: this.group.get('comments')?.value,
        })
        .subscribe((result) => {
          const err = this.commonData.translate.transform('data-cant-save');
          if (result && Array.isArray(result.data) && result.data.length) {
            if (result.data[0].bio && result.data[0].bio === 'OK') {
              this.snackbar.dismiss();
              this.testFinished = true;
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

  nextTest() {
    if (!this.testInfo) {
      this.testInfo = true;
      this.testResult.push({
        id: this.canvasInit[this.testCounter - 1].id,
        bioType: '0',
        w: window.innerWidth,
        h: window.innerHeight,
        time: new Date().getTime() - this.timer,
      });
      this.bioType.setValue('0');
    } else {
      if (this.testCounter < this.taskCount) {
        this.testInfo = false;
        this.timer = new Date().getTime();

        this.canvas = [this.canvasInit[this.testCounter]];
        this.bioMotion.clearCanvas();
        this.canvasReference = this.bioMotion.init(this.canvas, true);
        if (this.timerId) {
          clearInterval(this.timerId);
        }
        const noiseCount = this.canvas[0].noiseCount / 300;
        this.timerId = setInterval(() => {
          if (this.canvas[0].noiseCount > 0) {
            this.canvas[0].noiseCount -= noiseCount;
            this.canvasReference[0].noiseCount -= noiseCount;
          } else {
            clearInterval(this.timerId);
          }
        }, 100);
      }

      this.testCounter++;
      if (this.testCounter > this.taskCount) {
        if (this.timerId) {
          clearInterval(this.timerId);
        }
        this.startTest(false);
      }
    }
  }

  startTest(start: boolean) {
    if (!this.windowSize) {
      this.toggleFullScreen();
    }
    this.start = start;
    if (this.siteSettings) {
      this.siteSettings.closeMenu = start;
      this.pageLoad.siteSettings.next(this.siteSettings);
    }
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  changeFontSize(sizeChange: number) {
    if (this.textSize + sizeChange <= 3 || this.textSize + sizeChange >= 0) {
      this.pageLoad.textSize.next(this.textSize + sizeChange);
    }
  }

  openNewWindow() {
    const win = window.open(
      '/test/' + this.pageId,
      'test' + this.pageId,
      'width=' +
        window.screen.availWidth +
        ',height=' +
        window.screen.availHeight
    );
    win?.focus();
  }

  ngOnInit(): void {
    this.pageId = this.pageLoad.pageId.getValue();

    this.pageLoad.loading.subscribe(
      (loading: boolean) => (this.loading = loading)
    );
    this.pageLoad.textSize.subscribe(
      (textSize: number) => (this.textSize = textSize)
    );

    this.pageLoad.siteSettings.subscribe((siteSettings: SiteSettings) => {
      this.siteSettings = siteSettings;
    });

    if (this.pageId.length) {
      setTimeout(() => {
        this.getData();
      });
    } else {
      this.pageIdChecked = true;
    }
    for (let i = 16; i < 110; i++) {
      this.ages.push(i);
    }

    if (window.opener) {
      this.newWindow = true;
    }
  }

  ngOnDestroy(): void {
    this.bioMotion.clear();
    this.bioMotion.clearCanvas();
  }
}
