function getCanvasCalendarFeed() {
    const config = getConfig();

    if (!config.canvasIcalUrl) {
        throw new Error("CANVAS_ICAL_URL is not configured");
    }

    const response = UrlFetchApp.fetch(config.canvasIcalUrl);

    if (response.getResponseCode() !== 200) {
        throw new Error(
            `Canvas calendar request failed: ${response.getResponseCode()}`,
        );
    }

    return response.getContentText();
}

function testCanvasCalendarFeed() {
    const ical = getCanvasCalendarFeed();

    console.log(`Downloaded ${ical.length} characters`);
    console.log(ical.substring(0, 10000));
}
