function getConfig() {
    const properties = PropertiesService.getScriptProperties();

    const courseNameMapRaw = properties.getProperty("COURSE_NAME_MAP") || "{}";

    return {
        canvasIcalUrl: properties.getProperty("CANVAS_ICAL_URL"),
        taskListId: properties.getProperty("GOOGLE_TASK_LIST_ID") || "@default",
        courseNameMap: JSON.parse(courseNameMapRaw),

        importPastDue: properties.getProperty("IMPORT_PAST_DUE") === "true",
    };
}
