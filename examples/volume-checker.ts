import * as hl from "@nktkas/hyperliquid";

/**
 * Calculates the total trading volume (perps + spot) for a given address
 * and checks if it exceeds the $5M threshold.
 * 
 * @param address - The user's wallet address to check
 */
async function main(address: string) {
  try {
    console.log(`Checking trading volume for address: ${address}\n`);

    // Initialize the Hyperliquid Info API client
    const info = new hl.InfoAPI();

    // Fetch user's perpetuals trading volume
    let perpsVolume = 0;
    try {
      const userFunding = await info.perpetuals.getUserFunding(address);
      if (userFunding && Array.isArray(userFunding)) {
        // Sum up all perpetuals trading volume
        perpsVolume = userFunding.reduce((total, funding) => {
          return total + (funding.cumulativeVolume || 0);
        }, 0);
      }
    } catch (error) {
      console.warn("Warning: Could not fetch perpetuals volume", error);
    }

    // Fetch user's spot trading volume
    let spotVolume = 0;
    try {
      const spotMeta = await info.spot.getSpotMetaAndAssetCtxs();
      if (spotMeta && spotMeta.tokens) {
        // Try to get spot user data
        const spotUser = await info.spot.getSpotClearinghouseState(address);
        if (spotUser && spotUser.balances) {
          // Sum up spot trading volume from user's trading history
          // Note: This is an approximation as the API may not directly provide cumulative spot volume
          spotVolume = spotUser.balances.reduce((total: number, balance: any) => {
            return total + (balance.volume || 0);
          }, 0);
        }
      }
    } catch (error) {
      console.warn("Warning: Could not fetch spot volume", error);
    }

    // Calculate total volume
    const totalVolume = perpsVolume + spotVolume;
    const threshold = 5_000_000; // $5M threshold

    // Print results
    console.log("=".repeat(50));
    console.log("TRADING VOLUME SUMMARY");
    console.log("=".repeat(50));
    console.log(`Perpetuals Volume: $${perpsVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`Spot Volume:       $${spotVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log("-".repeat(50));
    console.log(`Total Volume:      $${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log("=".repeat(50));
    console.log();

    // Check threshold
    const isAboveThreshold = totalVolume >= threshold;
    if (isAboveThreshold) {
      console.log(`✅ Total volume is ABOVE the $5M threshold!`);
      console.log(`   Exceeded by: $${(totalVolume - threshold).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    } else {
      console.log(`❌ Total volume is BELOW the $5M threshold.`);
      console.log(`   Needs: $${(threshold - totalVolume).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more to reach threshold`);
    }

  } catch (error) {
    console.error("Error fetching volume data:", error);
    process.exit(1);
  }
}

// Example usage
const address = process.argv[2];
if (!address) {
  console.error("Please provide an address as an argument");
  console.error("Usage: ts-node hyperliquid-volume-checker.ts <address>");
  process.exit(1);
}

main(address);
