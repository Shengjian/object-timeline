export class TimelineEvent {
   public eventType: string;
   public time: number;
   public oldState: string;
   public newState: string;
   public oldLeafState: string;
   public newLeafState: string;
   public objectUuid: string;
   public componentUuid: string;
   public traceString: string;
   public traceName: string;
   public updateType: string;
}

export class StateTimeline {
   public state: string;
   public leafState: string;
   public duration: Duration;
   public spec: GraphSpec;
}

export class ComponentTimeline {
   public static readonly H_PADDING: number = 15;

   public name: string;
   public uuid: string;
   public forObject: boolean = false;
   public events: TimelineEvent[];
   /**
    * For a component, its duration should be same with the
    * object timeline
    */
   public duration: Duration;
   public spec: GraphSpec;
   public stateColorFunction: (state: string) => string;
}

export class VisualTimeline {
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
   public uuid: string;
   public owner: string;
   public type: string;
   public events: TimelineEvent[] = [];
}

export class RangeSlider {
  public range: Duration;
  public spec: GraphSpec;
}
