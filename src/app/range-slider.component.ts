import {Component, Input, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import * as d3 from 'd3';

export class Duration {
  public start: number;
  public end: number;
}

export class GraphSpec {
  public width: number;
  public height: number;
  public x: number;
  public y: number;
  public color: string;
}

export class RangeSlider {
  public range: Duration;
  public spec: GraphSpec;
}

@Component({
  selector: '[range-slider]',
  template:
    `<svg:rect #track 
        [attr.height]="barSpec?.height"
        [attr.width]="barSpec?.width"
        [attr.x]="barSpec?.x"
        [attr.y]="barSpec?.y"
        [attr.fill]="barSpec?.color"
        stroke-width="1"
        stroke="#aaa">
    </svg:rect>
    <svg:rect #rangeTrack 
        class="dragable"
        [attr.height]="slide2Spec.y - slide1Spec.y"
        [attr.width]="barSpec?.width"
        [attr.x]="barSpec?.x"
        [attr.y]="slide1Spec?.y + slide1Spec.height / 2"
        [attr.fill]="rangeSpec?.color"
        stroke-width="1"
        stroke="#aaa">
    </svg:rect>
    <svg:rect #slide1
        class="dragable"
        [attr.height]="slide1Spec?.height"
        [attr.width]="slide1Spec?.width"
        [attr.x]="slide1Spec?.x"
        [attr.y]="slide1Spec?.y"
        [attr.fill]="slide1Spec?.color"
        stroke-width="1"
        stroke="#aaa">
    </svg:rect>
    <svg:rect #slide2
        class="dragable"
        [attr.height]="slide2Spec?.height"
        [attr.width]="slide2Spec?.width"
        [attr.x]="slide2Spec?.x"
        [attr.y]="slide2Spec?.y"
        [attr.fill]="slide2Spec?.color"
        stroke-width="1"
        stroke="#aaa">
    </svg:rect>
    <svg:text  font-size="15">Test</svg:text>`
})
export class RangeSliderComponent implements AfterViewInit {
  @ViewChild('track')
  private _track: ElementRef;
  @ViewChild('rangeTrack')
  private _rangeTrack: ElementRef;
  @ViewChild('slide1')
  private _slide1: ElementRef;
  @ViewChild('slide2')
  private _slide2: ElementRef;

  private _slideTop: number;
  private _slideBottom: number;
  private readonly SLIDER_HEIGHT: number = 5;

  @Input('range')
  private _rangeSlider: RangeSlider;
  public get rangeSlider(): RangeSlider {
    return this._rangeSlider;
  }
  public set rangeSlider(value: RangeSlider) {
    this._rangeSlider = value;
    this.calculateOtherSpecs();
  }
  private _barSpec: GraphSpec;
  public get barSpec(): GraphSpec {
    return this._barSpec;
  }
  private _slide1Spec: GraphSpec;
  public get slide1Spec(): GraphSpec {
    return this._slide1Spec;
  }
  private _slide2Spec: GraphSpec;
  public get slide2Spec(): GraphSpec {
    return this._slide2Spec;
  }
  private _rangeSpec: GraphSpec;
  public get rangeSpec(): GraphSpec {
    return this._rangeSpec;
  }

  @Output()
  public rangeChange: EventEmitter<Duration> = new EventEmitter<Duration>();

  private calculateOtherSpecs(): void {
    const spec: GraphSpec = this._rangeSlider.spec;

    const barSpec: GraphSpec = new GraphSpec();
    barSpec.height = spec.height;
    barSpec.width = 2 * spec.width / 3;
    barSpec.x = spec.x + spec.width / 6;
    barSpec.y = spec.y;
    barSpec.color = '#ccc';
    this._barSpec = barSpec;

    const slide1Spec: GraphSpec = new GraphSpec();
    slide1Spec.width = spec.width;
    slide1Spec.height = spec.width / 3;
    slide1Spec.x = spec.x;
    slide1Spec.y = spec.y - slide1Spec.height / 2;
    this._slideTop = slide1Spec.y;
    slide1Spec.color = 'blue';
    this._slide1Spec = slide1Spec;
    console.log(this._slideTop);

    const slide2Spec: GraphSpec = new GraphSpec();
    slide2Spec.width = spec.width;
    slide2Spec.height = spec.width / 3;
    slide2Spec.x = spec.x;
    slide2Spec.y = spec.y + spec.height - slide2Spec.height / 2;
    this._slideBottom = slide2Spec.y - slide2Spec.height / 2;
    console.log(this._slideBottom);
    slide2Spec.color = 'blue';
    this._slide2Spec = slide2Spec;

    const rangeSpec: GraphSpec = new GraphSpec();
    rangeSpec.width = barSpec.width;
    rangeSpec.height = barSpec.height;
    rangeSpec.x = barSpec.x;
    rangeSpec.y = barSpec.y;
    rangeSpec.color = 'lightblue';
    this._rangeSpec = rangeSpec;
  }

  public ngAfterViewInit(): void {
    let dragTarget: any;
    let offset: number;
    const drag = d3.drag()
      .on('start', () => {
        dragTarget = d3.event.sourceEvent.target;
        offset = d3.event.y - dragTarget.y.baseVal.value;
      })
      .on('drag', () => {
        if (this.onDrag(dragTarget, offset)) {
          this.onRangeChangeHandler();
        }
      });
    d3.selectAll('.dragable').call(drag);
  }

  private onDrag(target: SVGElement, offset: number): boolean {
    const event: DragEvent = d3.event;
    console.log(event.y - offset);
    if (target === this._slide1.nativeElement) {
      if (event.y - offset < this.slide2Spec.y - this.slide1Spec.height &&
        event.y - offset > this._slideTop) {
        this.slide1Spec.y = event.y - offset;
        return true;
      }
    }

    if (target === this._slide2.nativeElement) {
      if (event.y - offset < this._slideBottom &&
        event.y - offset > this._slide1Spec.y + this._slide1Spec.height) {
        this.slide2Spec.y = event.y;
        return true;
      }
    }

    if (target === this._rangeTrack.nativeElement) {
      let height: number = this.slide2Spec.y - this.slide1Spec.y;
      let newSlide1Y: number = event.y - offset;
      let newSlide2Y: number = event.y - offset + height;
      if (newSlide1Y > this._slideTop &&
        newSlide2Y + this.slide2Spec.height < this._slideBottom) {
        this.slide1Spec.y = newSlide1Y;
        this.slide2Spec.y = newSlide2Y;
        return true;
      }
    }
    return false;
  }

  private onRangeChangeHandler(): void {
    let originRange: Duration = this.rangeSlider.range;
    let result: Duration = new Duration();
    let startY: number = this._rangeTrack.nativeElement.y.baseVal.value;
    let endY: number = startY + this._rangeTrack.nativeElement.height.baseVal.value;
    result.start = ((startY - this.barSpec.y) / this.barSpec.height) * (originRange.end - originRange.start) + originRange.start;
    result.end = ((endY - this.barSpec.y) / this.barSpec.height) * (originRange.end - originRange.start) + originRange.start;
    // console.log(`${result.start} ${result.end}`);
    this.rangeChange.emit(result);
  }



}
