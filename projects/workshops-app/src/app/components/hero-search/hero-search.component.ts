import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeroModel } from '../../services/heroes/hero.model';
import { HeroSearchResultsModel } from '../../services/heroes/hero-search-results.model';
import { HeroesService } from '../../services/heroes/heroes.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [AsyncPipe, FormsModule, RouterLink],
  templateUrl: './hero-search.component.html',
  styleUrl: './hero-search.component.scss',
})
export class HeroSearchComponent {
  public get heroSearchResults(): readonly HeroModel[] {
    return this._heroSearchResults;
  }

  public get searchTerm(): string {
    return this._searchTerm;
  }
  public set searchTerm(value: string) {
    this._searchTerm = value;
    this.searchHeroes();
  }

  private _searchTerm: string = '';
  private _heroSearchResults: HeroModel[] = [];
  private timer?: number;

  public constructor(private readonly heroService: HeroesService) {}

  private readonly searchHeroes = (): void => {
    window.clearTimeout(this.timer);

    this.timer = window.setTimeout((): void => {
      if (this.searchTerm) {
        this.heroService.searchHeroes(this.searchTerm, 10, 0).subscribe({
          next: (result: HeroSearchResultsModel): void => {
            this._heroSearchResults = result.heroes ?? [];
          },
        });
      } else {
        this._heroSearchResults = [];
      }
    }, 300);
  };
}
