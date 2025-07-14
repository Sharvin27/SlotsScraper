const puppeteer = require("puppeteer");
const { sendSlotAlertNotification } = require("./sendNotification");
const fs = require("fs");

let previousSnapshot = [];

async function fetchVisaSlots() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto("https://checkvisaslots.com/latest-us-visa-availability.html", {
        waitUntil: "networkidle2",
        timeout: 60000,
    });

    await page.waitForSelector("#table_F1Regular tbody tr");

    const slots = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll("#table_F1Regular tbody tr"));
        return rows.map(row => {
            const cells = row.querySelectorAll("td");
            return {
                location: cells[0]?.innerText.trim(),
                totalDates: cells[3]?.innerText.trim(),
            };
        });
    });

    await browser.close();
    return slots;
}

function hasSlotChanged(current, previous) {
    return current.some(currSlot => {
        const prevSlot = previous.find(p => p.location === currSlot.location);
        if (!prevSlot) return true; // new location added

        const prevCount = parseInt(prevSlot.totalDates);
        const currCount = parseInt(currSlot.totalDates);

        if (isNaN(prevCount) || isNaN(currCount)) return false;

        // Trigger only if increase is 2 or more
        return currCount - prevCount >= 2;
    });
}

async function monitorVisaSlots() {
    console.log("🔍 Checking for visa slot updates...");
    try {
        const currentSnapshot = await fetchVisaSlots();

        // Prepare comparison table
        // const allLocations = Array.from(new Set([
        //     ...previousSnapshot.map(s => s.location),
        //     ...currentSnapshot.map(s => s.location)
        // ]));

        // let table = `${"Location".padEnd(20)}${"Previous".padEnd(10)}${"Current".padEnd(10)}\n`;

        // for (const loc of allLocations) {
        //     const prev = previousSnapshot.find(s => s.location === loc);
        //     const curr = currentSnapshot.find(s => s.location === loc);
        //     table += `${loc.padEnd(20)}${String(prev ? prev.totalDates : "-").padEnd(10)}${String(curr ? curr.totalDates : "-").padEnd(10)}\n`;
        // }

        // fs.writeFileSync("slots.txt", table);

        if (previousSnapshot.length > 0 && hasSlotChanged(currentSnapshot, previousSnapshot)) {
            const summary = currentSnapshot
                .map(currSlot => {
                    const prevSlot = previousSnapshot.find(p => p.location === currSlot.location);
                    const prevCount = prevSlot ? parseInt(prevSlot.totalDates) : 0;
                    const currCount = parseInt(currSlot.totalDates);

                    if (!isNaN(currCount) && !isNaN(prevCount) && currCount - prevCount >= 2) {
                        return `📍 ${currSlot.location}: ${currSlot.totalDates} dates (Earliest: ${currSlot.earliestDate})`;
                    }
                    return null;
                })
                .filter(Boolean)
                .join("\n");

            if (summary.length > 0) {
                await sendSlotAlertNotification(summary);
            } else {
                console.log("📭 No significant increases found.");
            }
        } else {
            console.log("📭 No significant increases in visa slots.");
        }

        previousSnapshot = currentSnapshot;

        const used = process.memoryUsage();
        console.log(`🧠 Memory usage:
        RSS        : ${(used.rss / 1024 / 1024).toFixed(2)} MB
        Heap Total : ${(used.heapTotal / 1024 / 1024).toFixed(2)} MB
        Heap Used  : ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB
        External   : ${(used.external / 1024 / 1024).toFixed(2)} MB
        `);
    } catch (error) {
        console.error("❌ Error while checking slots:", error);
    }
}

// Export a function to start monitoring
function startSlotMonitor() {
    monitorVisaSlots();
    setInterval(monitorVisaSlots, 5 * 60 * 1000);
}

module.exports = startSlotMonitor;
