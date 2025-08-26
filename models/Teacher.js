const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: String,
      unique: true,
      // Not required since we auto-generate it
    },
    department: {
      type: String,
      required: [true, "Please add a department"],
      enum: [
        "Mathematics",
        "Science",
        "English",
        "History",
        "Geography",
        "Computer Science",
        "Physical Education",
        "Arts",
        "Music",
        "Other",
      ],
    },
    qualification: {
      type: String,
      required: [true, "Please add qualification"],
      enum: ["Bachelor", "Masters", "PhD", "Diploma", "Other"],
    },
    experience: {
      type: Number,
      default: 0,
      min: [0, "Experience cannot be negative"],
    },
    specialization: [String],
    dateOfBirth: {
      type: Date,
      required: [true, "Please add date of birth"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Please add gender"],
    },
    contactNumber: {
      type: String,
      match: [/^\+?[\d\s-]+$/, "Please add a valid contact number"],
    },
    salary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique teacher ID before saving
teacherSchema.pre("save", async function (next) {
  // Only generate teacherId if it's not already set
  if (!this.teacherId) {
    const count = await mongoose.model("Teacher").countDocuments();
    this.teacherId = `TCH${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Teacher", teacherSchema);
