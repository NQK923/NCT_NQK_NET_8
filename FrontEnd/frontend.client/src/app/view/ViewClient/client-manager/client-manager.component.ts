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
  chapters: Chapter[] = [];
  selectedFiles: FileList | null = null;
  selectedIdManga: string = '';
  selectedMangaName: string = '';
  chapterName: string = '';
  chapterIndex: string = '';
  isAddingChapter: boolean = false;
  categories: Category[] = [];
  selectedCategories: number[] = [];
  isHidden: boolean = true;
  selectedOption: string = 'option1';
  currentPage: number = 1;
  itemsPerPage: number = 6;
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
  accounts: ModelAccount[] = [];
  listMangas: Manga[] = [];
  infoManga: Manga | null = null;
  returnNotification: ModelNotification | null = null;
  infoAccounts: ModelInfoAccount[] = [];
  url: string | null = null;
  name: string | null = null;
  email: string | null = null;
  nameUser: string | null = null;
  idAccount: number | null = null;
  urlImg: string | null = null;

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

  onImgSelected(event: any, uri: string) {
    const file: File = event.target.files[0];
    if (file) {
      if (this.selectedOption === 'option2') {
        const confirmSelection = confirm('Bạn có chắc chắn muốn thay thế ảnh hiện tại không?');
        if (confirmSelection) {
          this.replaceImg(file, uri);
        } else {
          this.selectedOption = 'option1';
          this.isHidden = true;
        }
      } else if (this.selectedOption === 'option3') {
        const confirmSelection = confirm('Bạn có chắc chắn muốn thêm ảnh vừa chọn vào trước ảnh hiện tại không?');
        if (confirmSelection) {
          this.addPreImg(file, uri);
        } else {
          this.selectedOption = 'option1';
          this.isHidden = true;
        }
      } else if (this.selectedOption === 'option4') {
        const confirmSelection = confirm('Bạn có chắc chắn muốn thêm ảnh vừa chọn vào sau ảnh hiện tại không?');
        if (confirmSelection) {
          this.addAfterImg(file, uri);
        } else {
          this.selectedOption = 'option1';
          this.isHidden = true;
        }
      }
    }
  }

  replaceImg(file: File, uri: string) {
    const fileExtension = file.name.split('.').pop();
    const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
    this.selectedFile = new File([file], `${currentNumber}.${fileExtension}`, {
      type: file.type,
    });
    const formData = new FormData();
    formData.append('files', this.selectedFile);
    formData.append('id_manga', this.selectedIdManga.toString());
    formData.append('index', this.selectedChapter.toString());
    this.chapterService.uploadSingleImg(formData).subscribe(() => {
      alert('Thêm hình ảnh thành công!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      this.selectedOption = 'option1';
      this.isHidden = true;
    }, error => {
      alert('Thêm hình ảnh thất bại, vui lòng thử lại!');
      console.error(error);
      this.selectedOption = 'option1';
      this.isHidden = true;
    })
  }

  addPreImg(file: File, uri: string) {
    const fileExtension = file.name.split('.').pop();
    const currentIndex = this.chapterImages.indexOf(uri);
    console.log("Cu:", currentIndex);
    if (currentIndex !== -1) {
      let newNumber: number;
      if (currentIndex == 0) {
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        console.log("Number: ", currentNumber);
        newNumber = currentNumber / 2;
        console.log(newNumber);
      } else {
        const preImage = this.chapterImages[currentIndex - 1];
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        const preNumber = parseFloat(preImage.match(/\/(\d+\.\d+)\.\w+$/)?.[1] || '0');
        newNumber = (currentNumber + preNumber) / 2;
      }
      const newFileName = `${newNumber}.${fileExtension}`;
      const newUri = uri.replace((/\/(\d+(\.\d+)?)\.\w+$/), `/${newFileName}`);
      this.selectedFile = new File([file], newFileName, {
        type: file.type,
      });
      const formData = new FormData();
      formData.append('files', this.selectedFile);
      formData.append('id_manga', this.selectedIdManga.toString());
      formData.append('index', this.selectedChapter.toString());
      this.chapterService.uploadSingleImg(formData).subscribe(() => {
        alert('Thêm hình ảnh thành công!');
        this.chapterImages.splice(currentIndex, 0, newUri);
        this.selectedOption = 'option1';
        this.isHidden = true;
      }, error => {
        alert('Thêm chương thất bại, vui lòng thử lại!');
        console.log(error);
        this.selectedOption = 'option1';
        this.isHidden = true;
      })
    }
  }

  addAfterImg(file: File, uri: string) {
    const fileExtension = file.name.split('.').pop();
    const currentIndex = this.chapterImages.indexOf(uri);
    if (currentIndex !== -1) {
      let newNumber: number;
      if (currentIndex == this.chapterImages.length - 1) {
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        newNumber = +currentNumber + 1;
      } else {
        const nextImage = this.chapterImages[currentIndex + 1];
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        const nextNumber = parseFloat(nextImage.match(/\/(\d+\.\d+)\.\w+$/)?.[1] || '0');
        newNumber = (currentNumber + nextNumber) / 2;
      }
      const newFileName = `${newNumber}.${fileExtension}`;
      const newUri = uri.replace((/\/(\d+(\.\d+)?)\.\w+$/), `/${newFileName}`);
      this.selectedFile = new File([file], newFileName, {
        type: file.type,
      });
      const formData = new FormData();
      formData.append('files', this.selectedFile);
      formData.append('id_manga', this.selectedIdManga.toString());
      formData.append('index', this.selectedChapter.toString());
      this.chapterService.uploadSingleImg(formData).subscribe(() => {
        alert('Thêm hình ảnh thành công!');
        this.chapterImages.splice(currentIndex + 1, 0, newUri);
        this.selectedOption = 'option1';
        this.isHidden = true;
      }, error => {
        alert('Thêm hình ảnh thất bại, vui lòng thử lại!');
        console.log(error);
        this.selectedOption = 'option1';
        this.isHidden = true;
      });
    }
  }

  onFileChange(event: any) {
    this.selectedFiles = event.target.files;
  }

  addChapter() {
    if (!this.chapterIndex || !this.chapterName || !this.selectedFiles) {
      alert('Vui lòng nhập đủ thông tin');
      return;
    }
    this.isAddingChapter = true;
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
      () => {
        alert('Thêm chương thành công!');
        this.isAddingChapter = false;
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        const idManga = formData.get('id_manga');
        const nameChap = formData.get('title');
        this.addNotification(idManga, nameChap)
        this.mangaService.updateTimeManga(Number(this.selectedIdManga)).subscribe();
      },
      error => {
        if (error.status === 409) {
          const existingChapter = error.error.existingChapter;
          const updateConfirmed = confirm(`Chương ${this.chapterIndex} đã tồn tại. Bạn có muốn cập nhật không?`);
          if (updateConfirmed) {
            this.updateChapter(existingChapter.id_chapter);
          }
        } else {
          console.error(error);
          alert('Xảy ra lỗi! Vui lòng thử lại!!!!');
          this.isAddingChapter = false;
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
    this.chapterService.updateChapter(chapterId, formData).subscribe(() => {
      this.isAddingChapter = false;
      alert('Cập nhật thành công!');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }, error => {
      this.isAddingChapter = false;
      alert('Xảy ra lỗi! Vui lòng thử lại!!!!');
      console.error(error);
    });
  }

  checkOption(event: any, imageUri: string) {
    this.selectedOption = event.target.value;
    this.isHidden = this.selectedOption === 'option1';

    if (this.selectedOption === 'option2') {
      alert('Hãy chọn ảnh để thay thế');
    } else if (this.selectedOption === 'option3') {
      alert('Hãy chọn ảnh cần thêm');
    } else if (this.selectedOption === 'option4') {
      alert('Hãy chọn ảnh cần thêm');
    } else if (this.selectedOption === 'option5') {
      const confirmSelection = confirm('Bạn có chắc chắn muốn xoá ảnh này không?\nSau khi xoá không thể hoàn tác');
      if (confirmSelection) {
        this.chapterService.deleteSingleImg(imageUri).subscribe(() => {
          alert("Xoá hình ảnh thành công!");
          const index = this.chapterImages.indexOf(imageUri);
          if (index !== -1) {
            this.chapterImages.splice(index, 1);
          }
          this.selectedOption = 'option1';
        }, error => {
          alert("Xoá hình ảnh thất bại, vui lòng thử lại!");
          console.error(error);
        })
      }
      this.selectedOption = 'option1';
      this.isHidden = true;
    }
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
        () => {
          alert('Thêm truyện thành công!');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        (error) => {
          alert("Thêm truyện thất bại, vui lòng thử lại!");
          console.error('Upload failed:', error);
        }
      );
    } else {
      alert('Vui lòng nhập đủ thông tin!');
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
    this.mangaService.updateManga(formData, Number(this.selectedIdManga)).subscribe(() => {
      alert('Cập nhật thành công!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, (error) => {
      alert("Cập nhật thất bại, vui lòng thử lại!");
      console.error('Upload failed:', error);
    });
    this.categoryDetailsService.updateCategoriesDetails(this.selectedCategories).subscribe();
  }

  onCategoryChange(event: any, categoryId: number) {
    if (event.target.checked) {
      if (!this.selectedCategories.includes(categoryId)) {
        this.selectedCategories = [...this.selectedCategories, categoryId];
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }
  }

  deleteChapter(index: number): void {
    this.chapterService.deleteSelectedChapter(Number(this.selectedIdManga), index).subscribe(() => {
      alert('Xoá thành công!');
      this.getAllChapters(Number(this.selectedIdManga));
    })
  }

  deleteManga(manga: Manga): void {
    const deleteConfirmed = confirm(`Bạn có chắc chắn muốn xoá manga: ${manga.name} không? Sau khi xoá không thể hoàn tác!`);
    if (deleteConfirmed) {
      this.mangaService.deleteMangaById(manga.id_manga).subscribe(
        (response) => {
          console.log(response);
          this.chapterService.deleteAllChapter(manga.id_manga).subscribe(
            () => {
              alert('Xoá thành công!');
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }, (error) => {
              if (error.status === 404) {
                alert('Xoá thành công!');
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              } else {
                alert("Xoá thất bại, vui lòng thử lại!");
                console.error(error);
              }
            });
          const categoriesToDelete: number[] = [];
          categoriesToDelete.push(manga.id_manga);
          this.categoryDetailsService.getCategoriesByIdManga(manga.id_manga).subscribe(categories => {
            for (const category of categories) {
              categoriesToDelete.push(category.id_category);
            }
            this.categoryDetailsService.deleteCategoriesDetails(categoriesToDelete).subscribe();
          })
        },
        (error) => {
          alert("Xoá thất bại, vui lòng thử lại!");
          console.error(error);
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
    if (id != 0) {
      this.getAllChapters(id);
    } else {
      this.chapters = []
    }
    if (deleteChapElement) {
      deleteChapElement.classList.toggle('hidden');
    }
  }

  getAllChapters(id: number) {
    this.chapterService.getChaptersByMangaId(id).subscribe((data: Chapter[]) => {
      this.chapters = data;
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
    const userUpdate = this.el.nativeElement.querySelector('#userUpdate');
    userUpdate.addEventListener('click', () => {
      userOverlay.classList.remove('hidden');
      updateUserOverlay.classList.add('hidden');
    });
    const userButton = this.el.nativeElement.querySelector('#manageStories1');
    const userOverlay = this.el.nativeElement.querySelector('#user');
    const outUser = this.el.nativeElement.querySelector('#outUser');
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
    const updateUserOverlay = this.el.nativeElement.querySelector('#updateUser');
    const outUpdateUser = this.el.nativeElement.querySelector('#outUpdateUser');
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

  addAvatar(form: any) {
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
        () => {
          alert('Upload thành công:');
          this.ngOnInit()
        },
        (error) => {
          console.error(error);
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
    const emailElement = this.el.nativeElement.querySelector('#emailUser');
    const nameElement = this.el.nativeElement.querySelector('#nameUser');
    if (emailElement.value == "" && nameElement.value == "") {
      alert("Vui lòng nhập đủ thông tin")
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailPattern.test(emailElement.value)) {
      alert("Email phải có định dạng: example@gmail.com");
      return;
    }
    this.urlImg = '';
    this.accountService.getinfoAccount().subscribe(
      (data: ModelInfoAccount[]) => {
        this.infoAccounts = data;
        if (this.idAccount !== null) {
          this.findUrl(this.idAccount);
        }
      },
      (error) => {
        console.error('Error fetching account info:', error);
      }
    );
    for (var i = 0; i < this.infoAccounts.length; i++) {
      if (this.infoAccounts[i].id_account === parseInt(userId, 10)) {
        this.urlImg = this.infoAccounts[i].cover_img || '';  // Ensure it's a string
        break;
      }
    }
    if (!emailElement || !nameElement) {
      console.error('Email or Name input elements not found');
      return;
    }
    const updateInfo: ModelInfoAccount = {
      id_account: parseInt(userId, 10),
      email: emailElement.value,
      cover_img: this.urlImg,
      name: nameElement.value
    };
    this.accountService.updateaccount(updateInfo).subscribe({
      next: () => {
        alert('Update successful');
        this.ngOnInit()
      },
      error: (error) => {
        console.error(error)
        alert('An error occurred during the update. Please try again later.');
      }
    });
  }

  takeData() {
    this.accounts = [];
    this.infoAccounts = [];
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.idAccount = parseInt(userId, 10);
      this.accountService.getAccount().subscribe(
        (data: ModelAccount[]) => {
          this.accounts = data;
          if (this.idAccount !== null) {
            this.findUser(this.idAccount);
          }
        },
        (error) => {
          console.error('Error fetching accounts:', error);
        }
      );
      this.accountService.getinfoAccount().subscribe(
        (data: ModelInfoAccount[]) => {
          this.infoAccounts = data;
          if (this.idAccount !== null) {
            this.findUrl(this.idAccount);
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
        this.nameUser = this.infoAccounts[i].name || null;
        this.email = this.infoAccounts[i].email || null;
        break;
      }
    }
  }

  logOut() {
    localStorage.setItem('userId', "-1");
    this.router.navigate([`/`]);
  }

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
    const textNotification: any = "Truyện vừa được thêm chương " + text;
    const timestamp: number = Date.now();
    const idMangaNumber: number = Number(id_manga);
    const typeNoti: any = " Đã thêm 1 chương mới"
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
          is_read: false,
        };
        this.notificationMangaAccountService.addinfonotification(infoNotification).subscribe(
          () => {
          },
          (error) => {
            console.error('Error adding notification:', error);
            alert('Thêm thông báo  thất bại:');
          }
        )
      },
      (error) => {
        console.error('Error adding notification:', error);
        alert('Thêm thông báo  thất bại:');
      }
    )
  }
//Pagination
  getPagedMangas(): Manga[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.mangas.slice(startIndex, endIndex);
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
    return Math.ceil(this.mangas.length / this.itemsPerPage);
  }

}
