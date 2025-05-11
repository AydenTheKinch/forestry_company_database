interface FormInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
}

export const FormInput: React.FC<FormInputProps> = ({ id, name, value, onChange, label, placeholder }) => {
  return (
    <div>
      <label htmlFor={id} className="block font-medium mb-1">{label}</label>
      <input 
        type="text" 
        id={id} 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  );
};