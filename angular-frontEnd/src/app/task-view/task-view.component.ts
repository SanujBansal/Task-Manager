import { Component, OnInit } from '@angular/core';
import { WebRequestService } from '../web-request.service';
import { Task } from '../models/task.model';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {
  lists;
  tasks: Task[];
  constructor(
    private webRequest: WebRequestService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.listId) {
        this.getTasks(params.listId);
      }
    });
    this.webRequest.get('lists').subscribe(res => {
      this.lists = res;
    });
  }
  getTasks(id) {
    this.webRequest.get(`lists/${id}/tasks`).subscribe(tasks => {
      const res: any = tasks;
      this.tasks = res;
    });
  }
  changeCompletionStatus(task) {
    task.completed = !task.completed;
    this.webRequest
      .patch(`lists/${task._listId}/tasks/${task._id}`, task)
      .subscribe(res => {
        console.log(res);
      });
  }
}
