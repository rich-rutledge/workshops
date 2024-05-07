import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DashboardPageComponent } from './dashboard-page.component';
import { HeroSearchComponent } from '../hero-search/hero-search.component';
import { HeroesService } from '../../services/heroes/heroes.service';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';

const HEROES: any[] = [
  { id: 12, name: 'Dr. Nice', views: 0 },
  { id: 13, name: 'Bombasto', views: 0 },
  { id: 14, name: 'Celeritas', views: 0 },
  { id: 15, name: 'Magneta', views: 0 },
  { id: 16, name: 'RubberMan', views: 0 },
  { id: 17, name: 'Dynama', views: 0 },
  { id: 18, name: 'Dr. IQ', views: 0 },
  { id: 19, name: 'Magma', views: 0 },
  { id: 20, name: 'Tornado', views: 0 },
];

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let heroService;
  let getHeroesSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    heroService = jasmine.createSpyObj('HeroService', ['getHeroes']);
    getHeroesSpy = heroService.getHeroes.and.returnValue(of(HEROES));

    TestBed.configureTestingModule({
      declarations: [DashboardPageComponent, HeroSearchComponent],
      imports: [RouterModule.forRoot([])],
      providers: [{ provide: HeroesService, useValue: heroService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
  }));

  it('should display "Top Heroes" as headline', () => {
    expect(fixture.nativeElement.querySelector('h2').textContent).toEqual(
      'Top Heroes'
    );
  });

  it('should call heroService', waitForAsync(() => {
    expect(getHeroesSpy.calls.any()).toBe(true);
  }));

  it('should display 4 links', waitForAsync(() => {
    expect(fixture.nativeElement.querySelectorAll('a').length).toEqual(4);
  }));
});
