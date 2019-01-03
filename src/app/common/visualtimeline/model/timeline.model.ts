export class TimelineEvent {
   public eventType: string;
   public time: number;
   public timeString: string;
   public oldState: string;
   public newState: string;
   public oldLeafState: string;
   public newLeafState: string;
   public objectUuid: string;
   public componentUuid: string;
   public traceString: string;
   public traceName: string;
   public updateType: string;
   public opID: string;
   public target: string;
   public eventIcon: string;
   public eventIconColor: string;
   public origin: string;
}

export class StateTimeline {
   public state: string;
   public colorState: string;
   public duration: Duration;
   public spec: GraphSpec;
}

export class ComponentTimeline {
   public static readonly H_PADDING: number = 15;

   public name: string;
   public uuid: string;
   public forObject: boolean = false;
   public events: TimelineEvent[];
   public blankState: string;
   /**
    * For a component, its duration should be same with the
    * object timeline
    */
   public duration: Duration;
   public spec: GraphSpec;
   public stateColorFunction: (state: string) => string;
}

export class VisualTimeline {
   // The height for component tree.
   public static readonly HEADER_HEIGHT: number = 100;
   // The timeline chart padding left.
   public static readonly TIMELINE_CHART_PADDING_LEFT: number = 220;
   // Chart bar height.
   public static readonly CHART_BAR_HEIGHT: number = 260;
   // Vertical padding for each component(header, chart, legend, etc..).
   public static readonly V_PADDING: number = 10;
   public static readonly ACTION_BUTTONS_WIDTH: number = 100;
   public static readonly ACTION_BUTTONS_HEIGHT: number = 300;

   public object: ComponentEntity;
   public components: ComponentEntity[] = [];
   /**
    * Specific for the object and components' timelines display area,
    * i.e. the whole chart area minus the axises and labels area
    */
   public spec: GraphSpec;
   public stateColorFunction: (state: string) => string;
}

export class TimelineEventIcon {
   constructor(public iconShape: string,
               public iconClass: string) { }
}

export class Duration {
   constructor(public start: number,
               public end: number
   ) { }
}

/**
 * Each level of components have its own spec describing the
 * width and height of current component should have.
 */
export class GraphSpec {
   public x: number;
   public y: number;
   public width: number;
   public height: number;
   public color: string;
}

export class ComponentEntity {
   public name: string;
   public displayName: string;
   public uuid: string;
   public owner: string;
   public type: string;
   public blankState: string;
   public events: TimelineEvent[] = [];
}

export class RangeSlider {
  public range: Duration;
  public spec: GraphSpec;
}

export class ObjectInfoInputs {
   public objectUuid: string = "";
   public fname: string = "";
   public timestamp: string = "latest";
   public traceType: string = "urgent";
   public dataSource: string = "OTM";
   public traceStartTime: string = "";
   public traceEndTime: string = "";
   public copyFromRemote: boolean = false;
}
