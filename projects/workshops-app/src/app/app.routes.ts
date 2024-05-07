import { DashboardPageComponent } from './components/dashboard-page/dashboard-page.component';
import { HeroDetailsPageComponent } from './components/hero-details-page/hero-details-page.component';
import { HeroesPageComponent } from './components/heroes-page/heroes-page.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'detail/:id', component: HeroDetailsPageComponent },
  { path: 'heroes', component: HeroesPageComponent },
];
