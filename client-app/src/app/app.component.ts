import { Component } from '@angular/core';
declare let window: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'P2P Lending Application';

  constructor() {
  }

  ngOnInit(): void {
    window.ethereum.on('accountsChanged',(accounts)=>{
      window.location.reload();
    });
  }

}
