import {
   ComponentTimeline,
   Duration,
   GraphSpec,
   StateTimeline,
   TimelineEvent,
   VisualTimeline,
   ComponentEntity
} from "../model/timeline.model";
import { HitInfo, HitType } from "../../../components/clustertimeline/model/cluster.model";

export class TimelineUtils {
   public static readonly COLOR_MAP: Map<string, string> = new Map();
   private static readonly  ICON_PREFIX: string = "#icon-timeline-event-";
   private static readonly COLORS: string[] = [
      "#3366cc", "#dc3912", "#ff9900", "#109618",
      "#990099", "#0099c6", "#dd4477", "#66aa00",
      "#b82e2e", "#316395", "#994499", "#22aa99",
      "#aaaa11", "#6633cc", "#e67300", "#8b0707",
      "#651067", "#329262", "#5574a6", "#3b3eac"
   ];
   public static COLOR_MAPPINGS: object = {
      'initialize': '#66aa00',
      'active': 'green',
      'absent': 'red',
      'stale': 'grey',
      'resyncing': '#ff9900',
      'degraded': 'purple',
      'reconfiguring': 'blue',
      'publish': '#3366cc',
      'delete': '#8b0707',
      'wentdown': '#dc3912',
      'wentup': '#109618',
      // 'blocksgroup': '#6633cc',
      'non-compliant': '#6633cc',
      'compliant': '#a1e002',
      'inaccessible': '#e00241',
      'reconfigureFinalize': '#e67300',
      'opTookTooLong': '#dd4477',
      'clomReport': '#56b1ff',
      'default': '#22aa99'
   };

   public static CLUSTER_COLOR_MAPPING: object = {
      'TRANSITION': '#651067',
      'DESTROY_NODE': '#f44f4f',
      'MASTER_LOST_BACKUP': '#0099c6',
      'VMK_RECONFIG': '#bfc600',
      'ADD_DISK': '#229104',
      'REMOVE_DISK': '#ce2500',
      'DISK_EVENT': '#72a8ff',
      'REBOOT_EVENT': '#a00095',
      'default': "#22aa99"
   };

   public static CLUSTER_ICON_MAPPING: any[] = [
      { status: 'TRANSITION', value: 'Transition' },
      { status: 'DESTROY_NODE', value: 'Destroy Node' },
      { status: 'MASTER_LOST_BACKUP', value: 'Master Lost Backup' },
      { status: 'VMK_RECONFIG', value: 'Update Network Cbk' },
      { status: 'ADD_DISK', value: ' Add Disk' },
      { status: 'REMOVE_DISK', value: 'Remove Disk' },
      { status: 'DISK_EVENT', value: 'Disk Health Change' },
      { status: 'REBOOT_EVENT', value: 'Host Booted Up' },
      { status: 'default', value: 'default' }
   ];

   public static COMPONENT_STATUS_MAPPINGS: any[] = [
      { status: 'initialize', value: 'Initialize', traceName: 'DOMTraceLeafObjectStateChange' },
      { status: 'active', value: 'Active', traceName: 'DOMTraceLeafObjectStateChange' },
      { status: 'absent', value: 'Absent', traceName: 'DOMTraceLeafObjectStateChange' },
      { status: 'stale', value: 'Stale', traceName: 'DOMTraceLeafObjectStateChange' },
      { status: 'resyncing', value: 'Resyncing', traceName: 'DOMTraceLeafObjectStateChange' },
      { status: 'degraded', value: 'Degraded', traceName: 'DOMTraceLeafObjectStateChange' },
      { status: 'reconfiguring', value: 'Reconfiguring', traceName: 'DOMTraceLeafObjectStateChange' }
   ];

   public static OBJECT_STATUS_MAPPINGS: any[] = [
      { status: 'compliant', value: 'Accessible', traceName: 'DOMTraceConfigStatus' },
      { status: 'non-compliant', value: 'Not Compliant', traceName: 'DOMTraceConfigStatus' },
      { status: 'inaccessible', value: 'Not Live', traceName: 'DOMTraceConfigStatus' }
   ];

   public static ICON_MAPPINGS: any[] = [
      { status: 'initialize', value: 'Leaf State change', traceName: 'DOMTraceLeafObjectStateChange' },
      { status: 'non-compliant', value: 'Object Config Status Change', traceName: 'DOMTraceConfigStatus' },
      { status: 'publish', value: 'Publish', traceName: 'CMMDSTraceInitUpdate' },
      { status: 'delete', value: 'Delete', traceName: 'CMMDSTraceInitUpdate' },
      { status: 'wentdown', value: 'Went down', traceName: 'CMMDSTraceInitUpdate' },
      { status: 'wentup', value: 'Went up', traceName: 'CMMDSTraceInitUpdate' },
      { status: 'reconfigureFinalize', value: 'Finished', traceName: 'DOMTraceReconfigureFinalize' },
      { status: 'opTookTooLong', value: 'Op take too long', traceName: 'DOMTraceOpTookTooLong' },
      { status: 'clomReport', value: 'CLOM report', traceName: 'CLOMReport' },
      { status: 'default', value: 'Default', traceName: '' }
   ];

   public static CHART_BAR_WIDTH: number = 120;
   public static STATE_RECT_WIDTH: number = 90;
   public static originalTimelineData: VisualTimeline;

   public static getColorForCategory(category: string): string {
      if (!category) {
         category = 'unknown';
      }
      if (category === 'none') {
         if (this.COLOR_MAP.get(category) === undefined) {
            this.COLOR_MAP.set(category, '#999999');
         }
         return '#999999';
      }
      let color: string = TimelineUtils.COLOR_MAP.get(category);
      if (!color) {
         let availableColors: string[] = TimelineUtils.COLORS
            .filter(curColor => {
               let colorIt: IterableIterator<string> = TimelineUtils.COLOR_MAP.values();
               let next: IteratorResult<string> = colorIt.next();
               while (next && next.value) {
                  if (next.value === curColor) {
                     return false;
                  }
                  next = colorIt.next();
               }
               return true;
            });
         color = !!availableColors && !!availableColors.length ?
            availableColors[0] : TimelineUtils.COLORS[0];
         this.COLOR_MAP.set(category, color);

      }
      return color;
   }

   public static getObjectTimeline(timelineData: VisualTimeline): ComponentTimeline {
      if (!timelineData ||
         !timelineData.object ||
         !timelineData.object.events) {
         return null;
      }
      let objTimeline: ComponentTimeline = new ComponentTimeline();
      objTimeline.forObject = true;
      objTimeline.name = timelineData.object.name;
      objTimeline.uuid = timelineData.object.uuid;
      objTimeline.events = timelineData.object.events.sort((a, b) => a.time - b.time);
      objTimeline.duration = this.getTimelineDuration(timelineData);
      objTimeline.spec = new GraphSpec();
      objTimeline.spec.x = timelineData.spec.x;
      objTimeline.spec.y = timelineData.spec.y;
      objTimeline.spec.width = this.CHART_BAR_WIDTH;
      objTimeline.spec.height = timelineData.spec.height;
      objTimeline.stateColorFunction = timelineData.stateColorFunction;
      if (timelineData.object.blankState) {
         objTimeline.spec.color = objTimeline.stateColorFunction(timelineData.object.blankState);
      }
      return objTimeline;
   }

   public static getTimelineDuration (timelineData: VisualTimeline): Duration {
      let times: number[] = timelineData.object.events.map(event => event.time);
      timelineData.components.forEach(compTimeline => {
         times.push(...compTimeline.events.map(event => event.time));
      });
      let start: number = Math.min.apply(null, times);
      let end: number = Math.max.apply(null, times);
      return new Duration(start, end);
   }

   public static getComponentTimelines(timelineData: VisualTimeline, duration: Duration): ComponentTimeline[] {
      if (!timelineData ||
      !timelineData.components ||
      !timelineData.components.length) {
         return [];
      }
      return timelineData.components
         .map((cmp, index) => {
            let cmpTimeline: ComponentTimeline = new ComponentTimeline();
            let spec: GraphSpec = new GraphSpec();
            spec.width = this.CHART_BAR_WIDTH;
            spec.height = timelineData.spec.height;
            spec.y = timelineData.spec.y;
            spec.x = timelineData.spec.x + (index + 1) * spec.width;

            cmpTimeline.name = cmp ? cmp.name : "None";
            cmpTimeline.uuid = cmp ? cmp.uuid : "";
            cmpTimeline.spec = spec;
            cmpTimeline.duration = duration;
            cmpTimeline.events = cmp ? cmp.events.sort((a, b) => a.time - b.time) : [];
            cmpTimeline.stateColorFunction = timelineData.stateColorFunction;
            if (cmp.blankState) {
               cmpTimeline.spec.color = cmpTimeline.stateColorFunction(cmp.blankState);
            }
            return cmpTimeline;
         });
   }

   public static getStateTimelines(component: ComponentTimeline): StateTimeline[] {
      if (!component || !component.events || !component.events.length) {
         return [];
      }
      let events: TimelineEvent[] = component.events;
      if (!component.duration) {
         // throw "A component's duration cannot be empty.";
      }
      if (!component.spec) {
         // throw "A component's spec cannot be empty";
      }
      let curStateY: number = component.spec.y;
      let states: StateTimeline[] = [];
      let eventIndex: number = 0;

      if (component.forObject) {
         eventIndex = this.originalTimelineData
                          .object
                          .events
                          .findIndex(value => value.timeString === events[0].timeString);
      } else {
         eventIndex = this.originalTimelineData
                          .components
                          .find(value => value.uuid === component.uuid)
                          .events
                          .findIndex(value => value.timeString === events[0].timeString);
      }

      let firstState: StateTimeline = this.getState(component,
                                                    events[0].oldLeafState,
                                                    new Duration(component.duration.start, events[0].time),
                                                    curStateY);
      if (!this.isAvailableState(events[0].oldLeafState) || eventIndex !== 0) {
         firstState.colorState = this.getAvailableState(component.forObject, component.uuid, events[0]);
         firstState.spec.color = component.stateColorFunction(firstState.colorState);
      } else {
         firstState.colorState = events[0].oldLeafState;
      }
      curStateY += firstState.spec.height;
      states.push(firstState);

      events.forEach((event, index) => {
         let duration: Duration;
         if (index !== events.length - 1) {
            duration = new Duration(event.time, events[index + 1].time);
         } else {
            duration = new Duration(event.time, component.duration.end);
         }
         let state: StateTimeline = this.getState(component,
                                                  event.newLeafState,
                                                  duration,
                                                  curStateY);

         if (!this.isAvailableState(event.newLeafState)) {
            // states already has a state(firstState) before, so states[index].colorState is the previous colorState;
            state.colorState = states[index].colorState;
            state.spec.color = component.stateColorFunction(state.colorState);
         } else {
            state.colorState = event.newLeafState;
         }
         curStateY += state.spec.height;
         states.push(state);
      });

      return states;
   }

   public static getAvailableState(forObject: boolean, uuid: string, timelineEvent: TimelineEvent): string {
      let availableState: string;
      let originalEvents: TimelineEvent[];
      let i: number;

      if (forObject) {
         originalEvents = this.originalTimelineData.object.events;
      } else {
         originalEvents = this.originalTimelineData.components.find(value => value.uuid === uuid).events;
      }

      let index = originalEvents.findIndex(value => value.timeString === timelineEvent.timeString);
      if (index === 0 && this.isAvailableState(timelineEvent.oldLeafState)) {
         return timelineEvent.oldLeafState;
      }
      for (i = index - 1; i >= 0; i--) {
         if (this.isAvailableState(originalEvents[i].newLeafState)) {
            availableState = originalEvents[i].newLeafState;
            break;
         }
      }
      if (!availableState) {
         for (i = index + 1; i < originalEvents.length; i++) {
            if (this.isAvailableState(originalEvents[i].oldLeafState)) {
               availableState = originalEvents[i].oldLeafState;
               break;
            }
         }
      }
      return availableState;
   }

   public static isAvailableState(leafState: string): boolean {
      let availableStates: any[] = this.COMPONENT_STATUS_MAPPINGS.concat(this.OBJECT_STATUS_MAPPINGS);
      let state = availableStates.find((value) => value.status === leafState);
      return !!state;
   }

   public static getState(component: ComponentTimeline,
                          state: string,
                          duration: Duration,
                          curStateY: number): StateTimeline {
      let compSpec: GraphSpec = component.spec;
      let stateTimeline: StateTimeline = new StateTimeline();
      stateTimeline.state = state;
      stateTimeline.duration = duration;
      stateTimeline.spec = new GraphSpec();
      stateTimeline.spec.width = this.STATE_RECT_WIDTH;
      stateTimeline.spec.height = compSpec.height * this.getDurationRatio(stateTimeline.duration, component.duration);
      stateTimeline.spec.x = compSpec.x + (compSpec.width - stateTimeline.spec.width) / 2;
      stateTimeline.spec.y = curStateY;
      if (!component.stateColorFunction) {
         component.stateColorFunction = (cmpState: string) => this.getColorForCategory(cmpState);
      }
      stateTimeline.spec.color = component.stateColorFunction(stateTimeline.state);

      return stateTimeline;
   }

   public static getPreState(range: Duration,
                             events: TimelineEvent[],
                             forObject: boolean,
                             uuid: string,
                             originalDuration: Duration): string {
      let preState: string;
      if (range.start > originalDuration.start || range.end < originalDuration.end) {
         let i = 0;
         for (i = 0; i < events.length; i++) {
            if (events[i].time > range.start) {
               if (i === 0) {
                  if (this.isAvailableState(events[i].oldLeafState)) {
                     preState = events[i].oldLeafState;
                  } else {
                     preState = this.getAvailableState(forObject, uuid, events[i]);
                  }
                  break;
               } else {
                  if (this.isAvailableState(events[i - 1].newLeafState)) {
                     preState = events[i - 1].newLeafState;
                  } else {
                     preState = this.getAvailableState(forObject, uuid, events[i - 1]);
                  }
                  break;
               }
            }
         }
         if (!preState && i === events.length) {
            if (this.isAvailableState(events[events.length - 1].newLeafState)) {
               preState = events[events.length - 1].newLeafState;
            } else {
               preState = this.getAvailableState(forObject, uuid, events[events.length - 1]);
            }
         }
      }
      return preState;
   }

   public static getBlankState(component: ComponentTimeline): StateTimeline {
      let blankState: StateTimeline = new StateTimeline();
      blankState.spec = new GraphSpec();
      blankState.spec.width = this.STATE_RECT_WIDTH;
      blankState.spec.height = component.spec.height;
      blankState.spec.x = component.spec.x + (component.spec.width - blankState.spec.width) / 2;
      blankState.spec.y = component.spec.y;
      blankState.spec.color = component.spec.color ? component.spec.color : 'none';
      return blankState;
   }

   public static getDurationRatio(part: Duration, total: Duration): number {
      if (total.end === total.start) {
         return 0;
      }
      return (part.end - part.start) / (total.end - total.start);
   }

   public static getEventIcon(traceName: string, status: string): string {
      switch (traceName) {
         case "DOMTraceLeafObjectStateChange":
            return "block";
         case "CMMDSTraceInitUpdate":
            if (status === 'delete') {
               return "minus-circle";
            } else if (status === 'wentdown') {
               return "disconnect";
            } else if (status === 'wentup') {
               return "connect";
            } else if (status === 'publish') {
               return "circle-arrow";
            }
            return "info-circle";
         case "DOMTraceConfigStatus":
            return "blocks-group";
         case "DOMTraceOpTookTooLong":
            return "hourglass";
         case "DOMTraceReconfigureFinalize":
            return "scroll";
         case "DOMTraceRDTWatchdogTimerFired":
            return "bolt";
         case "DOMTraceLeafUpdateConnectionState":
            return "two-way-arrows";
         case "delete":
            return "trash";
         case "create":
            return "new";
         case "CLOMReport":
            return "cluster";
         default:
            return "info-circle";
      }
   }

   public static getDefEventIcon(traceName: string, status: string): string {
      return this.ICON_PREFIX + TimelineUtils.getEventIcon(traceName, status);
   }

   public static getHitIcon(type: string): string {
      switch (type) {
         case HitType.TRANSITION:
            return 'two-way-arrows';
         case HitType.DESTROY_NODE:
            return 'trash';
         case HitType.MASTER_LOST_BACKUP:
            return 'backup';
         case HitType.VMK_RECONFIG:
            return 'network-switch';
         case HitType.ADD_DISK:
            return 'plus-circle';
         case HitType.REMOVE_DISK:
            return 'minus-circle';
         case HitType.DISK_EVENT:
            return 'hard-disk';
         case HitType.REBOOT_EVENT:
            return 'refresh';
         default:
            return "info-circle";
      }
   }

   public static getHitIconColor(type: string): string {
      return this.CLUSTER_COLOR_MAPPING[type];
   }

   public static getDefHitIcon(type: string): string {
      return this.ICON_PREFIX + this.getHitIcon(type);
   }

   public static getEventIconColor(state: string): string {
      if (state) {
         return this.COLOR_MAPPINGS[state];
      }
      return this.getColorForCategory(state);
   }

   public static getHostMasterColor(key: string): string {
      return '';
   }

   public static getDisplayedUuid(uuid: string): string {
      if (!!!uuid) {
         return 'none';
      }
      let uuidArr: string[] = uuid.split('-');
      if (!!!uuidArr || uuidArr.length === 0) {
         return 'none';
      }

      // let index: number = Math.floor(uuidArr.length / 2);
      return uuidArr[1].toUpperCase();
   }

   public static isRaidNode(node: any): boolean {
      return node.type && node.type.startsWith("RAID_");
   }

   public static buildObjectTimelineData(obj: any, report: any, clomReports: any): VisualTimeline {
      let timeline: VisualTimeline = new VisualTimeline();
      timeline.object = new ComponentEntity();
      obj["content"]["attributes"]["compositeUuid"] = obj["content"]["attributes"]["compositeUuid"] ||
                                                      obj["content"]["attributes"]["objUUID"];
      timeline.object.uuid = obj["content"]["attributes"]["compositeUuid"];
      timeline.object.type = obj["type"];
      timeline.object.name = "Object";
      let objReports: any[] = report[timeline.object.uuid];
      if (objReports && objReports.length) {
         timeline.object.events = objReports.map(objReport => this.traceReportToEvent(objReport))
                                            .filter(reportEvent => !!reportEvent);
      }
      timeline.object.events.push(...this.getClomReportByObjectUuid(timeline.object.uuid, clomReports));
      let content: any = obj["content"];
      this.buildComponentTimeline(content, timeline.components, report);
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

   private static buildComponentTimeline(content: any, componentEntities: ComponentEntity[], report: any): void {
      if (!content) {
         return;
      }
      let keys: string[] = Object.keys(content);
      keys.forEach((key) => {
         if (key.startsWith("child-")) {
            if (content[key]["type"] === "Component" || content[key]["type"] === "Witness") {
               let component: any = content[key];
               let cmpEntity: ComponentEntity = new ComponentEntity();
               component["componentUuid"] = component["componentUuid"] || component["attributes"]["objUuid"];
               cmpEntity.uuid = component["componentUuid"];
               cmpEntity.type = component["type"];
               cmpEntity.name = component["type"];
               cmpEntity.blankState = component["persistentState"] || component["attributes"]["objState"];
               let reports: any[] = report[cmpEntity.uuid];
               if (reports && reports.length) {
                  cmpEntity.events = reports.map(reportEvent => this.traceReportToEvent(reportEvent));
               }
               componentEntities.push(cmpEntity);
            } else {
               this.buildComponentTimeline(content[key], componentEntities, report);
            }
         }
      });
   }

   private static traceReportToEvent(report: any): TimelineEvent {
      let reportContent: any = report["content"];
      let event: TimelineEvent = new TimelineEvent();

      // it's for getting old event state and new event state of the component, not for object.
      if (reportContent) {
         event.newState = reportContent["newCompState"];
         event.newLeafState = reportContent["newLeafObjState"];
         event.oldState = reportContent["oldCompState"];
         event.oldLeafState = reportContent["oldLeafObjState"];
         event.updateType = reportContent["updateType"];
      }

      if (!event.oldLeafState) {
         switch (report.traceName) {
            case "CMMDSTraceInitUpdate":
               if (report.traceString.indexOf("delete") !== -1) {
                  event.newLeafState = event.oldLeafState = "delete";
                  break;
               } else if (report.traceString.indexOf("went down") !== -1) {
                  event.newLeafState = event.oldLeafState = "wentdown";
                  break;
               } else if (report.traceString.indexOf("went up") !== -1) {
                  event.newLeafState = event.oldLeafState = "wentup";
                  break;
               } else if (report.traceString.indexOf("publish") !== -1) {
                  event.newLeafState = event.oldLeafState = "publish";
                  break;
               }
               event.newLeafState = event.oldLeafState = "default";
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
            case "DOMTraceOpTookTooLong":
               event.newLeafState = event.oldLeafState = "opTookTooLong";
               break;
            case "DOMTraceReconfigureFinalize":
               event.newLeafState = event.oldLeafState = "reconfigureFinalize";
               break;
            default:
               event.newLeafState = event.oldLeafState = "default";
         }
      }
      event.time = (new Date(report["tsStr"])).getTime();
      event.timeString = report["tsStr"];
      event.objectUuid = report["objectUuid"];
      event.componentUuid = report["componentUuid"];
      event.traceName = report["traceName"];
      event.traceString = report["traceString"];
      event.eventType = report["traceType"];
      event.origin = report["origin"];
      event.eventIcon = TimelineUtils.getEventIcon(event.traceName, event.newLeafState);
      event.eventIconColor = TimelineUtils.getEventIconColor(event.newLeafState);
      return event.traceString ? event : null;
   }

   private static getClomReportByObjectUuid(uuid: string, clomReports: any[]): TimelineEvent[] {
      let events: TimelineEvent[] = [];
      let reports: any[] = JSON.parse(JSON.stringify(clomReports));
      reports = reports.filter(clomReport => clomReport.uuid === uuid);
      if (reports) {
         reports.map(report => {
            let event: TimelineEvent = new TimelineEvent();
            let timeString: string = (report["timestamp"].split('Z'))[0];
            event.time = (new Date(timeString)).getTime();
            event.timeString = timeString;
            event.objectUuid = report["uuid"];
            event.traceName = "CLOMReport";
            event.traceString = report["timestamp"] + ' Posted a work item opID:' + report["opID"] +
                                  ' for ' + report['uuid'] + ' Type: ' + report['opType'] +
                                  ' (' + report['result'] + ')';
            event.newLeafState = event.oldLeafState = 'clomReport';
            event.opID = report["opID"];
            event.target = report["target"];
            event.eventIcon = TimelineUtils.getEventIcon(event.traceName, event.newLeafState);
            event.eventIconColor = TimelineUtils.getEventIconColor(event.newLeafState);
            events.push(event);
         });
      }
      return events;
   }
}
