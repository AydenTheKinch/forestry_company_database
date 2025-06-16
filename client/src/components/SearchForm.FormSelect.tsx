interface FormSelectProps {
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    label: string;
    options: string[];
  }
  
  export const FormSelect: React.FC<FormSelectProps> = ({ id, name, value, onChange, label, options }) => {
    return (
      <div>
        <label htmlFor={id} className="block font-medium mb-1">{label}</label>
        <select 
          id={id} 
          name={name} 
          value={value} 
          onChange={onChange} 
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select...</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  };