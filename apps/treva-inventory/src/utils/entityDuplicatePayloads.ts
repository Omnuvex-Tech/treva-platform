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
        title: duplicateText(apartment.title, token),
        slug: duplicateSlug(apartment.slug, token),
        description: apartment.description || undefined,
        image: apartment.image || undefined,
        gallery: Array.isArray(apartment.gallery) ? apartment.gallery : [],
        priceTotal: apartment.priceTotal,
        priceByArea: apartment.priceByArea,
        roomCount: apartment.roomCount,
        area: apartment.area,
        floorFrom: apartment.floorFrom,
        floorTo: apartment.floorTo,
        locationTitle: apartment.locationTitle || undefined,
        locationUrl: apartment.locationUrl || undefined,
        renovation: apartment.renovation || undefined,
        kitchenSize: apartment.kitchenSize ?? undefined,
        wallMaterial: apartment.wallMaterial || undefined,
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
