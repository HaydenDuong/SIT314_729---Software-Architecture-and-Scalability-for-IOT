// fire_node.js
// This code implements a TCP socket client that connects to a weather service
// and fetches fire warning levels from an RSS feed, sending updates to the server.
const net = require("net");
const Parser = require("rss-parser");
const cheerio = require("cheerio");

const host = "127.0.0.1";
const port = 6000;
const CFA_RSS_FEED_URL = "https://www.cfa.vic.gov.au/cfa/rssfeed/tfbfdrforecast_rss.xml";

// Create a TCP client
const client = new net.Socket();

// Initialize variables to store fire warning levels
let fireWarningLevels = {};

// Function to fetch fire warning levels from the RSS feed
async function fetchFireWarning() {
    try {
        // Use rss-parser to fetch and parse the RSS feed
        // Ensure the parser is configured correctly
        // to handle the specific structure of the CFA RSS feed
        // Note: The CFA RSS feed may have specific headers or content types
        // that need to be handled, so we use a custom parser configuration
        let parser = new Parser({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/xml, text/xml, */*'
            }
        });

        let feed = await parser.parseURL(CFA_RSS_FEED_URL);

        // Check if the feed has items
        // If items are present, process the first item (usually today)
        // If no items are found, set a default warning level
        if (feed.items.length > 0) {
            const latestItem = feed.items[0];

            // Use cheerio to parse the content of the latest item
            // and extract the fire warning levels
            // This assumes the content is HTML and contains the relevant information
            const $ = cheerio.load(latestItem.content);

            // Initialize fireWarningLevels to an empty object
            fireWarningLevels = {};

            // Find the paragraph that contains the "Fire Danger Ratings"
            const fireDangerRatingsHeaderP = $('p').filter(function() {
                return $(this).text().trim() === 'Fire Danger Ratings';
            });

            // If the header is found (or there is a sentence called "Fire Danger Ratings"), proceed to extract the ratings
            if (fireDangerRatingsHeaderP.length > 0) {

                // Find the next paragraph that contains the actual ratings
                // This assumes the ratings are in the next paragraph after "Fire Danger Ratings"
                const actualRatingsP = fireDangerRatingsHeaderP.next('p');
                if (actualRatingsP.length > 0) {
                    // Split the ratings by line breaks and process each line
                    // to extract area names and their corresponding ratings
                    // e.g., "Central: NO RATING<br>East Gippsland: NO RATING<br>Mallee: NO RATING<br>North Central: NO RATING<br>..."
                    const rawRatings = actualRatingsP.html();

                    // Split the raw ratings by line breaks and store them in an array
                    // This assumes the ratings are separated by <br> tags
                    // Outcome: ratingLines = ["Central: NO RATING", "East Gippsland: NO RATING", ...]
                    const ratingLines = rawRatings.split('<br>');

                    // Process each element of ratingLines to extract area names and ratings
                    // and store them in the fireWarningLevels object
                    ratingLines.forEach(element => {
                        // Trim whitespace and match the pattern "Area: Rating"
                        // e.g., "Central: NO RATING"
                        // Outcome: fireWarningLevels = { "Central": "NO RATING", "East Gippsland": "NO RATING", ... }
                        const trimmedElement = element.trim();
                        const match = trimmedElement.match(/^(.+?):\s*(.+)$/);
                        
                        // If the match is successful, extract area name and rating
                        // and store them in the fireWarningLevels object
                        // eg., match = ["Central: NO RATING", "Central", "NO RATING"] where:
                        // match[0] = "Central: NO RATING" (full match) comes from ^
                        // match[1] = "Central" (area name) comes from (.+?)
                        // match[2] = "NO RATING" (rating) comes from \s*(.+)$
                        if (match && match.length === 3) {
                            let areaName = match[1].trim();
                            let rating = match[2].trim();

                            // fireWarningLevels["Central"] = "NO RATING"
                            fireWarningLevels[areaName] = rating;
                        }
                    });
                } else {
                    console.warn("Warning: Could not find the actual fire ratings paragraph.");
                    fireWarningLevels = { "ALL": "NO RATING - PARAGRAPH_NOT_FOUND" };
                }
            } else {
                console.warn("Warning: Could not find 'Fire Danger Ratings' header.");
                fireWarningLevels = { "ALL": "NO RATING - HEADER_NOT_FOUND" };
            }

            console.log("Fire warning levels fetched successfully:", fireWarningLevels);

        } else {
            console.log("No items found in the RSS feed.");
            fireWarningLevels = { "ALL": "NO RATING - NO_ITEMS" };
        }

    } catch (error) {
        console.error("Error fetching fire warning levels:", error.message);
        fireWarningLevels = { "ALL": "ERROR_FETCHING" };
    }

    // Send the fire warning levels to the server
    // Check if the client is connected before sending data
    // If the client is not connected, attempt to reconnect and send data
    if (client.readyState === 'open') {
        client.write(`fire,${JSON.stringify(fireWarningLevels)}`);
        console.log(`Sent: fire,${JSON.stringify(fireWarningLevels)}`);
    } else {
        console.log("Client is not connected, attempting to reconnect and send data.");

        // Attempt to reconnect if the client is not connected
        // This is a simple retry mechanism to ensure the client can send data
        // after reconnecting to the server
        if (client.connecting === false && client.destroyed === false) {
            client.connect(port, host, () => {
                console.log("Reconnected to Weather Service");
                client.write(`fire,${JSON.stringify(fireWarningLevels)}`);
                console.log(`Sent after reconnect: fire,${JSON.stringify(fireWarningLevels)}`);
            });
        } else {
            console.log("Client is already connecting or destroyed. Will try again next interval.");
        }
    }
}

// Connect to the weather service
client.connect(port, host, () => {
    console.log("Connected to Weather Service");

    fetchFireWarning();
    
    //setInterval(fetchFireWarning, 300000);
});

// Handle incoming data from the server
client.on("data", (data) => {
    console.log(`Received from Weather Service: ${data.toString()}`);
});

// Handle socket error event
client.on("error", (error) => {
    console.error(`Client Error: ${error.message}`);
});

// Handle socket end event
client.on("close", () => {
    console.log("Connection closed");
});