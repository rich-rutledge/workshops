import { HeroModel } from './hero.model';

export interface HeroSearchResultsModel {
  readonly heroes?: HeroModel[] | null;
  readonly totalResultCount: number;
}
