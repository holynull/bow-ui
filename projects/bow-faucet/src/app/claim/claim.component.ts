import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ProxyService } from 'app-lib';
export enum ApproveStatus {
    None, Approved, NoApproved
}

export enum LoadStatus {
    None, Loading, Loaded
}
@Component({
    selector: 'app-claim',
    templateUrl: './claim.component.html',
    styleUrls: ['./claim.component.less']
})
export class ClaimComponent implements OnInit {
    loadStatus: LoadStatus = LoadStatus.None;

    @Output() loading: EventEmitter<any> = new EventEmitter();
    @Output() loaded: EventEmitter<any> = new EventEmitter();
    constructor(public boot: ProxyService) { }

    ngOnInit(): void {
    }

    claim(i) {
        this.loadStatus = LoadStatus.Loading;
        this.loading.emit();
        this.boot.claimSimulationStableCoin(i).then(() => {
            this.boot.loadData().then();
            this.loadStatus = LoadStatus.Loaded;
            this.loaded.emit();
        });
    }

}
