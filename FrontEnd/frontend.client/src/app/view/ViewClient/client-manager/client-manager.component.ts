import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MangaService} from '../../../service/Manga/get_manga.service';
import {MangaUploadService} from '../../../service/Manga/manga_upload.service';
import {UploadChapterService} from "../../../service/Chapter/upload_chapter.service";
import {MangaDetailsService} from "../../service/Manga/manga_details.service";
import {MatSnackBar} from "@angular/material/snack-bar";

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
}

interface Chapter {
  id_chapter: number;
  id_manga: number;
  title: string;
  created_at: Date;
  view: number;
  index: number;
}

@Component({
  selector: 'app-client-manager',
  templateUrl: './client-manager.component.html',
  styleUrls: ['./client-manager.component.css']
})
export class ClientManagerComponent implements OnInit {
  selectedFile: File | null = null;
  mangas: Manga[] = [];
  selectedFiles: FileList | null = null;
  selectedIdManga: string = '';
  selectedMangaName: string = '';
  chapterName: string = '';
  chapterIndex: string = '';
  isAddingChapter: boolean = false;
  notificationMessage: string = '';

  constructor(private snackBar: MatSnackBar, private router: Router, private mangaUploadService: MangaUploadService, private mangaService: MangaService, private uploadChapterService: UploadChapterService, private mangaDetailsService: MangaDetailsService) {

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

  onFileChange(event: any) {
    this.selectedFiles = event.target.files;
  }

  addChapter() {
    if (!this.chapterIndex || !this.chapterName || !this.selectedFiles) {
      this.notificationMessage = 'Vui lòng nhập đủ thông tin';
      return;
    }
    this.isAddingChapter = true;
    this.notificationMessage = '';

    const formData = new FormData();
    const filesArray = Array.from(this.selectedFiles);
    filesArray.forEach((file, idx) => {
      const renamedFile = new File([file], `${idx + 1}.${file.name.split('.').pop()}`, {type: file.type});
      formData.append('files', renamedFile);
    });

    formData.append('id_manga', this.selectedIdManga.toString());
    formData.append('index', this.chapterIndex.toString());
    formData.append('title', this.chapterName);

    this.uploadChapterService.addChapter(formData).subscribe(
      response => {
        this.notificationMessage = 'Thêm chương thành công!';
        this.isAddingChapter = false;
        setTimeout(() => {
          this.toggleAddChap(0, '')
        }, 2000);
      },
      error => {
        this.isAddingChapter = false;
        if (error.status === 409) {
          const existingChapter = error.error.existingChapter;
          console.log(existingChapter.id_chapter);
          const updateConfirmed = confirm(`Chương ${this.chapterIndex} đã tồn tại. Bạn có muốn cập nhật không?`);

          if (updateConfirmed) {
            this.updateChapter(existingChapter.id_chapter);
          }
        } else {
          this.notificationMessage = 'Xảy ra lỗi! Vui lòng thử lại!!!!';
        }
      }
    );
  }

  updateChapter(chapterId: number) {
    const formData = new FormData();
    // @ts-ignore
    const filesArray = Array.from(this.selectedFiles);
    filesArray.forEach((file, idx) => {
      const renamedFile = new File([file], `${idx + 1}.${file.name.split('.').pop()}`, {type: file.type});
      formData.append('files', renamedFile);
    });
    formData.append('id_manga', this.selectedIdManga.toString());
    formData.append('index', this.chapterIndex.toString());
    formData.append('title', this.chapterName);

    this.uploadChapterService.updateChapter(chapterId, formData).subscribe(response => {
      this.isAddingChapter = false;
      this.notificationMessage = 'Cập nhật thành công!';
      setTimeout(() => {
        this.toggleAddChap(0, '')
      }, 2000);
    }, error => {
      this.isAddingChapter = false;
      this.notificationMessage = 'Xảy ra lỗi! Vui lòng thử lại!!!!';
      console.error(error)
    });
  }

  onSubmit(form: any) {
    console.log('Form data:', form);
    console.log('Selected file:', this.selectedFile);
    if (this.selectedFile && form.controls.name.value && form.controls.author.value) {
      const formData = new FormData();
      formData.append('name', form.controls.name.value);
      formData.append('author', form.controls.author.value);
      formData.append('describe', form.controls.describe.value);
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

  deleteChapter(manga: Manga): void {
    console.log('Xóa chương của manga:', manga.name);
    // Thêm xử lý logic xóa chương
  }

  deleteManga(manga: Manga): void {
    const deleteConfirmed = confirm(`Bạn có chắc chắn muốn xoá manga: ${manga.name} không? Sau khi xoá không thể hoàn tác!`);
    if (deleteConfirmed) {
      this.mangaDetailsService.deleteMangaById(manga.id_manga).subscribe(
        (response) => {
          this.snackBar.open('Xoá manga thành công!', 'Đóng', {duration: 3000});
          console.log(response);
        },
        (error) => {
          this.snackBar.open('Xoá manga thất bại!', 'Đóng', {duration: 3000});
          console.log(error);
        }
      );
    }
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
    if (deleteChapElement) {
      deleteChapElement.classList.toggle('hidden');
    }
  }

  toggleUpdateChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const updateChapElement = document.getElementById('updateChapter');
    if (updateChapElement) {
      updateChapElement.classList.toggle('hidden');
    }
  }

  toggleUpdateManga(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const addChapElement = document.getElementById('AddChap');
    if (addChapElement) {
      addChapElement.classList.toggle('hidden');
    }
  }

  toggleDeleteManga(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const addChapElement = document.getElementById('AddChap');
    if (addChapElement) {
      addChapElement.classList.toggle('hidden');
    }
  }


  goToIndex() {
    this.router.navigate(['/']);
  }
}
