import mongoose from "mongoose";

const CitizenSchema = new mongoose.Schema(
  {
    fullNameEnglish: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },

    dateOfBirth: {
      type: String,
      required: [true, "Date of birth is required"],
      trim: true,
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Date of birth must be in YYYY-MM-DD format",
      ],
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
      minlength: [2, "Father's name must be at least 2 characters"],
      maxlength: [100, "Father's name cannot exceed 100 characters"],
    },

    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
      minlength: [2, "Mother's name must be at least 2 characters"],
      maxlength: [100, "Mother's name cannot exceed 100 characters"],
    },

    grandfatherName: {
      type: String,
      trim: true,
      maxlength: [100, "Grandfather's name cannot exceed 100 characters"],
      default: null,
    },

    spouseName: {
      type: String,
      trim: true,
      maxlength: [100, "Spouse's name cannot exceed 100 characters"],
      default: null,
    },
    permanentDistrict: {
      type: String,
      required: [true, "Permanent district is required"],
      trim: true,
      minlength: [2, "District name is invalid"],
      maxlength: [100, "District name cannot exceed 100 characters"],
    },

    municipality: {
      type: String,
      required: [true, "Municipality is required"],
      trim: true,
      minlength: [2, "Municipality name is invalid"],
      maxlength: [150, "Municipality name cannot exceed 150 characters"],
    },

    wardNo: {
      type: String,
      required: [true, "Ward number is required"],
      trim: true,
      match: [/^\d{1,2}$/, "Ward number must be a valid number"],
    },
    citizenshipNumber: {
      type: String,
      required: [true, "Citizenship number is required"],
      trim: true,
      uppercase: true,
      minlength: [3, "Citizenship number is too short"],
      maxlength: [30, "Citizenship number cannot exceed 30 characters"],
      unique: true,
      index: true,
    },

    issuedDistrict: {
      type: String,
      required: [true, "Issued district is required"],
      trim: true,
      minlength: [2, "Issued district is invalid"],
      maxlength: [100, "Issued district cannot exceed 100 characters"],
    },

    issuedDate: {
      type: String,
      required: [true, "Issued date is required"],
      trim: true,
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Issued date must be in YYYY-MM-DD format",
      ],
    },

    purposeEnglish: {
      type: String,
      trim: true,
      maxlength: [500, "Purpose cannot exceed 500 characters"],
      default: null,
    },
  },

  {
    timestamps: true,
    strict: true,
    versionKey: false,
  },
);
CitizenSchema.index(
  { citizenshipNumber: 1 },
  {
    unique: true,
    name: "unique_citizenship_number",
  },
);

CitizenSchema.index({
  permanentDistrict: 1,
  municipality: 1,
  wardNo: 1,
});

CitizenSchema.index({
  issuedDistrict: 1,
});

CitizenSchema.pre("save", function (next) {
  if (this.fullNameEnglish) {
    this.fullNameEnglish = this.fullNameEnglish.replace(/\s+/g, " ").trim();
  }

  if (this.fatherName) {
    this.fatherName = this.fatherName.replace(/\s+/g, " ").trim();
  }

  if (this.motherName) {
    this.motherName = this.motherName.replace(/\s+/g, " ").trim();
  }

  if (this.grandfatherName) {
    this.grandfatherName = this.grandfatherName.replace(/\s+/g, " ").trim();
  }

  if (this.spouseName) {
    this.spouseName = this.spouseName.replace(/\s+/g, " ").trim();
  }

  if (this.permanentDistrict) {
    this.permanentDistrict = this.permanentDistrict.replace(/\s+/g, " ").trim();
  }

  if (this.municipality) {
    this.municipality = this.municipality.replace(/\s+/g, " ").trim();
  }

  if (this.issuedDistrict) {
    this.issuedDistrict = this.issuedDistrict.replace(/\s+/g, " ").trim();
  }

  if (this.purposeEnglish) {
    this.purposeEnglish = this.purposeEnglish.replace(/\s+/g, " ").trim();
  }

  next();
});

export default mongoose.model("Citizen", CitizenSchema);
