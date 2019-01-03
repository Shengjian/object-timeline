import { StateTimeline, Duration } from "../../../common/visualtimeline/model/timeline.model";

export enum HitType {
   MASTER_CHANGE = 'MASTER_CHANGE',
   TRANSITION = 'TRANSITION',
   DESTROY_NODE = 'DESTROY_NODE',
   MASTER_LOST_BACKUP = 'MASTER_LOST_BACKUP',
   VMK_RECONFIG = 'VMK_RECONFIG',
   ADD_DISK = 'ADD_DISK',
   REMOVE_DISK = 'REMOVE_DISK',
   DISK_EVENT = 'DISK_EVENT',
   REBOOT_EVENT = 'REBOOT_EVENT'
}

export class HostMapping {
   public name: string;
   public uuid: string;
   public masterChangeHits: MasterHit[];
   public transitionHits: HitInfo[];
   public destroyNodeHits: HitInfo[];
   public masterLostBackupHits: HitInfo[];
   public vmkReconfigHits: HitInfo[];
   public diskEvents: HitInfo[];
   public rebootEvents: HitInfo[];
   public diskHits: HitInfo[];
   public allHits: HitInfo[] = [];
}

export class HostInfo {
   public name: string;
   public uuid: string;
   public cmpX: number;
   public cmpY: number;
   public width: number;
   public height: number;
   public masterChangeHits: MasterHit[];
   public transitionHits: HitInfo[];
   public destroyNodeHits: HitInfo[];
   public masterLostBackupHits: HitInfo[];
   public vmkReconfigHits: HitInfo[];
   public diskEvents: HitInfo[];
   public rebootEvents: HitInfo[];
   public diskHits: HitInfo[];
   public allHits: HitInfo[] = [];
   public displayedHits: HitInfo[] = [];
   public states: StateTimeline[] = [];
   public blankState: StateTimeline;
   public duration: Duration;
}

export class HitInfo {
   public data: string[];
   public hostName: string;
   public uuid: string;
   public hitString: string;
   public time: number;
   public type: string;
}

export class MasterHit extends HitInfo {
   public newMasterNode: string;
   public oldMasterNode: string;
}
