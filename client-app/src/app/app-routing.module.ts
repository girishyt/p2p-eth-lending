import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user/user.component';
import { TokenSaleComponent } from './token-sale/token-sale.component';


const routes: Routes = [
  {path:'user', component:UserComponent},
  {path:'sale', component:TokenSaleComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
