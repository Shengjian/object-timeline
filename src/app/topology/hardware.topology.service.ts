import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HardwareTopologyService {
   constructor(private http: HttpClient) {}

   public apiUrl: 'https://10.40.192.40/redfish/v1/Systems/1/Storage/Hcm/HcmDrives/';

   public getDevices() {
      return this.http.get(this.apiUrl).subscribe(result => {
         console.log(result);
      });
   }
}
