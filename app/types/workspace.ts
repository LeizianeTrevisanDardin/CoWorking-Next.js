import type { Property } from "./property";

export type Workspace = {
  id: string;
  owner_id: string;

  title: string;
  description: string | null;

  seats: number;
  price: number;

  image_url: string | null;

  is_available: boolean;

  property_id?: string;

  property: Property | null;
};