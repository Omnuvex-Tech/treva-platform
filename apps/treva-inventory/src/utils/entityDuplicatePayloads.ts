import type { Apartment, CreateApartmentData } from "../api/apartments";
import type { CreateUnitLayoutData, UnitLayout } from "../api/unit-layouts";
import {
    createDuplicateToken,
    duplicatePhone,
    duplicateSlug,
    duplicateText,
} from "./duplicate";

export function buildApartmentDuplicatePayload(
    apartment: Apartment
): CreateApartmentData {
    const token = createDuplicateToken();

    return {
        name: apartment.name || undefined,
        title: duplicateText(apartment.title, token),
        slug: duplicateSlug(apartment.slug, token),
        description: apartment.description || undefined,
        seoTitle: apartment.seoTitle || undefined,
        seoDescription: apartment.seoDescription || undefined,
        seoKeywords: apartment.seoKeywords || undefined,
        canonicalUrl: apartment.canonicalUrl || undefined,
        seoImage: apartment.seoImage || undefined,
        image: apartment.image || undefined,
        coverImage: apartment.coverImage || undefined,
        gallery: Array.isArray(apartment.gallery) ? apartment.gallery : [],
        priceTotal: apartment.priceTotal,
        priceByArea: apartment.priceByArea,
        roomCount: apartment.roomCount,
        area: apartment.area,
        grossArea: apartment.grossArea ?? undefined,
        floorFrom: apartment.floorFrom,
        floorTo: apartment.floorTo,
        bathroomCount: apartment.bathroomCount ?? undefined,
        purpose: apartment.purpose || undefined,
        region: apartment.region || undefined,
        city: apartment.city || undefined,
        locationTitle: apartment.locationTitle || undefined,
        locationUrl: apartment.locationUrl || undefined,
        renovation: apartment.renovation || undefined,
        mortgage: apartment.mortgage ?? undefined,
        extract: apartment.extract ?? undefined,
        parking: apartment.parking ?? undefined,
        buildingAge: apartment.buildingAge ?? undefined,
        completionYear: apartment.completionYear ?? undefined,
        furnishing: apartment.furnishing || undefined,
        elevator: apartment.elevator ?? undefined,
        ceilingHeight: apartment.ceilingHeight ?? undefined,
        heatingTypeIds: apartment.heatingTypeIds || [],
        viewOptionIds: apartment.viewOptionIds || [],
        apartmentTypeId: apartment.apartmentTypeId,
        ownerId: apartment.ownerId || undefined,
        attributeIds: apartment.attributeIds || [],
        requestIds: [],
        status: apartment.status,
        currencyId: apartment.currencyId || undefined,
        prices: apartment.prices?.map((price) => ({
            currencyId: price.currencyId,
            priceTotal: price.priceTotal,
            priceByArea: price.priceByArea,
        })),
    };
}

export function buildUnitLayoutDuplicatePayload(
    layout: UnitLayout
): CreateUnitLayoutData {
    const token = createDuplicateToken();

    return {
        title: duplicateText(layout.title, token),
        name: duplicateText(layout.name, token),
        slug: duplicateSlug(layout.slug, token),
        statusOptionId: layout.statusOptionId,
        categoryId: layout.categoryId,
        floor: layout.floor,
        number: layout.number ?? 1,
        totalArea: layout.totalArea,
        internalArea: layout.internalArea,
        balconyArea: layout.balconyArea ?? 0,
        prices: layout.prices || {},
        completionYear: layout.completionYear,
        numberOfFloors: layout.numberOfFloors,
        viewOptionId: layout.viewOptionId,
        similarApartmentIds: layout.similarApartmentIds || [],
        mainImage: layout.mainImage,
        gallery: layout.gallery || [],
        documents: layout.documents || [],
        location: layout.location || { title: layout.title, url: "", type: "apartment" },
        roomOptionId: layout.roomOptionId,
    };
}

export function buildOwnerDuplicateValues(
    firstName: string,
    lastName: string,
    phoneNumber: string
) {
    const token = createDuplicateToken();
    return {
        firstName,
        lastName: duplicateText(lastName, token),
        phoneNumber: duplicatePhone(phoneNumber, token),
    };
}
