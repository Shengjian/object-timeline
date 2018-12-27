import { Component } from '@angular/core';

@Component({
  selector: 'ngx-clipbpard',
  templateUrl: 'ngx-clipbpard-component.html'
})

export class ClipbpardComponent { 
  isCopied1: boolean = false;
  isCopied2: boolean = false;

  testObject = {uuid: 'Test copy'};

  copyToClipboard(): void {
     this.testObject.uuid = 'new uuid';
  }

  copyElementToClipboard(element): void {
   element.select();
   document.execCommand('copy');
   // this.toaster('success', 'Success!', 'Link copied to clipboard.');
  }
}
