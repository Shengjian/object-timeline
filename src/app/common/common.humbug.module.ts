import { NgModule } from '@angular/core';
import {HttpModule} from '@angular/http';
import { StateTimelineComponent } from './visualtimeline/state-timeline.component';
import { VisualTimelineComponent } from './visualtimeline/visual-timeline.component';
import { RangeSliderComponent } from './visualtimeline/range-slider.component';
import { SliderFilterComponent } from './visualtimeline/slider-filter.component';
import { ClarityModule } from 'clarity-angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ComponentTimelineComponent } from './visualtimeline/component-timeline.component';
import { ComponentHeaderDialogComponent } from './visualtimeline/component-header-dialog';
import { HumbugIconDefs } from './icons/humbug.icon.defs';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
   imports: [
      HttpModule,
      FormsModule,
      CommonModule,
      ClarityModule,
      ClipboardModule
   ],
   declarations: [
      RangeSliderComponent,
      SliderFilterComponent,
      StateTimelineComponent,
      ComponentTimelineComponent,
      ComponentHeaderDialogComponent,
      VisualTimelineComponent,
      HumbugIconDefs
   ],
   exports: [
      RangeSliderComponent,
      SliderFilterComponent,
      StateTimelineComponent,
      ComponentTimelineComponent,
      ComponentHeaderDialogComponent,
      VisualTimelineComponent,
      HumbugIconDefs
   ]
})
export class CommonHumbugModule { }
