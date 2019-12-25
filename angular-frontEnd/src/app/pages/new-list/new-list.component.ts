import { Component, OnInit } from '@angular/core';
import { WebRequestService } from 'src/app/web-request.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {
  constructor(
    private webRequest: WebRequestService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  selection: string;
  ngOnInit() {
    if (this.router.url.includes('new-list')) {
      this.selection = 'list';
    } else {
      this.selection = 'task';
    }
  }
  create(title) {
    if (this.selection === 'list') {
      this.webRequest.post('lists', { title }).subscribe(
        res => {
          const id: any = res;
          this.router.navigate(['/lists', id._id]);
        },
        err => {
          alert('there was problem check console for details');
          console.log(err);
        }
      );
    } else {
      this.route.params.subscribe(params => {
        console.log(params.listId);
        this.webRequest
          .post(`lists/${params.listId}/tasks`, { title })
          .subscribe(res => {
            const response: any = res;
            this.router.navigate(['/lists', response._listId]);
          });
      });
    }
  }
}
