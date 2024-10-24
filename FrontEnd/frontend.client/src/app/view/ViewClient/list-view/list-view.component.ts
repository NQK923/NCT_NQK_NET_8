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
  currentPage: number = 1;
  itemsPerPage: number = 10;

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
      });
      this.categoriesService.getAllCategories().subscribe(categories => {
        this.categories = categories;
      });
      this.route.queryParams.subscribe(params => {
        this.searchQuery = params['search'] || '';
        this.searchMangas();
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
    let filteredByQuery = [...this.mangas];
    if (this.searchQuery.trim()) {
      filteredByQuery = filteredByQuery.filter(manga =>
        manga.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        manga.author.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    if (this.selectedCategories.length > 0) {
      this.categoryDetailsService.getIdMangaByCategories(this.selectedCategories).subscribe(id_manga => {
        this.filteredMangas = filteredByQuery.filter(manga => id_manga.includes(manga.id_manga));
        this.applySorting();
      });
    } else {
      this.filteredMangas = filteredByQuery;
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

  //Pagination
  getPagedMangas(): any {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredMangas.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  totalPages(): number {
    return Math.ceil(this.filteredMangas.length / this.itemsPerPage);
  }
}
