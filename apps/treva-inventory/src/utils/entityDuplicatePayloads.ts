import type { Apartment, CreateApartmentData } from "../api/apartments";
import type { CreateHouseData, House } from "../api/houses";
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
        buildingAge: apartment.buildingAge ?? undefined,
        furnishing: apartment.furnishing || undefined,
        ceilingHeight: apartment.ceilingHeight ?? undefined,
        heatingTypeIds: [],
        apartmentTypeId: apartment.apartmentTypeId,
        ownerId: apartment.ownerId || undefined,
        attributeIds: apartment.attributeIds || [],
        requestIds: [],
        status: apartment.status,
        archived: false,
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
        status: layout.status,
        categoryId: layout.categoryId,
        houseId: layout.houseId,
        floor: layout.floor,
        number: layout.number ?? 1,
        entrance: layout.entrance,
        totalArea: layout.totalArea,
        internalArea: layout.internalArea,
        balconyArea: layout.balconyArea ?? 0,
        prices: layout.prices || {},
        completionYear: layout.completionYear,
        numberOfFloors: layout.numberOfFloors,
        similarApartmentIds: layout.similarApartmentIds || [],
        mainImage: layout.mainImage,
        gallery: layout.gallery || [],
        documents: layout.documents || [],
        unitTypeOptionId: layout.unitTypeOptionId,
    };
}

export function buildHouseDuplicatePayload(
    house: House
): CreateHouseData {
    const token = createDuplicateToken();

    return {
        title: duplicateText(house.title, token),
        name: duplicateText(house.name, token),
        slug: duplicateSlug(house.slug, token),
        status: house.status,
        archived: false,
        categoryId: house.categoryId,
        floor: house.floor,
        number: house.number ?? 1,
        totalArea: house.totalArea,
        internalArea: house.internalArea,
        balconyArea: house.balconyArea ?? 0,
        prices: house.prices || {},
        completionYear: house.completionYear,
        numberOfFloors: house.numberOfFloors,
        similarApartmentIds: house.similarApartmentIds || [],
        mainImage: house.mainImage,
        coverImage: house.coverImage,
        gallery: house.gallery || [],
        documents: house.documents || [],
        location: house.location,
        roomOptionId: house.roomOptionId,
        ownerId: house.ownerId,
        heatingTypeIds: house.heatingTypeIds || [],
        attributeIds: house.attributeIds || [],
        locationTitle: house.locationTitle,
        locationUrl: house.locationUrl,
        locationGoogleMapsUrl: house.locationGoogleMapsUrl,
        typeOfBuilding: house.typeOfBuilding,
        constructionStage: house.constructionStage,
        description: house.description,
        street: house.street,
        houseNumber: house.houseNumber,
        deadlineForCommissioning: house.deadlineForCommissioning,
        salesOffice: house.salesOffice,
        landCadastralNumber: house.landCadastralNumber,
        contractAddress: house.contractAddress,
        secondContractAddress: house.secondContractAddress,
        showroomAvailability: house.showroomAvailability,
        secondShowroomAvailability: house.secondShowroomAvailability,
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
