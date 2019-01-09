import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { TimelineUtils } from "./utils/timeline.utils";
import {
   ComponentTimeline,
   Duration,
   GraphSpec,
   StateTimeline,
   TimelineEvent,
   RangeSlider,
   VisualTimeline
} from "./model/timeline.model";
import * as d3 from "d3/d3.js";
import { RangeSliderComponent } from "./range-slider.component";
import { SliderFilterComponent } from "./slider-filter.component";

@Component({
   selector: '[timeline-bar-chart]',
   moduleId: module.id,
   templateUrl: 'timeline-bar-chart.component.html',
   styleUrls: [ 'timeline-bar-chart.component.scss' ]
})

export class TimelineBarChartComponent implements AfterViewInit {

   @ViewChild(RangeSliderComponent)
   private _slider: RangeSliderComponent;
   @ViewChild(SliderFilterComponent)
   private _sliderFilter: SliderFilterComponent;

   @Input("component-nodes")
   public componentNodes: any[];

   @Input("container-class")
   public containerClass: string;

   private _viewInitialized: boolean = false;
   private _dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');

   private _originalObjectTimeline: ComponentTimeline;
   private _originalComponentTimlines: ComponentTimeline[];
   private _objectTimeline: ComponentTimeline;
   private _componentTimelines: ComponentTimeline[];

   @Input("object-timeline")
   public get objectTimeline(): ComponentTimeline {
      return this._objectTimeline;
   }

   public set objectTimeline(value: ComponentTimeline) {
      if (!value) {
         return;
      }
      this._objectTimeline = value;
      this._separatorLineX = this._objectTimeline.spec.x + this._objectTimeline.spec.width - 1;

      if (!this._originalObjectTimeline) {
         this._originalObjectTimeline = value;
      }
      if (this._viewInitialized) {
         this.renderTimelineAxis(this._objectTimeline.duration);
      }
   }

   @Input("component-timelines")
   public get componentTimelines(): ComponentTimeline[] {
      return this._componentTimelines;
   }
   public set componentTimelines(value: ComponentTimeline[]) {
      if (!value) {
         return;
      }
      this._componentTimelines = value;
      if (!this._originalComponentTimlines) {
         this._originalComponentTimlines = value;
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

   private _separatorLineX: number;

   public get separatorLineX(): number {
      return this._separatorLineX;
   }

   constructor( private cdRef: ChangeDetectorRef ) { }

   public ngAfterViewInit(): void {
      this.renderTimelineAxis(this._objectTimeline.duration);
      this.renderSliderFilter(this._objectTimeline.duration);
      this.renderSlider(this._objectTimeline.duration);
      this.cdRef.detectChanges();
      this._viewInitialized = true;
   }

   private renderTimelineAxis(range: Duration): void {
      let startTime: number = range.start;
      let endTime: number = range.end;
      if (startTime === endTime) {
         startTime = startTime + 5000;
      }

      let timelineX: number = this.objectTimeline.spec.x;
      let timelineY: number = this.objectTimeline.spec.y;
      let format = this._dateFormat;

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

   private renderSlider(duration: Duration): void {
      let slideData: RangeSlider = new RangeSlider();
      let spec: GraphSpec = new GraphSpec();
      spec.width = 20;
      spec.height = VisualTimeline.CHART_BAR_HEIGHT;
      spec.x = 20;
      spec.y = this.objectTimeline.spec.y;

      slideData.spec = spec;
      slideData.range = new Duration((new Date(this._dateFormat(new Date(duration.start)))).getTime(),
                                     (new Date(this._dateFormat(new Date(duration.end)))).getTime());
      this._slider.rangeSlider = slideData;
   }

   private renderSliderFilter(duration: Duration) {
      let spec: GraphSpec = new GraphSpec();
      spec.width = VisualTimeline.TIMELINE_CHART_PADDING_LEFT;
      spec.height = VisualTimeline.HEADER_HEIGHT;
      spec.x = 0;
      spec.y = this.objectTimeline.spec.y - VisualTimeline.HEADER_HEIGHT;

      this._sliderFilter.rangeFilterSpec = spec;
      this.refreshSliderFilter(duration);
   }

   public onRangeChanged(range: Duration): void {
      this._sliderFilter.displayedStartTime = this._dateFormat(new Date(range.start));
      this._sliderFilter.displayedEndTime = this._dateFormat(new Date(range.end));

      let objectTimeline: ComponentTimeline = JSON.parse(JSON.stringify(this._originalObjectTimeline));
      let componentTimelines: ComponentTimeline[] = JSON.parse(JSON.stringify(this._originalComponentTimlines));
      let originalDuration: Duration = objectTimeline.duration;
      let startTime: number = originalDuration.start;
      let endTime: number = originalDuration.end;

      if (range.start > startTime) {
         startTime = range.start;
      }

      if (range.end < endTime) {
         endTime = range.end;
      }

      let preState: string;
      if (objectTimeline.events && objectTimeline.events.length > 0) {
         preState = TimelineUtils.getPreState(range,
                                             objectTimeline.events,
                                             true,
                                             objectTimeline.uuid,
                                             originalDuration);
      }
      objectTimeline.events = objectTimeline.events.filter(e => e.time >= startTime && e.time <= endTime);
      objectTimeline.duration = new Duration(startTime, endTime);
      objectTimeline.stateColorFunction = this.objectTimeline.stateColorFunction;

      if (preState) {
         objectTimeline.blankState = preState;
         objectTimeline.spec.color = objectTimeline.stateColorFunction(preState);
      }

      componentTimelines.forEach(cmp => {
         cmp.stateColorFunction = this.objectTimeline.stateColorFunction;
         preState = undefined;
         if (cmp.events && cmp.events.length > 0) {
            preState = TimelineUtils.getPreState(range,
                                                cmp.events,
                                                false,
                                                cmp.uuid,
                                                originalDuration);
         }
         cmp.duration = new Duration(startTime, endTime);
         cmp.events = cmp.events.filter(e => e.time > startTime && e.time <= endTime);

         if (preState) {
            cmp.blankState = preState;
            cmp.spec.color = cmp.stateColorFunction(preState);
         }
      });

      this.objectTimeline = objectTimeline;
      this.componentTimelines = componentTimelines;
   }

   private refreshSliderFilter(duration: Duration): void {
      this._sliderFilter.startTime = this._dateFormat(new Date(duration.start));
      this._sliderFilter.endTime = this._dateFormat(new Date(duration.end));
   }

   public filterButtonClicked(range: Duration): void {
      this._slider.resetSliderBar(range);
      this.onRangeChanged(range);
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
