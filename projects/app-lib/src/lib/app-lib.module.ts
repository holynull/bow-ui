import { NgModule } from '@angular/core';
import { AppLibComponent } from './app-lib.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BootService } from './services/boot.service';
import { ModuleWithProviders } from '@angular/core';
import { AddlpSlippageConfirmComponent } from './components/addlp-slippage-confirm/addlp-slippage-confirm.component';
import { ApproveDlgComponent } from './components/approve-dlg/approve-dlg.component';
import { SwapConfirmComponent } from './components/swap-confirm/swap-confirm.component';
import { UnsupportedNetworkComponent } from './components/unsupported-network/unsupported-network.component';
import { WalletExceptionDlgComponent } from './components/wallet-exception-dlg/wallet-exception-dlg.component';
import { FormsModule } from '@angular/forms';
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