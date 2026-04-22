interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className="text-red-600 text-sm" role="alert">
      {message}
    </p>
  );
}

export default FieldError;
