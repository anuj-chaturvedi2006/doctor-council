
import React from "react";
import CatalogManager from "./CatalogManager";

const fields = [
  {
    name: "name",
    label: "Specialization Name",
    type: "text",
    required: true,
    placeholder: "e.g. Artificial Intelligence",
  },
  {
    name: "code",
    label: "Specialization Code",
    type: "text",
    placeholder: "e.g. AI",
  },
  {
    name: "course",
    label: "Course",
    type: "select",
    lookup: "courses",
    optionLabel: "name",
    required: true,
  },
  {
    name: "duration.value",
    label: "Duration",
    type: "number",
    min: 1,
    placeholder: "e.g. 2",
  },
  {
    name: "duration.unit",
    label: "Duration Unit",
    type: "select",
    defaultValue: "years",
    options: [
      { label: "Years", value: "years" },
      { label: "Months", value: "months" },
    ],
  },
  {
    name: "eligibility.minimumPercentage",
    label: "Minimum Eligibility (%)",
    type: "number",
    min: 0,
    max: 100,
    placeholder: "e.g. 50",
  },
  {
    name: "eligibility.requiredQualification",
    label: "Required Qualification",
    type: "text",
    placeholder: "e.g. Relevant bachelor's degree",
  },
  {
    name: "eligibility.requiredSubjects",
    label: "Required Subjects",
    type: "tags",
    fullWidth: true,
    placeholder: "Mathematics, Computer Science",
    help: "Comma-separated values.",
  },
  {
    name: "careerOptions",
    label: "Career Options",
    type: "tags",
    fullWidth: true,
    placeholder: "Data Scientist, ML Engineer, Researcher",
    help: "Comma-separated values.",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    fullWidth: true,
    placeholder: "Enter specialization details...",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    defaultValue: "active",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];

const columns = [
  { key: "name", label: "Specialization" },
  { key: "code", label: "Code" },
  { key: "course", label: "Course" },
  { key: "duration.value", label: "Duration" },
  { key: "status", label: "Status" },
];

const Specialization = () => (
  <CatalogManager
    title="Specializations"
    singular="Specialization"
    subtitle="Manage specializations, eligibility and career options."
    endpoint={{
      list: "/get-specializations",
      create: "/create-specialization",
      update: "/update-specialization",
      delete: "/delete-specialization",
    }}
    listKey="specializations"
    fields={fields}
    columns={columns}
    searchFields={[
      "name",
      "code",
      "course.name",
      "careerOptions",
    ]}
    lookups={[
      {
        key: "courses",
        label: "Courses",
        endpoint: "/get-courses",
        listKey: "courses",
      },
    ]}
  />
);

export default Specialization;
