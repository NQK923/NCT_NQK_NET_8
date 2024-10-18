import {Component, ElementRef, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {ChapterService} from '../../../service/Chapter/chapter.service';
import {CommentService} from "../../../service/Comment/comment.service";
import {ModelComment} from "../../../Model/ModelComment";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {InfoAccountService} from '../../../service/InfoAccount/info-account.service';
import {MangaHistoryService} from "../../../service/MangaHistory/manga_history.service";
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";
import {AccountService} from "../../../service/Account/account.service";
import {ModelAccount} from "../../../Model/ModelAccount";

interface Chapter {
  id_chapter: number;
  title: string;
  id_manga: number;
  view: number;
  created_at: Date;
  index: number;
}

export class CommentData {
  Comment: ModelComment | null;
  InfoAccount: ModelInfoAccount | null;

  constructor(
    comment: ModelComment | null,
    infoAccount: ModelInfoAccount | null
  ) {
    this.Comment = comment;
    this.InfoAccount = infoAccount;
  }
}

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit {
  id_manga!: number;
  chapter_index!: number;
  images: string[] = [];
  chapters: Chapter[] = [];
  //nguyen
  comment: ModelComment[] = [];
  comments: ModelComment[] = [];
  listInfoAccount: ModelInfoAccount[] = [];

  listDataComment: CommentData[] = [];
  listYourComment: CommentData[] = [];
  yourId: number = -1;
  yourbancomment: boolean = false;
  idChap: number = -1;
  listAccount: ModelAccount [] = [];
  yourAc: ModelAccount | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private chapterService: ChapterService,
    private router: Router,
    private infoAccountservice: InfoAccountService,
    private el: ElementRef,
    private commentService: CommentService,
    private mangaHistoryService: MangaHistoryService,
    private mangaViewHistoryService: MangaViewHistoryService,
    private accountService: AccountService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id_manga = params['id_manga'];
      this.chapter_index = +params['index'];
      this.loadImages();
      this.chapterService.getChaptersByMangaId(this.id_manga).subscribe(
        (data: Chapter[]) => {
          this.chapters = data;
          this.route.params.subscribe(newParams => {
            this.loadImages();
            //nguyen
            this.listDataComment = [];
            this.listYourComment = [];
            this.loadAllComment();
          });
        },
        (error) => {
          console.error('Error fetching chapters', error);
        }
      );
    });


  }

  loadImages(): void {
    this.chapterService.getImagesByMangaIdAndIndex(this.id_manga, this.chapter_index).subscribe(
      (images: string[]) => {
        this.images = images;
      },
      (error) => {
        console.error('Error fetching images', error);
      }
    );
  }

  goToChapter(index: any): void {
    const numericIndex = +index;
    if (numericIndex >= 1 && numericIndex <= this.chapters.length) {
      this.images = [];
      const selectedChapter = this.chapters.find(chapter => chapter.index === numericIndex);
      if (selectedChapter) {
        this.mangaViewHistoryService.createHistory(this.id_manga).subscribe(
          (error) => {
            console.error('Error: ', error);
          }
        )
        if (selectedChapter && selectedChapter.id_chapter !== undefined) {
          localStorage.setItem('id_chapter', selectedChapter.id_chapter.toString());
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
        } else {
          console.log("chapter or id_chapter is invalid");
        }
        this.router.navigate([`/manga/${this.id_manga}/chapter/${numericIndex}`]).then(() => {
          this.loadImages();
          this.chapter_index = numericIndex;
          console.log('Navigated to chapter:', this.chapter_index);
        });
      }
    }
  }


  hasPreviousChapter(): boolean {
    return this.chapter_index > 1;
  }

  hasNextChapter(): boolean {
    return this.chapter_index < this.chapters.length;
  }

  isLoggedIn(): boolean {
    const id_user = localStorage.getItem('userId');
    return !!(id_user && Number(id_user) != -1);
  }

  //nguyen
  loadAllComment() {

    this.listDataComment = []
    this.listYourComment = []
    const userId = localStorage.getItem('userId');
    this.yourId = userId !== null ? parseInt(userId, 10) : 0;
    const idChapter = localStorage.getItem('id_chapter');
    this.idChap = idChapter !== null ? parseInt(idChapter, 10) : 0;
    this.loadComment()
      .then(() => this.loadInfoAccount())
      .then(() => this.takeData())
      .catch(error => console.error('Error loading data:', error));
    this.loadComment()
      .then(() => this.loadAccount())
      .then(() => this.loadInfoAccount())
      .then(() => this.takeYourData())
      .catch(error => console.error('Error loading data:', error));
  }

  loadAccount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.accountService.getAccount().subscribe(
        (data: ModelAccount[]) => {
          this.listAccount = data;
          for (let i = 0; i < this.listAccount.length; i++) {
            if (this.listAccount[i].id_account === this.yourId) {
              this.yourAc = this.listAccount[i];
              resolve();
              return;
            }
          }
          reject(new Error('Account not found'));
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  deleteComment(id_cm: any) {

    this.commentService.deleteBanner(id_cm).subscribe(
      (response) => {
        alert('Upload thành công:');

      },
      (error) => {
        alert('Upload thất bại:');
      }
    );


  }

  updateComment(id_cm: any) {

    const textupdate = this.el.nativeElement.querySelector(`#text${id_cm}`);
    var id = this.yourId;
    var idchap = this.idChap;
    const comment: ModelComment = {
      id_comment: id_cm,
      id_chapter: idchap,
      id_user: id,
      content: textupdate.value,
      isReported: false,
    }
    this.commentService.updateComment(comment).subscribe(
      (response) => {
        alert('Upload thành công:');
      },
      (error) => {
        alert('Upload thất bại:');
      }
    );


  }

  addComment() {
    const text = this.el.nativeElement.querySelector('#textComment');
    var id = this.yourId;
    var idchap = this.idChap;
    const comment: ModelComment = {
      id_chapter: idchap,
      id_user: id,
      content: text.value,
      isReported: false,
    }
    this.commentService.addComment(comment).subscribe(
      (response) => {
        alert('Upload thành công:');
      },
      (error) => {
        alert('Upload thất bại:');
      }
    );

  }

  takeData() {
    for (var i = 0; i < this.comments.length; i++) {
      for (var k = 0; k < this.listDataComment.length; k++) {
        if (this.listDataComment[k].Comment?.id_comment == this.comments[i].id_comment) {
          return;
        }
      }
      if (this.comments[i].id_chapter === this.idChap) {
        for (var j = 0; j < this.listInfoAccount.length; j++) {
          if (this.comments[i].id_user === this.listInfoAccount[j].id_account && this.comments[i].id_user != this.yourId) {
            this.listDataComment.push(new CommentData(
              this.comments[i],
              this.listInfoAccount[j]
            ));

          }
        }
      }
    }
  }

  takeYourData() {
    for (var i = 0; i < this.comments.length; i++) {
      for (var k = 0; k < this.listYourComment.length; k++) {
        if (this.listYourComment[k].Comment?.id_comment == this.comments[i].id_comment) {
          return;
        }
      }
      if (this.comments[i].id_chapter === this.idChap) {
        for (var j = 0; j < this.listInfoAccount.length; j++) {
          if (this.comments[i].id_user === this.listInfoAccount[j].id_account && this.comments[i].id_user == this.yourId) {
            this.listYourComment.push(new CommentData(
              this.comments[i],
              this.listInfoAccount[j]
            ));
          }
        }
      }
    }
  }

  loadComment(): Promise<void> {
    return new Promise((resolve, reject) => {
        this.commentService.getCommnet().subscribe(
          (data: ModelComment[]) => {
            this.comments = data;
            resolve();
          },
          error => {
            console.error('Lỗi ', error);
          }
        );
      }
    )
  }

  loadInfoAccount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.infoAccountservice.getinfoaccount().subscribe(
        (data: ModelInfoAccount[]) => {
          this.listInfoAccount = data;
          resolve();
        },
        (error) => {
          console.error('Error fetching info accounts', error);
        }
      );
    })
  }

  addreport(idchap: any, id: any, text: any) {

    const comment: ModelComment = {
      id_chapter: idchap,
      id_user: id,
      content: text,
      isReported: true,
    }
    this.commentService.addComment(comment).subscribe(
      (response) => {
        alert('Báo cáo thành công');
      },
      (error) => {
        alert('thất bại:');
      }
    );


  }


}
