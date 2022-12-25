/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Type } from '@angular/core';
import { toUniqueType } from './utils';


@Injectable({providedIn: 'root'})
export class RegistryService<C = ComponentPortal<Type<any>>> {
  private _registry: Map<string, C> = new Map<string, C>();

  constructor() {
  }

  hasNamespaceAndType(namespace: string, type: string): boolean {
    return this._registry.has(toUniqueType(type, namespace));
  }

  getNamespaceAndName(namespace: string, name: string): C | undefined {
    return this._registry.get(toUniqueType(name, namespace));
  }

  get(key: string): C | undefined {
    return this._registry.get(key);
  }

  has(key: string): boolean {
    return this._registry.has(key);
  }

  set(key: string, component: C) {
    this._registry.set(key, component);
  }

  clear() {
    this._registry.clear();
  }

  delete(key: string) {
    this._registry.delete(key);
  }
}
