import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { WebRequestService } from 'src/app/web-request.service';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss']
})
export class EditListComponent implements OnInit {
  selection;
  listId;
  taskId;
  constructor(
    private router: Router,
    private webRequest: WebRequestService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    if (this.router.url.includes('task')) {
      this.selection = 'task';
    } else {
      this.selection = 'list';
    }
    this.route.params.subscribe(params => {
      this.listId = params.listId;
      this.taskId = params.taskId;
    });
  }
  edit(value) {
    if (this.selection === 'task') {
      this.webRequest
        .patch(`lists/${this.listId}/tasks/${this.taskId}`, {
          title: value
        })
        .subscribe(res => {
          this.router.navigate([`lists/${this.listId}`]);
        });
    } else {
      this.webRequest
        .patch(`lists/${this.listId}`, { title: value })
        .subscribe(res => {
          this.router.navigate([`lists/${this.listId}`]);
        });
    }
  }
}
