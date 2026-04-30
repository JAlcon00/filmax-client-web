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
      imageUrl: 'https://i.pinimg.com/736x/0b/e1/da/0be1dafba6a85a2b21dbb27102fd4d3b.jpg'
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
      imageUrl: 'https://i.pinimg.com/1200x/f0/01/3c/f0013ca4a05245afde43e0eaa7d1a2ce.jpg'
    },
    {
      title: 'The Godfather',
      year: 1972,
      rating: 5,
      ratingLabel: '4.5K Me gusta',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg'
    },
    {
      title: 'Amores Perros',
      year: 2000,
      rating: 5,
      ratingLabel: '3.5K Me gusta',
      imageUrl: 'https://i.pinimg.com/736x/7c/6c/b6/7c6cb6cf241d6487725d877b85571856.jpg'
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
      imageUrl: 'https://i.pinimg.com/736x/9b/22/24/9b22243e735e2ad0f018ac2bf9a0460f.jpg'
    }
  ];
}
