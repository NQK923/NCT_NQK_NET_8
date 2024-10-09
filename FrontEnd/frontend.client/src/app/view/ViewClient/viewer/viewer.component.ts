import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {ChapterService} from '../../../service/Chapter/get_chapter.service';
import {ChapterDetailsService} from '../../../service/Chapter/chapter_details.service'
import {CommentService} from "../../../service/Comment/comment.service";
import {ModelComment} from "../../../Model/ModelComment";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {InfoAccountService} from '../../../service/InfoAccount/info-account.service';

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
  index!: number;
  images: string[] = [];
  chapters: Chapter[] = [];
  //nguyen
  comment: ModelComment[] = [];
  comments: ModelComment[] = [];
  listinfoaccount: ModelInfoAccount[] = [];

  listdatacomment: CommentData[] = [];
  listyourcomment: CommentData[] = [];
  yourid: number = 1;
  idchap: number = 1;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private chapterService: ChapterService,
    private router: Router,
    private chapterDetailsService: ChapterDetailsService,
    private infoAccountservice: InfoAccountService,
    private commentService: CommentService
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id_manga = params['id_manga'];
      this.chapterService.getChaptersByMangaId(this.id_manga).subscribe(
        (data: Chapter[]) => {
          this.chapters = data;
          this.route.params.subscribe(newParams => {
            this.index = newParams['index'];
            this.loadImages();
          });
        },
        (error) => {
          console.error('Error fetching chapters', error);
        }
      );
    });
    this.loadcomment()
      .then(() => this.loadInfoAccount())
      .then(() => this.takedata())
      .catch(error => console.error('Error loading data:', error));
    this.loadcomment()
      .then(() => this.loadInfoAccount())
      .then(() => this.takeyourdata())
      .catch(error => console.error('Error loading data:', error));
  }

  loadImages(): void {
    this.chapterDetailsService.getImagesByMangaIdAndIndex(this.id_manga, this.index).subscribe(
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
      this.index = numericIndex;
      this.images = [];
      const selectedChapter = this.chapters.find(chapter => chapter.index === numericIndex);
      if (selectedChapter) {
        this.chapterService.incrementChapterView(selectedChapter.id_chapter).subscribe(() => {
        });
        this.router.navigate([`/manga/${this.id_manga}/chapter/${numericIndex}`]).then(() => {
          this.loadImages();
          console.log('Navigated to chapter:', this.index);
        });
      }
    }
  }

  hasPreviousChapter(): boolean {
    return this.index > 1;
  }

  hasNextChapter(): boolean {
    return this.index < this.chapters.length;
  }


  //nguyen
  takedata() {
    for (var i = 0; i < this.comments.length; i++) {
      if (this.comments[i].id_chapter === this.idchap) {
        for (var j = 0; j < this.listinfoaccount.length; j++) {
          if (this.comments[i].id_user === this.listinfoaccount[j].id_account && this.comments[i].id_user != this.yourid) {
            this.listdatacomment.push(new CommentData(
              this.comments[i],
              this.listinfoaccount[j]
            ));
          }
        }
      }
    }
    console.log(this.listdatacomment);
  }

  takeyourdata() {
    for (var i = 0; i < this.comments.length; i++) {
      if (this.comments[i].id_chapter === this.idchap) {
        for (var j = 0; j < this.listinfoaccount.length; j++) {
          if (this.comments[i].id_user === this.listinfoaccount[j].id_account && this.comments[i].id_user == this.yourid) {
            this.listyourcomment.push(new CommentData(
              this.comments[i],
              this.listinfoaccount[j]
            ));
          }
        }
      }
    }
    console.log(this.listdatacomment);
  }

  loadcomment(): Promise<void> {
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
          this.listinfoaccount = data;
          resolve();
        },
        (error) => {
          console.error('Error fetching info accounts', error);
        }
      );
    })
  }

  addComment() {
    for (let i = 0; i < this.comment.length; i++) {
      if (this.comment[i].id_chapter == 1) {
        this.comments.push(this.comments[i])
      }

    }
  }


}
