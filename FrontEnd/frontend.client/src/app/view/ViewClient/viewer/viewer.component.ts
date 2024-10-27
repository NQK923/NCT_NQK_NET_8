import {Component, ElementRef, OnInit} from '@angular/core';
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
import {forkJoin, map} from "rxjs";

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
  chapter_index: number = 0;
  images: string[] = [];
  chapters: Chapter[] = [];
  comment: ModelComment[] = [];
  comments: ModelComment[] = [];
  listInfoAccount: ModelInfoAccount[] = [];
  listDataComment: CommentData[] = [];
  listYourComment: CommentData[] = [];
  yourId: number = -1;
  idChap: number = -1;
  listAccount: ModelAccount [] = [];
  yourAc: ModelAccount | null = null;

  constructor(
    private route: ActivatedRoute,
    private chapterService: ChapterService,
    private router: Router,
    private infoAccountService: InfoAccountService,
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
      if (this.chapter_index !== +params['index']) {
        this.chapter_index = +params['index'];
      }
      this.loadImages();
      this.chapterService.getChaptersByMangaId(this.id_manga).subscribe(
        (data: Chapter[]) => {
          this.chapters = data;
          this.loadAllComment();
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
          () => {
          },
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
            this.mangaHistoryService.addMangaHistory(numberId, this.id_manga, numericIndex).subscribe(
              () => {
              },
              (error) => {
                console.error('Error:', error);
              }
            );
          }
        } else {
          console.log("chapter or id_chapter is invalid");
        }
        this.chapter_index = numericIndex;
        this.router.navigate([`/manga/${this.id_manga}/chapter/${this.chapter_index}`]).then(() => {
          this.loadImages();
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
      this.accountService.getAccountById(Number(this.yourId)).subscribe(
        (data: ModelAccount) => {
          {
            this.yourAc = data
            resolve()
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
      () => {
        this.loadAllComment()
      },
      (error) => {
        console.error(error);
        alert('Upload thất bại:');
      }
    );
  }

  updateComment(id_cm: any) {
    const textUpdate = this.el.nativeElement.querySelector(`#text${id_cm}`);
    const id = this.yourId;
    const idChap = this.idChap;
    const comment: ModelComment = {
      id_comment: id_cm,
      id_chapter: idChap,
      id_user: id,
      content: textUpdate.value,
      isReported: false,
      time: new Date()
    }
    this.commentService.updateComment(comment).subscribe(
      () => {
        this.loadAllComment()
      },
      (error) => {
        console.error(error);
        alert('Upload thất bại:');
      }
    );
  }

  addComment() {
    const text = this.el.nativeElement.querySelector('#textComment');
    const id = this.yourId;
    const idChap = this.idChap;
    const comment: ModelComment = {
      id_chapter: idChap,
      id_user: id,
      content: text.value,
      isReported: false,
      time: new Date()
    }
    this.commentService.addComment(comment).subscribe(
      () => {
        this.loadAllComment()
      },
      (error) => {
        console.error(error);
        alert('Upload thất bại:');
      }
    );
  }

  takeData() {
    for (let i = 0; i < this.comments.length; i++) {
      const comment = this.comments[i];
      const existsInList = this.listDataComment.some(item => item.Comment?.id_comment === comment.id_comment);
      if (existsInList) {
        continue;
      }
      if (comment.id_chapter === this.idChap && comment.id_user !== this.yourId) {
        this.infoAccountService.getInfoAccountById(Number(comment.id_user)).subscribe(
          (data: ModelInfoAccount) => {
            this.listDataComment.push(new CommentData(comment, data));
          }
        );
      }
    }
  }

  takeYourData() {
    const existingCommentIds = new Set(this.listYourComment.map(comment => comment.Comment?.id_comment));
    const relevantComments = this.comments.filter(comment =>
      comment.id_chapter === this.idChap &&
      comment.id_user === this.yourId &&
      !existingCommentIds.has(comment.id_comment)
    );
    const accountRequests = relevantComments.map(comment =>
      this.infoAccountService.getInfoAccountById(Number(comment.id_user)).pipe(
        map((data: ModelInfoAccount) => new CommentData(comment, data))
      )
    );
    forkJoin(accountRequests).subscribe(
      (dataComments: CommentData[]) => {
        this.listYourComment.push(...dataComments);
      },
      (error) => {
        console.error('Error fetching account info:', error);
      }
    );
  }

  loadComment(): Promise<void> {
    return new Promise((resolve) => {
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
    return new Promise((resolve) => {
      this.infoAccountService.getInfoAccount().subscribe(
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

  addReport(idComment: any, idChap: any, id: any, text: any) {
    const comment: ModelComment = {
      id_comment: idComment,
      id_chapter: idChap,
      id_user: id,
      content: text,
      isReported: true,
      time: new Date()
    }
    console.log(comment)
    this.commentService.updateComment(comment).subscribe(
      () => {
        alert('Báo cáo thành công');
      },
      (error) => {
        console.error(error);
        alert('Thất bại:');
      }
    );
  }

  trackByChapterIndex(index: number, chapter: Chapter): number {
    return chapter.index;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
  onUpdate(){
    const text = this.el.nativeElement.querySelector('#buttonUndate');
    text.classList.remove('hidden');

  }
}
