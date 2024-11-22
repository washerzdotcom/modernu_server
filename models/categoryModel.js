import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const categorySchema = new mongoose.Schema({
  index: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  productType: {
    type: String,
    required: true,
  },
});

// `productType` ke hisaab se alag alag sequence bana sakte hain
categorySchema.plugin(AutoIncrement, {
  id: "category_index",
  inc_field: "index",
  reference_fields: ["productType"],
});

export default mongoose.model("Category", categorySchema);
