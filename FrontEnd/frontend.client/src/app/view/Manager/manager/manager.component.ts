import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MangaService} from "../../../service/Manga/manga.service";
import {ChapterService} from "../../../service/Chapter/chapter.service";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service";
import {NgForm} from "@angular/forms";
import {ModelNotification} from "../../../Model/ModelNotification";
import {ModelNotificationMangaAccount} from "../../../Model/ModelNotificationMangaAccount";
import {ModelAccount} from "../../../Model/ModelAccount";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {NotificationService} from "../../../service/notification/notification.service";
import {
  NotificationMangaAccountService
} from "../../../service/notificationMangaAccount/notification-manga-account.service";
import {CategoriesService} from "../../../service/Categories/Categories.service";

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
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {
  allMangas: Manga[] = [];
  myManga: Manga[] = [];
  unPostedManga: Manga[] = [];
  selectedIdManga: string = '';
  selectedMangaName: string = '';
  selectedCategories: number[] = [];
  chapters: Chapter[] = [];
  selectedChapter: number = 1;
  chapterImages: string[] = [];
  selectedFile: File | null = null;
  option: number = 0;
  mangas: Manga[] = [];
  selectedFiles: FileList | null = null;
  chapterName: string = '';
  chapterIndex: string = '';
  isAddingChapter: boolean = false;
  categories: Category[] = [];
  isHidden: boolean = true;
  selectedOption: string = 'option1';
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

  constructor(private el: ElementRef, private router: Router, private mangaService: MangaService, private chapterService: ChapterService, private categoryDetailsService: CategoryDetailsService,private notificationService: NotificationService, private notificationMangaAccountService: NotificationMangaAccountService, private categoriesService: CategoriesService  ) {
  }

  ngOnInit() {
    const id = localStorage.getItem('userId');
    this.mangaService.getMangasByUser(Number(id)).subscribe(mangas => {
      this.myManga = mangas;
    });
    this.mangaService.getMangas().subscribe(mangas => {
      this.allMangas = mangas;
    });
    this.mangaService.getUnPostedManga().subscribe(mangas => {
      this.unPostedManga = mangas;
    });
    this.categoriesService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    })
    console.log(this.unPostedManga);
    this.setupEventListeners();
    this.applyTailwindClasses();
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
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
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
        //nguyen
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

  onChapterChange(): void {
    this.loadChapterImages(this.selectedChapter);
  }

  deleteChapter(index: number): void {
    this.chapterService.deleteSelectedChapter(Number(this.selectedIdManga), index).subscribe(() => {
      alert('Xoá thành công!');
      this.getAllChapters(Number(this.selectedIdManga));
    })
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
              this.selectedCategories.push(category.id_category);
            }
          })
          this.categoryDetailsService.deleteCategoriesDetails(categoriesToDelete).subscribe();
        },
        (error) => {
          alert("Xoá thất bại, vui lòng thử lại!");
          console.error(error);
        }
      );
    }
  }

  getAllChapters(id: number) {
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
          isGotNotification: false,
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

    const buttons = this.el.nativeElement.querySelector('#buttonBrowser');
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
  }

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
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

}
