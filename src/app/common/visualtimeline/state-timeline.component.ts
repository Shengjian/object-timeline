import { Component, Input } from "@angular/core";
import { StateTimeline } from "./model/timeline.model";

@Component({
   selector: '[state-timeline]',
   moduleId: module.id,
   templateUrl: 'state-timeline.component.html'
})
export class StateTimelineComponent {
   @Input("state-timeline")
   public state: StateTimeline;
}
