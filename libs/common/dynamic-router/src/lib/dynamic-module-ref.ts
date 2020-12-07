import {ComponentFactoryResolver, Injector, NgModuleRef, StaticProvider} from "@angular/core";

export class DynamicModuleRef<T> extends NgModuleRef<T> {

  private readonly _injector: Injector;

  constructor(private parent: NgModuleRef<T>, providers: StaticProvider[] = []) {
    super();

    this._injector = Injector.create({parent: parent.injector, providers: providers});
  }

  get componentFactoryResolver(): ComponentFactoryResolver {
    return this.parent.componentFactoryResolver;
  }

  destroy(): void {
    this.parent.destroy();
  }

  get injector(): Injector {
    return this._injector;
  }

  get instance(): any {
    return this.parent.instance;
  }

  onDestroy(callback: () => void): void {
    this.parent.onDestroy(callback);
  }

}
