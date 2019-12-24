import { Component, OnInit } from '@angular/core';
import { WebRequestService } from 'src/app/web-request.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {
  constructor(private webRequest: WebRequestService, private router: Router) {}

  ngOnInit() {}
  createList(title) {
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
  }
}
