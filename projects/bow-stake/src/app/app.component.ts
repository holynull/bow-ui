import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChooseWalletDlgComponent, HeaderComponent, InstallWalletDlgComponent, LanguageService, ProxyService } from 'app-lib';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    @ViewChild('header')
    header: HeaderComponent;

    constructor(public boot: ProxyService, public lang: LanguageService, private dialog: MatDialog) { }
    ngOnInit(): void {
    }

    chooseWallet() {
        let dlgRef = this.dialog.open(ChooseWalletDlgComponent, {
            height: 'auto',
            minWidth: '30%'
        });
        dlgRef.afterClosed().toPromise().then(res => {
            this.header.onLoaded();
        });
    }

    public async connectWallet() {
        if (!this.boot.isMetaMaskInstalled() && !this.boot.isBinanceInstalled()) {
            this.dialog.open(InstallWalletDlgComponent, {
                height: 'auto',
                width: '30%'
            });
            return;
        } else {
            this.chooseWallet();
        }
    }

    public getVpDiff() {
        let r = this.boot.poolInfo.virtualPrice.minus(1).multipliedBy(100).abs();
        if (r.comparedTo(100) === 0) {
            return null;
        } else {
            return r;
        }
    }
}
