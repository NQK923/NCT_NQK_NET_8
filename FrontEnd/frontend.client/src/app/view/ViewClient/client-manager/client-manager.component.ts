import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MangaService} from '../../../service/Manga/manga.service';
import {ChapterService} from "../../../service/Chapter/chapter.service";
import {ModelAccount} from "../../../Model/ModelAccount";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {AccountService} from "../../../service/Account/account.service";
import {CategoriesService} from "../../../service/Categories/Categories.service";
import {NgForm} from "@angular/forms";
import {ModelNotification} from "../../../Model/ModelNotification";
import {NotificationService} from "../../../service/notification/notification.service";
import {
  NotificationMangaAccountService
} from "../../../service/notificationMangaAccount/notification-manga-account.service";
import {ModelNotificationMangaAccount} from "../../../Model/ModelNotificationMangaAccount";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service"

interface Manga {
  id_manga: number;
  name: string;
  author: string;
  num_of_chapter: number;
  id_account: number;
  cover_img: string;
  describe: string;
}

interface Chapter {
  id_chapter: number;
  title: string;
  id_manga: number;
  view: number;
  created_at: Date;
  index: number;
}

interface Category {
  id_category: number;
  name: string;
}

@Component({
  selector: 'app-client-manager',
  templateUrl: './client-manager.component.html',
  styleUrls: ['./client-manager.component.css']
})
export class ClientManagerComponent implements OnInit {
  selectedFile: File | null = null;
  selectedChapter: number = 1;
  option: number = 0;
  mangas: Manga[] = [];
  chapterImages: string[] = [];
  selectedImg: string = '';
  chapters: Chapter[] = [];
  selectedFiles: FileList | null = null;
  selectedIdManga: string = '';
  selectedMangaName: string = '';
  chapterName: string = '';
  chapterIndex: string = '';
  isAddingChapter: boolean = false;
  notificationMessage: string = '';
  categories: Category[] = [];
  selectedCategories: number[] = [];
  mangaDetails: Manga = {
    id_manga: 0,
    id_account: 0,
    num_of_chapter: 0,
    cover_img: '',
    name: '',
    author: '',
    describe: ''
  };
  //nguyen
  accounts: ModelAccount[] = [];
  listMangas: Manga[] = [];
  infoManga: Manga | null = null;
  returnNotification: ModelNotification | null = null;

  infoAccounts: ModelInfoAccount[] = [];
  url: string | null = null;
  name: string | null = null;
  email: string | null = null;
  nameuser: string | null = null;
  idaccount: number | null = null;
  urlimg: string | null = null;

  constructor(private accountService: AccountService, private el: ElementRef,
              private mangaService: MangaService,
              private notificationService: NotificationService,
              private notificationMangaAccountService: NotificationMangaAccountService,
              private categoriesService: CategoriesService,
              private chapterService: ChapterService,
              private categoryDetailsService: CategoryDetailsService,
              private router: Router,
  ) {

  }

  ngOnInit(): void {
    const id = localStorage.getItem('userId');
    this.mangaService.getMangasByUser(Number(id)).subscribe(mangas => {
      this.mangas = mangas;
    });
    this.categoriesService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    })
    this.setupEventListeners();
    this.takeData();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = new File([file], 'Cover' + file.name.substring(file.name.lastIndexOf('.')), {
        type: file.type,
      });
    }
  }

  onImgSelected(event: any) {
    const file: File = event.target.files[0];
    let indexBefore: number;
    // @ts-ignore
    indexBefore = this.chapterImages.findIndex(this.selectedImg);
    const indexAfter = indexBefore - 1;
    if (file) {
      this.selectedFile = new File([file], 'Cover' + file.name.substring(file.name.lastIndexOf('.')), {
        type: file.type,
      });
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

    this.chapterService.addChapter(formData).subscribe(
      response => {
        this.notificationMessage = 'Thêm chương thành công!';
        this.isAddingChapter = false;
        setTimeout(() => {
          this.toggleAddChap(0, '')
        }, 2000);
        //nguyen
        const idManga = formData.get('id_manga');
        const nameChap = formData.get('title');
        this.addNotification(idManga, nameChap)
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

    this.chapterService.updateChapter(chapterId, formData).subscribe(response => {
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

  onChapterChange(): void {
    this.loadChapterImages(this.selectedChapter);
  }

  onSubmit(addForm: any) {
    console.log('Form data:', addForm);
    console.log('Selected file:', this.selectedFile);
    console.log(this.selectedCategories);
    if (this.selectedFile && addForm.controls.name.value && addForm.controls.author.value) {
      const formData = new FormData();
      formData.append('name', addForm.controls.name.value);
      formData.append('author', addForm.controls.author.value);
      formData.append('describe', addForm.controls.describe.value);
      formData.append('file', this.selectedFile, this.selectedFile.name);
      formData.append('categories', this.selectedCategories.join(','));
      const id_user = localStorage.getItem('userId');
      let numberId: number;
      numberId = Number(id_user);
      this.mangaService.uploadManga(formData, numberId).subscribe(
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

  onSubmitUpdate(form: NgForm): void {
    if (!form.valid) {
      return;
    }
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('author', form.value.author);
    formData.append('describe', form.value.describe);
    formData.append('categories', this.selectedCategories.join(','));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }
    this.mangaService.updateManga(formData, Number(this.selectedIdManga)).subscribe(response => {
      console.log('Cập nhật thành công', response);
    });
    this.categoryDetailsService.updateCategoriesDetails(this.selectedCategories).subscribe((response) => {
      console.log(response);
    }, (error) => {
      console.error('Upload failed:', error);
    })
  }

  onCategoryChange(event: any, categoryId: number) {
    console.log('Checkbox changed:', event.target.checked, 'Category ID:', categoryId);
    if (event.target.checked) {
      if (!this.selectedCategories.includes(categoryId)) {
        this.selectedCategories = [...this.selectedCategories, categoryId];
        console.log('Added category:', this.selectedCategories);
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
      console.log('Removed category:', this.selectedCategories);
    }
  }


  deleteChapter(index: number): void {
    console.log('Xóa chương :', index);
    console.log('Xoá trong manga:' + this.selectedIdManga.toString());
    this.chapterService.deleteSelectedChapter(Number(this.selectedIdManga), index).subscribe(response => {
      console.log(response);
    })
  }

  deleteManga(manga: Manga): void {
    const deleteConfirmed = confirm(`Bạn có chắc chắn muốn xoá manga: ${manga.name} không? Sau khi xoá không thể hoàn tác!`);
    if (deleteConfirmed) {
      this.mangaService.deleteMangaById(manga.id_manga).subscribe(
        (response) => {
          console.log(response);
        },
        (error) => {
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

  toggleUpdateImg(img: string, selectedOption: number): void {
    const updateImgElement = document.getElementById('updateImg');
    this.selectedImg = img;
    this.option = selectedOption;
    if (updateImgElement) {
      updateImgElement.classList.toggle('hidden');
    }
  }

  toggleDeleteChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const deleteChapElement = document.getElementById('deleteChapter');
    if (id != 0) {
      this.chapterService.getChaptersByMangaId(id).subscribe((data: Chapter[]) => {
        this.chapters = data;
      });
    } else {
      this.chapters = []
    }
    if (deleteChapElement) {
      deleteChapElement.classList.toggle('hidden');
    }
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

  goToIndex() {
    this.router.navigate(['/']);
  }


  setupEventListeners() {
    const buttonAdd = this.el.nativeElement.querySelector('#buttonAdd');
    const overlay = this.el.nativeElement.querySelector('#overlay');
    const out = this.el.nativeElement.querySelector('#out');

    if (out) {
      out.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
        this.selectedCategories = [];
      });
    }

    if (buttonAdd) {
      buttonAdd.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }
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
  // thêm thông tin
  FileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 100;
          canvas.height = 100;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Tạo file mới từ canvas
          canvas.toBlob((blob) => {
            if (blob) {
              this.selectedFile = new File([blob], 'Cover_' + file.name, {type: file.type});
            }
          }, file.type);
        };
      };

      reader.readAsDataURL(file);
    }
  }

  addAvata(form: any) {
    const idAccount = localStorage.getItem('userId');

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
          alert('Upload thành công:');

        },
        (error) => {
          alert('Upload thất bại:');
        }
      );
    } else {
      alert('Không có ảnh');
    }
  }

  updateInfo() {
    const userId = localStorage.getItem('userId');
    if (userId === null) {
      console.error('User ID not found in local storage');
      return;
    }

    const emailElement = this.el.nativeElement.querySelector('#emailuser');
    const nameElement = this.el.nativeElement.querySelector('#nameuser');
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailPattern.test(emailElement.value)) {
      alert("Email phải có định dạng: example@gmail.com");
      return;
    }

    this.urlimg = '';  // Initialize to an empty string

    this.accountService.getinfoAccount().subscribe(
      (data: ModelInfoAccount[]) => {
        this.infoAccounts = data;
        if (this.idaccount !== null) {
          this.findUrl(this.idaccount);
        }
      },
      (error) => {
        console.error('Error fetching account info:', error);
      }
    );
    for (var i = 0; i < this.infoAccounts.length; i++) {
      if (this.infoAccounts[i].id_account === parseInt(userId, 10)) {
        this.urlimg = this.infoAccounts[i].cover_img || '';  // Ensure it's a string
        break;
      }
    }

    if (!emailElement || !nameElement) {
      console.error('Email or Name input elements not found');
      return;
    }

    const updateinfo: ModelInfoAccount = {
      id_account: parseInt(userId, 10),
      email: emailElement.value,
      cover_img: this.urlimg,  // This will now be a string
      name: nameElement.value
    };

    this.accountService.updateaccount(updateinfo).subscribe({
      next: (response) => {
        alert('Update successful');
      },
      error: (err) => {
        alert('An error occurred during the update. Please try again later.');
      }
    });
  }

  takeData() {
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

      this.accountService.getinfoAccount().subscribe(
        (data: ModelInfoAccount[]) => {
          this.infoAccounts = data;
          if (this.idaccount !== null) {
            this.findUrl(this.idaccount);
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
        break;
      }
    }
  }

  findUrl(userId: number) {
    for (let i = 0; i < this.infoAccounts.length; i++) {
      if (this.infoAccounts[i].id_account === userId) {
        this.url = this.infoAccounts[i].cover_img || null;
        this.nameuser = this.infoAccounts[i].name || null;
        this.email = this.infoAccounts[i].email || null;
        break;
      }
    }
  }

  logOut() {
    localStorage.setItem('userId', "-1");
    this.router.navigate([`/`]);
  }

  // thêm thông báo
  addNotification(id_manga: any, text: any) {

    this.mangaService.getMangas().subscribe({
      next: (mangas: Manga[]) => {
        this.listMangas = mangas;
      },
      error: (error) => {
        console.error('Failed to fetch mangas:', error);
      }
    });
    for (const manga of this.listMangas) {
      if (manga.id_account === id_manga) {
        this.infoManga = manga;
        break;
      }
    }
    const nameManga: any = this.infoManga ? this.infoManga.name : null;
    const textNotification: any = "Truyện vừa được thêm chương " + text;
    const timestamp: number = Date.now();
    const idMangaNumber: number = Number(id_manga);
    const typeNoti: any = nameManga + " đã thêm 1 chương mới"
    const time: Date = new Date(timestamp);
    const userId = localStorage.getItem('userId');
    const yourId = userId !== null ? parseInt(userId, 10) : 0;
    const notification: ModelNotification = {
      content: textNotification,
      isRead: false,
      time: time,
      type_Noti: typeNoti
    };

    this.notificationService.addnotification(notification).subscribe(
      (response) => {
        this.returnNotification = response;
        const infoNotification: ModelNotificationMangaAccount = {
          id_Notification: this.returnNotification?.id_Notification,
          id_manga: idMangaNumber,
          id_account: yourId,
          isGotNotification: true,
        };
        this.notificationMangaAccountService.addinfonotification(infoNotification).subscribe(
          (response) => {

          },
          (error) => {
            alert('thêm thông báo  thất bại:');
          }
        )
      },
      (error) => {
        alert('thêm thông báo  thất bại:');
      }
    )
  }
}
