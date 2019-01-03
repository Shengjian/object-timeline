import {
   Component,
   OnDestroy,
   Output,
   EventEmitter,
   Input,
   OnInit
} from "@angular/core";
import { Subject } from "rxjs/Subject";
import {
   VisualTimeline,
   ObjectInfoInputs
} from "../common/visualtimeline/model/timeline.model";
import "rxjs/add/operator/takeUntil";
import "rxjs/add/operator/combineLatest";
import 'rxjs/add/operator/map';
import { TimelineUtils } from "../common/visualtimeline/utils/timeline.utils";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import * as _ from 'lodash';

@Component({
   selector: 'obj-info-visual-timeline',
   moduleId: module.id,
   templateUrl: 'object-info-visual-timeline.component.html',
   styleUrls: ['object-info-visual-timeline.component.scss']
})
export class ObjectInfoVisualTimelineComponent implements OnDestroy, OnInit {
   public objectNames: string[] = [];
   public objectList: VisualTimeline[] = [];
   public configList: any;
   public clomReports: any;

   configList$: Observable<any>;
   vsanReport$: Observable<any>;
   clomReports$: Observable<any>;
   courses$: Observable<any>;
   
   private report: any = null;
   private unsubscribeSub: Subject<void> = new Subject<void>();

   @Output()
   public hostNameEmitter: EventEmitter<any[]> = new EventEmitter<any[]>();
   @Output()
   public clomReportIconClick: EventEmitter<void> = new EventEmitter();

   @Input("hostname-mappings")
   public hostnameMappings: any[];
   @Input("object-inputs")
   public objectInfoInputs: ObjectInfoInputs;

   constructor(private http: Http) { }

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

      this.clomReports$ = this.http
            .get('assets/mockdata-clom-report.json')
            .map(res => res.json());
            

      this.configList$.takeUntil(this.unsubscribeSub)
                      .combineLatest(
                         this.vsanReport$,
                         this.clomReports$,
                         (configList, report, clomTimelineReport) => {
                           return {
                              'report': report,
                              'configList': configList,
                              'clomTimelineReport': clomTimelineReport
                           };
                        }
                      )
                      .subscribe(result => {
                        this.report = result['report'].result;
                        this.configList = [result['configList'].result.object];
                        this.clomReports = result["clomTimelineReport"];
                        this.objectList = [];
            
                        if (this.report.length === 0 ||
                            this.configList.length === 0 ||
                            Object.getOwnPropertyNames(this.report).length === 0) {
                           return;
                        }
            
                        this.configList.forEach((obj) => {
                           this.objectList.push(TimelineUtils.buildObjectTimelineData(obj,
                                                                                     this.report,
                                                                                     this.clomReports));
                        });
                     });
   }

   // constructor(private objectInfoService: ObjectInfoWorkflowService) {
   //    this.objectInfoService.namesSub$
   //       .takeUntil(this.unsubscribeSub)
   //       .subscribe(ns => {
   //             // update the object names
   //             this.objectNames = ns;
   //          }
   //       );

   //    this.objectInfoService.hostnameMap$
   //          .takeUntil(this.unsubscribeSub)
   //          .subscribe(ns => {
   //             this.hostNameEmitter.emit(ns);
   //          });

   //    this.objectInfoService.configList$
   //       .takeUntil(this.unsubscribeSub)
   //       .combineLatest(
   //          this.objectInfoService.vsanReport$,
   //          this.objectInfoService.clomTimelineReport$,
   //          (configList, report, clomTimelineReport) => {
   //             return {
   //                "report": report,
   //                "configList": configList,
   //                'clomTimelineReport': clomTimelineReport
   //             };
   //          }
   //       )
   //       .subscribe(result => {
   //          this.report = result["report"];
   //          this.configList = result["configList"];
   //          this.clomReports = result["clomTimelineReport"];
   //          this.objectList = [];

   //          if (this.report.length === 0 ||
   //              this.configList.length === 0 ||
   //              Object.getOwnPropertyNames(this.report).length === 0) {
   //             return;
   //          }

   //          this.configList.forEach((obj) => {
   //             let timelineData: VisualTimeline = TimelineUtils.buildObjectTimelineData(obj,
   //                                                                                      this.report,
   //                                                                                      this.clomReports);

   //             this.objectList.push(timelineData);
   //          });
   //       });
   // }

   public clomReportIconClickHandler(): void {
      this.clomReportIconClick.emit();
   }

   public ngOnDestroy(): void {
      this.unsubscribeSub.next();
      this.unsubscribeSub.complete();
   }
}
