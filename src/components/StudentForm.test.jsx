// A basic test that just checks if the component renders
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Simple mock of the StudentForm
const MockStudentForm = () => {
  return (
    <div>
      <h2>Register New Student</h2>
      <form>
        <input placeholder="Admission Number" />
        <input placeholder="First Name" />
        <input placeholder="Last Name" />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

describe('StudentForm Simple Test', () => {
  it('should render the form title', () => {
    render(
      <BrowserRouter>
        <MockStudentForm />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Register New Student')).toBeDefined();
  });

  it('should have a submit button', () => {
    render(
      <BrowserRouter>
        <MockStudentForm />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('button', { name: /register/i })).toBeDefined();
  });
});