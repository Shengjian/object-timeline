import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Duration } from './model/timeline.model';
import * as d3 from 'd3/d3.js';

@Component({
   selector: '[slider-filter]',
   moduleId: module.id,
   templateUrl: 'slider-filter.component.html',
   styleUrls: [ 'slider-filter.component.scss' ]
})
export class SliderFilterComponent {
   @Input('filter-width')
   public filterWidth: number;
   @Input('filter-height')
   public filterHeight: number;

   private _startTime: string;
   @Input('start-time')
   public get startTime(): string {
      return this._startTime;
   }
   public set startTime(value: string) {
      this.displayedStartTime = value;
      this._startTime = value;
   }

   private _endTime: string;
   @Input('end-time')
   public get endTime(): string {
      return this._endTime;
   }
   public set endTime(value: string) {
      this.displayedEndTime = value;
      this._endTime = value;
   }

   public displayedStartTime: string;
   public displayedEndTime: string;

   @Output()
   public filterButtonClick: EventEmitter<Duration> = new EventEmitter<Duration>();

   public isStartDateValid: boolean = true;
   public isEndDateValid: boolean = true;

   public filterButtonClickHandler(): void {
      let startDate: Date = new Date(this.displayedStartTime);
      let endDate: Date = new Date(this.displayedEndTime);
      let originalStartTime: number = (new Date(this.startTime)).getTime();
      let originalEndTime: number = (new Date(this.endTime)).getTime();

      if (startDate.getTime() < originalStartTime) {
         this.displayedStartTime = this.startTime;
      }
      if (endDate.getTime() > originalEndTime) {
         this.displayedEndTime = this.endTime;
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
         (new Date(this.displayedStartTime)).getTime(),
         (new Date(this.displayedEndTime)).getTime(),
      ));
   }
}
