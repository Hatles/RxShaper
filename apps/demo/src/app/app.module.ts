import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BuilderModule } from '@builder.io/angular';

import { AppComponent } from './app.component';
import { FooComponent } from './foo.component';
import {CustomThingComponent} from "./custom-thing.component";
import { BuilderComponent } from './components/builder/builder.component';
import { BlockComponent } from './components/block/block.component';
import { ChildrenHostDirective } from './directives/children-host.directive';

@NgModule({
  declarations: [AppComponent, FooComponent, CustomThingComponent, BuilderComponent, BlockComponent, ChildrenHostDirective],
  entryComponents: [CustomThingComponent],
  imports: [
    BrowserModule,
    BuilderModule.forRoot('1f3bf1d766354f32ba70dde440fcef97'),
    RouterModule.forRoot([
      {
        path: '**',
        component: FooComponent,
      },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
