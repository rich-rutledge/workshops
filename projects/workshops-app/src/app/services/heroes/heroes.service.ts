import { AddHeroModel, HeroModel } from './hero.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { HeroSearchResultsModel } from './hero-search-results.model';
import { Injectable } from '@angular/core';
import { MessageService } from '../message/message.service';
import { heroSearchResultsPageSizeOptions } from './hero-search-results-page-size.type';

@Injectable({ providedIn: 'root' })
export class HeroesService {
  public readonly validPageSizes: readonly number[] =
    heroSearchResultsPageSizeOptions;
  private readonly heroesUrl: string = 'http://localhost:5000/api/heroes';
  private readonly httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  public constructor(
    private readonly httpClient: HttpClient,
    private readonly messageService: MessageService
  ) {}

  public readonly getTopHeroes = (count: number): Observable<HeroModel[]> =>
    this.httpClient
      .get<HeroModel[]>(`${this.heroesUrl}/top-heroes`, {
        params: { count },
      })
      .pipe(
        tap({ next: (): void => this.log(`fetched top ${count} heroes`) }),
        catchError(
          (error: any): Observable<any> =>
            this.handleError<any>(error, 'getTopHeroes', [])
        )
      );

  public readonly resetTopHeroes = (count: number): Observable<HeroModel[]> =>
    this.httpClient
      .put<HeroModel[]>(`${this.heroesUrl}/top-heroes/reset`, undefined, {
        params: { count },
      })
      .pipe(
        catchError(
          (error: any): Observable<any> =>
            this.handleError<any>(error, `resetTopHeroes`)
        )
      );

  public readonly getHero = (id: number): Observable<HeroModel> =>
    this.httpClient.get<HeroModel>(`${this.heroesUrl}/${id}`).pipe(
      tap({ next: (): void => this.log(`fetched hero id=${id}`) }),
      catchError(
        (error: any): Observable<any> =>
          this.handleError<any>(error, `getHero id=${id}`)
      )
    );

  public readonly searchHeroes = (
    searchTerm: string,
    pageSize: number,
    pageNumber: number
  ): Observable<HeroSearchResultsModel> =>
    !searchTerm.trim()
      ? of([])
      : this.httpClient
          .get<HeroSearchResultsModel>(this.heroesUrl, {
            params: {
              searchTerm,
              pageSize,
              pageNumber,
            },
          })
          .pipe(
            tap({
              next: (searchResults: HeroSearchResultsModel): void =>
                this.log(
                  `found ${searchResults.totalResultCount} heroes matching "${searchTerm}"`
                ),
            }),
            catchError(
              (error: any): Observable<any> =>
                this.handleError<any>(error, 'searchHeroes', [])
            )
          );

  public readonly addHero = (hero: AddHeroModel): Observable<HeroModel> =>
    this.httpClient
      .post<HeroModel>(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap({
          next: (newHero: HeroModel): void =>
            this.log(`added hero w/ id=${newHero.id}`),
        }),
        catchError(
          (error: any): Observable<any> =>
            this.handleError<any>(error, 'addHero')
        )
      );

  public readonly deleteHero = (id: number): Observable<undefined> =>
    this.httpClient
      .delete<undefined>(`${this.heroesUrl}/${id}`, this.httpOptions)
      .pipe(
        tap({ next: () => this.log(`deleted hero id=${id}`) }),
        catchError(
          (error: any): Observable<any> =>
            this.handleError<any>(error, 'deleteHero')
        )
      );

  public readonly updateHero = (hero: HeroModel): Observable<any> =>
    this.httpClient.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap({ next: () => this.log(`updated hero id=${hero.id}`) }),
      catchError(
        (error: any): Observable<any> =>
          this.handleError<any>(error, 'updateHero')
      )
    );

  private readonly handleError = <T>(
    error: any,
    operation = 'operation',
    result?: T
  ): Observable<T | undefined> => {
    // TODO: send the error to remote logging infrastructure
    console.error(error); // log to console instead

    this.log(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning a result
    return of(result);
  };

  private readonly log = (message: string): void =>
    this.messageService.add(`Heroes Service: ${message}`);
}
