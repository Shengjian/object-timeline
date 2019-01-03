import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-collapsable-card',
  templateUrl: 'collapsableCard.component.html',
})

export class CollapsableCardComponent implements OnInit {
   // Determines whether to show the card body block
   @Input()
   public show = false;
   // the header title
   @Input()
   public label: string;
   // Determines if the card needs to be highlighted
   @Input()
   public highlight: boolean = false;

   @Output()
   public onVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

   constructor() { }

   ngOnInit() {}

   // toggle the card body
   toggle() {
      this.show = !this.show;
      this.onVisibleChange.next(this.show);
   }
}
