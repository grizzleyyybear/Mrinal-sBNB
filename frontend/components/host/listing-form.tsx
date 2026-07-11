"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { Amenity, ListingDetail, ListingWritePayload } from "@/types/api";

type ListingFormProps = {
  amenities: Amenity[] | undefined;
  initialListing?: ListingDetail | null;
  isSubmitting: boolean;
  onSubmit: (payload: ListingWritePayload) => void;
  onCancelEdit?: () => void;
};

const listingFormSchema = z.object({
  title: z.string().min(3, "Title needs at least 3 characters.").max(180),
  description: z.string().min(10, "Description needs at least 10 characters."),
  property_type: z.string().min(2),
  location_city: z.string().min(2, "City is required."),
  location_country: z.string().min(2, "Country is required."),
  lat: z.number(),
  lng: z.number(),
  price_per_night: z.string().refine((value) => Number(value) > 0, "Price must be greater than 0."),
  max_guests: z.number().int().positive(),
  bedrooms: z.number().int().nonnegative(),
  beds: z.number().int().positive(),
  baths: z.number().positive(),
  photo_urls_text: z.string().refine((value) => value.split("\n").some((url) => url.trim().length > 0), "At least one photo URL is required."),
  amenity_ids: z.array(z.number())
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

const blankValues: ListingFormValues = {
  title: "",
  description: "",
  property_type: "Apartment",
  location_city: "",
  location_country: "India",
  lat: 28.6139,
  lng: 77.209,
  price_per_night: "6500.00",
  max_guests: 2,
  bedrooms: 1,
  beds: 1,
  baths: 1,
  photo_urls_text: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  amenity_ids: []
};

function listingToFormValues(listing: ListingDetail): ListingFormValues {
  return {
    title: listing.title,
    description: listing.description,
    property_type: listing.property_type,
    location_city: listing.location_city,
    location_country: listing.location_country,
    lat: listing.lat,
    lng: listing.lng,
    price_per_night: listing.price_per_night,
    max_guests: listing.max_guests,
    bedrooms: listing.bedrooms,
    beds: listing.beds,
    baths: listing.baths,
    photo_urls_text: listing.photos.map((photo) => photo.url).join("\n"),
    amenity_ids: listing.amenities.map((amenity) => amenity.id)
  };
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="text-xs font-medium text-[#c13515]">{message}</span> : null;
}

export function ListingForm({ amenities, initialListing, isSubmitting, onSubmit, onCancelEdit }: ListingFormProps) {
  const {
    formState: { errors },
    control,
    handleSubmit,
    register,
    setValue,
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: initialListing ? listingToFormValues(initialListing) : blankValues
  });

  const amenityIds = useWatch({ control, name: "amenity_ids" }) ?? [];

  function toggleAmenity(amenityId: number) {
    const nextAmenities = amenityIds.includes(amenityId)
      ? amenityIds.filter((id) => id !== amenityId)
      : [...amenityIds, amenityId];

    setValue("amenity_ids", nextAmenities, { shouldDirty: true, shouldValidate: true });
  }

  function submit(values: ListingFormValues) {
    const photoUrls = values.photo_urls_text
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    onSubmit({
      title: values.title,
      description: values.description,
      property_type: values.property_type,
      location_city: values.location_city,
      location_country: values.location_country,
      lat: values.lat,
      lng: values.lng,
      price_per_night: values.price_per_night,
      max_guests: values.max_guests,
      bedrooms: values.bedrooms,
      beds: values.beds,
      baths: values.baths,
      photo_urls: photoUrls,
      amenity_ids: values.amenity_ids
    });
  }

  return (
    <form className="rounded-air border border-hairline bg-white p-5 shadow-sm" onSubmit={handleSubmit(submit)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[21px] font-bold text-ink">{initialListing ? "Edit listing" : "Create a listing"}</h2>
          <p className="mt-1 text-sm text-muted">Photos are URL-based for this mocked assignment.</p>
        </div>
        {initialListing && onCancelEdit ? (
          <button type="button" className="text-sm font-semibold underline" onClick={onCancelEdit}>
            Cancel
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Title</span>
          <input className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" {...register("title")} />
          <FieldError message={errors.title?.message} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Description</span>
          <textarea className="min-h-28 rounded-lg border border-hairline px-3 py-3 text-sm outline-none focus:border-ink" {...register("description")} />
          <FieldError message={errors.description?.message} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Property type</span>
            <select className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" {...register("property_type")}>
              {["Apartment", "Villa", "Cabin", "Bungalow", "House", "Loft", "Chalet", "Farm stay", "Private room"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Price per night</span>
            <input className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" {...register("price_per_night")} />
            <FieldError message={errors.price_per_night?.message} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">City</span>
            <input className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" {...register("location_city")} />
            <FieldError message={errors.location_city?.message} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Country</span>
            <input className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" {...register("location_country")} />
            <FieldError message={errors.location_country?.message} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Latitude</span>
            <input className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" type="number" step="0.0001" {...register("lat", { valueAsNumber: true })} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Longitude</span>
            <input className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" type="number" step="0.0001" {...register("lng", { valueAsNumber: true })} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Guests</span>
            <input className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" type="number" min={1} {...register("max_guests", { valueAsNumber: true })} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Bedrooms</span>
            <input className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" type="number" min={0} {...register("bedrooms", { valueAsNumber: true })} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Beds</span>
            <input className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" type="number" min={1} {...register("beds", { valueAsNumber: true })} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Baths</span>
            <input className="h-12 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink" type="number" min={0.5} step={0.5} {...register("baths", { valueAsNumber: true })} />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">Photo URLs</span>
          <textarea className="min-h-28 rounded-lg border border-hairline px-3 py-3 text-sm outline-none focus:border-ink" {...register("photo_urls_text")} />
          <FieldError message={errors.photo_urls_text?.message} />
        </label>

        <div>
          <p className="text-sm font-semibold text-ink">Amenities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(amenities ?? []).map((amenity) => {
              const isActive = amenityIds.includes(amenity.id);

              return (
                <button
                  type="button"
                  key={amenity.id}
                  className={clsx(
                    "rounded-full border px-4 py-2 text-sm font-medium",
                    isActive ? "border-ink bg-ink text-white" : "border-hairline text-ink"
                  )}
                  onClick={() => toggleAmenity(amenity.id)}
                >
                  {amenity.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button className="mt-6 h-12 rounded-lg bg-rausch px-6 text-sm font-medium text-white disabled:bg-[#ffd1da]" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : initialListing ? "Save changes" : "Create listing"}
      </button>
    </form>
  );
}
