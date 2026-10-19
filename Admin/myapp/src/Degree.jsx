
import React from "react";
import CatalogManager from "./CatalogManager";

const fields = [
  {
    name: "name",
    label: "Degree Name",
    type: "text",
    required: true,
    placeholder: "e.g. Bachelor of Technology",
  },
  {
    name: "shortName",
    label: "Short Name",
    type: "text",
    required: true,
    placeholder: "e.g. B.Tech",
  },
  {
    name: "code",
    label: "Degree Code",
    type: "text",
    placeholder: "e.g. BTECH",
  },
  {
    name: "level",
    label: "Degree Level",
    type: "select",
    required: true,
    options: [
      { label: "Certificate", value: "certificate" },
      { label: "Diploma", value: "diploma" },
      { label: "Undergraduate", value: "undergraduate" },
      { label: "Postgraduate", value: "postgraduate" },
      { label: "Doctoral", value: "doctoral" },
      { label: "Postdoctoral", value: "postdoctoral" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "degreeType",
    label: "Degree Type",
    type: "select",
    defaultValue: "academic",
    options: [
      { label: "Academic", value: "academic" },
      { label: "Professional", value: "professional" },
      { label: "Vocational", value: "vocational" },
      { label: "Research", value: "research" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "defaultDuration.value",
    label: "Default Duration",
    type: "number",
    min: 1,
    placeholder: "e.g. 4",
  },
  {
    name: "defaultDuration.unit",
    label: "Duration Unit",
    type: "select",
    defaultValue: "years",
    options: [
      { label: "Years", value: "years" },
      { label: "Months", value: "months" },
    ],
  },
  {
    name: "streams",
    label: "Available Streams",
    type: "multiselect",
    lookup: "streams",
    optionLabel: "name",
    fullWidth: true,
    placeholder: "Select streams",
  },
  {
    name: "displayOrder",
    label: "Display Order",
    type: "number",
    min: 0,
    defaultValue: 0,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    fullWidth: true,
    placeholder: "Enter degree description...",
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
  { key: "name", label: "Degree Name" },
  { key: "shortName", label: "Short Name" },
  { key: "level", label: "Level" },
  { key: "degreeType", label: "Type" },
  { key: "defaultDuration.value", label: "Duration" },
  { key: "status", label: "Status" },
];

const Degree = () => (
  <CatalogManager
    title="Degrees"
    singular="Degree"
    subtitle="Manage degree programs, levels and available streams."
    endpoint={{
      list: "/get-degrees",
      create: "/create-degree",
      update: "/update-degree",
      delete: "/delete-degree",
    }}
    listKey="degrees"
    fields={fields}
    columns={columns}
    searchFields={[
      "name",
      "shortName",
      "code",
      "level",
      "degreeType",
    ]}
    lookups={[
      {
        key: "streams",
        label: "Streams",
        endpoint: "/get-streams",
        listKey: "streams",
      },
    ]}
  />
);

export default Degree;
