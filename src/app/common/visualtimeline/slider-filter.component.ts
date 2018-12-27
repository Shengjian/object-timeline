import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Duration } from './model/timeline.model';
import * as d3 from 'd3/d3.js';

@Component({
   selector: '[slider-filter]',
   moduleId: module.id,
   templateUrl: 'slider-filter.component.html',
   styleUrls: [ 'slider-filter.component.css' ]
})
export class SliderFilterComponent {
   @Input('filter-width')
   public filterWidth: number;
   @Input('filter-height')
   public filterHeight: number;

   private _originalStartTime: number;
   private _startTime: string;
   @Input('start-time')
   public get startTime(): string {
      return this._startTime;
   }
   public set startTime(value: string) {
      if (!this._originalStartTime) {
         this._originalStartTime = new Date(value).getTime();
      }
      this._startTime = value;
   }

   private _originalEndTime: number;
   private _endTime: string;
   @Input('end-time')
   public get endTime(): string {
      return this._endTime;
   }
   public set endTime(value: string) {
      if (!this._originalEndTime) {
         this._originalEndTime = new Date(value).getTime();
      }
      this._endTime = value;
   }

   @Output()
   public filterButtonClick: EventEmitter<Duration> = new EventEmitter<Duration>();

   public isStartDateValid: boolean = true;
   public isEndDateValid: boolean = true;

   public filterButtonClickHandler(): void {
      let startDate: Date = new Date(this.startTime);
      let endDate: Date = new Date(this.endTime);
      let format = d3.time.format('%Y-%m-%d %H:%M:%S');

      if (startDate.getTime() < this._originalStartTime) {
         this.startTime = format(new Date(this._originalStartTime));
      }
      if (endDate.getTime() > this._originalEndTime) {
         this.endTime = format(new Date(this._originalEndTime));
      }

      if (startDate.toString() === 'Invalid Date') {
         this.isStartDateValid = false;
         return;
      }
      if (endDate.toString() === 'Invalid Date') {
         this.isEndDateValid = false;
         return;
      }

      this.filterButtonClick.emit(new Duration(
         (new Date(this.startTime)).getTime(),
         (new Date(this.endTime)).getTime(),
      ));
   }
}
