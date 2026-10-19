
import React from "react";
import CatalogManager from "./CatalogManager";

const fields = [
  {
    name: "name",
    label: "Course Name",
    type: "text",
    required: true,
    placeholder: "e.g. Bachelor of Computer Applications",
  },
  {
    name: "code",
    label: "Course Code",
    type: "text",
    placeholder: "e.g. BCA",
  },
  {
    name: "stream",
    label: "Stream",
    type: "select",
    lookup: "streams",
    optionLabel: "name",
    required: true,
  },
  {
    name: "degree",
    label: "Degree",
    type: "select",
    lookup: "degrees",
    optionLabel: "name",
    required: true,
  },
  {
    name: "duration.value",
    label: "Duration",
    type: "number",
    min: 1,
    required: true,
    placeholder: "e.g. 3",
  },
  {
    name: "duration.unit",
    label: "Duration Unit",
    type: "select",
    required: true,
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
    placeholder: "e.g. 10+2 from a recognized board",
  },
  {
    name: "eligibility.requiredSubjects",
    label: "Required Subjects",
    type: "tags",
    fullWidth: true,
    placeholder: "Mathematics, Physics, Chemistry",
    help: "Comma-separated values.",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    fullWidth: true,
    placeholder: "Enter course details...",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    defaultValue: "active",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];

const columns = [
  { key: "name", label: "Course Name" },
  { key: "code", label: "Code" },
  { key: "stream", label: "Stream" },
  { key: "degree", label: "Degree" },
  { key: "duration.value", label: "Duration" },
  { key: "status", label: "Status" },
];

const Course = () => (
  <CatalogManager
    title="Courses"
    singular="Course"
    subtitle="Manage courses, streams, degrees and eligibility."
    endpoint={{
      list: "/get-courses",
      create: "/create-course",
      update: "/update-course",
      delete: "/delete-course",
    }}
    listKey="courses"
    fields={fields}
    columns={columns}
    searchFields={[
      "name",
      "code",
      "stream.name",
      "degree.name",
    ]}
    lookups={[
      {
        key: "streams",
        label: "Streams",
        endpoint: "/get-streams",
        listKey: "streams",
      },
      {
        key: "degrees",
        label: "Degrees",
        endpoint: "/get-degrees",
        listKey: "degrees",
      },
    ]}
  />
);

export default Course;
