import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ModelBanner} from '../../../Model/ModelBanner';
import {BannerService} from '../../../service/Banner/banner.service';

@Component({
  selector: 'app-manager-banner',
  templateUrl: './manager-banner.component.html',
  styleUrls: ['./manager-banner.component.css']
})
export class ManagerBannerComponent implements OnInit {

  banners: ModelBanner[] = [];
  selectedFile: File | null = null;
  @ViewChild('dataUrl') urlInput!: ElementRef;
  id: number = -1;
  @ViewChild('dataUrlImg') imageInput!: ElementRef;

  constructor(private route: ActivatedRoute, private el: ElementRef, private router: Router, private bannerService: BannerService) {
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  goToManager() {
    this.router.navigate(['/manager', this.id]);
  }

  goToAccount() {
    this.router.navigate(['/manager-account', this.id]);
  }

  goToStatiscal() {
    this.router.navigate(['/manager-statiscal', this.id]);
  }

  goToComment() {
    this.router.navigate(['/manager-comment', this.id]);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['Id'];
    });
    this.applyTailwindClasses();
    this.loadBanners();
  }

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories4');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
  }

  loadBanners(): void {
    this.banners = []
    this.bannerService.getBanner().subscribe(
      (data: ModelBanner[]) => {
        this.banners = data;
      },
      error => {
        console.error('Lỗi khi lấy banner', error);
      }
    );
    this.setupEventListeners();
  }

  addAvatar(form: any) {
    if (!this.selectedFile) {
      console.error('Chưa chọn file.');
    }
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);
      formData.append('name', form.controls.name.value);
      this.bannerService.addBannerImg(formData).subscribe(
        (response) => {
          alert('Upload thành công:');
          const addBannerModal = this.el.nativeElement.querySelector('#AddBanner');
          addBannerModal.classList.add('hidden');
          this.loadBanners()

        },
        (error) => {
          alert('Upload thất bại:');
          this.loadBanners()
        }
      );
    } else {
      alert('Không có ảnh');
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
          canvas.width = 1200;
          canvas.height = 500;
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

  delete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      this.bannerService.deleteBanner(id).subscribe(
        response => {
          alert(response ? 'Banner đã được xóa thành công!' : 'Có lỗi xảy ra khi xóa banner.');
          this.loadBanners(); // Tải lại danh sách banner
        },
        error => {
          console.error('Lỗi khi xóa banner', error);
          alert('Có lỗi xảy ra khi xóa banner.');
        }
      );
    }
  }

  setupEventListeners() {
    const addBannerModal = this.el.nativeElement.querySelector('#AddBanner');
    const addBannerButton = this.el.nativeElement.querySelector('#addBannerButton');
    const outBanner = this.el.nativeElement.querySelector('#outBanner');
    if (outBanner) {
      outBanner.addEventListener('click', () => {
        addBannerModal.classList.add('hidden');
      });
    }
    if (addBannerButton) {
      addBannerButton.addEventListener('click', () => {
        addBannerModal.classList.remove('hidden');
      });
    }
  }


}
