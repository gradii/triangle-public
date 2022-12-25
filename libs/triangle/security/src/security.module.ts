/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { TriIsGrantedDirective } from './directives/is-granted.directive';

import { TRI_SECURITY_OPTIONS_TOKEN, TriAclOptions } from './security.options';
import { TriAccessChecker } from './services/access-checker.service';
import { TriAclService } from './services/acl.service';
import { EmptyRoleProvider } from './services/role.provider';

/**
 * <!-- example(security:security-basic-example) -->
 */
@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    TriIsGrantedDirective,
  ],
  exports: [
    TriIsGrantedDirective,
  ],
})
export class TriSecurityModule {
  static forRoot(securityOptions?: TriAclOptions): ModuleWithProviders<TriSecurityModule> {
    return {
      ngModule : TriSecurityModule,
      providers: [
        {provide: TRI_SECURITY_OPTIONS_TOKEN, useValue: securityOptions},
        TriAclService,
        TriAccessChecker,
        EmptyRoleProvider,
      ],
    };
  }
}
