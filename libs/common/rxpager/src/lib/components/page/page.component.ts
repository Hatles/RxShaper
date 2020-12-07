import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnDestroy,
  OnInit, Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Page} from "../../models/page";
import {ComponentRegistry} from "../../services/component-registry";
import {PageType} from "../../models/page-type";
import {EmptyPageComponent} from "../empty-page/empty-page.component";

@Component({
  selector: 'rxpager-page',
  templateUrl: './page.component.html',
})
export class PageComponent implements OnInit, OnDestroy {

  @ViewChild('content', {static: true, read: ViewContainerRef})
  contentRef: ViewContainerRef;
  pageRef: ComponentRef<PageType>;

  page: Page;

  constructor(
    private route: ActivatedRoute,
    private resolver: ComponentFactoryResolver,
    private registry: ComponentRegistry
  ) {
    this.page = route.snapshot.data.page;
  }

  ngOnInit(): void {
    const componentType = this.page.component ? this.getComponentType(this.page.component) : EmptyPageComponent;
    const factory = this.resolver.resolveComponentFactory(componentType);
    this.pageRef = this.contentRef.createComponent<PageType>(factory);

    this.pageRef.instance.page = this.page;
    this.pageRef.changeDetectorRef.detectChanges();
  }

  private getComponentType(component?: string | Type<any>) {
    if (component instanceof Type) {
      return component;
    }

    return this.registry.get(component);
  }

  ngOnDestroy(): void {
    if (this.pageRef) {
      this.pageRef.destroy();
    }
  }

}
