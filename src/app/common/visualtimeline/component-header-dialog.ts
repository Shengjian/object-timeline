import { Component, Input } from '@angular/core';

@Component({
   moduleId: module.id,
   selector: 'component-header-dialog',
   templateUrl: 'component-header-dialog.html',
   styleUrls: [ 'component-header-dialog.css' ]
})

export class ComponentHeaderDialogComponent {
   @Input()
   showDialog: boolean = false;
   @Input()
   cmpInfo: any;
}
