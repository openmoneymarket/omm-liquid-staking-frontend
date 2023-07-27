import {bootstrapApplication} from "@angular/platform-browser";
import {AppComponent} from "./app/app.component";
import {provideRouter, withComponentInputBinding, withHashLocation} from "@angular/router";
import {APP_ROUTES} from "./app/app-routing";
import {environment} from "./environments/environment";
import {enableProdMode, importProvidersFrom} from "@angular/core";
import BigNumber from "bignumber.js";
import {HttpClientModule} from "@angular/common/http";
import {DeviceDetectorService} from "ngx-device-detector";
import {provideToastr} from "ngx-toastr";
import {provideAnimations} from "@angular/platform-browser/animations";
import log from "loglevel";

// set 18 decimals places computation precision and default ROUND DOWN mode
BigNumber.set({ DECIMAL_PLACES: 18, ROUNDING_MODE: BigNumber.ROUND_DOWN });

// set logging level
log.setLevel(environment.production ? "error" : "debug");

if (environment.production) {
    enableProdMode();
}


bootstrapApplication(AppComponent,{
    providers:[
        provideRouter(APP_ROUTES, withHashLocation(), withComponentInputBinding()),
        importProvidersFrom(HttpClientModule),
        DeviceDetectorService,
        provideAnimations(), // required animations providers
        provideToastr({
            timeOut: 5000,
            extendedTimeOut: 3000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: true,
            progressBar: true,
        }), // Toastr providers
    ]
}).catch(e => console.error("Error occurred in bootstrapApplication:", e));
