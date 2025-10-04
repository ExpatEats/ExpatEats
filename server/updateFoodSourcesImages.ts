import { db } from "./db";
import { places } from "@shared/schema";
import { eq } from "drizzle-orm";

// Function to update food source images with more reliable URLs
export async function updateFoodSourcesImages() {
    try {
        // Map of proper images for major retailers and specialized stores in Lisbon
        const imageUrlMap: Record<string, string> = {
            Continente:
                "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "Pingo Doce":
                "https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            Lidl: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            Auchan: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "El Corte Inglés":
                "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            Celeiro:
                "https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            Biomercado:
                "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "Maria Granel":
                "https://images.unsplash.com/photo-1584473457406-6240486418e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            GreenBeans:
                "https://images.unsplash.com/photo-1610348725531-843dff563e2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            Bomercado:
                "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "Sam Pastelaria Saudável":
                "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "Despensa No.6":
                "https://images.unsplash.com/photo-1525518392674-39ba1fca2ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "Saludê Pastelaria Fit":
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            Batardas:
                "https://images.unsplash.com/photo-1556471013-0001958d2f12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "Mercado de Campo de Ourique":
                "https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "Time Out Market Lisboa":
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "Mercearia Bio":
                "https://images.unsplash.com/photo-1601600576337-c1d8a0d4f549?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "Quintal Bioshop":
                "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        };

        // Category based image defaults for stores without specific images
        const categoryImageDefaults: Record<string, string> = {
            supermarket:
                "https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "health food store":
                "https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            bakery: "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "grocery store":
                "https://images.unsplash.com/photo-1601600576337-c1d8a0d4f549?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            market: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            "bulk store":
                "https://images.unsplash.com/photo-1584473457406-6240486418e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        };

        // Get all places from the database
        const allPlaces = await db.select().from(places);
        console.log(
            `Found ${allPlaces.length} places in the database. Updating images...`,
        );

        // Update each place with appropriate image URL
        for (const place of allPlaces) {
            let imageUrl;

            // Try to find a specific image for the place
            if (imageUrlMap[place.name]) {
                imageUrl = imageUrlMap[place.name];
            }
            // Otherwise use a category default
            else if (
                place.category &&
                categoryImageDefaults[place.category.toLowerCase()]
            ) {
                imageUrl = categoryImageDefaults[place.category.toLowerCase()];
            }
            // If no category match, use a generic food store image
            else {
                imageUrl =
                    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
            }

            // Update the image URL in the database
            await db
                .update(places)
                .set({ imageUrl })
                .where(eq(places.id, place.id));
        }

        console.log("Food source images updated successfully!");
        return { success: true, count: allPlaces.length };
    } catch (error) {
        console.error("Error updating food source images:", error);
        return { success: false, error };
    }
}
