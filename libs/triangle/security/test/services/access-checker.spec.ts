import { async, inject, TestBed } from '@angular/core/testing';
import { of as observableOf } from 'rxjs';
import { TriAccessChecker } from '../../../src/security/services/access-checker.service';
import { TriAclService } from '../../../src/security/services/acl.service';

import { TriRoleProvider } from '../../../src/security/services/role.provider';

let accessChecker: TriAccessChecker;

function setupAcl(can, roles: string | string[]) {
  beforeEach(() => {
    // Configure testbed to prepare services
    TestBed.configureTestingModule({
      providers: [
        {
          provide : TriRoleProvider,
          useValue: {
            getRole: () => {
              return observableOf(roles);
            },
          },
        },
        {
          provide : TriAclService,
          useValue: {
            can: (role, permission, resource) => {
              return can[role]; // this is a simple mocked ACL implementation
            },
          },
        },
        TriAccessChecker,
      ],
    });
  });

  // Single async inject to save references; which are used in all tests below
  beforeEach(async(inject(
    [TriAccessChecker],
    (_accessChecker) => {
      accessChecker = _accessChecker;
    },
  )));
}

describe('authorization checker', () => {

  describe('acl returns true', () => {
    setupAcl({admin: true}, 'admin');

    it(`checks against provided role`, (done) => {
      accessChecker.isGranted('delete', 'users').subscribe((result: boolean) => {
        expect(result).toBe(true);
        done();
      });
    });
  });

  describe('acl returns false', () => {
    setupAcl({admin: false}, 'admin');

    it(`checks against provided role`, (done) => {
      accessChecker.isGranted('delete', 'users').subscribe((result: boolean) => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  describe('acl returns false (both roles return false)', () => {
    setupAcl({admin: false, user: false}, ['user', 'admin']);

    it(`checks against provided roles`, (done) => {
      accessChecker.isGranted('delete', 'users').subscribe((result: boolean) => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  describe('acl returns true (both roles return true)', () => {
    setupAcl({admin: true, user: true}, ['user', 'admin']);

    it(`checks against provided roles`, (done) => {
      accessChecker.isGranted('delete', 'users').subscribe((result: boolean) => {
        expect(result).toBe(true);
        done();
      });
    });
  });

  describe('acl returns true (one of the roles return true)', () => {
    setupAcl({admin: true, user: false}, ['user', 'admin']);

    it(`checks against provided roles`, (done) => {
      accessChecker.isGranted('delete', 'users').subscribe((result: boolean) => {
        expect(result).toBe(true);
        done();
      });
    });
  });
});
