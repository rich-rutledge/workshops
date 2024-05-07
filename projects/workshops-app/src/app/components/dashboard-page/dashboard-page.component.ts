import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeroModel } from '../../services/heroes/hero.model';
import { HeroSearchComponent } from '../hero-search/hero-search.component';
import { HeroesService } from '../../services/heroes/heroes.service';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [HeroSearchComponent, FormsModule, RouterLink, UpperCasePipe],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  public topHeroes: HeroModel[] = [];

  public constructor(private readonly heroesService: HeroesService) {
    this.heroesService.getTopHeroes(4).subscribe({
      next: (topHeroes: HeroModel[]): void => {
        this.topHeroes = topHeroes;
      },
    });
  }

  public resetTopHeroesButtonClicked = (): void => {
    this.heroesService.resetTopHeroes(4).subscribe({
      next: (result: HeroModel[]): void => {
        this.topHeroes = result;
      },
    });
  };
}
