import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeroModel } from '../../services/heroes/hero.model';
import { HeroesService } from '../../services/heroes/heroes.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-hero-details-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './hero-details-page.component.html',
  styleUrl: './hero-details-page.component.scss',
})
export class HeroDetailsPageComponent {
  public hero?: HeroModel;

  public constructor(
    private readonly route: ActivatedRoute,
    private readonly heroService: HeroesService,
    private readonly location: Location
  ) {
    const id = parseInt(this.route.snapshot.paramMap.get('id') ?? '', 10);
    this.heroService.getHero(id).subscribe({
      next: (hero: HeroModel | undefined): void => {
        this.hero = hero;

        if (this.hero) {
          this.hero = { ...this.hero, views: this.hero.views + 1 };
          this.heroService.updateHero(this.hero).subscribe();
        }
      },
    });
  }

  public readonly goBackClicked = (): void => {
    this.goBack();
  };

  public readonly saveClicked = (): void => {
    if (this.hero) {
      this.heroService.updateHero(this.hero).subscribe(() => this.goBack());
    }
  };

  private readonly goBack = (): void => {
    this.location.back();
  };
}
