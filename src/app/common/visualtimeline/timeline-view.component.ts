import { Component, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import {
   TimelineEvent,
   VisualTimeline,
   Duration,
   ComponentTimeline,
   ObjectInfoInputs,
   GraphSpec
} from "./model/timeline.model";
import { TimelineUtils } from "./utils/timeline.utils";
// import { ObjectTimelineService } from "../../components/objectinfo/object.timeline.service";
import * as d3 from "d3/d3.js";

@Component({
   selector: '[timeline-view]',
   moduleId: module.id,
   templateUrl: 'timeline-view.component.html',
   styleUrls: [ 'timeline-view.component.scss' ]
})

export class TimelineViewComponent {

   public VisualTimeline = VisualTimeline;
   // Header components, include object, component, RAID, Witness.
   public componentNodes: any[] = [];

   // Used to record header component horizontal position.
   private _cmpX: number;
   private _objectTimeline: ComponentTimeline;
   private _originalDuration: Duration;
   private _duration: Duration;
   // When drag slider bar, it does not need to refresh slider
   private _refreshSlider: boolean = false;
   private _timelineBuffer: number;

   public actionButtonsX: number;
   public actionButtonsY: number;

   @Input("configure-object")
   public configureObject: any;
   @Input("container-class")
   public containerClass: string;

   public timelineIndex: number = 0;
   public timelineData: VisualTimeline;
   public prevBtnEnabled: boolean;
   public nextBtnEnabled: boolean;
   public topExpanded: boolean;
   public bottomExpanded: boolean;
   public displayedTimelines: any[];
   public devidedTimelines: any[];

   private _timelines: any;
   @Input()
   public get timelines(): any {
      return this._timelines;
   }
   public set timelines(value: any) {
      if (value) {
         this._timelines = value;
         this.timelineData = value.timelineData;
         this.devidedTimelines = value.devidedTimelines;
         this.renderTimeline(this.timelineData, null);
      }
   }

   @Output()
   public headerComponentClickEmitter: EventEmitter<any> = new EventEmitter<any>();
   @Output()
   public mouseoverEmitter: EventEmitter<any> = new EventEmitter<any>();
   @Output()
   public mouseoutEmitter: EventEmitter<any> = new EventEmitter<any>();
   @Output()
   public tooltipChangeEmitter: EventEmitter<any> = new EventEmitter<any>();
   @Output()
   public eventClickEmitter: EventEmitter<any> = new EventEmitter<any>();
   @Output()
   public timelineChangedEmitter: EventEmitter<any> = new EventEmitter<any>();

   private renderTimeline(timeline: VisualTimeline, duration: Duration): void {
      this._objectTimeline = TimelineUtils.getObjectTimeline(timeline);
      if (duration) {
         this._refreshSlider = false;
         this._objectTimeline.duration = duration;
      } else {
         this._refreshSlider = true;
         this._originalDuration = this._objectTimeline.duration;
         this._timelineBuffer = (this._originalDuration.end - this._originalDuration.start) * 0.05;
         this._originalDuration.start -= this._timelineBuffer;
         this._originalDuration.end += this._timelineBuffer;
      }

      this._cmpX = VisualTimeline.TIMELINE_CHART_PADDING_LEFT + TimelineUtils.CHART_BAR_WIDTH;
      this.actionButtonsX = (this.timelineData.components.length + 1) * TimelineUtils.CHART_BAR_WIDTH +
                            VisualTimeline.V_PADDING + VisualTimeline.TIMELINE_CHART_PADDING_LEFT;
      this.actionButtonsY = VisualTimeline.V_PADDING + VisualTimeline.HEADER_HEIGHT;

      this.convertObjectTimelines();
   }

   private convertObjectTimelines(): void {
      this.displayedTimelines = [];

      if (this.devidedTimelines && this.devidedTimelines.length > 0) {
         if (this.devidedTimelines.length > 2) {
            this.getDisplayedTimelines(this.timelineIndex, this.timelineIndex + 2);
         } else {
            this.getDisplayedTimelines(this.timelineIndex, this.devidedTimelines.length);
         }
      }
   }

   private getDisplayedTimelines(startIndex: number, endIndex: number): void {
      this.displayedTimelines = this.convertDisplayedTimelines(startIndex, endIndex);
      this.checkActionsButtonStatus();

      let componentNodes: any[] = this.displayedTimelines.map(timeline => timeline.componentTimelines.length);
      let numComponentNodes: number = Math.max(...componentNodes);
      this.actionButtonsX = (numComponentNodes + 1) * TimelineUtils.CHART_BAR_WIDTH +
                            VisualTimeline.V_PADDING + VisualTimeline.TIMELINE_CHART_PADDING_LEFT;

      this.timelineChangedEmitter.emit({
         duration: this._duration,
         displayedNumber: endIndex - startIndex,
         refreshSlider: this._refreshSlider,
         numComponentNodes: numComponentNodes
      });
   }

   public renderDisplayedTimelines(range: Duration): void {
      let timelines: any[] = JSON.parse(JSON.stringify(this.displayedTimelines));
      this.displayedTimelines = [];
      timelines.forEach(timeline => {
         let originalTimelineData: VisualTimeline = JSON.parse(JSON.stringify(this.timelineData));
         let originalDuration = timeline.originalDuration;
         let rangeChanged: boolean = true;
         let startTime: number = originalDuration.start;
         let endTime: number = originalDuration.end;
         timeline.objectTimeline.stateColorFunction = this.timelineData.stateColorFunction;
         timeline.componentTimelines.forEach(cmp => {
            cmp.stateColorFunction = this.timelineData.stateColorFunction;
         });

         if (range.start > originalDuration.start) {
            startTime = range.start;
         }

         if (range.end < originalDuration.end) {
            endTime = range.end;
         }

         if (rangeChanged) {
            let preState: string;
            if (timeline.objectTimeline.events && timeline.objectTimeline.events.length > 0) {
               preState = TimelineUtils.getPreState(range,
                                                   timeline.objectTimeline.events,
                                                   true,
                                                   timeline.objectTimeline.uuid,
                                                   originalDuration);
            }
            timeline.objectTimeline.events = originalTimelineData.object.events
               .filter(e => e.time >= startTime && e.time <= endTime);
            timeline.objectTimeline.duration = new Duration(startTime, endTime);
            if (preState) {
               timeline.objectTimeline.blankState = preState;
               timeline.objectTimeline.spec.color = timeline.objectTimeline.stateColorFunction(preState);
            }

            timeline.componentTimelines.forEach(cmp => {
               preState = undefined;
               if (cmp.events && cmp.events.length > 0) {
                  preState = TimelineUtils.getPreState(range,
                                                      cmp.events,
                                                      false,
                                                      cmp.uuid,
                                                      originalDuration);
               }
               cmp.duration = new Duration(startTime, endTime);

               originalTimelineData.components.forEach(originalComponent => {
                  if (cmp.uuid === originalComponent.uuid) {
                     cmp.events = originalComponent.events.filter(e => e.time > startTime && e.time <= endTime);
                  }
               });

               if (preState) {
                  cmp.blankState = preState;
                  cmp.spec.color = cmp.stateColorFunction(preState);
               }
            });
         }
      });

      this.displayedTimelines = timelines;
   }

   private convertDisplayedTimelines(startIndex: number, endIndex: number): any[] {
      let timelines: any[] = [];
      let startTime: number;
      let endTime: number;
      let timelineData: any[] = this.devidedTimelines.slice(startIndex, endIndex);

      timelineData.forEach((timeline, index) => {
         let data: any = {};
         // Copy original data.
         let tempTimelineData: any = JSON.parse(JSON.stringify(timeline.timelineData));
         // Color function canot be copy, copy it manaully
         tempTimelineData.stateColorFunction = timeline.timelineData.stateColorFunction;
         tempTimelineData.spec.y = tempTimelineData.spec.y +
            index * (VisualTimeline.V_PADDING + VisualTimeline.HEADER_HEIGHT +
                     VisualTimeline.V_PADDING + VisualTimeline.CHART_BAR_HEIGHT);

         data.objectTimeline = TimelineUtils.getObjectTimeline(tempTimelineData);

         // add 5% time range buffer for the fist and the last timeline;
         if (startIndex === 0 && index === 0) {
            data.objectTimeline.duration.start -= this._timelineBuffer;
         } else if (endIndex === this.devidedTimelines.length - 1 && index === timelineData.length - 1) {
            data.objectTimeline.duration.end += this._timelineBuffer;
         }
         data.originalDuration = data.objectTimeline.duration;
         data.componentTimelines = TimelineUtils.getComponentTimelines(
                                       tempTimelineData, data.objectTimeline.duration);

         if (index === 0) {
            startTime = data.objectTimeline.duration.start;
            endTime = data.objectTimeline.duration.end;
         } else {
            startTime = Math.min(startTime, data.objectTimeline.duration.start);
            endTime = Math.max(endTime, data.objectTimeline.duration.end);
         }

         this.convertNodes(data.objectTimeline, timeline.configure);
         data.componentNodes = JSON.parse(JSON.stringify(this.componentNodes));
         timelines.push(data);
      });

      this._duration = new Duration(startTime, endTime);
      return timelines;
   }

   private convertNodes(objectTimeline: ComponentTimeline, configure: any): void {
      this.componentNodes = [];
      let cmpY: number = objectTimeline.spec.y - VisualTimeline.V_PADDING - VisualTimeline.HEADER_HEIGHT;
      this.componentNodes.push(this.convertObjectNode(objectTimeline, cmpY));
      this.convertComponentNode(configure.content, this._cmpX, cmpY, VisualTimeline.HEADER_HEIGHT);
   }

   private convertObjectNode(objectTimeline: ComponentTimeline, cmpY: number): any  {
      let objectNode: any = JSON.parse(JSON.stringify(objectTimeline));
      objectNode.displayName = objectNode.name + "-" + TimelineUtils.getDisplayedUuid(objectNode.uuid);
      objectNode.width = TimelineUtils.CHART_BAR_WIDTH;
      objectNode.height = VisualTimeline.HEADER_HEIGHT;
      objectNode.cmpX = VisualTimeline.TIMELINE_CHART_PADDING_LEFT;
      objectNode.cmpY = cmpY;
      // this.componentNodes.push(objectNode);
      return objectNode;
   }

   private convertComponentNode(node: any, cmpX: number, cmpY: number, cmpHeight: number): any {
      node.children = [];
      node.leafNodes = 0;
      node.isRootNode = this.isRootNode(node);
      let keys: string[] = Object.keys(node);

      if (!this.isRootNode(node)) {
         cmpHeight = cmpHeight / 2;
         cmpY = cmpY + cmpHeight;
      }
      keys.forEach((key, index) => {
         if (key.startsWith("child-")) {
            let childNode = this.convertComponentNode(node[key], cmpX, cmpY, cmpHeight);
            childNode.cmpX = cmpX;
            if (childNode.children.length === 0) {
               childNode.height = cmpHeight;
               node.leafNodes ++;
            } else {
               childNode.height = cmpHeight / 2;
               node.leafNodes += childNode.leafNodes;
            }
            childNode.cmpY = cmpY;
            childNode.width = childNode.leafNodes === 0 ? TimelineUtils.CHART_BAR_WIDTH :
                                                          childNode.leafNodes * TimelineUtils.CHART_BAR_WIDTH;
            cmpX += childNode.width;
            childNode.name = childNode.type;
            if (childNode.type.startsWith("RAID")) {
               childNode.displayName = childNode.type;
            } else {
               childNode.displayName = childNode.name + "-" +
                  TimelineUtils.getDisplayedUuid(childNode["componentUuid"]);
            }

            this.componentNodes.push(childNode);
            node.children.push(childNode);
         }
      });
      return node;
   }

   public clickComponentHandler(cmpData: any): void {
      this.headerComponentClickEmitter.emit(cmpData);
   }

   public onMouseover(emitData: any): void {
      if (TimelineUtils.isRaidNode(emitData.cmpData)) {
         return;
      }
      this.mouseoverEmitter.emit(emitData);
   }

   public onMouseout(e: any): void {
      this.mouseoutEmitter.emit(e);
   }

   public onTooltipChangeHandler(emitData: any): void {
      this.tooltipChangeEmitter.emit(emitData);
   }

   public onEventsClickHandler(emitData: any): void {
      this.eventClickEmitter.emit(emitData);
   }

   private isRootNode(node: any): boolean {
      return node.type === "Configuration";
   }

   public prevButtonClickHandler(): void {
      this.timelineIndex--;
      this._refreshSlider = true;
      this.getDisplayedTimelines(this.timelineIndex, this.timelineIndex + 2);
   }

   public nextButtonClickHandler(): void {
      this.timelineIndex++;
      this._refreshSlider = true;
      this.getDisplayedTimelines(this.timelineIndex, this.timelineIndex + 2);
   }

   public expandToTop(): void {
      let endIndex: number = this.bottomExpanded ? this.devidedTimelines.length : this.timelineIndex + 2;
      this.topExpanded = !this.topExpanded;
      this._refreshSlider = true;
      if (this.topExpanded) {
         this.getDisplayedTimelines(0, endIndex);
      } else {
         this.getDisplayedTimelines(this.timelineIndex, endIndex);
      }
   }

   public expandToBottom(): void {
      let startIndex: number = this.topExpanded ? 0 : this.timelineIndex;
      this.bottomExpanded = !this.bottomExpanded;
      this._refreshSlider = true;
      if (this.bottomExpanded) {
         this.getDisplayedTimelines(startIndex, this.devidedTimelines.length);
      } else {
         this.getDisplayedTimelines(startIndex, this.timelineIndex + 2);
      }
   }

   private checkActionsButtonStatus(): void {
      if (this.devidedTimelines.length < 3) {
         this.prevBtnEnabled = false;
         this.nextBtnEnabled = false;
      } else if (this.topExpanded || this.bottomExpanded) {
         // disable prev button and next button when expanded to top/bottom
         this.prevBtnEnabled = this.nextBtnEnabled = false;
      } else {
         this.prevBtnEnabled = this.timelineIndex === 0 ? false : true;
         this.nextBtnEnabled = this.devidedTimelines.length - this.timelineIndex > 2 ? true : false;
      }
   }
}
