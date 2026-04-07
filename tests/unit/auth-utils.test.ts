import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Session } from 'next-auth';
import {
  applyTokenToSession,
  applyUserToToken,
  getAuthRedirectPath,
} from '../../src/lib/auth-utils';

describe('getAuthRedirectPath', () => {
  it('permite acceder a login sin sesion', () => {
    assert.equal(getAuthRedirectPath('/login', false), null);
  });

  it('redirige a dashboard cuando ya existe sesion', () => {
    assert.equal(getAuthRedirectPath('/login', true), '/dashboard');
  });

  it('redirige a login cuando la ruta esta protegida y no hay sesion', () => {
    assert.equal(getAuthRedirectPath('/dashboard', false), '/login');
  });

  it('permite continuar cuando la ruta esta protegida y hay sesion', () => {
    assert.equal(getAuthRedirectPath('/dashboard', true), null);
  });
});

describe('applyUserToToken', () => {
  it('copia los datos personalizados del usuario al token', () => {
    const token = applyUserToToken(
      {},
      {
        id: 'user-1',
        name: 'Admin',
        email: 'admin',
        username: 'admin',
        nombre: 'Administrador',
        rol: 'ADMIN',
        color: '#123456',
        departamentoId: 'dept-1',
        permisos: ['EDITAR', 'VER'],
      }
    );

    assert.deepEqual(
      {
        id: token.id,
        username: token.username,
        nombre: token.nombre,
        rol: token.rol,
        color: token.color,
        departamentoId: token.departamentoId,
        permisos: token.permisos,
      },
      {
      id: 'user-1',
      username: 'admin',
      nombre: 'Administrador',
      rol: 'ADMIN',
      color: '#123456',
      departamentoId: 'dept-1',
      permisos: ['EDITAR', 'VER'],
      }
    );
  });

  it('deja el token sin cambios cuando no recibe usuario', () => {
    const token = applyUserToToken({ id: 'existing-token' });

    assert.equal(token.id, 'existing-token');
  });
});

describe('applyTokenToSession', () => {
  it('copia los datos del token a la sesion', () => {
    const session: Session = {
      expires: '2099-01-01T00:00:00.000Z',
      user: {
        name: 'Admin',
        email: 'admin',
        image: null,
        id: '',
        username: '',
        nombre: '',
        rol: 'VIEWER',
        color: '',
        departamentoId: null,
        permisos: [],
      },
    };

    const nextSession = applyTokenToSession(session, {
      id: 'user-1',
      username: 'admin',
      nombre: 'Administrador',
      rol: 'ADMIN',
      color: '#123456',
      departamentoId: 'dept-1',
      permisos: ['EDITAR'],
    });

    assert.deepEqual(nextSession.user, {
      name: 'Admin',
      email: 'admin',
      image: null,
      id: 'user-1',
      username: 'admin',
      nombre: 'Administrador',
      rol: 'ADMIN',
      color: '#123456',
      departamentoId: 'dept-1',
      permisos: ['EDITAR'],
      totpEnabled: false,
    });
  });
});