import type { Metadata } from "next";
import { SearchPage } from "@/components/locations/search-page";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Find and add a city by name, ZIP code, or coordinates, or pick from suggested places to follow its weather.",
};

export default function SearchRoutePage() {
  return <SearchPage />;
}
