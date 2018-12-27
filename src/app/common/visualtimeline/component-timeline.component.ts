import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ComponentTimeline, Duration, GraphSpec, StateTimeline, TimelineEvent } from './model/timeline.model';
import { TimelineUtils } from './utils/timeline.utils';

@Component({
   selector: '[component-timeline]',
   moduleId: module.id,
   templateUrl: 'component-timeline.component.html',
   styleUrls: [ 'component-timeline.component.css' ]
})
export class ComponentTimelineComponent {
   private _component: ComponentTimeline;
   private _states: StateTimeline[] = [];

   public TimelineUtils = TimelineUtils;
   public displayedEvents: TimelineEvent[];
   public blankState: StateTimeline;
   public iconSize: number = 20;
   @Output()
   public tooltipChangeEvent: EventEmitter<TimelineEvent[]> = new EventEmitter<any>();
   @Output()
   public eventsClickEvent: EventEmitter<TimelineEvent[]> = new EventEmitter<TimelineEvent[]>();

   @Input('component-timeline')
   public get component(): ComponentTimeline {
      return this._component;
   }

   public set component(value: ComponentTimeline) {
      this.displayedEvents = [];
      this._states = [];
      this.blankState = undefined;
      if (!(value && value.events)) {
         return;
      }
      this._component = value;

      let events: TimelineEvent[] = this._component.events;
      if (events.length !== 0) {
         let currentItem: TimelineEvent;
         let i: number;
         let gap: number;
         let overlappedItem: TimelineEvent = events[events.length - 1];
         this.displayedEvents.push(overlappedItem);

         for (i = events.length - 2; i >= 0; i--) {
            currentItem = events[i];
            gap = this.getEventY(overlappedItem) - this.getEventY(currentItem);
            if (gap > 20) {
               this.displayedEvents.push(currentItem);
               overlappedItem = currentItem;
            }
         }
         this._states = TimelineUtils.getStateTimelines(this._component);
      } else {
         this.blankState = TimelineUtils.getBlankState(this._component);
      }
   }

   public get states(): StateTimeline[] {
      return this._states;
   }

   public getEventX(): number {
      let spec: GraphSpec = this.component.spec;
      if (!spec) {
         return -9999;
      }
      return spec.x + (spec.width - this.iconSize) / 2;
   }

   public getEventY(event: TimelineEvent): number {
      let spec: GraphSpec = this.component.spec;
      let cmpDuration: Duration = this.component.duration;
      if (!spec || !cmpDuration) {
         return -9999;
      }
      let duration: Duration = new Duration(cmpDuration.start, event.time);
      let offset: number = TimelineUtils.getDurationRatio(duration, cmpDuration) * spec.height;
      return spec.y + offset - this.iconSize / 2;
   }

   public onMouseover(e: any, event: TimelineEvent): void {
      let emitData: any = {};
      emitData.mouseEvent = e;
      emitData.events = this.getOverlappedItems(event);
      this.tooltipChangeEvent.emit(emitData);
   }

   public onMouseout(): void {
      this.tooltipChangeEvent.emit(null);
   }

   public showEventDialog(event: TimelineEvent): void {
      this.eventsClickEvent.emit(this.getOverlappedItems(event));
   }

   private getOverlappedItems(item: TimelineEvent): TimelineEvent[] {
      const index: number = this._component.events.indexOf(item);
      const len: number = this._component.events.length;

      let overlappedItems: TimelineEvent[] = [item];
      let currentItem: TimelineEvent,
          previousItem: TimelineEvent,
          nextItem: TimelineEvent,
          i: number,
          j: number,
          gap: number = 0;

      if (index !== 0) {
         for (i = index; i > 0; i--) {
            currentItem = this._component.events[i];
            previousItem = this._component.events[i - 1];
            gap = this.getEventY(item) - this.getEventY(previousItem);
            if (gap < 22) {
               overlappedItems.push(previousItem);
            } else {
               break;
            }
         }
      }

      if (index !== len - 1) {
         for (j = index; j < len - 1; j++) {
            currentItem = this._component.events[j];
            nextItem = this._component.events[j + 1];
            gap = this.getEventY(nextItem) - this.getEventY(currentItem);
            if (gap < 22) {
               overlappedItems.push(nextItem);
               console.log('overlapped');
            } else {
               break;
            }
         }
      }
      return overlappedItems.sort((event1, event2) => event1.time - event2.time);
   }
}
