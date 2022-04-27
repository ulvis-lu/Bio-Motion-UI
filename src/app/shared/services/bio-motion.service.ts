import { Color } from '@angular-material-components/color-picker';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BioMotionData } from 'shared/common/bio-motion.data';
import {
  BioType,
  Canvas,
  CanvasData,
  CanvasElement,
  NoiseData,
} from 'shared/interfaces/Canvas';

@Injectable({
  providedIn: 'root',
})
export class BioMotionService {
  maxNoiseCount = 4000;
  noiseZ = 500;
  dotZ = 500;
  spaceExtra = 100;
  intervalId: any;
  canvasReference: CanvasElement[] = [];
  bioTypes: BioType[] = [];

  canvasRatio = 16 / 9;
  canvasRatioText = '16 : 9';
  gapHeight = 240;
  defaultWidth = 800;
  scrollTop = 0;
  waitResize: any;

  useWindow = false;

  constructor(private bioMotionData: BioMotionData) {
    this.bioTypes = this.bioMotionData.getBioTypes();
  }

  setScrollTop(top: number): void {
    this.scrollTop = top;
  }
  setSizes(): void {
    if (this.waitResize) {
      clearTimeout(this.waitResize);
    }
    this.waitResize = setTimeout(() => {
      let w: number, h: number;
      this.canvasReference.forEach((item: CanvasElement) => {
        item.canvas.height = 0;
        item.canvas.width = 0;
        w = this.useWindow ? window.innerWidth : item.parent.clientWidth;
        h =
          window.innerHeight -
          item.parent.clientHeight -
          (this.useWindow ? 0 : this.gapHeight);
        if (w / h > this.canvasRatio) {
          item.canvas.height = h;
          item.canvas.width = h * this.canvasRatio;
        } else {
          item.canvas.width = w;
          item.canvas.height = w / this.canvasRatio;
        }
        if (item.canvas.parentElement) {
          item.canvas.parentElement.style.width = item.canvas.width + 'px';
        }
        if (item.canvas.previousElementSibling) {
          item.canvas.previousElementSibling.innerHTML =
            this.canvasRatioText +
            ' (' +
            item.canvas.width +
            'px : ' +
            item.canvas.height +
            'px)';
        }
      });
    }, 300);
  }

  init(canvas: Canvas[], useWindow: boolean = false): CanvasElement[] {
    this.useWindow = useWindow;
    this.clear();
    canvas.forEach((item: Canvas) => {
      let el: any, div: any, w: number, h: number;
      const canvasId = setInterval(() => {
        div = document.getElementById('canvasContainerId' + item.id);
        el = document.getElementById('canvasId' + item.id);
        if (div instanceof HTMLDivElement && el instanceof HTMLCanvasElement) {
          clearInterval(canvasId);

          w = this.useWindow ? window.innerWidth : div.clientWidth;
          h =
            window.innerHeight -
            div.clientHeight -
            (this.useWindow ? 0 : this.gapHeight);
          if (w / h > this.canvasRatio) {
            el.height = h;
            el.width = h * this.canvasRatio;
          } else {
            el.width = w;
            el.height = w / this.canvasRatio;
          }
          if (el.parentElement) {
            el.parentElement.style.width = el.width + 'px';
          }
          if (el.previousElementSibling) {
            el.previousElementSibling.innerHTML =
              this.canvasRatioText +
              ' (' +
              el.width +
              'px : ' +
              el.height +
              'px)';
          }

          const noise: NoiseData[] = [];
          for (let index = 0; index < this.maxNoiseCount; index++) {
            noise.push({
              x: Math.random() * (el.width * 2) - el.width,
              y: Math.random() * (el.height * 2) - el.height,
              z: Math.random() * this.noiseZ,
              step: 0,
              size: item.size + Math.random() * 3,
            });
          }
          this.canvasReference.push(
            Object.assign(
              {
                parent: div,
                canvas: el,
                context: el.getContext('2d', { alpha: false }),
                noise: noise,
              },
              item
            )
          );
        }
      }, 100);
    });
    this.intervalId = setInterval(() => this.animate(), Math.floor(1000 / 30));
    return this.canvasReference;
  }
  clear() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  clearCanvas() {
    this.canvasReference = [];
  }

  newMatrix(): any[] {
    const m = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    return m;
  }

  newIdentityMatrix(): any[] {
    const m = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    return m;
  }

  multMatrixVector(m: any, v: any): any[] {
    const v2 = [4];
    let i, r;
    for (i = 0; i < 4; i++) {
      v2[i] = 0;
    }

    for (r = 0; r < 4; r++) {
      for (i = 0; i < 4; i++) {
        v2[r] += m[r][i] * v[i];
      }
    }
    return v2;
  }

  rotateX(angle: number): any[] {
    const m = [
      [1, 0, 0, 0],
      [0, Math.cos(angle), -Math.sin(angle), 0],
      [0, Math.sin(angle), Math.cos(angle), 0],
      [0, 0, 0, 1],
    ];
    return m;
  }

  rotateY(angle: number): any[] {
    const m = [
      [Math.cos(angle), 0, Math.sin(angle), 0],
      [0, 1, 0, 0],
      [-Math.sin(angle), 0, Math.cos(angle), 0],
      [0, 0, 0, 1],
    ];
    return m;
  }

  rotateZ(angle: number): any[] {
    const m = [
      [Math.cos(angle), -Math.sin(angle), 0, 0],
      [Math.sin(angle), Math.cos(angle), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    return m;
  }

  perspective(zfar: number): any[] {
    const znear = 1;
    const f = zfar;
    const m = [
      [f, 0, 0, 0],
      [0, f, 0, 0],
      [
        0,
        0,
        (zfar + znear) / (znear - zfar),
        (2 * zfar * znear) / (znear - zfar),
      ],
      [0, 0, -1, 0],
    ];
    return m;
  }

  noiseSpacePosition(
    item: CanvasElement,
    index: number
  ): { x: number; y: number; z: number } {
    let x, y, z: number;
    x = item.noise[index].x + item.noise[index].step + Math.random() * 3;
    y = item.noise[index].y + Math.random() * 3;
    z = item.noise[index].z + Math.random() * 3;

    let matrix = this.multMatrixVector(this.newIdentityMatrix(), [x, y, z, 1]);

    matrix = this.multMatrixVector(
      this.rotateZ((item.noiseDirection * Math.PI) / 180),
      [matrix[0], matrix[1], matrix[2], 1]
    );
    matrix = this.multMatrixVector(this.perspective(this.noiseZ), [
      matrix[0],
      matrix[1],
      matrix[2] - this.noiseZ,
      1,
    ]);

    matrix[0] = matrix[0] / matrix[3];
    matrix[1] = matrix[1] / matrix[3];
    matrix[2] = matrix[2] / matrix[3];
    return { x: matrix[0], y: matrix[1], z: matrix[2] };
  }

  dotSpacePosition(
    item: CanvasElement,
    bioType: BioType,
    index: number
  ): { x: number; y: number; z: number } {
    let x, y, z: number;
    x =
      (bioType.dots[index][0] *
        item.bioSize *
        (item.canvas.width / this.defaultWidth)) /
      100;
    y =
      (bioType.dots[index][1] *
        item.bioSize *
        (item.canvas.width / this.defaultWidth)) /
      100;
    z =
      (bioType.dots[index][2] *
        item.bioSize *
        (item.canvas.width / this.defaultWidth)) /
      100;

    let matrix = this.multMatrixVector(this.newIdentityMatrix(), [x, y, z, 1]);

    matrix = this.multMatrixVector(
      this.rotateX((item.viewpointX * Math.PI) / 180),
      [matrix[0], matrix[1], matrix[2], 1]
    );
    matrix = this.multMatrixVector(
      this.rotateY((item.viewpointY * Math.PI) / 180),
      [matrix[0], matrix[1], matrix[2], 1]
    );
    matrix = this.multMatrixVector(
      this.rotateZ((item.viewpointZ * Math.PI) / 180),
      [matrix[0], matrix[1], matrix[2], 1]
    );

    matrix = this.multMatrixVector(this.perspective(this.dotZ), [
      matrix[0],
      matrix[1],
      matrix[2] - this.dotZ,
      1,
    ]);
    matrix[0] = matrix[0] / matrix[3];
    matrix[1] = matrix[1] / matrix[3];
    matrix[2] = matrix[2] / matrix[3];

    return { x: matrix[0], y: matrix[1], z: matrix[2] };
  }

  drawLine(
    item: CanvasElement,
    color: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    item.context.strokeStyle = color;
    item.context.beginPath();
    item.context.moveTo(x1, y1);
    item.context.lineTo(x2, y2);
    item.context.stroke();
    item.context.closePath();
  }

  animate() {
    let pos: { x: number; y: number; z: number };
    let x1: number,
      y1: number,
      z1: number,
      x2: number,
      y2: number,
      z2: number,
      dirX: number,
      dirY: number;
    let bioType: BioType;
    let index: number;
    let centerX: number, centerY: number;
    let index1: number, index2: number;
    this.canvasReference.forEach((item: CanvasElement) => {
      item.context.fillStyle = '#000000';
      item.context.fillRect(0, 0, item.canvas.width, item.canvas.height);
      if (
        this.useWindow ||
        1 -
          Math.abs(this.scrollTop - item.parent.offsetTop) /
            item.parent.clientHeight >
          0.5
      ) {
        centerX = (item.canvas.width * item.placementX) / 100;
        centerY = (item.canvas.height * item.placementY) / 100;

        if (item.lines.value) {
          this.drawLine(
            item,
            '#FFFFFF',
            centerX,
            0,
            centerX,
            item.canvas.height
          );
          this.drawLine(
            item,
            '#FFFFFF',
            0,
            centerY,
            item.canvas.width,
            centerY
          );
        }

        for (index = 0; index < this.bioTypes.length; index++) {
          if (this.bioTypes[index].id === parseInt(item.bioType.value)) {
            bioType = this.bioTypes[index];
            break;
          }
        }

        item.context.fillStyle = item.color.value;

        if (bioType) {
          for (index = 0; index < bioType.dotCount; index++) {
            index1 = bioType.currentPosition * bioType.dotCount;
            index2 = index + index1;
            pos = this.dotSpacePosition(item, bioType, index2);
            x1 = pos.x;
            y1 = pos.y;
            z1 = pos.z;

            bioType.dotsNew[index2] = [x1, y1, z1];

            item.context.beginPath();
            item.context.arc(
              x1 + centerX,
              y1 + centerY,
              item.size,
              0,
              2 * Math.PI
            );
            item.context.fill();
            item.context.closePath();

            bioType.timer++;
            if (bioType.timer >= 20) {
              bioType.timer = 0;
              bioType.currentPosition++;
              if (bioType.currentPosition >= bioType.totalPosition) {
                bioType.currentPosition = 0;
              }
            }
          }
          if (item.lines.value) {
            for (index = 0; index < bioType.lines.length; index++) {
              x1 = bioType.dotsNew[bioType.lines[index][0] + index1][0];
              y1 = bioType.dotsNew[bioType.lines[index][0] + index1][1];
              x2 = bioType.dotsNew[bioType.lines[index][1] + index1][0];
              y2 = bioType.dotsNew[bioType.lines[index][1] + index1][1];
              this.drawLine(
                item,
                item.color.value,
                x1 + centerX,
                y1 + centerY,
                x2 + centerX,
                y2 + centerY
              );
            }
          }
        }

        for (
          index = 0;
          index < (this.maxNoiseCount * item.noiseCount) / 100;
          index++
        ) {
          pos = this.noiseSpacePosition(item, index);
          x1 = pos.x;
          y1 = pos.y;
          z1 = pos.z;

          item.noise[index].step += 1;

          pos = this.noiseSpacePosition(item, index);
          x2 = pos.x;
          y2 = pos.y;
          z2 = pos.z;

          dirX = x2 - x1;
          dirY = y2 - y1;

          if (
            (x2 > item.canvas.width + this.spaceExtra && dirX >= 0) ||
            (x2 < -this.spaceExtra && dirX < 0) ||
            (y2 > item.canvas.height + this.spaceExtra && dirY >= 0) ||
            (y2 < -this.spaceExtra && dirY < 0)
          ) {
            item.noise[index].step = 0;
            item.noise[index].x =
              Math.random() * (item.canvas.width * 2) - item.canvas.width;
          }

          item.context.beginPath();
          item.context.arc(x2, y2, item.noise[index].size, 0, 2 * Math.PI);
          item.context.fill();
          item.context.closePath();
        }
      }
    });
  }

  canvasData(item: CanvasData, lines: boolean) {
    let color = item.color.split(',');
    if (color.length !== 4) {
      color = ['255', '255', '255', '1'];
    }
    return {
      id: item.id,
      bioType: new FormControl(item.bioType + ''),
      bioSize: item.bioSize,
      noiseCount: item.noiseCount,
      noiseDirection: item.noiseDirection,
      placementX: item.placementX,
      placementY: item.placementY,
      size: item.size,
      color: new FormControl(
        new Color(
          parseInt(color[0]),
          parseInt(color[1]),
          parseInt(color[2]),
          parseInt(color[3])
        )
      ),
      viewpointX: item.viewpointX,
      viewpointY: item.viewpointY,
      viewpointZ: item.viewpointZ,
      lines: new FormControl(lines),
    };
  }
}
