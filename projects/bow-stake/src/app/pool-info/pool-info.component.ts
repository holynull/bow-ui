import { Component, OnInit } from '@angular/core';
import { ProxyService } from 'app-lib';
import BigNumber from 'bignumber.js';

@Component({
    selector: 'app-pool-info',
    templateUrl: './pool-info.component.html',
    styleUrls: ['./pool-info.component.less']
})
export class PoolInfoComponent implements OnInit {

    constructor(public boot: ProxyService) { }

    ngOnInit(): void {
    }
    allocationPercent() {
        return this.boot.poolInfo.allocPoint.div(this.boot.poolInfo.totalAllocPoint).multipliedBy(100);
    }

    farmingRewardPercent() {
        return this.boot.poolInfo.shareRewardRate.multipliedBy(100);
    }

    volRewardPercent() {
        return this.boot.poolInfo.swapRewardRate.multipliedBy(100);
    }

    tokenBalance() {
        return this.boot.poolInfo.tokenShareBalance.plus(this.boot.poolInfo.tokenSwapBalance);
    }
}
