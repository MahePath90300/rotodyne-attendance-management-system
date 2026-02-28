import { InputGroup } from "../../pages/labels";

function Step4PPEKit() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4"> PPE Kit Information</h3>

      <div className="grid grid-cols-2 gap-6">
        <InputGroup label="Shoe Size" />
        <InputGroup label="Shoes Issued Date" type="date" />
        <InputGroup
          label="Uniform Size"
          type="select"
          options={["S", "M", "L", "XL", "XXL"]}
        />
        <InputGroup label="Uniform Issued Date" type="date" />
        <InputGroup label="Helmet Issued Date" type="date" />
      </div>
    </div>
  );
}

export default Step4PPEKit;
