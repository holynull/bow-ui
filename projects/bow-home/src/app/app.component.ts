import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChooseWalletDlgComponent, HeaderComponent, InstallWalletDlgComponent, LanguageService, ProxyService } from 'app-lib';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    @ViewChild('header')
    header: HeaderComponent;

    constructor(public lang: LanguageService) {

    }
    ngOnInit(): void {
    }
}
