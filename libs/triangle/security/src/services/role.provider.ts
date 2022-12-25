/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



export abstract class TriRoleProvider {

  /**
   * Returns current user role
   * @returns {Observable<string | string[]>}
   */
  abstract getRole(): Observable<string|string[]>;
}

@Injectable()
export class EmptyRoleProvider implements TriRoleProvider {

  constructor() {
  }

  getRole(): Observable<string> {
    throw new Error('Method not implemented.');
  }
}