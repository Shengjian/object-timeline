import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// import { AppStateService } from '../../app.state';

@Component({
   moduleId: module.id,
   selector: 'component-header-dialog',
   templateUrl: 'component-header-dialog.html',
   styleUrls: [ 'component-header-dialog.scss' ]
})

export class ComponentHeaderDialog {
   @Input()
   showDialog: boolean = false;
   @Input()
   cmpInfo: any;
   @Output()
   public clomReportIconClick: EventEmitter<void> = new EventEmitter();

   private _targets: any;

   // constructor(
   //    private appstate: AppStateService
   // ) {
   //    this._targets = this.appstate.params['target'];
   // }

   click(event) {
      if (event.traceName !== 'CLOMReport') {
         return;
      }
      this.clomReportIconClick.emit();
   }

   traceParams(timestamp: string): Object {
      let params = {};
      params['term'] = "";
      // params['handle'] = this.appstate.params['handle'];
      params['timestamp'] = timestamp;
      return params;
   }

   searchParams(opID, opTimestamp, opTarget) {
      let self = this;
      let term = opTimestamp + ".*" + opID;
      let includeTargets = '';
      let targets = this._targets.split('|');

      /*
       *  "/ui/search/result" require a "binary string" to indicate which target
       *  should be included in this search
       */
      for (let item of targets) {
        let includeTarget = '0';
        if (item.localeCompare(targets[ parseInt(opTarget, 10) ]) === 0) {
          includeTarget = '1';
        }
        includeTargets += includeTarget;
      }

      /* set up paramters for customized search */
      return {
      //   term: self.appstate.encodeSpecialCharaters(term),
      //   handle: self.appstate.params['handle'],
      //   searchFiles: "clomd\\.",
      //   include: self.appstate.encodeSpecialCharaters(includeTargets),
      };
   }

}
