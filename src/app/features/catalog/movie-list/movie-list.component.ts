import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MovieCardComponent, MovieCardViewModel } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css'
})
export class MovieListComponent {
  protected readonly movies: MovieCardViewModel[] = [
    {
      title: 'Inception',
      year: 2010,
      rating: 5,
      ratingLabel: '4.5K Me gusta',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg'
    },
    {
      title: 'Interstellar',
      year: 2014,
      rating: 5,
      ratingLabel: '4.5K Me gusta',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg'
    },
    {
      title: 'Parasite',
      year: 2019,
      rating: 5,
      ratingLabel: '4.5K Me gusta',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png'
    },
    {
      title: 'Pulp Fiction',
      year: 1994,
      rating: 5,
      ratingLabel: '4.5K Me gusta',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/8/82/Pulp_Fiction_cover.jpg'
    },
    {
      title: 'The Godfather',
      year: 1972,
      rating: 5,
      ratingLabel: '4.5K Me gusta',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg'
    },
    {
      title: 'Roma',
      year: 2018,
      rating: 4,
      ratingLabel: '3.5K Me gusta',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Roma_%282018_film%29.png'
    },
    {
      title: 'Amelie',
      year: 2001,
      rating: 4,
      ratingLabel: '3.5K Me gusta',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Amelie_poster.jpg'
    },
    {
      title: 'V de Vendetta',
      year: 2005,
      rating: 5,
      ratingLabel: '4.5K Me gusta',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Vforvendetta_m.jpg'
    }
  ];
}
