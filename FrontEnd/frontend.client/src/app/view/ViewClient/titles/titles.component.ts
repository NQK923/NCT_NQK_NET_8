import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ChapterService} from '../../../service/Chapter/chapter.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MangaService} from '../../../service/Manga/manga.service';
import {MangaFavoriteService} from "../../../service/MangaFavorite/manga-favorite.service";
import {ModelMangaFavorite} from "../../../Model/MangaFavorite";
import {MangaHistoryService} from "../../../service/MangaHistory/manga_history.service";

interface Chapter {
  id_chapter: number;
  title: string;
  id_manga: number;
  view: number;
  created_at: Date;
  index: number;
}

@Component({
  selector: 'app-titles',
  templateUrl: './titles.component.html',
  styleUrls: ['./titles.component.css']
})
export class TitlesComponent implements OnInit {
  id_manga!: number;
  chapters: Chapter[] = [];
  mangaDetails: any = {};
  selectedRatingValue: number = 0;
  titleId!: number;
  yourId!: number;

  @ViewChild('ratingSection') ratingSection!: ElementRef;

  constructor(
    private chapterService: ChapterService,
    private route: ActivatedRoute,
    private mangaFavoriteService: MangaFavoriteService,
    private mangaService: MangaService, private router: Router,
    private mangaHistoryService: MangaHistoryService
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id_manga = +params['id_manga'];
      this.getMangaDetails(this.id_manga);
      this.chapterService.getChaptersByMangaId(this.id_manga).subscribe(
        (data: Chapter[]) => {
          this.chapters = data;
        },
        (error) => {
          console.error('Error fetching chapters', error);
        }
      );
    });
  }

  getMangaDetails(id: number): void {
    this.mangaService.getMangaById(id).subscribe(
      (data) => {
        this.mangaDetails = data;
      },
      (error) => {
        console.error('Error fetching manga details', error);
      }
    );
  }

  goToChapter(index: number, id_chapter: number): void {
    if (this.isLoggedIn()) {
      const id_user = localStorage.getItem('userId');
      let numberId: number;
      numberId = Number(id_user);
      this.mangaHistoryService.addMangaHistory(numberId, this.id_manga, index).subscribe(
        (response) => {
          console.log('Response:', response);
        },
        (error) => {
          console.error('Error:', error);
        }
      );
    }
    this.chapterService.incrementChapterView(id_chapter).subscribe(updatedChapter => {
      const chapter = this.chapters.find(c => c.id_chapter === id_chapter);
      if (chapter) {
        chapter.view = updatedChapter.view;
      }
      if (chapter && chapter.id_chapter !== undefined) {
        localStorage.setItem('id_chapter', chapter.id_chapter.toString());
      } else {
        console.log("chapter or id_chapter is invalid");
      }
      console.log(`Chapter ${index} view updated to: ${chapter?.view}`);
      this.router.navigate([`/manga/${this.id_manga}/chapter/${index}`]);
      console.log(this.id_manga);
    });

  }

  isLoggedIn(): boolean {
    const id_user = localStorage.getItem('userId');
    return !!(id_user && Number(id_user) != -1);
  }

  toggleRatingSection() {
    this.ratingSection.nativeElement.classList.toggle('hidden');
  }

  confirmRating() {
    this.ratingSection.nativeElement.classList.add('hidden');
  }

  selectRating(value: number) {
    this.selectedRatingValue = value;
  }

  // them yeu thích
  addFavorite() {
    this.route.params.subscribe(params => {
      this.titleId = +params['id_manga'];
    });

    const userId = localStorage.getItem('userId');
    this.yourId = userId !== null ? parseInt(userId, 10) : 0;

    if (this.yourId === 0) {
      alert("Vui lòng đăng nhập để thêm manga vào danh sách yêu thích.");
      return;
    }

    const temp: ModelMangaFavorite = {
      id_manga: this.titleId,
      id_account: this.yourId,
      is_favorite: true
    };

    console.log(temp);

    this.mangaFavoriteService.addMangaFavorite(temp).subscribe(
      (data) => {
        alert("Thêm thành công!");
      },
      (error) => {
        console.error('Lỗi khi thêm manga yêu thích:', error);
        alert("Có lỗi xảy ra khi thêm manga. Vui lòng thử lại sau.");
      }
    );
  }
}
