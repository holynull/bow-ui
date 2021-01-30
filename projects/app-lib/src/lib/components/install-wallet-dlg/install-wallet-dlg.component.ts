import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BootService } from '../../services/boot.service';

@Component({
    selector: 'app-intall-wallet-dlg',
    templateUrl: './install-wallet-dlg.component.html',
    styleUrls: ['./install-wallet-dlg.component.less']
})
export class InstallWalletDlgComponent implements OnInit {

    constructor(public boot: BootService, public dialogRef: MatDialogRef<InstallWalletDlgComponent>) { }

    ngOnInit(): void {
    }
    connectWC() {
        this.dialogRef.close();
        this.boot.connectWC();
    }
}
