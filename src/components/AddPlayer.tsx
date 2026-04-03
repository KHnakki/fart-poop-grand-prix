import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AddPlayer = ({ onAdd }: { onAdd: (name: string) => void }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Family member name..."
        className="flex-1"
      />
      <Button type="submit" variant="default">Add</Button>
    </form>
  );
};

export default AddPlayer;
