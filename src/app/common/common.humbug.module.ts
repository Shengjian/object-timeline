import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { StateTimelineComponent } from "./visualtimeline/state-timeline.component";
import { VisualTimelineComponent } from "./visualtimeline/visual-timeline.component";
import { RangeSliderComponent } from "./visualtimeline/range-slider.component";
import { SliderFilterComponent } from './visualtimeline/slider-filter.component';
import { ClarityModule } from "clarity-angular";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TimelineViewComponent } from "./visualtimeline/timeline-view.component";
import { ComponentTimelineComponent } from "./visualtimeline/component-timeline.component";
import { TimelineBarChartComponent } from "./visualtimeline/timeline-bar-chart.component";
import { ComponentHeaderDialog } from "./visualtimeline/component-header-dialog";
import { HumbugIconDefs } from "./icons/humbug.icon.defs";
import { ClipboardModule } from "ngx-clipboard";
import { HttpModule } from "@angular/http";
import { Stepper } from "./stepper.component";

@NgModule({
   imports: [
      FormsModule,
      CommonModule,
      ClarityModule,
      ClipboardModule,
      RouterModule,
      HttpModule
   ],
   declarations: [
      RangeSliderComponent,
      SliderFilterComponent,
      StateTimelineComponent,
      ComponentTimelineComponent,
      TimelineViewComponent,
      TimelineBarChartComponent,
      ComponentHeaderDialog,
      VisualTimelineComponent,
      HumbugIconDefs,
      Stepper
   ],
   exports: [
      RangeSliderComponent,
      SliderFilterComponent,
      StateTimelineComponent,
      ComponentTimelineComponent,
      TimelineViewComponent,
      TimelineBarChartComponent,
      ComponentHeaderDialog,
      VisualTimelineComponent,
      HumbugIconDefs,
      Stepper
   ]
})
export class CommonHumbugModule { }
