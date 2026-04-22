import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import FieldEditor from '../FieldEditor';
import type { FormField } from '../../../types';

describe('FieldEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders field type buttons', () => {
    render(<FieldEditor field={null} onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: 'Text' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Text Area' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Number' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Phone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dropdown' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checkbox' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Date' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Time' })).toBeInTheDocument();
  });

  it('renders label input', () => {
    render(<FieldEditor field={null} onSave={mockOnSave} onCancel={mockOnCancel} />);

    const labelInput = screen.getByPlaceholderText('Enter field label');
    expect(labelInput).toBeInTheDocument();
  });

  it('renders required and enabled checkboxes as checked by default', () => {
    render(<FieldEditor field={null} onSave={mockOnSave} onCancel={mockOnCancel} />);

    const requiredCheckbox = screen.getByRole('checkbox', { name: /required field/i });
    const enabledCheckbox = screen.getByRole('checkbox', { name: /^enabled$/i });

    expect(requiredCheckbox).toBeChecked();
    expect(enabledCheckbox).toBeChecked();
  });

  it('renders cancel and save buttons', () => {
    render(<FieldEditor field={null} onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Field' })).toBeInTheDocument();
  });

  it('renders validation section for text type', () => {
    render(<FieldEditor field={null} onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByText('Validation Rules')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('255')).toBeInTheDocument();
  });

  it('renders with existing field data when editing', () => {
    const existingField: FormField = {
      id: 'field_1',
      type: 'email',
      label: 'Email Address',
      required: false,
      enabled: true,
      order: 0,
    };

    render(<FieldEditor field={existingField} onSave={mockOnSave} onCancel={mockOnCancel} />);

    const labelInput = screen.getByDisplayValue('Email Address');
    expect(labelInput).toBeInTheDocument();
  });

  it('shows update button when editing existing field', () => {
    const existingField: FormField = {
      id: 'field_1',
      type: 'text',
      label: 'Name',
      required: true,
      enabled: true,
      order: 0,
    };

    render(<FieldEditor field={existingField} onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: 'Update Field' })).toBeInTheDocument();
  });

  it('renders placeholder and help text inputs', () => {
    render(<FieldEditor field={null} onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByPlaceholderText('Enter placeholder text')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Additional help text for this field')).toBeInTheDocument();
  });
});