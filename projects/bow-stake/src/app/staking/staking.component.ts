import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChooseWalletDlgComponent, InstallWalletDlgComponent, ProxyService } from 'app-lib';
import BigNumber from 'bignumber.js';

export enum ActionStatus {
    None, Transfering, TrasactionEnd
}

export enum LoadStatus {
    None, Loading, Loaded
}

@Component({
    selector: 'app-staking',
    templateUrl: './staking.component.html',
    styleUrls: ['./staking.component.less']
})
export class StakingComponent implements OnInit {

    amts: Array<number>;

    redeemPercent: number = 0;

    redeemToIndex: string = '4';

    depositPercent: number = 0;

    depositLPAmt: BigNumber = new BigNumber(0);

    needApproveLP: boolean = false;

    withdrawLPPercent: number = 0;

    withdrawLPAmt: BigNumber = new BigNumber(0);

    status: ActionStatus = ActionStatus.None;

    loadStatus: LoadStatus = LoadStatus.None;

    @Output() loading: EventEmitter<any> = new EventEmitter();
    @Output() loaded: EventEmitter<any> = new EventEmitter();


    constructor(public boot: ProxyService, private dialog: MatDialog) {
        this.amts = new Array();
        this.boot.coins.forEach((e, i, arr) => {
            this.amts.push(0);
        });
        this.boot.walletReady.subscribe(() => {
            this.updateLPApproveStatus();
        });
    }

    ngOnInit(): void {
    }


    public async connectWallet() {
        if (!this.boot.isMetaMaskInstalled() && !this.boot.isBinanceInstalled()) {
            this.dialog.open(InstallWalletDlgComponent, { width: '30em' });
            return;
        } else {
            this.chooseWallet();
        }
    }
    chooseWallet() {
        this.dialog.open(ChooseWalletDlgComponent, { width: '30em' });
    }

    updateLPApproveStatus() {
        this.boot.allowanceLP(this.boot.chainConfig.contracts.proxy.address).then(amt => {
            if (this.depositLPAmt.comparedTo(amt) > 0) {
                this.needApproveLP = true;
            } else {
                this.needApproveLP = false;
            }
        });
    }

    depositPercentChange(val) {
        this.depositPercent = val;
        if (this.depositPercent && this.depositPercent !== 0) {
            this.depositLPAmt = this.boot.balance.lp.multipliedBy(this.depositPercent).dividedBy(100);
            this.depositLPAmt = new BigNumber(this.depositLPAmt.toFixed(9, BigNumber.ROUND_DOWN));
        }
        this.updateLPApproveStatus();
    }

    approveLP() {
        this.loading.emit();
        this.loadStatus = LoadStatus.Loading;
        this.boot.approveLP(this.depositLPAmt.toFixed(9, BigNumber.ROUND_DOWN), this.boot.chainConfig.contracts.proxy.address).then(() => {
            this.updateLPApproveStatus();
            this.boot.loadData();
            this.loaded.emit();
            this.loadStatus = LoadStatus.Loaded;
        });
    }

    depositLP() {
        this.loading.emit();
        this.loadStatus = LoadStatus.Loading;
        this.boot.depositLP(this.depositLPAmt.toFixed(18, BigNumber.ROUND_DOWN)).then(() => {
            this.boot.loadData();
            this.loaded.emit();
            this.loadStatus = LoadStatus.Loaded;
            this.depositPercentChange(0);
        });
    }

    withdrawLPPercentChange(val) {
        this.withdrawLPPercent = val;
        if (this.withdrawLPPercent && this.withdrawLPPercent !== 0) {
            this.withdrawLPAmt = this.boot.balance.stakingLP.multipliedBy(this.withdrawLPPercent).dividedBy(100);
        }
    }

    withdrawLP() {
        this.loading.emit();
        this.loadStatus = LoadStatus.Loading;
        this.boot.withdrawLP(this.withdrawLPAmt.toFixed(18, BigNumber.ROUND_DOWN)).then(() => {
            this.boot.loadData();
            this.loaded.emit();
            this.loadStatus = LoadStatus.Loaded;
            this.withdrawLPPercentChange(0);
        });
    }

    withdrawAllLP() {
        this.loading.emit();
        this.loadStatus = LoadStatus.Loading;
        this.boot.emergencyWithdraw().then(() => {
            this.boot.loadData();
            this.loaded.emit();
            this.loadStatus = LoadStatus.Loaded;
        });
    }

    getPending() {
        this.loading.emit();
        this.loadStatus = LoadStatus.Loading;
        this.boot.withdrawLP("0").then(() => {
            this.boot.loadData();
            this.loaded.emit();
            this.loadStatus = LoadStatus.Loaded;
        });
    }

}
