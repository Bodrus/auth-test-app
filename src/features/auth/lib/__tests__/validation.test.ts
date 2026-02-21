import i18n from 'i18next';

import { createLoginSchema, type LoginFormData } from '../validation';

const errorsFor = (data: Record<string, string>, field: string): string[] => {
  const schema = createLoginSchema();
  const result = schema.safeParse(data);
  expect(result.success).toBe(false);
  if (!result.success) {
    return result.error.issues
      .filter((i) => i.path[0] === field)
      .map((i) => i.message);
  }
  return [];
};

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const schema = createLoginSchema();
    const result = schema.safeParse({
      username: 'emilys',
      password: 'emilyspass',
    });

    expect(result.success).toBe(true);
  });

  it('accepts exact boundary values (username=3, password=6)', () => {
    const schema = createLoginSchema();
    const result = schema.safeParse({ username: 'abc', password: 'abcdef' });

    expect(result.success).toBe(true);
  });

  it('rejects empty username with required message', () => {
    const errors = errorsFor({ username: '', password: 'emilyspass' }, 'username');

    expect(errors).toContain(i18n.t('validation.usernameRequired'));
  });

  it('rejects short username (1-2 chars) with invalid message', () => {
    const errors = errorsFor({ username: 'ab', password: 'emilyspass' }, 'username');

    expect(errors).toContain(i18n.t('validation.usernameInvalid'));
  });

  it('rejects empty password with required message', () => {
    const errors = errorsFor({ username: 'emilys', password: '' }, 'password');

    expect(errors).toContain(i18n.t('validation.passwordRequired'));
  });

  it('rejects short password (1-5 chars) with invalid message', () => {
    const errors = errorsFor({ username: 'emilys', password: 'abc' }, 'password');

    expect(errors).toContain(i18n.t('validation.passwordInvalid'));
  });

  it('returns errors for both fields when both are invalid', () => {
    const schema = createLoginSchema();
    const result = schema.safeParse({ username: '', password: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain('username');
      expect(paths).toContain('password');
    }
  });

  it('inferred type matches expected shape', () => {
    const data: LoginFormData = { username: 'test', password: 'secret' };

    expect(data).toEqual({ username: 'test', password: 'secret' });
  });
});
