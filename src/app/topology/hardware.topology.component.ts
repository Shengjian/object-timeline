import { Component, AfterViewInit } from '@angular/core';
import { HardwareTopologyService } from './hardware.topology.service';
// import { ManagedObject } from '../../vsan/common/managed-object';
// import { Icon } from '../../vsan/common/icon';
// import { VsanHardwareTopologyPropertyProvider } from '../../generated/vsan-hardware-topology-property-provider';
// import { VsanHostDisksData } from '../../generated/vsan-host-disks-data';
// import { VsanDiskDataEx } from '../../generated/vsan-disk-data-ex';
import { Http } from '@angular/http';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hardware-topology',
  templateUrl: './hardware.topology.component.html',
  styleUrls: ['./hardware.topology.component.css']
})

export class HardwareTopologyComponent implements AfterViewInit {
   BG_IMAGE_URL = '../../../images/png/dellServerFront.png';
   SLOT_IMAGE_URL = '../../../images/png/dellDevice.png';
   LED_IMAGE_URL = '../../../images/png/deviceLed.png';

   deviceData = {
      'devices': [
         {
            'ctrl': 'lsi_msgpt3',
            'slot': '1',
            'disk': 'naa.5000c5005d7952fb',
            'vendor': 'IBM-ESXS',
            'healthStatus': 'OK',
            'capacity': '286102MB',
            'temperature': '42',
            'ssd': 'HDD'
         }
         ,
         {
            'ctrl': 'lsi_msgpt3',
            'slot': '4',
            'disk': 'naa.5000cca7dcce5ba7',
            'vendor': 'ATA',
            'healthStatus': 'OK',
            'capacity': '953869MB',
            'temperature': '31',
            'ssd': 'HDD'
         }
         ,
         {
            'ctrl': 'lsi_msgpt3',
            'slot': '6',
            'disk': 'naa.5000c500558d005f',
            'vendor': 'SEAGATE',
            'healthStatus': 'OK',
            'capacity': '476940MB',
            'temperature': '39',
            'ssd': 'HDD'
         }
      ],
      'count': '3'
   };

   showSlot0: boolean = false;
   showSlot1: boolean = false;
   showSlot2: boolean = false;
   showSlot3: boolean = false;
   showSlot4: boolean = false;
   showSlot5: boolean = false;
   showSlot6: boolean = false;
   showSlot7: boolean = false;
   showSlot8: boolean = false;
   showSlot9: boolean = false;
   showSlot10: boolean = false;
   showSlot11: boolean = false;
   showSlot12: boolean = false;
   showSlot13: boolean = false;
   showSlot14: boolean = false;
   showSlot15: boolean = false;

   showLed0: boolean = true;
   showLed1: boolean = true;
   showLed2: boolean = true;
   showLed3: boolean = true;
   showLed4: boolean = true;
   showLed5: boolean = true;
   showLed6: boolean = true;
   showLed7: boolean = true;
   showLed8: boolean = true;
   showLed9: boolean = true;
   showLed10: boolean = true;
   showLed11: boolean = true;
   showLed12: boolean = true;
   showLed13: boolean = true;
   showLed14: boolean = true;
   showLed15: boolean = true;

  //  selectedDevice: VsanDiskDataEx = undefined;
   selectedDevice: any = undefined;
   selectedDeviceIndex: number;

   deviceCtrl: string = '';
   deviceSlot: string = '';
   deviceDisk: string = '';
   deviceVendor: string = '';
   deviceHealth: string = '';
   deviceCapacity: string = '';
   deviceTemperature: string = '';
   deviceSsd: string = '';

  //  private objectId:ManagedObject;
  //  private selectedHost:VsanHostDisksData;
  //  private hosts: VsanHostDisksData[] = [];
  //  private Icon = Icon;

   constructor(private http: Http) {}

   ngAfterViewInit() {
      // this.objectId = ManagedObject.contextObject;
      // this.getHostsDisksInfo();
      this.refresh();
   }

   refresh() {
      this.http.get('https://10.40.192.40/redfish/v1/Systems/1/Storage/Hcm/HcmDrives/')
         .subscribe(result => {
            console.log(result);
         });
      this.selectedDevice = undefined;
      // let devices = this.selectedHost.disks;
      let devices = this.deviceData.devices;
      for (let device of devices) {
        //  device.capacity = device.capacity * 1024 * 1024;
         device.temperature = device.temperature ? device.temperature : '-';
         device.healthStatus = device.healthStatus ? device.healthStatus : '-';
         let slot = 'showSlot' + device.slot;
         this[slot] = true;
         let led = 'showLed' + device.slot;
         this[led] = true;
      }
   }

  //  getHostsDisksInfo() {
  //     this.hardwareTopologyProvider.getHostsDisksInfo(this.objectId).then(this.populateData);
  //  }

  //  private populateData = (resultData: VsanHostDisksData[]) => {
  //     console.log(resultData);
  //     this.hosts = resultData;
  //     if (resultData.length > 0) {
  //        this.selectedHost = resultData[0];
  //        this.refresh();
  //     }
  //  }

  //  hostChangeHandler(host: VsanHostDisksData): void {
  //     this.selectedHost = host;
  //     this.refresh();
  //  }

   turnOnLed() {
      if (!this.selectedDevice) {
         return;
      }
      // this.turnOffLed();
      let slot = 'showLed' + this.selectedDeviceIndex;
      this[slot] = false;
   }

   turnOffLed() {
      if (!this.selectedDevice) {
         return;
      }

      let slot = 'showLed' + this.selectedDeviceIndex;
      this[slot] = true;
   }

   getSlotDetailsClass(): any {
     return 'show-device';
      // return this.selectedDevice ? 'show-device': 'hide-device';
   }

   getSlotClass(slotNo: number): any {
     return 'show-device';
      // return this['showSlot' + slotNo] ? 'show-device': 'hide-device';
   }

   getLedClass(ledNo: number): any {
      console.log('ledNo -- > ' + ledNo);
      return this['showSlot' + ledNo] && this['showLed' + ledNo] ? 'show-device' : 'hide-device';
   }

   getBorderClass(index: number): any {
      // console.log('index -- > ' + index);
      return this.selectedDevice && this.selectedDeviceIndex === index ? 'show-device' : 'hide-device';
   }

   showDeviceInfo(deviceNo: number) {
      // let devices = this.selectedHost.disks;
      let devices = this.deviceData.devices;
      this.selectedDeviceIndex = deviceNo;
      for (let device of devices) {
         if (Number(device.slot) === deviceNo) {
            this.selectedDevice = device;
            this.selectedDevice.temperature = 'None';
            // this.selectedDevice.capacity = this.selectedDevice.capacity * 1024 *1024;
            break;
         }
      }
   }
}
