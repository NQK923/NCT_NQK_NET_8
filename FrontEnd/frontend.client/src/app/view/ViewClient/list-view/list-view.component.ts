import { Component, OnInit } from '@angular/core';
import { combineLatest } from "rxjs";
import { Router } from "@angular/router";
import { MangaService } from "../../../service/Manga/manga.service";
import { MangaViewHistoryService } from "../../../service/MangaViewHistory/MangaViewHistory.service";
import { CategoriesService } from "../../../service/Categories/Categories.service";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service";



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

interface Category {
  id_category: number;
  name: string;
}
@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css']
})

export class ListViewComponent implements OnInit {
  mangas: Manga[] = [];
  filteredMangas: Manga[] = [];
  categories: Category[] = [];
  selectedCategories: number[] = [];
  sortOption: string = 'newest';

  constructor(private router: Router, private mangaService: MangaService, private mangaViewHistoryService: MangaViewHistoryService, private categoriesService: CategoriesService, private categoryDetailsService: CategoryDetailsService) {}

  ngOnInit(): void {
    this.categoriesService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.mangaService.getMangas().subscribe(mangas => {
      this.mangas = mangas;
      this.filteredMangas = [...this.mangas];
      const observables = this.mangas.map(manga =>
        this.mangaViewHistoryService.getAllView(manga.id_manga)
      );
      combineLatest(observables).subscribe(results => {
        results.forEach((result, index) => {
          this.mangas[index].totalViews = result;
          this.filteredMangas[index].totalViews = result;
        });
      });
    });
  }

  toggleCategorySelection(id_category: number) {
    if (this.selectedCategories.includes(id_category)) {
      this.selectedCategories = this.selectedCategories.filter(id => id !== id_category);
    } else {
      this.selectedCategories.push(id_category);
    }
  }

  searchMangas() {
    if (this.selectedCategories.length > 0) {
      this.categoryDetailsService.getIdMangaByCategories(this.selectedCategories).subscribe(id_manga => {
        this.filteredMangas = this.mangas.filter(manga => id_manga.includes(manga.id_manga));
        this.applySorting();
      });
    } else {
      this.filteredMangas = [...this.mangas];
      this.applySorting();
    }
  }

  applySorting() {
    switch (this.sortOption) {
      case 'newest':
        this.filteredMangas.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'oldest':
        this.filteredMangas.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
        break;
      case 'viewsHigh':
        this.filteredMangas.sort((a, b) => b.totalViews - a.totalViews);
        break;
      case 'viewsLow':
        this.filteredMangas.sort((a, b) => a.totalViews - b.totalViews);
        break;
    }
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }
}
