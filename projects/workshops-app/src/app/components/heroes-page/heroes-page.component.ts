import { AsyncPipe, NgClass } from '@angular/common';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeroModel } from '../../services/heroes/hero.model';
import { HeroesService } from '../../services/heroes/heroes.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-heroes-page',
  standalone: true,
  imports: [AsyncPipe, NgClass, RouterLink, FormsModule],
  templateUrl: './heroes-page.component.html',
  styleUrl: './heroes-page.component.scss',
})
export class HeroesPageComponent {
  public readonly disablePreviousPageButton$: Observable<boolean>;
  public readonly disableNextPageButton$: Observable<boolean>;

  public constructor(public readonly heroesService: HeroesService) {
    this.disablePreviousPageButton$ = this.heroesService.pageNumber$.pipe(
      map((pageNumber: number): boolean => pageNumber === 0),
      shareReplay(1)
    );
    this.disableNextPageButton$ = combineLatest({
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
      ),
      shareReplay(1)
    );
  }

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
