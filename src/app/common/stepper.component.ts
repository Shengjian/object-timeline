import {
   Component,
   Input,
   Output,
   OnInit,
   ViewChild,
   EventEmitter,
   AfterViewInit
 } from '@angular/core';

 @Component({
   selector: 'stepper',
   templateUrl: 'stepper.component.html',
   styleUrls: ['./stepper.component.scss']
 })
 export class Stepper implements OnInit, AfterViewInit {
   private _value = 0;

   @Input() min: number;
   @Input() max: number;
   @Input() step = 1;
   @Output() change: EventEmitter<number> = new EventEmitter();
   @ViewChild('numberInput') input;

   constructor() {}

   @Input()
   set value(val: number) {
      this._value = val;
      this.onChange();
   }

   get value(): number {
      return this._value;
   }

   ngAfterViewInit() {
      const el = this.input.nativeElement;
      el.min   = this.min;
      el.max   = this.max;
      el.step  = this.step;
   }

   ngOnInit() {
      this.value = this.min ? Math.max(this.min, this.value) : this.value;
   }

   stepUp() {
      if (this.max && this._value + this.step > this.max) {
         return;
      }
      this.value += this.step;
   }

   stepDown() {
      if ( (this.value - this.step) < this.min) {
         return;
      }
      this.value -= this.step;
   }

   onChange() {
      this.change.emit(this.value);
   }
 }
