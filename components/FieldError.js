export default function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm font-medium text-[#a34400]">
      {message}
    </p>
  );
}
