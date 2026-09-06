function getConfig() {
    const properties = PropertiesService.getScriptProperties();

    return {
        canvasIcalUrl: properties.getProperty("CANVAS_ICAL_URL"),
    };
}
