import { FormControl } from '@angular/forms';

export interface BioType {
  id: number;
  dots: number[][];
  dotsNew: number[][];
  lines: number[][];
  dotCount: number;
  totalPosition: number;
  currentPosition: number;
  timer: number;
}

export interface Canvas {
  id: number;
  bioType: FormControl;
  bioSize: number;
  noiseCount: number;
  noiseDirection: number;
  placementX: number;
  placementY: number;
  size: number;
  color: FormControl;
  viewpointX: number;
  viewpointY: number;
  viewpointZ: number;
  lines: FormControl;
}
export interface NoiseData {
  x: number;
  y: number;
  z: number;
  step: number;
  size: number;
}
export interface CanvasElement extends Canvas {
  parent: HTMLDivElement;
  canvas: HTMLCanvasElement;
  context: any;
  noise: NoiseData[];
}

export interface CanvasData {
  id: number;
  bioType: number;
  bioSize: number;
  noiseCount: number;
  noiseDirection: number;
  placementX: number;
  placementY: number;
  size: number;
  color: string;
  viewpointX: number;
  viewpointY: number;
  viewpointZ: number;
}
export interface TestData {
  id: number;
  name: string;
  my: number;
  public: number;
  users: number;
  count: number;
  data: CanvasData[];
  result?: UsersResult[];
}

export interface CanvasTestResult {
  id: number;
  bioType: string;
  w: number;
  h: number;
  time: number;
  bioTypeResult?: string;
}
export interface UsersResult {
  id: number;
  timeCreated: string;
  sex: number;
  age: number;
  hobbies: string;
  profession: string;
  comments: string;
  percentage: number;
  totalTime: number;
  result: CanvasTestResult[];
}
