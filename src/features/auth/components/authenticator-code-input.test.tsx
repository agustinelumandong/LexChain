// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthenticatorCodeInput } from './authenticator-code-input';

afterEach(cleanup);

function CodeField() {
  const [code, setCode] = useState('');
  return (
    <>
      <label htmlFor="code">Authenticator code</label>
      <AuthenticatorCodeInput id="code" value={code} onChange={setCode} invalid={false} />
    </>
  );
}

function enteredCode() {
  return (screen.getByLabelText('Authenticator code') as HTMLInputElement).value;
}

function boxContents() {
  return Array.from(document.querySelectorAll('[data-code-box]')).map((box) => box.textContent);
}

describe('AuthenticatorCodeInput', () => {
  it('shows six empty boxes before a code is entered', () => {
    render(<CodeField />);
    expect(boxContents()).toEqual(['', '', '', '', '', '']);
  });

  it('places each digit in its own box', () => {
    render(<CodeField />);
    fireEvent.change(screen.getByLabelText('Authenticator code'), { target: { value: '394' } });
    expect(boxContents()).toEqual(['3', '9', '4', '', '', '']);
  });

  it('accepts only digits', () => {
    render(<CodeField />);
    fireEvent.change(screen.getByLabelText('Authenticator code'), { target: { value: '12ab3-' } });
    expect(enteredCode()).toBe('123');
  });

  it('keeps only six digits, including from a pasted code with spaces', () => {
    render(<CodeField />);
    fireEvent.change(screen.getByLabelText('Authenticator code'), { target: { value: '394 418 77' } });
    expect(enteredCode()).toBe('394418');
    expect(boxContents()).toEqual(['3', '9', '4', '4', '1', '8']);
  });
});
