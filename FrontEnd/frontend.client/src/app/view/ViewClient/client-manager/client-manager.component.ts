import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MangaService} from '../../../service/Manga/get_manga.service';
import {MangaUploadService} from '../../../service/Manga/manga_upload.service';

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
  totalViews:number
}
@Component({
  selector: 'app-client-manager',
  templateUrl: './client-manager.component.html',
  styleUrls: ['./client-manager.component.css']
})
export class ClientManagerComponent implements OnInit{
  selectedFile: File | null = null;
  mangas: Manga[] = [];

  constructor(private el: ElementRef ,private router: Router, private mangaUploadService: MangaUploadService, private mangaService: MangaService) {

  }
  ngOnInit(): void {
    this.mangaService.getMangasByUser(1).subscribe(mangas => {
      this.mangas = mangas;
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = new File([file], 'Cover' + file.name.substring(file.name.lastIndexOf('.')), {
        type: file.type,
      });
      console.log(this.selectedFile);
    }
  }

  onSubmit(form: any) {
    console.log('Form data:', form);
    console.log('Selected file:', this.selectedFile);
    if (this.selectedFile && form.controls.name.value && form.controls.author.value) {
      const formData = new FormData();
      formData.append('name', form.controls.name.value);
      formData.append('author', form.controls.author.value);
      formData.append('describe',form.controls.describe.value);
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.mangaUploadService.uploadManga(formData).subscribe(
        (response) => {
          console.log('Upload successful:', response);
        },
        (error) => {
          console.error('Upload failed:', error);
        }
      );
    } else {
      console.error('Form is incomplete');
    }
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  toggleAddChap(): void {
    const addChapElement = document.getElementById('AddChap');
    if (addChapElement) {
      addChapElement.classList.toggle('hidden');
    }}

  addChapter(manga: Manga): void {
    console.log('Thêm chương cho manga:', manga.name);
    this.toggleAddChap();
  }

  updateChapter(manga: Manga): void {
    console.log('Sửa chương của manga:', manga.name);
    // Thêm xử lý logic sửa chương
  }

  deleteChapter(manga: Manga): void {
    console.log('Xóa chương của manga:', manga.name);
    // Thêm xử lý logic xóa chương
  }

  deleteManga(manga: Manga): void {
    console.log('Xóa manga:', manga.name);
    // Thêm xử lý logic xóa manga
  }

}
