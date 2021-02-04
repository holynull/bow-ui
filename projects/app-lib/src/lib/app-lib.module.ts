import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppLibComponent } from './app-lib.component';
import { AddlpSlippageConfirmComponent } from './components/addlp-slippage-confirm/addlp-slippage-confirm.component';
import { ApproveDlgComponent } from './components/approve-dlg/approve-dlg.component';
import { ChooseWalletDlgComponent } from './components/choose-wallet-dlg/choose-wallet-dlg.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { InstallWalletDlgComponent } from './components/install-wallet-dlg/install-wallet-dlg.component';
import { SwapConfirmComponent } from './components/swap-confirm/swap-confirm.component';
import { UnsupportedNetworkComponent } from './components/unsupported-network/unsupported-network.component';
import { WalletExceptionDlgComponent } from './components/wallet-exception-dlg/wallet-exception-dlg.component';
import { EnvService } from './services/env.service';


@NgModule({
    declarations: [
        AppLibComponent,
        HeaderComponent,
        FooterComponent,
        AddlpSlippageConfirmComponent,
        ApproveDlgComponent,
        SwapConfirmComponent,
        UnsupportedNetworkComponent,
        WalletExceptionDlgComponent,
        ChooseWalletDlgComponent,
        InstallWalletDlgComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            }
        }),
        HttpClientModule,
        MatProgressBarModule,
        MatDialogModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        FormsModule,
    ],
    exports: [
        AppLibComponent,
        HeaderComponent,
        FooterComponent,
        CommonModule,
        TranslateModule,
        HttpClientModule,
        AddlpSlippageConfirmComponent,
        ApproveDlgComponent,
        SwapConfirmComponent,
        UnsupportedNetworkComponent,
        ChooseWalletDlgComponent,
        InstallWalletDlgComponent,
    ]
})
export class AppLibModule {
    public static forRoot(environment: any): ModuleWithProviders<AppLibModule> {

        return {
            ngModule: AppLibModule,
            providers: [
                EnvService,
                {
                    provide: 'environment', // you can also use InjectionToken
                    useValue: environment
                }
            ]
        };
    }
}
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}