import {
   ComponentTimeline,
   Duration,
   GraphSpec,
   StateTimeline,
   TimelineEvent,
   TimelineEventIcon, VisualTimeline
} from '../model/timeline.model';

export class TimelineUtils {
   private static readonly COLOR_MAP: Map<string, string> = new Map();
   private static readonly  ICON_PREFIX: string = '#icon-timeline-event-';
   private static readonly COLORS: string[] = [
      '#3366cc', '#dc3912', '#ff9900', '#109618',
      '#990099', '#0099c6', '#dd4477', '#66aa00',
      '#b82e2e', '#316395', '#994499', '#22aa99',
      '#aaaa11', '#6633cc', '#e67300', '#8b0707',
      '#651067', '#329262', '#5574a6', '#3b3eac'
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
      'default': '#22aa99'
   };

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
      { status: 'default', value: 'Default', traceName: '' }
   ];

   public static CHART_BAR_WIDTH: number = 120;
   public static STATE_RECT_WIDTH: number = 90;

   public static getColorForCategory(category: string): string {
      if (!category) {
         category = 'unknown';
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
      objTimeline.events = timelineData.object.events;
      objTimeline.duration = this.getTimelineDuration(timelineData);
      objTimeline.spec = new GraphSpec();
      objTimeline.spec.x = timelineData.spec.x;
      objTimeline.spec.y = timelineData.spec.y;
      objTimeline.spec.width = this.CHART_BAR_WIDTH;
      objTimeline.spec.height = timelineData.spec.height;
      objTimeline.stateColorFunction = timelineData.stateColorFunction;
      return objTimeline;
   }

   private static getTimelineDuration (timelineData: VisualTimeline): Duration {
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

            cmpTimeline.name = cmp ? cmp.name : 'None';
            cmpTimeline.uuid = cmp ? cmp.uuid : '';
            cmpTimeline.spec = spec;
            cmpTimeline.duration = duration;
            cmpTimeline.events = cmp ? cmp.events : [];
            cmpTimeline.stateColorFunction = timelineData.stateColorFunction;
            return cmpTimeline;
         });
   }

   public static getStateTimelines(component: ComponentTimeline): StateTimeline[] {
      if (!component || !component.events || !component.events.length) {
         return [];
      }
      let events: TimelineEvent[] = component.events
         .sort((a, b) => a.time - b.time);
      if (!component.duration) {
         return [];
      }
      if (!component.spec) {
         return [];
      }
      let compSpec: GraphSpec = component.spec;
      let curStateY: number = component.spec.y;
      let states: StateTimeline[] = [];
      let firstState: StateTimeline = this.getState(component,
                                                    events[0].oldLeafState,
                                                    new Duration(component.duration.start, events[0].time),
                                                    curStateY);
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
         curStateY += state.spec.height;
         states.push(state);
      });

      return states;
   }

   private static getState(component: ComponentTimeline,
                           state: string,
                           duration: Duration,
                           curStateY: number): StateTimeline {
      let compSpec: GraphSpec = component.spec;
      let stateTimeline: StateTimeline = new StateTimeline();
      stateTimeline.state = stateTimeline.leafState = state;
      stateTimeline.duration = duration;
      stateTimeline.spec = new GraphSpec();
      // stateTimeline.spec.width = Math.min(compSpec.width - 2 * ComponentTimeline.H_PADDING, 90);
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

   public static getBlankState(component: ComponentTimeline): StateTimeline {
      let blankState: StateTimeline = new StateTimeline();
      blankState.spec = new GraphSpec();
      blankState.spec.width = Math.min(component.spec.width - 2 * ComponentTimeline.H_PADDING, 90);
      blankState.spec.width = this.STATE_RECT_WIDTH;
      blankState.spec.height = component.spec.height;
      blankState.spec.x = component.spec.x + (component.spec.width - blankState.spec.width) / 2;
      blankState.spec.y = component.spec.y;
      return blankState;
   }

   public static getDurationRatio(part: Duration, total: Duration): number {
      return (part.end - part.start) / (total.end - total.start);
   }

   public static getEventIcon(traceName: string, status: string): string {
      switch (traceName) {
         case 'DOMTraceLeafObjectStateChange':
            return 'block';
         case 'CMMDSTraceInitUpdate':
            if (status === 'delete') {
               return 'minus-circle';
            } else if (status === 'wentdown') {
               return 'disconnect';
            } else if (status === 'wentup') {
               return 'connect';
            } else if (status === 'publish') {
               return 'circle-arrow';
            }
            return 'info-circle';
         case 'DOMTraceConfigStatus':
            return 'blocks-group';
         case 'DOMTraceOpTookTooLong':
            return 'hourglass';
         case 'DOMTraceReconfigureFinalize':
            return 'scroll';
         case 'DOMTraceRDTWatchdogTimerFired':
            return 'bolt';
         case 'DOMTraceLeafUpdateConnectionState':
            return 'two-way-arrows';
         case 'delete':
            return 'trash';
         case 'create':
            return 'new';
         default:
            return 'info-circle';
      }
   }

   public static getDefEventIcon(traceName: string, status: string): string {
      return this.ICON_PREFIX + TimelineUtils.getEventIcon(traceName, status);
   }

   public static getEventIconColor(state: string): string {
      if (state) {
         return this.COLOR_MAPPINGS[state];
      }
      return this.getColorForCategory(state);
   }
}
