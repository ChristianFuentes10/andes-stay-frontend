import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { CallbackComponent } from './features/callback/callback.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { AuditComponent } from './features/audit/audit.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalog' },
  { path: 'login', component: LoginComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'catalog', component: CatalogComponent, canActivate: [authGuard] },
  { path: 'audit', component: AuditComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: 'catalog' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
