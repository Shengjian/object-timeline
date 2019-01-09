import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Duration, GraphSpec } from './model/timeline.model';

@Component({
   selector: '[slider-filter]',
   moduleId: module.id,
   templateUrl: 'slider-filter.component.html',
   styleUrls: [ 'slider-filter.component.scss' ]
})
export class SliderFilterComponent {
   public filterWidth: number;
   public filterHeight: number;
   public filterX: number;
   public filterY: number;

   @Input('range')
   private _rangeFilterSpec: GraphSpec;
   public get rangeFilterSpec(): GraphSpec {
      return this._rangeFilterSpec;
   }
   public set rangeFilterSpec(value: GraphSpec) {
      this._rangeFilterSpec = value;
      this.calculateOtherSpecs();
   }

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

   private calculateOtherSpecs(): void {
      this.filterWidth = this._rangeFilterSpec.width;
      this.filterHeight = this._rangeFilterSpec.height;
      this.filterX = this._rangeFilterSpec.x;
      this.filterY = this._rangeFilterSpec.y;
   }

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
