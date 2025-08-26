const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: String,
      unique: true,
      // Not required since we auto-generate it
    },
    grade: {
      type: String,
      required: [true, "Please add a grade"],
      enum: ["9th", "10th", "11th", "12th"],
    },
    section: {
      type: String,
      required: [true, "Please add a section"],
      enum: ["A", "B", "C", "D"],
    },
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
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    attendance: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["present", "absent", "late"],
          default: "present",
        },
      },
    ],
    grades: [
      {
        subject: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 0,
        },
        maxScore: {
          type: Number,
          required: true,
          min: 0,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique student ID before saving
studentSchema.pre("save", async function (next) {
  // Only generate studentId if it's not already set
  if (!this.studentId) {
    const count = await mongoose.model("Student").countDocuments();
    this.studentId = `STU${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);
