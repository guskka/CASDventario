export default function InputFloatingLabel({
  id,
  type,
  text,
  value,
  onChange,
  ...props
}) {
  return (
    <div className="relative w-full">
      <input
        className={`w-full peer px-4 py-2 rounded-md border border-input outline-none focus:border-2 focus:border-ring/50 `}
        id={id}
        type={type}
        placeholder=""
        value={value}
        onChange={onChange}
        {...props}
      />
      <label
        htmlFor={id}
        className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-text select-none peer-focus:left-2 peer-focus:top-0 peer-focus:px-1 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-background peer-not-placeholder-shown:left-2 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:px-1 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-background transition-all ease-in-out`}
      >
        {text}
      </label>
    </div>
  );
}
