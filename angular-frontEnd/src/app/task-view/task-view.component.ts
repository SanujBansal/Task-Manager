import { Component, OnInit } from '@angular/core';
import { WebRequestService } from '../web-request.service';
import { Task } from '../models/task.model';
import { ActivatedRoute, Router } from '@angular/router';
import { List } from '../models/list.model';
import { Route } from '@angular/compiler/src/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {
  lists: List[];
  tasks: Task[];
  constructor(
    private webRequest: WebRequestService,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}
  deleteList() {
    let listId;
    this.route.params.subscribe(params => {
      listId = params.listId;
    });
    this.webRequest.delete(`lists/${listId}`).subscribe(res => {
      this.router.navigate(['/lists']);
    });
  }
  logout() {
    this.auth.logout();
  }
  deleteTask(taskId) {
    let listId;
    this.route.params.subscribe(params => {
      listId = params.listId;
    });
    this.webRequest.delete(`lists/${listId}/tasks/${taskId}`).subscribe(res => {
      console.log(res);
      this.tasks = this.tasks.filter(task => task._id !== taskId);
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.listId) {
        this.getTasks(params.listId);
      } else {
        this.tasks = undefined;
      }
    });
    this.webRequest.get('lists').subscribe((res: List[]) => {
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
      .subscribe(res => {});
  }

  editList() {
    this.router.navigate(['edit'], { relativeTo: this.route });
    // this.router.navigate([`${this.route}/edit`]);
  }
  editTask(taskId) {
    this.router.navigate([`edit/task/${taskId}`], { relativeTo: this.route });
  }
  moveToNewTask() {
    let listId;
    this.route.params.subscribe(params => (listId = params.listId));
    console.log(listId);
    if (listId) {
      this.router.navigate(['new-task'], { relativeTo: this.route });
    }
  }
}
