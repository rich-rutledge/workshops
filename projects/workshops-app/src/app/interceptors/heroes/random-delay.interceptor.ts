import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, delay } from 'rxjs';

export const randomDelayInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> =>
  next(request).pipe(delay(Math.round(Math.random()) * 1000));
