import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './features/login/login.component';
import { CallbackComponent } from './features/callback/callback.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { AuditComponent } from './features/audit/audit.component';
import { authInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [
    App,
    LoginComponent,
    CallbackComponent,
    CatalogComponent,
    AuditComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
