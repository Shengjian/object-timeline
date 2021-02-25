import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HardwareTopologyComponent } from './hardware.topology.component';
import { ClarityModule } from '@clr/angular';
import { HardwareTopologyService } from './hardware.topology.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      ClarityModule,
      // HttpClientModule
   ],
   providers: [ HardwareTopologyService ],
   declarations: [ HardwareTopologyComponent ],
   exports: [ HardwareTopologyComponent ]
})

export class HardwareTopologyModule {}
