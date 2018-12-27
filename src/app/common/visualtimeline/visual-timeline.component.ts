import { AfterViewInit,
   ChangeDetectorRef,
   Component,
   ElementRef,
   Input,
   ViewChild
} from '@angular/core';
import {
   ComponentTimeline,
   VisualTimeline,
   GraphSpec,
   TimelineEvent,
   Duration,
   RangeSlider
} from './model/timeline.model';
import { TimelineUtils } from './utils/timeline.utils';
import { RangeSliderComponent } from './range-slider.component';
import { ComponentHeaderDialogComponent } from './component-header-dialog';
import * as d3 from 'd3/d3.js';

@Component({
   selector: '[visual-timeline]',
   moduleId: module.id,
   templateUrl: 'visual-timeline.component.html',
   styleUrls: [ 'visual-timeline.component.css' ]
})
export class VisualTimelineComponent implements AfterViewInit {

   public TimelineUtils = TimelineUtils;

   private _timelineData: VisualTimeline;
   private _objectTimeline: ComponentTimeline;
   private _componentTimelines: ComponentTimeline[] = [];
   private _separatorLineX: number;
   public _viewInitialized: boolean = false;

   public TIMELINE_X: number = 220;
   private TIMELINE_Y: number = 120;

   private _cmpX: number;
   private _isHeaderRendered: boolean = false;

   public componentNodes: any[] = [];
   public headerHeight: number = 100;
   public headerY: number = 10;

   public tooltipEvents: TimelineEvent[];
   public copiedUUid: string = '';

   public svgWidth: number;
   public svgHeight: number;
   public chartWidth: number;
   public chartHeight: number = 400;

   public legendRowHeight: number = 25;
   public legendPadding: number = 5;

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

   private _originalStartTime: number;
   private _originalEndTime: number;
   public startTime: string;
   public endTime: string;

   @ViewChild(RangeSliderComponent)
   private _slider: RangeSliderComponent;
   @ViewChild(ComponentHeaderDialogComponent)
   headerDialog: ComponentHeaderDialogComponent;

   @Input('container-class')
   public containerClass: string;

   @Input('configure-object')
   public configureObject: any;

   @Input('visual-timeline')
   public get timelineData(): VisualTimeline {
      return this._timelineData;
   }
   public set timelineData(value: VisualTimeline) {
      this._timelineData = value;
      if (this._viewInitialized) {
         this.refresh();
      }
   }

   public get objectTimeline(): ComponentTimeline {
      return this._objectTimeline;
   }

   public get componentTimelines(): ComponentTimeline[] {
      return this._componentTimelines;
   }

   public get separatorLineX(): number {
      return this._separatorLineX;
   }

   constructor(private el: ElementRef,
               private cdRef: ChangeDetectorRef) { }

   public ngAfterViewInit(): void {
      this.refresh();
      this.cdRef.detectChanges();
      this._viewInitialized = true;
   }

   public refresh(): void {
      if (this._timelineData) {
         this._timelineData.spec = this._timelineData.spec || new GraphSpec();
         this.chartWidth = (this._timelineData.components.length + 1) * TimelineUtils.CHART_BAR_WIDTH;

         this._objectLegendColummn = Math.floor((this.chartWidth - this.legendPadding * 2) / this._objectLegendWidth);
         this._objectLegendRow = Math.ceil(TimelineUtils.OBJECT_STATUS_MAPPINGS.length / this._objectLegendColummn) + 1;
         this.objectLegendHeight = this._objectLegendRow * this.legendRowHeight;

         this._componentLegendColummn = Math.floor((this.chartWidth - this.legendPadding * 2) / this._componentLegendWidth);
         this._componentLegendRow = Math.ceil(TimelineUtils.COMPONENT_STATUS_MAPPINGS.length / this._componentLegendColummn) + 1;
         this.componentLegendHeight = this._componentLegendRow * this.legendRowHeight;

         this._iconLegendColummn = Math.floor((this.chartWidth - this.legendPadding * 2) / this._iconLegendWidth);
         this._iconLegendRow = Math.ceil(TimelineUtils.ICON_MAPPINGS.length / this._iconLegendColummn);
         this.iconLegendHeight = this._iconLegendRow * this.legendRowHeight;

         this.svgWidth = this.chartWidth + this.TIMELINE_X;
         this.svgHeight = this.chartHeight + this.objectLegendHeight + 
                          this.componentLegendHeight + this.iconLegendHeight + 20;

         // Temporary values. We should calculate them based on labels and axes
         this._timelineData.spec.x = this.TIMELINE_X;
         this._timelineData.spec.y = this.TIMELINE_Y;
         this._timelineData.spec.height = this.chartHeight - this.TIMELINE_Y - 10;
      }
      this.renderTimeline(this._timelineData);
      this.renderSlider();
   }

   private renderTimeline(timeline: VisualTimeline): void {
      this._objectTimeline = this.TimelineUtils.getObjectTimeline(timeline);
      this._componentTimelines = this.TimelineUtils.getComponentTimelines(timeline, this._objectTimeline.duration);
      this._separatorLineX = this._objectTimeline.spec.x + this._objectTimeline.spec.width - 1;
      // this.ractWidth = this._objectTimeline.spec.width;

      this.renderTimelineAxis();
      if (!this._isHeaderRendered && this.configureObject && this.configureObject.content) {
         this._isHeaderRendered = true;
         this._cmpX = this.TIMELINE_X + TimelineUtils.CHART_BAR_WIDTH;
         this.componentNodes = [];
         this.convertNode(this.configureObject.content, this._cmpX, this.headerY, this.headerHeight);
      }
   }

   private renderTimelineAxis(): void {
      if (!(this.objectTimeline &&
            this.objectTimeline.events &&
            this.objectTimeline.events.length > 0)) {
         return;
      }
      let eventData: TimelineEvent[] = this.objectTimeline.events;
      let timelineY: number = this.objectTimeline.spec.y;

      let format = d3.time.format('%Y-%m-%d %H:%M:%S');
      let minTimeData: Date = new Date(d3.min(eventData, function(d) {
         return d.time;
      }));
      this.startTime = format(minTimeData);

      let maxTimeData: Date = new Date(d3.max(eventData, function(d) {
         return d.time;
      }));
      this.endTime = format(maxTimeData);

      let duration: number = maxTimeData.getTime() - minTimeData.getTime();

      let ylinearScale = d3.time.scale()
                           .domain([maxTimeData, minTimeData])
                           .range([this.objectTimeline.spec.height, 0]);

      let yAxis = d3.svg.axis()
         .scale(ylinearScale)
         .orient('left')
         .tickValues([
            minTimeData,
            new Date(minTimeData.getTime() + 1 * duration / 4),
            new Date(minTimeData.getTime() + 2 * duration / 4),
            new Date(minTimeData.getTime() + 3 * duration / 4),
            maxTimeData
         ])
         .tickFormat(function(d) {
            return format(d);
         });

      let timelineAxis: string = this.containerClass + ' .timelineAxis';
      d3.select(timelineAxis)
         .attr('font-size', 12)
         .attr('font-family', 'sans-serif')
         .attr('transform', 'translate(' + this.TIMELINE_X + ', ' + timelineY + ')')
         .call(yAxis)
         .select('path')
         .attr('fill', 'none')
         .attr('stroke', '#000')
         .attr('shape-rendering', 'crispEdges');

      d3.select(timelineAxis)
         .selectAll('.tick line')
         .attr('fill', 'none')
         .attr('stroke', '#000')
         .attr('shape-rendering', 'crispEdges');
   }

   private renderSlider(): void {
      if (!(this._timelineData && this._timelineData.object.events)) {
         return;
      }
      let events = this._timelineData.object.events;
      let minTimeData: Date = new Date(d3.min(events, function(d) {
         return d.time;
      }));
      let maxTimeData: Date = new Date(d3.max(events, function(d) {
         return d.time;
      }));
      let format = d3.time.format('%Y-%m-%d %H:%M:%S');
      let slideData: RangeSlider = new RangeSlider();
      let spec: GraphSpec = new GraphSpec();
      spec.width = 20;
      spec.height = this._timelineData.spec.height;
      spec.x = 20;
      spec.y = this._timelineData.spec.y;

      slideData.spec = spec;
      slideData.range = new Duration((new Date(format(minTimeData))).getTime(),
                                     (new Date(format(maxTimeData))).getTime());
      this._slider.containerClass = this.containerClass;
      this._slider.rangeSlider = slideData;
   }

   public onTooltipChangeHandler(emitData: any): void {
      let timelineTooltip: string = this.containerClass + ' .timeline-tooltip';
      let tooltip = d3.select(timelineTooltip);

      if (!emitData) {
         tooltip.transition()
            .duration(500)
            .style('opacity', 0);
         return;
      }

      tooltip.transition()
         .duration(200)
         .style('opacity', .9)
         .style('left', (emitData.mouseEvent.clientX + 10) + 'px')
         .style('top', (emitData.mouseEvent.clientY) + 'px');

      this.tooltipEvents = emitData.events ? emitData.events : [];
   }

   public onEventsClickHandler(events: TimelineEvent[], component: any): void {
      let cmpData: any = {};
      cmpData.name = component.name;
      cmpData.uuid = component.uuid;
      cmpData.events = events;

      this.showDialog(cmpData);
   }

   public onRangeChanged(range: Duration): void {
      let timeline: VisualTimeline = JSON.parse(JSON.stringify(this.timelineData));
      timeline.stateColorFunction = this.timelineData.stateColorFunction;

      timeline.object.events = timeline.object.events.filter(
         event => !(event.time < range.start || event.time > range.end)
      );
      timeline.components.forEach(cmpTimeline => {
         cmpTimeline.events = cmpTimeline.events.filter(
            cmpEvent => !(cmpEvent.time < range.start || cmpEvent.time > range.end));
      });

      this.renderTimeline(timeline);
   }

   public filterButtonClicked(range: Duration): void {
      this._slider.resetSliderBar(range);

      let rangeTemp: Duration = new Duration(range.start, range.end + 1000);
      this.onRangeChanged(rangeTemp);
   }

   private convertNode(node: any, cmpX: number, cmpY: number, cmpHeight: number): any {
      node.children = [];
      node.leafNodes = 0;
      node.isRootNode = this.isRootNode(node);
      let keys: string[] = Object.keys(node);

      if (!this.isRootNode(node)) {
         cmpHeight = cmpHeight / 2;
         cmpY = cmpY + cmpHeight;
      }
      keys.forEach((key, index) => {
         if (key.startsWith('child-')) {
            let childNode = this.convertNode(node[key], cmpX, cmpY, cmpHeight);
            childNode.cmpX = cmpX;
            if (childNode.children.length === 0) {
               childNode.height = cmpHeight;
               this._cmpX += TimelineUtils.CHART_BAR_WIDTH;
               node.leafNodes ++;
            } else {
               childNode.height = cmpHeight / 2;
               node.leafNodes += childNode.leafNodes;
            }
            childNode.cmpY = cmpY;
            childNode.width = childNode.leafNodes === 0 ? TimelineUtils.CHART_BAR_WIDTH :
                                                          childNode.leafNodes * TimelineUtils.CHART_BAR_WIDTH;
            cmpX += childNode.width;
            this.componentNodes.push(childNode);
            node.children.push(childNode);
         }
      });
      return node;
   }

   private isRootNode(node: any): boolean {
      return node.type === 'Configuration';
   }

   private isRaidNode(node: any): boolean {
      return node.type && node.type.startsWith('RAID_');
   }

   public clickComponentHandler(cmpData: any): void {
      if (this.isRaidNode(cmpData)) {
         return;
      }
      let cmpInfo: any;
      if (cmpData.forObject) {
         cmpInfo = cmpData;
      } else {
         cmpInfo =  this._componentTimelines.find(
            cmpTimeline => cmpTimeline.uuid === cmpData.componentUuid
         );
      }
      this.showDialog(cmpInfo);
   }

   private showDialog(cmpData: any): void {
      this.headerDialog.cmpInfo = cmpData;
      this.headerDialog.showDialog = true;
   }

   // get copied uuid and show copy button
   public onMouseover(e: any, cmpData: any): void {
      if (this.isRaidNode(cmpData)) {
         return;
      }
      if (cmpData.forObject) {
         this.copiedUUid = cmpData.uuid;
      } else {
         this.copiedUUid = cmpData.componentUuid;
      }

      let copyButton: string = this.containerClass + ' .copy-uuid';
      d3.select(copyButton)
         .transition()
         .duration(200)
         .style('display', 'block')
         .style('left', (e.clientX + 10) + 'px')
         .style('top', (e.clientY) + 'px');
   }

   // hide the copy button when move out of the text, but when the pointer moved to the copy button,
   // do not hide the copy button, do nothing.
   public onMouseout(event: any): void {
      if (event.relatedTarget && event.relatedTarget.localName === 'button') {
         return;
      }
      this.hideCopyButton();
   }

   // do copy action
   public copyToClipboard(): void {
      console.log('copy successfully!');
      this.hideCopyButton();
   }

   // hide the copy button
   private hideCopyButton(): void {
      let copyButton: string = this.containerClass + ' .copy-uuid';
      d3.select(copyButton)
         .transition()
         .duration(500)
         .style('display', 'none');
   }

   // hide the copy button when mouse out of the copy button, but when the pointer moved to the
   // text, do nothing.
   public mouseoutCopyButton(event: any): void {
      if (event.relatedTarget.localName === 'svg' &&
         (event.relatedTarget.id === 'timeline-header')) {
         this.hideCopyButton();
      }
   }

   public getObjectLegendX(index: number): number {
      return this.TIMELINE_X + 15 + this.legendPadding + index % this._objectLegendColummn * this._objectLegendWidth;
   }

   public getObjectLegendY(index: number): number {
      return this.chartHeight + (Math.floor(index / this._objectLegendColummn) + 1) * this.legendRowHeight;
   }

   public getComponentLegendX(index: number): number {
      return this.TIMELINE_X + 15 + this.legendPadding + index % this._componentLegendColummn * this._componentLegendWidth;
   }

   public getComponentLegendY(index: number): number {
      return this.chartHeight + this.objectLegendHeight + 10 +
             (Math.floor(index / this._componentLegendColummn) + 1) * this.legendRowHeight;
   }

   public getIconLegendX(index: number): number {
      return this.TIMELINE_X + 15 + this.legendPadding + index % this._iconLegendColummn * this._iconLegendWidth;
   }

   public getIconLegendY(index: number): number {
      return this.chartHeight + this.componentLegendHeight + this.objectLegendHeight + 20 +
             Math.floor(index / this._iconLegendColummn) * this.legendRowHeight;
   }

   public getHeaderComponentClass(component: any): string {
      if (this.isRaidNode(component)) {
         return 'no-cursor';
      }
      return '';
   }
}
