import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskViewComponent } from './task-view/task-view.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { LoginComponent } from './login/login.component';
import { EditListComponent } from './pages/edit-list/edit-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'lists',
    pathMatch: 'full'
  },
  {
    path: 'lists/:listId',
    component: TaskViewComponent,
    pathMatch: 'full'
  },
  {
    path: 'lists/:listId/edit',
    component: EditListComponent
  },
  {
    path: 'lists/:listId/edit/task/:taskId',
    component: EditListComponent
  },
  {
    path: 'lists',
    component: TaskViewComponent
  },
  {
    path: 'new-list',
    component: NewListComponent
  },
  {
    path: 'lists/:listId/new-task',
    component: NewListComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
