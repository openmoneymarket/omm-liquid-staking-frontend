import {bootstrapApplication} from "@angular/platform-browser";
import {AppComponent} from "./app/app.component";
import {provideRouter} from "@angular/router";
import {APP_ROUTES} from "./app/app-routing";


bootstrapApplication(AppComponent,{
    providers:[provideRouter(APP_ROUTES)]
}).catch(e => console.log("Error occurred in bootstrapApplication:", e));
