import { Component, OnInit } from '@angular/core';
import { ProxyService } from 'app-lib';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.less']
})
export class UserInfoComponent implements OnInit {

  constructor(public boot:ProxyService) { }

  ngOnInit(): void {
  }

}
