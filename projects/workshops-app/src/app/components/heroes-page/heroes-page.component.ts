import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeroModel } from '../../services/heroes/hero.model';
import { HeroSearchResultsModel } from '../../services/heroes/hero-search-results.model';
import { HeroesService } from '../../services/heroes/heroes.service';
import { RouterLink } from '@angular/router';

interface ViewModel {
  searchTerm: string;
  pageSize: number;
  pageCount: number;
  pageNumber: number;
  searchResults: HeroSearchResultsModel;
  disablePreviousPageButton: boolean;
  disableNextPageButton: boolean;
}

@Component({
  selector: 'app-heroes-page',
  standalone: true,
  imports: [AsyncPipe, NgClass, NgIf, RouterLink, FormsModule],
  templateUrl: './heroes-page.component.html',
  styleUrl: './heroes-page.component.scss',
})
export class HeroesPageComponent {
  public readonly viewModel$: Observable<ViewModel> = combineLatest({
    searchTerm: this.heroesService.searchTerm$,
    pageSize: this.heroesService.pageSize$,
    pageCount: this.heroesService.pageCount$,
    pageNumber: this.heroesService.pageNumber$,
    searchResults: this.heroesService.searchResults$,
    disablePreviousPageButton: this.heroesService.pageNumber$.pipe(
      map((pageNumber: number): boolean => pageNumber === 0)
    ),
    disableNextPageButton: combineLatest({
      pageCount: this.heroesService.pageCount$,
      pageNumber: this.heroesService.pageNumber$,
    }).pipe(
      map(
        ({
          pageCount,
          pageNumber,
        }: {
          pageCount: number;
          pageNumber: number;
        }): boolean => pageNumber === pageCount - 1
      )
    ),
  }).pipe(shareReplay(1));

  public constructor(public readonly heroesService: HeroesService) {}

  public readonly addButtonClicked = (
    name: string,
    description: string,
    imageUrl: string
  ): void => {
    name = name.trim();

    if (name) {
      this.heroesService
        .addHero({ name, description, imageUrl, views: 0 })
        .subscribe();
    }
  };

  public readonly deleteButtonClicked = (
    event: MouseEvent,
    hero: HeroModel
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    this.heroesService.deleteHero(hero.id).subscribe();
  };
}
