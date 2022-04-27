import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function trimSpaces(len: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control && control.value && control.value.trim().length < len) {
      return { trimSpaces: true };
    }
    return null;
  };
}
