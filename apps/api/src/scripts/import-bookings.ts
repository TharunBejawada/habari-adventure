import { prisma } from "../prisma";
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';


async function importBookingsFromCSV() {
  const results: any[] = [];
  const csvFilePath = path.join(__dirname, 'bookings.csv');

  console.log('Reading CSV file...');

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => {
      // Push each row of the CSV into our results array
      results.push(data);
    })
    .on('end', async () => {
      console.log(`Successfully parsed ${results.length} rows. Starting database import...`);

      try {
        // Map the CSV data to match your Prisma Booking schema
        const bookingsToInsert = results.map((row) => ({
          // Adjust the keys inside row['...'] to match your exact CSV headers
          firstName: row['FirstName'], 
          lastName: row['LastName'] ? row['LastName'].trim() : null,
          email: row['Email'],
          
          // Handle empty phone numbers by setting them to null
          phone: row['PhoneNumber'] ? row['PhoneNumber'].trim() : null,
          
          // Parse the date string into a valid JavaScript Date object
          // If the CSV date is empty, it defaults to the current date
          createdAt: row['CreatedAt'] 
            ? new Date(row['CreatedAt']) 
            : new Date(),
            
          // Set your default schema values explicitly just to be safe
          bookingType: "General",
          status: "New"
        }));

        // Use Prisma's createMany for a fast, bulk insertion
        const insertResult = await prisma.booking.createMany({
          data: bookingsToInsert,
          skipDuplicates: true, // Prevents crashing if you accidentally run it twice
        });

        console.log(`🎉 Import complete! Successfully added ${insertResult.count} bookings.`);
      } catch (error) {
        console.error("❌ Error importing data to the database:", error);
      } finally {
        // Always disconnect the Prisma client when done
        await prisma.$disconnect();
      }
    });
}

// Execute the function
importBookingsFromCSV();