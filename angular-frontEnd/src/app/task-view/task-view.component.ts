import { Component, OnInit } from '@angular/core';
import { WebRequestService } from '../web-request.service';
import { Task } from '../models/task.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {
  lists;
  tasks: Task[] = [
    { title: "Select A List To Display It's tasks", listId: '', _id: '' }
  ];
  constructor(
    private webRequest: WebRequestService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.getTasks(params.id);
    });
    this.webRequest.get('lists').subscribe(res => {
      this.lists = res;
    });
  }
  getTasks(id) {
    this.webRequest.get(`lists/${id}/tasks`).subscribe(tasks => {
      const res: any = tasks;
      this.tasks = res;
      if (this.tasks.length === 0) {
        this.tasks = [new Task('This List has no tasks')];
      }
    });
  }
}
