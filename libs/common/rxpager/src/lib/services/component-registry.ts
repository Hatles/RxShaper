import {Inject, Injectable, Optional, Type} from '@angular/core';
import {ComponentRegistryItem} from "../models/component";
import {RXPAGER_OPTIONS, RxPagerOptions} from "../models/options";

@Injectable()
export class ComponentRegistry {

  components: ComponentRegistryItem[] = [];

  constructor(@Optional() @Inject(RXPAGER_OPTIONS) configs: RxPagerOptions[] = []) {
    this.registerConfigs(configs);
  }

  registerConfigs(configs: RxPagerOptions[]) {
    configs.forEach(c => this.registerConfig(c));
  }

  registerConfig(config: RxPagerOptions) {
    this.components.push(...(config.components || []));
  }

  get(component: string): Type<any> {
    const item = this.components.find(c => c.name === component);

    if (!item) {
      throw new Error("Can not find component with name '" + component + "' in pager component registry");
    }

    return item.type;
  }
}
