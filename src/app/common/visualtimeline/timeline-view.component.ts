import { Component, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef, ViewChild } from "@angular/core";
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
import { Stepper } from "../stepper.component";

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
   private _timelineBuffer: number;

   public actionButtonsX: number;

   @ViewChild(Stepper)
   private _stepper: Stepper;

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
         this._objectTimeline.duration = duration;
      } else {
         this._originalDuration = this._objectTimeline.duration;
         this._timelineBuffer = (this._originalDuration.end - this._originalDuration.start) * 0.05;
         this._originalDuration.start -= this._timelineBuffer;
         this._originalDuration.end += this._timelineBuffer;
      }

      this._cmpX = VisualTimeline.TIMELINE_CHART_PADDING_LEFT + TimelineUtils.CHART_BAR_WIDTH;
      this.actionButtonsX = (this.timelineData.components.length + 1) * TimelineUtils.CHART_BAR_WIDTH +
                            VisualTimeline.V_PADDING + VisualTimeline.TIMELINE_CHART_PADDING_LEFT;

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

      let componentNodes: any[] = this.displayedTimelines.map(timeline => timeline.componentTimelines.length);
      let numComponentNodes: number = Math.max(...componentNodes);
      this.actionButtonsX = (componentNodes[0] + 1) * TimelineUtils.CHART_BAR_WIDTH +
                            VisualTimeline.V_PADDING + VisualTimeline.TIMELINE_CHART_PADDING_LEFT;

      this.timelineChangedEmitter.emit({
         duration: this._duration,
         displayedNumber: endIndex - startIndex,
         numComponentNodes: numComponentNodes
      });
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
         if (timelineData.length === 1) { // This is the case for CMMDS timeline
            data.objectTimeline.duration.start -= this._timelineBuffer;
            data.objectTimeline.duration.end += this._timelineBuffer;
         } else {
            if (startIndex === 0 && index === 0) { // It's for OTM timeline
               data.objectTimeline.duration.start -= this._timelineBuffer;
               data.objectTimeline.duration.end = timeline.timestamp;
            } else {
               let preTimestamp: number = this.devidedTimelines[startIndex + index - 1].timestamp;
               data.objectTimeline.duration.start = preTimestamp;

               if (endIndex === this.devidedTimelines.length - 1 && index === timelineData.length - 1) {
                  data.objectTimeline.duration.end += this._timelineBuffer;
               } else {
                  data.objectTimeline.duration.end = timeline.timestamp;
               }
            }
         }
         data.componentTimelines = TimelineUtils.getComponentTimelines(tempTimelineData, data.objectTimeline.duration);

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
   public onStepperChanged(emitData: any): void {
      this.getDisplayedTimelines(0, emitData);
   }

   public onChanged(e: any): void {
      this._stepper.value = e.target.checked ? this.devidedTimelines.length : 2;
   }
}
