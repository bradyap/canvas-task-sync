function getConfig() {
    const properties = PropertiesService.getScriptProperties();

    return {
        canvasUrl: properties.getProperty("CANVAS_URL"),
        canvasToken: properties.getProperty("CANVAS_TOKEN"),
    };
}
