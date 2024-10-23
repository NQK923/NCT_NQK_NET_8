import {Component, OnInit} from '@angular/core';
import {forkJoin} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {MangaService} from "../../../service/Manga/manga.service";
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";
import {CategoriesService} from "../../../service/Categories/Categories.service";
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
  searchQuery: string = '';
  mangas: Manga[] = [];
  filteredMangas: Manga[] = [];
  categories: Category[] = [];
  selectedCategories: number[] = [];
  sortOption: string = 'newest';

  constructor(private route: ActivatedRoute, private router: Router, private mangaService: MangaService, private mangaViewHistoryService: MangaViewHistoryService, private categoriesService: CategoriesService, private categoryDetailsService: CategoryDetailsService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      if (this.searchQuery) {
        this.searchMangas();
      }
    });
    this.mangaService.getMangas().subscribe(mangas => {
      this.mangas = mangas;
      this.filteredMangas = [...this.mangas];
      const observables = this.mangas.map(manga =>
        this.mangaViewHistoryService.getAllView(manga.id_manga)
      );
      forkJoin(observables).subscribe(results => {
        results.forEach((result, index) => {
          this.mangas[index].totalViews = result;
          this.filteredMangas[index].totalViews = result;
        });
        this.searchMangas();
      });
      this.categoriesService.getAllCategories().subscribe(categories => {
        this.categories = categories;
      });
      this.route.queryParams.subscribe(params => {
        this.searchQuery = params['search'] || '';
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
    if (this.searchQuery.trim()) {
      this.filteredMangas = this.mangas.filter(manga =>
        manga.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        manga.author.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else if (this.selectedCategories.length > 0) {
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

  getTimeDifference(updatedTime: string | Date): string {
    const updatedDate = typeof updatedTime === 'string' ? new Date(updatedTime) : updatedTime;
    const currentDate = new Date();

    const diffInMs = currentDate.getTime() - updatedDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return `${diffInDays} ngày trước`;
    }
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }
}
