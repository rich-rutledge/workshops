import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeroModel } from '../../services/heroes/hero.model';
import { HeroSearchResultsModel } from '../../services/heroes/hero-search-results.model';
import { HeroesService } from '../../services/heroes/heroes.service';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-heroes-page',
  standalone: true,
  imports: [NgClass, RouterLink, FormsModule],
  templateUrl: './heroes-page.component.html',
  styleUrl: './heroes-page.component.scss',
})
export class HeroesPageComponent {
  // Should something outside of this class, including the template, be able
  // to change these fields???
  public searchResults: HeroModel[] = [];
  public pageCount: number = 0;

  public get pageNumber(): number {
    return this._pageNumber;
  }
  public set pageNumber(value: number) {
    this._pageNumber = value;
    this.searchHeroes();
  }

  public get pageSize(): number {
    return this._pageSize;
  }
  public set pageSize(value: number) {
    this._pageSize = value;
    this._pageNumber = 0;
    this.searchHeroes();
  }

  public get searchTerm(): string {
    return this._searchTerm;
  }
  public set searchTerm(value: string) {
    this._searchTerm = value;
    this._pageNumber = 0;
    this.searchHeroes();
  }

  private _pageNumber: number = 0;
  private _pageSize: number = 10;
  private _searchTerm: string = '';

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
        .subscribe({
          next: (): void => {
            this.searchHeroes();
          },
        });
    }
  };

  public readonly movePageNumber = (pages: number): void => {
    this.pageNumber = Math.min(
      Math.max(this.pageNumber + pages, 0),
      this.pageCount - 1
    );
  };

  public readonly deleteButtonClicked = (
    event: MouseEvent,
    hero: HeroModel
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    this.heroesService.deleteHero(hero.id).subscribe({
      next: (): void => {
        this.searchHeroes();
      },
    });
  };

  private readonly searchHeroes = (): void => {
    this.heroesService
      .searchHeroes(this.searchTerm, this.pageSize, this.pageNumber)
      .subscribe({
        next: (result: HeroSearchResultsModel): void => {
          this.searchResults = result.heroes ?? [];
          this.pageCount = Math.ceil(result.totalResultCount / this.pageSize);
        },
      });
  };
}
