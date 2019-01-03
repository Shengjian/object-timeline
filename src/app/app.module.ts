import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from 'clarity-angular';

import { ClipboardModule } from 'ngx-clipboard';
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { RangeSliderComponent } from './range-slider.component';
import { ClipbpardComponent } from './ngxClipboard/ngx-clipbpard-component';
import { CommonHumbugModule } from './common/common.humbug.module';
import { ObjectInfoVisualTimelineComponent } from './objectInfo/object-info-visual-timeline.component';
import { CollapsableCardComponent } from './objectInfo/collapsableCard.component';


@NgModule({
  declarations: [
    AppComponent, RangeSliderComponent,
    ClipbpardComponent,
    ObjectInfoVisualTimelineComponent,
    CollapsableCardComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ClarityModule.forRoot(),
    ClipboardModule,
    CommonHumbugModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
