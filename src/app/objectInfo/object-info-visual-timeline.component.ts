import { Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import {
   TimelineEvent,
   VisualTimeline,
   ComponentEntity,
   GraphSpec
} from '../common/visualtimeline/model/timeline.model';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
import { VisualTimelineComponent } from '../common/visualtimeline/visual-timeline.component';
import { TimelineUtils } from '../common/visualtimeline/utils/timeline.utils';
import { Observable } from 'rxjs/Observable';
// import 'rxjs/Rx';
import * as _ from 'lodash';

@Component({
   selector: 'obj-info-visual-timeline',
   moduleId: module.id,
   templateUrl: 'object-info-visual-timeline.component.html',
   styleUrls: ['object-info-visual-timeline.component.css']
})
export class ObjectInfoVisualTimelineComponent implements OnDestroy, OnInit {
   public objectNames: string[] = ['Test'];
   public objectList: VisualTimeline[] = [];
   public configList: any;
   
   configList$: Observable<any>;
   vsanReport$: Observable<any>;
   courses$: Observable<any>;

   private report: any = null;
   private unsubscribeSub: Subject<void> = new Subject<void>();
   private COLOR_MAPPINGS: Map<string, string> = new Map<string, string>();

   @ViewChild('timelineContainer')
   private timelineContainer: VisualTimelineComponent;
   @ViewChild('treetblEl') treetblEl: ElementRef;

   ngOnInit(): void {
      this.courses$ = this.http
            .get('https://angular-http-guide.firebaseio.com/courses.json')
            .map(data => _.values(data));

      this.configList$ = this.http
            .get('assets/mockdata-config.json')
            .map(res => res.json());

      this.vsanReport$ = this.http
            .get('assets/mockdata-vsanReport.json')
            .map(res => res.json());

      this.configList$.takeUntil(this.unsubscribeSub)
                      .combineLatest(
                         this.vsanReport$,
                         (configList, report) => {
                           return {
                              'report': report,
                              'configList': configList
                           };
                        }
                      )
                      .subscribe(result => {
                        this.report = result['report'].result;
                        this.configList = [result['configList'].result.object];
                        this.objectList = [];
            
                        if (this.report.length === 0 ||
                            this.configList.length === 0 ||
                            Object.getOwnPropertyNames(this.report).length === 0) {
                           return;
                        }
            
                        this.configList.forEach((obj) => {
                           this.objectList.push(this.buildObjectTimelineData(obj));
                        });
                     });
   }

   constructor(private http: Http) { }

   private buildObjectTimelineData(obj: any): VisualTimeline {
      let timeline: VisualTimeline = new VisualTimeline();
      timeline.object = new ComponentEntity();
      timeline.object.uuid = obj['uuid'];
      timeline.object.type = obj['type'];
      timeline.object.name = 'Object';
      let objReports: any[] = this.report[timeline.object.uuid];
      if (objReports && objReports.length) {
         timeline.object.events = objReports.map(objReport => this.traceReportToEvent(objReport));
      }
      let content: any = obj['content'];
      this.buildComponentTimeline(content, timeline.components);
      timeline.spec = new GraphSpec();
      timeline.stateColorFunction = (state: string): string => {
         const stateColor: string = TimelineUtils.COLOR_MAPPINGS[state];
         if (stateColor) {
            return stateColor;
         }
         return TimelineUtils.getColorForCategory(state);
      };
      return timeline;
   }

   private buildComponentTimeline(content: any, componentEntities: ComponentEntity[]): void {
      if (!content) {
         return;
      }
      let keys: string[] = Object.keys(content);
      keys.forEach((key, index) => {
         if (key.startsWith('child-')) {
            if (content[key]['type'] === 'Component' || content[key]['type'] === 'Witness') {
               let component: any = content[key];
               let cmpEntity: ComponentEntity = new ComponentEntity();
               cmpEntity.uuid = component['componentUuid'];
               cmpEntity.type = component['type'];
               cmpEntity.name = component['type'];
               let reports: any[] = this.report[cmpEntity.uuid];
               if (reports && reports.length) {
                  cmpEntity.events = reports.map(report => this.traceReportToEvent(report));
               }
               componentEntities.push(cmpEntity);
            } else {
               this.buildComponentTimeline(content[key], componentEntities);
            }
         }
      });
   }

   private traceReportToEvent(report: any): TimelineEvent {
      let reportContent: any = report['content'];
      let event: TimelineEvent = new TimelineEvent();

      // it's for getting old event state and new event state of the component, not for object.
      if (reportContent) {
         event.newState = reportContent['newCompState'];
         event.newLeafState = reportContent['newLeafObjState'];
         event.oldState = reportContent['oldCompState'];
         event.oldLeafState = reportContent['oldLeafObjState'];
         event.updateType = reportContent['updateType'];
      }

      if (!event.oldLeafState) {
         switch (report.traceName) {
            case 'CMMDSTraceInitUpdate':
               if (report.traceString.indexOf('delete') !== -1) {
                  event.newLeafState = event.oldLeafState = 'delete';
                  break;
               } else if (report.traceString.indexOf('went down') !== -1) {
                  event.newLeafState = event.oldLeafState = 'wentdown';
                  break;
               } else if (report.traceString.indexOf('went up') !== -1) {
                  event.newLeafState = event.oldLeafState = 'wentup';
                  break;
               } else if (report.traceString.indexOf('publish') !== -1) {
                  event.newLeafState = event.oldLeafState = 'publish';
                  break;
               }
               event.newLeafState = event.oldLeafState = 'default';
               break;
            case 'DOMTraceConfigStatus':
               if (report.traceString.indexOf('Object is accessible, live and compliant') !== -1) {
                  event.newLeafState = event.oldLeafState = 'compliant';
                  break;
               } else if (report.traceString.indexOf('Object is accessible, live but not compliant') !== -1) {
                  event.newLeafState = event.oldLeafState = 'non-compliant';
                  break;
               }
               event.newLeafState = event.oldLeafState = 'inaccessible';
               break;
            case 'DOMTraceOpTookTooLong':
               event.newLeafState = event.oldLeafState = 'opTookTooLong';
               break;
            case 'DOMTraceReconfigureFinalize':
               event.newLeafState = event.oldLeafState = 'reconfigureFinalize';
               break;
            default:
               event.newLeafState = event.oldLeafState = 'default';
         }
      }
      event.time = (new Date(report['tsStr'])).getTime();
      event.objectUuid = report['objectUuid'];
      event.componentUuid = report['componentUuid'];
      event.traceName = report['traceName'];
      event.traceString = report['traceString'];
      event.eventType = report['traceType'];
      return event;
   }


   public ngOnDestroy(): void {
      this.unsubscribeSub.next();
      this.unsubscribeSub.complete();
   }
}
