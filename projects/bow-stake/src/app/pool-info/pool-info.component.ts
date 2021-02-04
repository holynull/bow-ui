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

    farmingRewardAmt() {
        return this.boot.poolInfo.shareRewardRate.multipliedBy(this.boot.poolInfo.tokenBalance.multipliedBy(this.allocationPercent().div(100))).toFormat(2, BigNumber.ROUND_DOWN) + " " + this.boot.tokenSymbol;
    }

    volRewardPercent() {
        return this.boot.poolInfo.swapRewardRate.multipliedBy(100);
    }

    volRewardAmt() {
        return this.boot.poolInfo.swapRewardRate.multipliedBy(this.boot.poolInfo.tokenBalance.multipliedBy(this.allocationPercent().div(100))).toFormat(2, BigNumber.ROUND_DOWN) + " " + this.boot.tokenSymbol;
    }

    tokenBalance() {
        return this.boot.poolInfo.tokenBalance.multipliedBy(this.allocationPercent()).div(100);
    }
}
