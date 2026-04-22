import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import DynamicForm from '../DynamicForm';
import type { FormField } from '../../../types';

const mockFields: FormField[] = [
  {
    id: 'field_name',
    type: 'text',
    label: 'Full Name',
    required: true,
    enabled: true,
    order: 0,
    placeholder: 'Enter your name',
  },
  {
    id: 'field_email',
    type: 'email',
    label: 'Email Address',
    required: true,
    enabled: true,
    order: 1,
  },
  {
    id: 'field_phone',
    type: 'tel',
    label: 'Phone Number',
    required: false,
    enabled: true,
    order: 2,
  },
  {
    id: 'field_subject',
    type: 'select',
    label: 'Subject',
    required: true,
    enabled: true,
    order: 3,
    options: [
      { value: 'general_inquiry', label: 'General Inquiry' },
      { value: 'feedback', label: 'Feedback' },
      { value: 'support', label: 'Support' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'field_newsletter',
    type: 'checkbox',
    label: 'Subscribe to newsletter',
    required: false,
    enabled: true,
    order: 4,
  },
  {
    id: 'field_date',
    type: 'date',
    label: 'Submission Date',
    required: true,
    enabled: true,
    order: 5,
  },
  {
    id: 'field_time',
    type: 'time',
    label: 'Submission Time',
    required: true,
    enabled: true,
    order: 6,
  },
  {
    id: 'field_notes',
    type: 'textarea',
    label: 'Additional Notes',
    required: false,
    enabled: true,
    order: 7,
  },
  {
    id: 'field_age',
    type: 'number',
    label: 'Age',
    required: false,
    enabled: true,
    order: 8,
    validation: { min_value: 0, max_value: 120 },
  },
];

describe('DynamicForm', () => {
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all enabled fields in order', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subscribe to newsletter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/submission date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/submission time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/additional notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
  });

  it('does not render disabled fields', () => {
    const fieldsWithDisabled: FormField[] = [
      ...mockFields,
      {
        id: 'field_disabled',
        type: 'text',
        label: 'Disabled Field',
        required: false,
        enabled: false,
        order: 99,
      },
    ];

    render(
      <DynamicForm
        fields={fieldsWithDisabled}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.queryByLabelText(/disabled field/i)).not.toBeInTheDocument();
  });

  it('shows required indicator for required fields', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const nameLabel = screen.getByText('Full Name');
    expect(nameLabel).toBeInTheDocument();
    expect(nameLabel.closest('label')).toBeInTheDocument();
  });

  it('calls onChange when field value changes', async () => {
    const user = userEvent.setup();

    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, 'John Doe');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onBlur when field loses focus', async () => {
    const user = userEvent.setup();

    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const nameInput = screen.getByLabelText(/full name/i);
    await user.click(nameInput);
    await user.tab();

    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('displays error message for invalid field', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{ field_name: 'Name is required' }}
        touched={{ field_name: true }}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('does not display error message when field is not touched', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{ field_name: 'Name is required' }}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  it('displays placeholder text when provided', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const nameInput = screen.getByPlaceholderText('Enter your name');
    expect(nameInput).toBeInTheDocument();
  });

  it('renders select field with options', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const selectElement = screen.getByLabelText(/subject/i);
    expect(selectElement).toBeInTheDocument();

    expect(screen.getByRole('option', { name: 'General Inquiry' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Feedback' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Support' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
  });

  it('renders checkbox field', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /subscribe to newsletter/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('renders textarea field', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const textarea = screen.getByLabelText(/additional notes/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
  });

  it('renders date input', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const dateInput = screen.getByLabelText(/submission date/i);
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveAttribute('type', 'date');
  });

  it('renders time input', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const timeInput = screen.getByLabelText(/submission time/i);
    expect(timeInput).toBeInTheDocument();
    expect(timeInput).toHaveAttribute('type', 'time');
  });

  it('renders number input', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{}}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const ageInput = screen.getByLabelText(/age/i);
    expect(ageInput).toBeInTheDocument();
    expect(ageInput).toHaveAttribute('type', 'number');
  });

  it('displays pre-filled form data', () => {
    render(
      <DynamicForm
        fields={mockFields}
        formData={{ field_name: 'Jane Doe', field_email: 'jane@example.com' }}
        errors={{}}
        touched={{}}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
  });
});