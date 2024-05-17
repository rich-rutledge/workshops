import { AsyncPipe, NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HeroModel } from '../../services/heroes/hero.model';
import { HeroSearchResultsModel } from '../../services/heroes/hero-search-results.model';
import { HeroesService } from '../../services/heroes/heroes.service';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-heroes-page',
  standalone: true,
  imports: [AsyncPipe, NgClass, RouterLink, FormsModule],
  templateUrl: './heroes-page.component.html',
  styleUrl: './heroes-page.component.scss',
})
export class HeroesPageComponent implements OnDestroy {
  // Should something outside of this class, including the template, be able
  // to change these fields???
  public searchResults: HeroModel[] = [];

  private readonly subscriptions: Subscription = new Subscription();

  public constructor(public readonly heroesService: HeroesService) {
    this.heroesService.searchResults$.subscribe({
      next: (result: HeroSearchResultsModel): void => {
        this.searchResults = result.heroes ?? [];
      },
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
        .subscribe({
          next: (): void => {},
        });
    }
  };

  public readonly deleteButtonClicked = (
    event: MouseEvent,
    hero: HeroModel
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    this.heroesService.deleteHero(hero.id).subscribe({
      next: (): void => {},
    });
  };
}
