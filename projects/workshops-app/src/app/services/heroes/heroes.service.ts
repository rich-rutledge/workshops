import { AddHeroModel, HeroModel } from './hero.model';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';

import { HeroSearchResultsModel } from './hero-search-results.model';
import { Injectable } from '@angular/core';
import { MessageService } from '../message/message.service';
import { heroSearchResultsPageSizeOptions } from './hero-search-results-page-size.type';

@Injectable({ providedIn: 'root' })
export class HeroesService {
  public readonly pageCount$: Observable<number>;
  public readonly pageSize$: Observable<number>;
  public readonly pageNumber$: Observable<number>;
  public readonly searchResults$: Observable<HeroSearchResultsModel>;
  public readonly searchTerm$: Observable<string>;
  public readonly validPageSizes: readonly number[] =
    heroSearchResultsPageSizeOptions;
  private readonly heroesUrl: string = 'http://localhost:5000/api/heroes';
  private readonly httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  private readonly pageSizeBS: BehaviorSubject<number> = new BehaviorSubject(
    this.validPageSizes[0]
  );
  private readonly pageNumberBS: BehaviorSubject<number> = new BehaviorSubject(
    0
  );
  private readonly searchTermBS: BehaviorSubject<string> = new BehaviorSubject(
    ''
  );

  public constructor(
    private readonly httpClient: HttpClient,
    private readonly messageService: MessageService
  ) {
    this.pageSize$ = this.pageSizeBS.asObservable();
    this.pageNumber$ = this.pageNumberBS.asObservable();
    this.searchTerm$ = this.searchTermBS.asObservable();

    this.searchResults$ = combineLatest({
      pageSize: this.pageSize$,
      pageNumber: this.pageNumber$,
      searchTerm: this.searchTerm$,
    }).pipe(
      switchMap(
        ({
          pageSize,
          pageNumber,
          searchTerm,
        }: {
          pageSize: number;
          pageNumber: number;
          searchTerm: string;
        }): Observable<HeroSearchResultsModel> =>
          !searchTerm
            ? of({ heroes: [], totalResultCount: 0 })
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
                    (
                      error: HttpErrorResponse
                    ): Observable<HeroSearchResultsModel> =>
                      this.handleErrorWithDefault(error, 'searchHeroes', {
                        heroes: [],
                        totalResultCount: 0,
                      })
                  )
                )
      ),
      shareReplay(1)
    );

    this.pageCount$ = combineLatest({
      searchResults: this.searchResults$,
      pageSize: this.pageSize$,
    }).pipe(
      map(
        ({
          searchResults,
          pageSize,
        }: {
          searchResults: HeroSearchResultsModel;
          pageSize: number;
        }): number => Math.ceil(searchResults.totalResultCount / pageSize)
      ),
      shareReplay(1)
    );
  }

  public readonly setSearchTerm = (searchTerm: string): void =>
    this.searchTermBS.next(searchTerm);

  public readonly setPageSize = (pageSize: number): void =>
    this.pageSizeBS.next(pageSize);

  public readonly movePageNumber = (pages: number): void =>
    this.pageNumberBS.next(this.pageNumberBS.value + pages);

  public readonly getTopHeroes = (count: number): Observable<HeroModel[]> =>
    this.httpClient
      .get<HeroModel[]>(`${this.heroesUrl}/top-heroes`, {
        params: { count },
      })
      .pipe(
        tap({ next: (): void => this.log(`fetched top ${count} heroes`) }),
        catchError(
          (error: HttpErrorResponse): Observable<HeroModel[]> =>
            this.handleErrorWithDefault(error, 'getTopHeroes', [])
        ),
        shareReplay(1)
      );

  public readonly resetTopHeroes = (count: number): Observable<HeroModel[]> =>
    this.httpClient
      .put<HeroModel[]>(`${this.heroesUrl}/top-heroes/reset`, undefined, {
        params: { count },
      })
      .pipe(
        catchError(
          (error: HttpErrorResponse): Observable<HeroModel[]> =>
            this.handleErrorWithDefault(error, `resetTopHeroes`, [])
        ),
        shareReplay(1)
      );

  public readonly getHero = (id: number): Observable<HeroModel | undefined> =>
    this.httpClient.get<HeroModel>(`${this.heroesUrl}/${id}`).pipe(
      tap({ next: (): void => this.log(`fetched hero id=${id}`) }),
      catchError(
        (error: HttpErrorResponse): Observable<undefined> =>
          this.handleError(error, `getHero id=${id}`)
      ),
      shareReplay(1)
    );

  public readonly addHero = (
    hero: AddHeroModel
  ): Observable<HeroModel | undefined> =>
    this.httpClient
      .post<HeroModel>(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap({
          next: (newHero: HeroModel): void =>
            this.log(`added hero w/ id=${newHero.id}`),
        }),
        catchError(
          (error: HttpErrorResponse): Observable<undefined> =>
            this.handleError(error, 'addHero')
        ),
        shareReplay(1)
      );

  public readonly deleteHero = (id: number): Observable<undefined> =>
    this.httpClient
      .delete<undefined>(`${this.heroesUrl}/${id}`, this.httpOptions)
      .pipe(
        tap({ next: () => this.log(`deleted hero id=${id}`) }),
        catchError(
          (error: HttpErrorResponse): Observable<undefined> =>
            this.handleError(error, 'deleteHero')
        ),
        shareReplay(1)
      );

  public readonly updateHero = (
    hero: HeroModel
  ): Observable<HeroModel | undefined> =>
    this.httpClient.put<HeroModel>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap({ next: () => this.log(`updated hero id=${hero.id}`) }),
      catchError(
        (error: HttpErrorResponse): Observable<undefined> =>
          this.handleError(error, 'updateHero')
      ),
      shareReplay(1)
    );

  private readonly handleError = (
    error: HttpErrorResponse,
    operation: string
  ): Observable<undefined> =>
    this.handleErrorWithDefault(error, operation, undefined);

  private readonly handleErrorWithDefault = <T>(
    error: HttpErrorResponse,
    operation: string,
    result: T
  ): Observable<T> => {
    // TODO: send the error to remote logging infrastructure
    console.error(error); // log to console instead

    this.log(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning a result
    return of(result);
  };

  private readonly log = (message: string): void =>
    this.messageService.add(`Heroes Service: ${message}`);
}
