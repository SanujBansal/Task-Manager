import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskViewComponent } from './task-view/task-view.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'lists',
    pathMatch: 'full'
  },
  {
    path: 'lists/:listId',
    component: TaskViewComponent
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
