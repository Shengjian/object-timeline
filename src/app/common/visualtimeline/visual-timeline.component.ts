import {
   AfterViewInit,
   ChangeDetectorRef,
   Component,
   Input,
   Output,
   EventEmitter,
   ViewChild
} from "@angular/core";
import {
   VisualTimeline,
   GraphSpec,
   TimelineEvent,
   ObjectInfoInputs
} from "./model/timeline.model";
import { TimelineUtils } from "./utils/timeline.utils";
import { RangeSliderComponent } from "./range-slider.component";
import { ComponentHeaderDialog } from "./component-header-dialog";
import * as d3 from "d3/d3.js";
import { SliderFilterComponent } from "./slider-filter.component";
import { TimelineViewComponent } from "./timeline-view.component";
import { Http } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
import * as _ from 'lodash';
// import { ObjectTimelineService } from "../../components/objectinfo/object.timeline.service";

@Component({
   selector: '[visual-timeline]',
   moduleId: module.id,
   templateUrl: 'visual-timeline.component.html',
   styleUrls: [ 'visual-timeline.component.scss' ]
})
export class VisualTimelineComponent implements AfterViewInit {

   public TimelineUtils = TimelineUtils;
   public VisualTimeline = VisualTimeline;

   private _timelineData: VisualTimeline;
   private _hostnameMappings: any[];
   private _viewInitialized: boolean = false;

   public TIMELINE_X: number = VisualTimeline.TIMELINE_CHART_PADDING_LEFT;

   // Vertical padding for each component(header, chart, legend, etc..).
   private _padding: number = VisualTimeline.V_PADDING;
   // Collected events, when hover over the event icon, it whould be shown as tooltip
   public tooltipEvents: TimelineEvent[];
   public copiedUUid: string = "";

   public svgWidth: number;
   public svgHeight: number;

   // Bar chart width
   public chartWidth: number;
   // header tree height + bar chart height
   private chartHeight: number;
   // Legend vertical position
   public legendY: number;
   // Legend horizontal position
   public legendX: number;
   public legendWidth: number;

   private _legendRowHeight: number = 25;
   private _legendPadding: number = 5;

   private _objectLegendWidth: number = 100;
   private _objectLegendRow: number = 0;
   private _objectLegendColummn: number = 0;
   public objectLegendHeight: number;

   private _componentLegendWidth: number = 100;
   private _componentLegendRow: number = 0;
   private _componentLegendColummn: number = 0;
   public componentLegendHeight: number;

   private _iconLegendWidth: number = 200;
   private _iconLegendRow: number = 0;
   private _iconLegendColummn: number = 0;
   public iconLegendHeight: number;

   private _displayedTimelineLength: number = 0;
   private _numComponents: number = 0;

   private _timelines: any;
   public devidedTimelines: any[];
   public isReady: boolean;

   private _clomIndex: number = 0;
   private _clomEvents: TimelineEvent[];

   @ViewChild(TimelineViewComponent)
   private _timelineViewComponent: TimelineViewComponent;
   @ViewChild(ComponentHeaderDialog)
   headerDialog: ComponentHeaderDialog;

   @Output()
   public clomReportIconClick: EventEmitter<void> = new EventEmitter();
   @Output()
   public isReadyEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
   @Input("container-class")
   public containerClass: string;
   @Input("configure-object")
   public configureObject: any;
   @Input("object-inputs")
   public objectInfoInputs: ObjectInfoInputs;
   @Input()
   public clomReports: any;

   @Input("visual-timeline")
   public get timelineData(): VisualTimeline {
      return this._timelineData;
   }
   public set timelineData(value: VisualTimeline) {
      this._timelineData = value;
      TimelineUtils.originalTimelineData = value;
      if (this._viewInitialized) {
         this.refresh();
      }
   }

   @Input("host-mappings")
   public get hostnameMappings(): any[] {
      return this._hostnameMappings;
   }
   public set hostnameMappings(value: any[]) {
      if (!this._viewInitialized) {
         return;
      }
      if (value) {
         this._hostnameMappings = value;
         let tempObj: VisualTimeline = JSON.parse(JSON.stringify(this._timelineData));
         tempObj.stateColorFunction = this._timelineData.stateColorFunction;
         let timelineEvents: TimelineEvent[] = tempObj.object.events;

         this._hostnameMappings.forEach(mapping => {
            for (let i = 0; i < timelineEvents.length; i++) {
               if (timelineEvents[i].traceString.indexOf(mapping.uuid) !== -1) {
                  timelineEvents.splice(i, 1);
                  i--;
               }
            }
         });
         this._timelineViewComponent.timelineData = tempObj;
      }
   }

   constructor(
      private cdRef: ChangeDetectorRef,
      private http: Http
      // private objectTimelineService: ObjectTimelineService
   ) {
   }

   public ngAfterViewInit(): void {
      this.refresh();
      this.cdRef.detectChanges();
      this._viewInitialized = true;
   }

   public refresh(): void {
      if (this._timelineData) {
         this.objectInfoInputs = {
            copyFromRemote: false,
            dataSource: 'CMMDS',
            fname: '',
            objectUuid: '1e580a5c-cfc4-e1fb-8ace-ecf4bbe981f8',
            timestamp: '',
            traceEndTime: '',
            traceStartTime: '',
            traceType: ''
         };
         if (this._timelineData.object && this._timelineData.object.events) {
            this._clomEvents = this._timelineData.object.events.filter(e => e.traceName === 'CLOMReport');

            // If there is no clom event, just show timeline events only, it needn't to devide the timeline events.
            if (!this._clomEvents || this._clomEvents.length === 0 ) {
               this._displayedTimelineLength = 1;
            }
         }

         this._timelineData.spec = this._timelineData.spec || new GraphSpec();
         // Temporary values. We should calculate them based on labels and axes
         this._timelineData.spec.x = VisualTimeline.TIMELINE_CHART_PADDING_LEFT;
         // define bar chart vertical position
         this._timelineData.spec.y = this._padding + VisualTimeline.HEADER_HEIGHT + this._padding;
         this._timelineData.spec.height = VisualTimeline.CHART_BAR_HEIGHT;

         this._numComponents = this._timelineData.components.length;
         this.refreshSVGSize();

         this._timelines = {};
         this._timelines.timelineData = this._timelineData;

         this.devidedTimelines = [];
         if (this.objectInfoInputs.dataSource === "OTM") {
            this.convertOTMObjectTimelines(this._clomEvents[0]);
         } else {
            let objectTimeline: any = {};
            objectTimeline.configure = this.configureObject;
            objectTimeline.timelineData = this._timelineData;
            this.devidedTimelines.push(objectTimeline);

            this._timelines.devidedTimelines = this.devidedTimelines;
            this._timelineViewComponent.timelines = this._timelines;
            this.isReady = true;
         }
      }
   }

   private refreshSVGSize(): void {
      this.chartWidth = (this._numComponents + 1) * TimelineUtils.CHART_BAR_WIDTH;
      this.chartHeight = this._padding + VisualTimeline.HEADER_HEIGHT +
                           this._padding + VisualTimeline.CHART_BAR_HEIGHT;

      this.legendX = VisualTimeline.TIMELINE_CHART_PADDING_LEFT + 15;
      this.legendWidth = this.chartWidth - 15;

      this._objectLegendColummn = Math.floor((this.chartWidth - this._padding) /
                                             this._objectLegendWidth);
      this._objectLegendRow = Math.ceil(TimelineUtils.OBJECT_STATUS_MAPPINGS.length /
                                       this._objectLegendColummn) + 1;
      this.objectLegendHeight = this._objectLegendRow * this._legendRowHeight;

      this._componentLegendColummn = Math.floor((this.chartWidth - this._padding) /
                                                this._componentLegendWidth);
      this._componentLegendRow = Math.ceil(TimelineUtils.COMPONENT_STATUS_MAPPINGS.length /
                                          this._componentLegendColummn) + 1;
      this.componentLegendHeight = this._componentLegendRow * this._legendRowHeight;

      this._iconLegendColummn = Math.floor((this.chartWidth - this._padding) / this._iconLegendWidth);
      this._iconLegendRow = Math.ceil(TimelineUtils.ICON_MAPPINGS.length / this._iconLegendColummn);
      this.iconLegendHeight = this._iconLegendRow * this._legendRowHeight;
      this.svgWidth = this.chartWidth + VisualTimeline.TIMELINE_CHART_PADDING_LEFT +
                        this._padding + VisualTimeline.ACTION_BUTTONS_WIDTH;
   }

   private refreshContent(): void {
      this.legendY = this.chartHeight * this._displayedTimelineLength + this._padding;
      this.svgHeight = this.chartHeight * this._displayedTimelineLength  +
                       this._padding +
                       this.objectLegendHeight +
                       this._padding +
                       this.componentLegendHeight +
                       this._padding +
                       this.iconLegendHeight +
                       this._padding;
   }

   public onTooltipChangeHandler(emitData: any): void {
      let timelineTooltip: string = this.containerClass + " .timeline-tooltip";
      let tooltip = d3.select(timelineTooltip);

      if (!emitData) {
         tooltip.transition()
            .duration(500)
            .style("opacity", 0);
         return;
      }

      tooltip.transition()
         .duration(200)
         .style("opacity", .9)
         .style("left", (emitData.mouseEvent.clientX + 10) + "px")
         .style("top", (emitData.mouseEvent.clientY) + "px");

      this.tooltipEvents = emitData.events ? emitData.events : [];
   }

   public onEventsClickHandler(emitData: any): void {
      let events: TimelineEvent[] = emitData.events;
      let component: any = emitData.component;
      let cmpData: any = {};
      cmpData.name = component.name;
      cmpData.uuid = component.uuid;
      cmpData.events = events;

      this.showDialog(cmpData);
   }

   public timelineChangedHandler(emitData: any): void {
      if (this._numComponents !== emitData.numComponentNodes) {
         this._numComponents = emitData.numComponentNodes;
         this.refreshSVGSize();
      }

      if (this._displayedTimelineLength !== emitData.displayedNumber) {
         this._displayedTimelineLength = emitData.displayedNumber;
         this.refreshContent();
      }
   }

   public clickComponentHandler(cmpData: any): void {
      this.showDialog(cmpData);
   }

   private showDialog(cmpData: any): void {
      this.headerDialog.cmpInfo = cmpData;
      this.headerDialog.showDialog = true;
   }

   // get copied uuid and show copy button
   public onMouseover(emitData: any): void {
      if (emitData.cmpData.forObject) {
         this.copiedUUid = emitData.cmpData.uuid;
      } else {
         this.copiedUUid = emitData.cmpData.componentUuid;
      }

      let copyButton: string = this.containerClass + " .copy-uuid";
      d3.select(copyButton)
         .transition()
         .duration(200)
         .style("display", "block")
         .style("left", (emitData.event.clientX + 10) + "px")
         .style("top", (emitData.event.clientY) + "px");
   }

   // hide the copy button when move out of the text, but when the pointer moved to the copy button,
   // do not hide the copy button, do nothing.
   public onMouseout(event: any): void {
      if (event.relatedTarget && event.relatedTarget.localName === "button") {
         return;
      }
      this.hideCopyButton();
   }

   // do copy action
   public copyToClipboard(): void {
      console.log("copy successfully!");
      this.hideCopyButton();
   }

   // hide the copy button
   private hideCopyButton(): void {
      let copyButton: string = this.containerClass + " .copy-uuid";
      d3.select(copyButton)
         .transition()
         .duration(500)
         .style("display", "none");
   }

   // hide the copy button when mouse out of the copy button, but when the pointer moved to the
   // text, do nothing.
   public mouseoutCopyButton(event: any): void {
      if (event.relatedTarget.localName === "svg" &&
         (event.relatedTarget.id === "timeline-header")) {
         this.hideCopyButton();
      }
   }

   public getLegendX(index: number, type: string): number {
      let xPosition: number = this.legendX + this._legendPadding;
      if (type === 'object') {
         return xPosition + index % this._objectLegendColummn * this._objectLegendWidth;
      } else if (type === 'component') {
         return xPosition + index % this._componentLegendColummn * this._componentLegendWidth;
      } else if (type === 'icon') {
         return xPosition + index % this._iconLegendColummn * this._iconLegendWidth;
      }
      return -999;
   }

   public getObjectLegendY(index: number): number {
      return this.legendY + (Math.floor(index / this._objectLegendColummn) + 1) * this._legendRowHeight;
   }

   public getComponentLegendY(index: number): number {
      return this.legendY + this.objectLegendHeight + 10 +
             (Math.floor(index / this._componentLegendColummn) + 1) * this._legendRowHeight;
   }

   public getIconLegendY(index: number): number {
      return this.legendY + this.componentLegendHeight + this.objectLegendHeight + 20 +
             Math.floor(index / this._iconLegendColummn) * this._legendRowHeight;
   }

   public clomReportIconClickHandler(): void {
      this.headerDialog.showDialog = false;
      this.clomReportIconClick.emit();
   }

   private convertOTMObjectTimelines(clomEvent: TimelineEvent): void {
      let dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
      let timeBuffer: number;
      if (this._clomIndex !== this._clomEvents.length - 1) {
         timeBuffer = Math.min(5000, (this._clomEvents[this._clomIndex + 1].time - clomEvent.time) / 2);
      } else {
         timeBuffer = 5000;
      }
      let timestamp: string = dateFormat(new Date(clomEvent.time + timeBuffer));
      timestamp += "." + clomEvent.timeString.split(".")[1];
      console.log(timestamp);

      this.isReady = false;
      // this.objectTimelineService.getObjectInfo(timestamp,
      //                                           this.objectInfoInputs.objectUuid,
      //                                           this.objectInfoInputs.dataSource)
      let url = "assets/mockdata-config-" + this._clomIndex + ".json";
      this.http.get(url)
         .map(res => res.json())
         .subscribe(resultData => {
            console.log(resultData);
            let configure: any = resultData["object"];
            let uuids: string[] = resultData["summary"]["uuids"];
            this.getVsanReport(configure, uuids, (new Date(timestamp)).getTime());
         });
   }

   private getVsanReport(configure: any, uuids: string[], timestamp: number): void {
      // this.objectTimelineService.getVsanReportForUuids(uuids,
      //                                                  this.objectInfoInputs.traceType,
      //                                                  this.objectInfoInputs.traceStartTime,
      //                                                  this.objectInfoInputs.traceEndTime,
      //                                                  this.objectInfoInputs.copyFromRemote)
      let url = "assets/mockdata-vsanReport-0.json";
      this.http.get(url)
         .map(res => res.json())
         .subscribe(data => {
            let report: any = {};
            uuids.forEach(uuid => {
               report[uuid] = data[uuid];
            });
            let timeline: any = {};
            timeline.timestamp = timestamp;
            timeline.configure = configure;
            timeline.timelineData = TimelineUtils.buildObjectTimelineData(configure,
                                                                           report,
                                                                           this.clomReports);

            timeline.timelineData.spec = new GraphSpec();
            // Temporary values. We should calculate them based on labels and axes
            timeline.timelineData.spec.x = VisualTimeline.TIMELINE_CHART_PADDING_LEFT;
            // define bar chart vertical position
            timeline.timelineData.spec.y = VisualTimeline.V_PADDING +
                                           VisualTimeline.HEADER_HEIGHT +
                                           VisualTimeline.V_PADDING;
            timeline.timelineData.spec.height = VisualTimeline.CHART_BAR_HEIGHT;

            if (this._clomIndex === 0) {
               timeline.timelineData.object.events = timeline.timelineData.object.events.
                                                            filter(e => e.time <= timestamp);
               timeline.timelineData.components.forEach(cmp => {
                  cmp.events = cmp.events.filter(e => e.time <= timestamp);
               });
            } else {
               let prevTimeline: any = this.devidedTimelines[this._clomIndex - 1];
               timeline.timelineData.object.events = timeline.timelineData.object.events.
                  filter(e => e.time > prevTimeline.timestamp && e.time <= timestamp);

               timeline.timelineData.components.forEach(cmp => {
                  cmp.events = cmp.events.filter(e => e.time > prevTimeline.timestamp && e.time <= timestamp);
               });
            }
            this.devidedTimelines.push(timeline);

            this._clomIndex ++;
            if (this._clomIndex < this._clomEvents.length) {
               this.convertOTMObjectTimelines(this._clomEvents[this._clomIndex]);
            } else {
               this._timelines.devidedTimelines = this.devidedTimelines;
               this._timelineViewComponent.timelines = this._timelines;
               this.isReady = true;
            }
         });
   }
}
