import { Component, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";
import { TimelineUtils } from "./utils/timeline.utils";
import {
   ComponentTimeline,
   Duration,
   GraphSpec,
   StateTimeline,
   TimelineEvent
} from "./model/timeline.model";
import * as d3 from "d3/d3.js";

@Component({
   selector: '[timeline-bar-chart]',
   moduleId: module.id,
   templateUrl: 'timeline-bar-chart.component.html',
   styleUrls: [ 'timeline-bar-chart.component.scss' ]
})

export class TimelineBarChartComponent implements AfterViewInit {
   @Input("component-nodes")
   public componentNodes: any[];

   @Input("container-class")
   public containerClass: string;

   private _objectTimeline: ComponentTimeline;

   @Input("object-timeline")
   public get objectTimeline(): ComponentTimeline {
      return this._objectTimeline;
   }

   public set objectTimeline(value: ComponentTimeline) {
      this._objectTimeline = value;
      if (this._objectTimeline) {
         this._separatorLineX = this._objectTimeline.spec.x + this._objectTimeline.spec.width - 1;
      }
   }

   @Input("component-timelines")
   public componentTimelines: ComponentTimeline[];

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

   private _separatorLineX: number;

   public get separatorLineX(): number {
      return this._separatorLineX;
   }

   public ngAfterViewInit(): void {
      this.renderTimelineAxis(this._objectTimeline.duration);
   }

   private renderTimelineAxis(range: Duration): void {
      if (!this.objectTimeline) {
         return;
      }

      let startTime: number = range.start;
      let endTime: number = range.end;
      if (startTime === endTime) {
         startTime = startTime + 5000;
      }

      let timelineX: number = this.objectTimeline.spec.x;
      let timelineY: number = this.objectTimeline.spec.y;
      let format = d3.time.format('%Y-%m-%d %H:%M:%S');

      let minTimeData: Date = new Date(startTime);
      let maxTimeData: Date = new Date(endTime);

      let duration: number = endTime - startTime;

      let ylinearScale = d3.time.scale()
                           .domain([maxTimeData, minTimeData])
                           .range([this.objectTimeline.spec.height, 0]);

      let yAxis = d3.svg.axis()
         .scale(ylinearScale)
         .orient("left")
         .tickValues([
            minTimeData,
            new Date(minTimeData.getTime() + 1 * duration / 4),
            new Date(minTimeData.getTime() + 2 * duration / 4),
            new Date(minTimeData.getTime() + 3 * duration / 4),
            maxTimeData
         ])
         .tickFormat(function(d) {
            if (startTime >= endTime) {
               return format(new Date(endTime));
            }
            return format(d);
         });

      let timelineAxis: string = this.containerClass + " .timelineAxis";
      d3.select(timelineAxis)
         .attr("font-size", 12)
         .attr("font-family", "sans-serif")
         .attr("transform", "translate(" + timelineX + ", " + timelineY + ")")
         .call(yAxis)
         .select("path")
         .attr("fill", "none")
         .attr("stroke", "#000")
         .attr("shape-rendering", "crispEdges");

      d3.select(timelineAxis)
         .selectAll(".tick line")
         .attr("fill", "none")
         .attr("stroke", "#000")
         .attr("shape-rendering", "crispEdges");
   }

   public getHeaderComponentClass(component: any): string {
      if (this.isRaidNode(component)) {
         return "no-cursor";
      }
      return "";
   }

   public clickComponentHandler(cmpData: any): void {
      if (TimelineUtils.isRaidNode(cmpData)) {
            return;
      }
      let cmpInfo: any;
      if (cmpData.forObject) {
      cmpInfo = cmpData;
      } else {
      cmpInfo =  this.componentTimelines.find(
            cmpTimeline => cmpTimeline.uuid === cmpData.componentUuid
      );
      }
      this.headerComponentClickEmitter.emit(cmpInfo);
   }

   public onMouseover(e: any, cmpData: any): void {
      this.mouseoverEmitter.emit({ event: e, cmpData: cmpData });
   }

   public onMouseout(e: any): void {
      this.mouseoutEmitter.emit(e);
   }

   public onTooltipChangeHandler(emitData: any): void {
      this.tooltipChangeEmitter.emit(emitData);
   }

   public onEventsClickHandler(events: TimelineEvent[], component: any): void {
      this.eventClickEmitter.emit({ events: events, component: component });
   }

   private isRaidNode(node: any): boolean {
      return node.type && node.type.startsWith("RAID_");
   }
}
