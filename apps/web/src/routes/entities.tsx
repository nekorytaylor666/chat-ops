import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Plus } from "lucide-react";
import * as React from "react";

import { EntityGrid } from "@/components/entity-grid";
import { Button } from "@/components/ui/button";
import { getFilterFn } from "@/lib/data-grid-filters";
import type { CellSelectOption } from "@/types/data-grid";

export const Route = createFileRoute("/entities")({
  component: EntitiesPage,
});

interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  country: string;
  foundedDate: string | null;
  twitterFollowers: number | null;
  twitterUrl: string;
  linkedinUrl: string;
}

const industryOptions: CellSelectOption[] = [
  { label: "Technology", value: "technology" },
  { label: "Finance", value: "finance" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Retail", value: "retail" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Energy", value: "energy" },
  { label: "Real Estate", value: "real-estate" },
  { label: "Media", value: "media" },
];

const countryOptions: CellSelectOption[] = [
  { label: "United States", value: "us" },
  { label: "United Kingdom", value: "uk" },
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "Japan", value: "jp" },
  { label: "Canada", value: "ca" },
  { label: "Australia", value: "au" },
  { label: "Singapore", value: "sg" },
];

const filterFn = getFilterFn<Company>();

const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: "Company",
    size: 200,
    meta: {
      label: "Company",
      cell: { variant: "short-text" },
    },
    filterFn,
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 300,
    meta: {
      label: "Description",
      cell: { variant: "long-text" },
    },
    filterFn,
  },
  {
    accessorKey: "industry",
    header: "Primary Industry",
    size: 160,
    meta: {
      label: "Primary Industry",
      cell: { variant: "select", options: industryOptions },
    },
    filterFn,
  },
  {
    accessorKey: "country",
    header: "Country",
    size: 150,
    meta: {
      label: "Country",
      cell: { variant: "select", options: countryOptions },
    },
    filterFn,
  },
  {
    accessorKey: "foundedDate",
    header: "Foundation Date",
    size: 140,
    meta: {
      label: "Foundation Date",
      cell: { variant: "date" },
    },
    filterFn,
  },
  {
    accessorKey: "twitterFollowers",
    header: "Twitter Followers",
    size: 140,
    meta: {
      label: "Twitter Followers",
      cell: { variant: "number" },
    },
    filterFn,
  },
  {
    accessorKey: "twitterUrl",
    header: "Twitter URL",
    size: 200,
    meta: {
      label: "Twitter URL",
      cell: { variant: "url" },
    },
    filterFn,
  },
  {
    accessorKey: "linkedinUrl",
    header: "LinkedIn URL",
    size: 200,
    meta: {
      label: "LinkedIn URL",
      cell: { variant: "url" },
    },
    filterFn,
  },
];

function generateMockData(): Company[] {
  return [
    {
      id: "1",
      name: "Acme Corporation",
      description:
        "Leading provider of innovative solutions for modern businesses.",
      industry: "technology",
      country: "us",
      foundedDate: "1995-03-15",
      twitterFollowers: 125_000,
      twitterUrl: "https://twitter.com/acmecorp",
      linkedinUrl: "https://linkedin.com/company/acmecorp",
    },
    {
      id: "2",
      name: "Global Finance Ltd",
      description:
        "International banking and investment services with a focus on sustainable growth.",
      industry: "finance",
      country: "uk",
      foundedDate: "1987-08-22",
      twitterFollowers: 89_000,
      twitterUrl: "https://twitter.com/globalfinance",
      linkedinUrl: "https://linkedin.com/company/globalfinance",
    },
    {
      id: "3",
      name: "MedTech Solutions",
      description:
        "Pioneering healthcare technology for better patient outcomes.",
      industry: "healthcare",
      country: "de",
      foundedDate: "2010-01-10",
      twitterFollowers: 45_000,
      twitterUrl: "https://twitter.com/medtechsol",
      linkedinUrl: "https://linkedin.com/company/medtechsolutions",
    },
    {
      id: "4",
      name: "RetailMax",
      description:
        "E-commerce platform connecting retailers with global customers.",
      industry: "retail",
      country: "us",
      foundedDate: "2015-06-01",
      twitterFollowers: 210_000,
      twitterUrl: "https://twitter.com/retailmax",
      linkedinUrl: "https://linkedin.com/company/retailmax",
    },
    {
      id: "5",
      name: "Precision Manufacturing Co",
      description:
        "High-quality manufacturing solutions for industrial clients.",
      industry: "manufacturing",
      country: "jp",
      foundedDate: "1972-11-30",
      twitterFollowers: 15_000,
      twitterUrl: "https://twitter.com/precisionmfg",
      linkedinUrl: "https://linkedin.com/company/precisionmfg",
    },
    {
      id: "6",
      name: "GreenEnergy Partners",
      description: "Renewable energy solutions for a sustainable future.",
      industry: "energy",
      country: "de",
      foundedDate: "2008-04-22",
      twitterFollowers: 78_000,
      twitterUrl: "https://twitter.com/greenenergy",
      linkedinUrl: "https://linkedin.com/company/greenenergy",
    },
    {
      id: "7",
      name: "Urban Spaces Inc",
      description: "Commercial and residential real estate development.",
      industry: "real-estate",
      country: "ca",
      foundedDate: "2001-09-05",
      twitterFollowers: 32_000,
      twitterUrl: "https://twitter.com/urbanspaces",
      linkedinUrl: "https://linkedin.com/company/urbanspaces",
    },
    {
      id: "8",
      name: "MediaWave",
      description: "Digital media and content creation platform.",
      industry: "media",
      country: "au",
      foundedDate: "2018-02-14",
      twitterFollowers: 156_000,
      twitterUrl: "https://twitter.com/mediawave",
      linkedinUrl: "https://linkedin.com/company/mediawave",
    },
    {
      id: "9",
      name: "TechStart Asia",
      description: "Technology incubator and venture capital firm.",
      industry: "technology",
      country: "sg",
      foundedDate: "2012-07-20",
      twitterFollowers: 67_000,
      twitterUrl: "https://twitter.com/techstartasia",
      linkedinUrl: "https://linkedin.com/company/techstartasia",
    },
    {
      id: "10",
      name: "FinServe Global",
      description: "Financial technology solutions for banks and institutions.",
      industry: "finance",
      country: "fr",
      foundedDate: "2005-12-01",
      twitterFollowers: 92_000,
      twitterUrl: "https://twitter.com/finserveglobal",
      linkedinUrl: "https://linkedin.com/company/finserveglobal",
    },
  ];
}

function EntitiesPage() {
  const [data, setData] = React.useState<Company[]>(generateMockData);

  const onRowAdd = React.useCallback(() => {
    const newId = String(Date.now());
    const newCompany: Company = {
      id: newId,
      name: "",
      description: "",
      industry: "",
      country: "",
      foundedDate: null,
      twitterFollowers: null,
      twitterUrl: "",
      linkedinUrl: "",
    };

    setData((prev) => [...prev, newCompany]);

    return {
      rowIndex: data.length,
      columnId: "name",
    };
  }, [data.length]);

  const onRowsDelete = React.useCallback((rows: Company[]) => {
    const idsToDelete = new Set(rows.map((r) => r.id));
    setData((prev) => prev.filter((item) => !idsToDelete.has(item.id)));
  }, []);

  return (
    <div className="container mx-auto py-6">
      <EntityGrid
        columns={columns}
        data={data}
        entityIcon={Building2}
        entityName="Companies"
        headerActions={
          <Button onClick={onRowAdd} size="sm">
            <Plus />
            Add Company
          </Button>
        }
        height={600}
        onDataChange={setData}
        onRowAdd={onRowAdd}
        onRowsDelete={onRowsDelete}
      />
    </div>
  );
}
