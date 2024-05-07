export interface AddHeroModel {
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly views: number;
}
export interface HeroModel extends AddHeroModel {
  readonly id: number;
}
