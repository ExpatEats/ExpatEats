import type { Place } from "@shared/schema";

/**
 * Converts boolean filter columns to tag array for display
 * This function replaces the old tags array with the new boolean column structure
 */
export function getTagsFromPlace(place: Place): string[] {
    const tags: string[] = [];

    // Grocery & Market tags
    if (place.glutenFree) tags.push("gluten-free");
    if (place.dairyFree) tags.push("dairy-free");
    if (place.nutFree) tags.push("nut-free");
    if (place.vegan) tags.push("vegan");
    if (place.organic) tags.push("organic");
    if (place.localFarms) tags.push("local-farms");
    if (place.freshVegetables) tags.push("fresh-vegetables");
    if (place.farmRaisedMeat) tags.push("farm-raised-meat");
    if (place.noProcessed) tags.push("no-processed");
    if (place.kidFriendly) tags.push("kid-friendly");
    if (place.bulkBuying) tags.push("bulk-buying");
    if (place.zeroWaste) tags.push("zero-waste");

    // Supplement tags
    if (place.generalSupplements) tags.push("general-supplements");
    if (place.omega3) tags.push("omega-3");
    if (place.veganSupplements) tags.push("vegan-supplements");
    if (place.onlineRetailer) tags.push("online-retailer");
    if (place.vitamins) tags.push("vitamins");
    if (place.herbalRemedies) tags.push("herbal-remedies");
    if (place.organicSupplements) tags.push("organic-supplements");
    if (place.sportsNutrition) tags.push("sports-nutrition");
    if (place.practitionerGrade) tags.push("practitioner-grade");
    if (place.hypoallergenic) tags.push("hypoallergenic");

    return tags;
}
