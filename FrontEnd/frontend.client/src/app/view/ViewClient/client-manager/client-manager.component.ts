import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MangaService} from '../../../service/Manga/get_manga.service';
import {MangaUploadService} from '../../../service/Manga/manga_upload.service';
import {UploadChapterService} from "../../../service/Chapter/upload_chapter.service";
import {MangaDetailsService} from "../../../service/Manga/manga_details.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ModelAccount} from "../../../Model/ModelAccount";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccount";
import {AccountService} from "../../../service/Account/account.service";

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
  //nguyen
  accounts: ModelAccount[] = [];

  infoAccounts: ModelInfoAccount[] = [];
  url: string | null = null;
  name: string | null = null;
  email: string | null = null;
  nameuser: string | null = null;
  idaccount: number | null = null;

  constructor(private accountService: AccountService,private el: ElementRef, private snackBar: MatSnackBar, private router: Router, private mangaUploadService: MangaUploadService, private mangaService: MangaService, private uploadChapterService: UploadChapterService, private mangaDetailsService: MangaDetailsService) {

  }

  ngOnInit(): void {
    this.mangaService.getMangasByUser(1).subscribe(mangas => {
      this.mangas = mangas;
    });
    this.setupEventListeners();
    //nguyen
    this.Takedata();
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


  setupEventListeners() {


    const userupdate = this.el.nativeElement.querySelector('#userupdate');
    userupdate.addEventListener('click', () => {
      userOverlay.classList.remove('hidden');
      updateUserOverlay.classList.add('hidden');
    });

    const userButton = this.el.nativeElement.querySelector('#manageStories1');
    const userOverlay = this.el.nativeElement.querySelector('#user');
    const outUser = this.el.nativeElement.querySelector('#outuser');


    if (outUser) {
      outUser.addEventListener('click', () => {
        userOverlay.classList.toggle('hidden');
      });
    }

    if (userButton) {
      userButton.addEventListener('click', () => {
        userOverlay.classList.toggle('hidden');
      });
    }

    const updateUserButton = this.el.nativeElement.querySelector('#updates');
    const updateUserOverlay = this.el.nativeElement.querySelector('#updateuser');
    const outUpdateUser = this.el.nativeElement.querySelector('#outupdateuser');

    if (outUpdateUser) {
      outUpdateUser.addEventListener('click', () => {
        updateUserOverlay.classList.toggle('hidden');
        userOverlay.classList.add('hidden');
      });
    }

    if (updateUserButton) {
      updateUserButton.addEventListener('click', () => {
        updateUserOverlay.classList.toggle('hidden');
        userOverlay.classList.add('hidden');
      });
    }

  }
  //nguyen
  onButtonClick() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click(); // Mở hộp thoại chọn tệp
  }

  onFileSelecteds(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('File đã chọn:', this.selectedFile);
  }


  addavata(form: any) {
    console.log('Hàm addavata được gọi');
    console.log('Form data:', form.value);
    console.log('Selected file:', this.selectedFile);

    const idAccount =  localStorage.getItem('userId');

    if (!this.selectedFile) {
      console.error('Chưa chọn file.');
    }
    if (!idAccount) {
      console.error('Chưa nhập id.');
    }

    if (this.selectedFile && idAccount) {
      const formData = new FormData();
      formData.append('id', idAccount);
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.accountService.uploadavata(formData).subscribe(
        (response) => {
          console.log('Upload thành công:', response);
        },
        (error) => {
          console.error('Upload thất bại:', error);
        }
      );
    } else {
      console.error('Form chưa đầy đủ');
    }
  }

  Takedata() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.idaccount = parseInt(userId, 10);
      this.accountService.getAccount().subscribe(
        (data: ModelAccount[]) => {
          this.accounts = data;
          if (this.idaccount !== null) {
            this.findUser(this.idaccount);
          }
        },
        (error) => {
          console.error('Error fetching accounts:', error);
        }
      );

      // Fetch account info
      this.accountService.getinfoAccount().subscribe(
        (data: ModelInfoAccount[]) => {
          this.infoAccounts = data;
          if (this.idaccount !== null) {
            this.findurl(this.idaccount);
          }
        },
        (error) => {
          console.error('Error fetching account info:', error);
        }
      );

    } else {
      console.error('No userId found in localStorage');
    }
  }

  findUser(userId: number) {
    for (let i = 0; i < this.accounts.length; i++) {

      if (this.accounts[i].id_account === userId) {
        this.name = this.accounts[i].username || null;
        console.log(this.name);
        break;
      }
    }
  }

  findurl(userId: number) {
    for (let i = 0; i < this.infoAccounts.length; i++) {
      if (this.infoAccounts[i].id_account === userId) {
        this.url = this.infoAccounts[i].cover_img || null;
        this.nameuser = this.infoAccounts[i].name || null;
        this.email = this.infoAccounts[i].email || null;
        console.log(this.url);
        break;
      }
    }
  }
  logout(){
    localStorage.setItem('userId',"-1");
    this.router.navigate([`/`]);
  }

}
