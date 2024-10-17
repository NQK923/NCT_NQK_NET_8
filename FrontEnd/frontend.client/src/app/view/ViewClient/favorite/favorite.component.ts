import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";


interface Manga {
  id_manga: number;
  name: string;
  author: string;
  num_of_chapter: number;
  rating: number;
  id_account: number;
  is_posted: boolean;
  cover_img: string;
  describe: string;
  updated_at: Date;
  totalViews: number
  rated_num: number
}
@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  standalone: true,
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit{
  constructor(private router: Router) {}

  ngOnInit() {

  }

}
