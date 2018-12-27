import {Component, OnInit, ViewChild} from '@angular/core';
import {GraphSpec, RangeSlider, Duration, RangeSliderComponent} from './range-slider.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title: string = 'app';
  public currentRange: Duration;
  @ViewChild(RangeSliderComponent)
  private _slider: RangeSliderComponent;

  public ngOnInit(): void {
   //  let spec: GraphSpec = new GraphSpec();
   //  spec.width = 20;
   //  spec.height = 200;
   //  spec.x = 20;
   //  spec.y = 20;
   //  let slideData: RangeSlider = new RangeSlider();
   //  slideData.spec = spec;
   //  slideData.range = new Duration();
   //  slideData.range.start = 200;
   //  slideData.range.end = 900;
   //  this._slider.rangeSlider = slideData;
   //  this.currentRange = slideData.range;
  }

  public onRangeChanged(range: Duration): void {
    this.currentRange = range;
  }
}
