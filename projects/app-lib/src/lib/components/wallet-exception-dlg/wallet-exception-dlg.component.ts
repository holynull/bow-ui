import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnvService } from '../../services/env.service';

@Component({
    selector: 'app-wallet-exception-dlg',
    templateUrl: './wallet-exception-dlg.component.html',
    styleUrls: ['./wallet-exception-dlg.component.less']
})
export class WalletExceptionDlgComponent implements OnInit {

    content: string;

    liquditySymbol: string = this.env.environment.liquiditySymbol;

    constructor(@Inject(MAT_DIALOG_DATA) public dlgData: any, private dialogRef: MatDialogRef<WalletExceptionDlgComponent>, private env: EnvService) {
        this.content = dlgData.content;
    }

    ngOnInit(): void {
    }

}
