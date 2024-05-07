import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { randomDelayInterceptor } from './interceptors/heroes/random-delay.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([randomDelayInterceptor])),
  ],
};
