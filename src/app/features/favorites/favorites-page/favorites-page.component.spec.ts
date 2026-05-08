import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { FavoritesPageComponent } from './favorites-page.component';
import { RatingsService } from '../../../core/services/ratings.service';

describe('FavoritesPageComponent', () => {
  let component: FavoritesPageComponent;
  let fixture: ComponentFixture<FavoritesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesPageComponent],
      providers: [
        {
          provide: RatingsService,
          useValue: {
            getRatings: () => of([]),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
