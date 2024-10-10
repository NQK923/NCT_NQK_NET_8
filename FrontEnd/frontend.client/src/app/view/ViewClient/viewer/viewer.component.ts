import {Component, ElementRef, OnInit} from '@angular/core';
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
  chapter_index!: number;
  images: string[] = [];
  chapters: Chapter[] = [];
  //nguyen
  comment: ModelComment[] = [];
  comments: ModelComment[] = [];
  listinfoaccount: ModelInfoAccount[] = [];

  listdatacomment: CommentData[] = [];
  listyourcomment: CommentData[] = [];
  yourid: number = -1;
  idchap: number = -1;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private chapterService: ChapterService,
    private router: Router,
    private chapterDetailsService: ChapterDetailsService,
    private infoAccountservice: InfoAccountService,
    private el: ElementRef,
    private commentService: CommentService
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
            this.index = newParams['index'];
            this.loadImages();
            //nguyen
            this.listdatacomment = [];
            this.listyourcomment = [];
            this.loadallcomment();
          });
        },
        (error) => {
          console.error('Error fetching chapters', error);
        }
      );
    });


  }



  loadImages(): void {
    this.chapterDetailsService.getImagesByMangaIdAndIndex(this.id_manga, this.chapter_index).subscribe(
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
        this.chapterService.incrementChapterView(selectedChapter.id_chapter).subscribe(() => {
        });
        if (selectedChapter && selectedChapter.id_chapter !== undefined) {
          localStorage.setItem('id_chapter', selectedChapter.id_chapter.toString());
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


  //nguyen
  loadallcomment() {

    // Retrieve userId from localStorage
    const userId = localStorage.getItem('userId');
    this.yourid = userId !== null ? parseInt(userId, 10) : 0; // Default to 0 if null
    console.log("user", this.yourid);

    console.log(localStorage.getItem('id_chapter')); // Nên hiện ra "3"
    const idChapter = localStorage.getItem('id_chapter');
    this.idchap = idChapter !== null ? parseInt(idChapter, 10) : 0; // Default to 0 if null
    console.log("idchap", this.idchap);
    this.loadcomment()
      .then(() => this.loadInfoAccount())
      .then(() => this.takedata())
      .catch(error => console.error('Error loading data:', error));
    this.loadcomment()
      .then(() => this.loadInfoAccount())
      .then(() => this.takeyourdata())
      .catch(error => console.error('Error loading data:', error));

  }

  deletecomment(id_cm: any) {

    this.commentService.deleteBanner(id_cm).subscribe(
      (response) => {
        alert('Upload thành công:');

      },
      (error) => {
        alert('Upload thất bại:');
      }
    );


  }

  updatecomment(id_cm: any) {

    const textupdate = this.el.nativeElement.querySelector(`#text${id_cm}`);
    var id = this.yourid;
    var idchap = this.idchap;
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

  addcomment() {
    const text = this.el.nativeElement.querySelector('#textComment');
    var id = this.yourid;
    var idchap = this.idchap;
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

  takedata() {
    for (var i = 0; i < this.comments.length; i++) {
      for (var k = 0; k < this.listdatacomment.length; k++) {
        if (this.listdatacomment[k].Comment?.id_comment == this.comments[i].id_comment) {
          return;
        }
      }
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
  }

  takeyourdata() {
    for (var i = 0; i < this.comments.length; i++) {
      for (var k = 0; k < this.listyourcomment.length; k++) {
        if (this.listyourcomment[k].Comment?.id_comment == this.comments[i].id_comment) {
          return;
        }
      }
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
    console.log("yourdata", this.listdatacomment);
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
