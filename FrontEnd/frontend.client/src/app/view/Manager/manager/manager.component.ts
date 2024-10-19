import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MangaService} from "../../../service/Manga/manga.service";
import {ChapterService} from "../../../service/Chapter/chapter.service";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service";

interface Manga {
  id_manga: number;
  name: string;
  author: string;
  num_of_chapter: number;
  id_account: number;
  cover_img: string;
  describe: string;
  is_posted: boolean;
}
interface Chapter {
  id_chapter: number;
  title: string;
  id_manga: number;
  view: number;
  created_at: Date;
  index: number;
}
@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {
  allMangas: Manga[] =[];
  myManga: Manga[] = [];
  unPostedManga: Manga[] = [];
  selectedIdManga: string = '';
  selectedMangaName: string = '';
  selectedCategories: number[] = [];
  chapters: Chapter[] = [];
  selectedChapter: number = 1;
  chapterImages: string[] = [];
  mangaDetails: Manga = {
    id_manga: 0,
    id_account: 0,
    num_of_chapter: 0,
    cover_img: '',
    name: '',
    author: '',
    describe: '',
    is_posted: false,
  };

  constructor(private el: ElementRef, private router: Router, private mangaService: MangaService, private chapterService: ChapterService, private categoryDetailsService: CategoryDetailsService) {
  }

  ngOnInit() {
    const id = localStorage.getItem('userId');
    this.mangaService.getMangasByUser(Number(id)).subscribe(mangas => {
      this.myManga = mangas;
    });
    this.mangaService.getMangas().subscribe(mangas => {
      this.allMangas = mangas;
    })
    this.mangaService.getUnPostedManga().subscribe(mangas => {
      this.unPostedManga = mangas;
    })
    this.setupEventListeners();
    this.applyTailwindClasses();
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  goToManager() {
    this.router.navigate(['/manager']);
  }

  goToAccount() {
    this.router.navigate(['/manager-account']);
  }

  goToStatiscal() {
    this.router.navigate(['/manager-statiscal']);
  }

  goToComment() {
    this.router.navigate(['/manager-comment']);
  }



  goToBanner() {
    this.router.navigate(['/manager-banner']);
  }

  toggleAddChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const addChapElement = document.getElementById('AddChap');
    if (addChapElement) {
      addChapElement.classList.toggle('hidden');
    }

  }

  toggleDeleteChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const deleteChapElement = document.getElementById('deleteChapter');
    if (id != 0) {
      this.getAllChapters(id);
    } else {
      this.chapters = []
    }
    if (deleteChapElement) {
      deleteChapElement.classList.toggle('hidden');
    }
  }
  deleteManga(manga: Manga): void {
    const deleteConfirmed = confirm(`Bạn có chắc chắn muốn xoá manga: ${manga.name} không? Sau khi xoá không thể hoàn tác!`);
    if (deleteConfirmed) {
      this.mangaService.deleteMangaById(manga.id_manga).subscribe(
        (response) => {
          console.log(response);
          this.chapterService.deleteAllChapter(manga.id_manga).subscribe(
            (response: any) => {
              alert('Xoá thành công!');
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            },(error)=>{
              if(error.status === 404){
                alert('Xoá thành công!');
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              } else{
                alert("Xoá thất bại, vui lòng thử lại!");
                console.error(error);
              }
            });
          this.categoryDetailsService.deleteCategoriesDetails(manga.id_manga).subscribe();
        },
        (error) => {
          alert("Xoá thất bại, vui lòng thử lại!");
          console.error(error);
        }
      );
    }
  }

  getAllChapters(id: number){
    this.chapterService.getChaptersByMangaId(id).subscribe((data: Chapter[]) => {
      this.chapters = data;
    });
  }
  loadChapters(): void {
    this.chapterService.getChaptersByMangaId(Number(this.selectedIdManga)).subscribe(chapters => {
      this.chapters = chapters;
      this.selectedChapter = this.chapters[0]?.index || 1;
      this.loadChapterImages(this.selectedChapter);
    });
  }
  loadChapterImages(index: number): void {
    this.chapterService.getImagesByMangaIdAndIndex(Number(this.selectedIdManga), index).subscribe(images => {
      this.chapterImages = images;
    });
  }

  toggleUpdateChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const updateChapElement = document.getElementById('updateChapter');
    if (id != 0) {
      this.loadChapters();
    }
    if (updateChapElement) {
      updateChapElement.classList.toggle('hidden');
    }
  }

  toggleUpdateManga(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    if (id != 0) {
      this.selectedCategories.push(id);
      this.mangaService.getMangaById(id).subscribe(data => {
        this.mangaDetails = data;
      });
      this.categoryDetailsService.getCategoriesByIdManga(id).subscribe(categories => {
        for (const category of categories) {
          this.selectedCategories.push(category.id_category);
        }
      })
    } else {
      this.selectedCategories = [];
    }
    const addChapElement = document.getElementById('updateManga');
    if (addChapElement) {
      addChapElement.classList.toggle('hidden');
    }
  }


  setupEventListeners() {
    const button = this.el.nativeElement.querySelector('#buttonAdd');
    const overlay = this.el.nativeElement.querySelector('#overlay');
    const out = this.el.nativeElement.querySelector('#out');

    if (out) {
      out.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }

    if (button) {
      button.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }

    const buttons = this.el.nativeElement.querySelector('#buttonbrowse');
    const browse = this.el.nativeElement.querySelector('#browse');
    const outs = this.el.nativeElement.querySelector('#outs');

    if (outs) {
      outs.addEventListener('click', () => {
        browse.classList.toggle('hidden');
      });
    }

    if (buttons) {
      buttons.addEventListener('click', () => {
        browse.classList.toggle('hidden');
      });
    }

    const buttonchap = this.el.nativeElement.querySelector('#addchapter');
    const Addchapter = this.el.nativeElement.querySelector('#AddChap');
    const outchap = this.el.nativeElement.querySelector('#outchap');

    if (outchap) {
      outchap.addEventListener('click', () => {
        Addchapter.classList.toggle('hidden');
      });
    }

    if (buttonchap) {
      buttonchap.addEventListener('click', () => {
        Addchapter.classList.toggle('hidden');
      });
    }

    const deletechap = this.el.nativeElement.querySelector('#DeleteChap');
    const deletechapter = this.el.nativeElement.querySelector('#deletechapter');
    const outdelete = this.el.nativeElement.querySelector('#outdeletechapter');

    if (outdelete) {
      outdelete.addEventListener('click', () => {
        deletechapter.classList.toggle('hidden');
      });
    }

    if (deletechap) {
      deletechap.addEventListener('click', () => {
        deletechapter.classList.toggle('hidden');
      });
    }
  }

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
  }
}
