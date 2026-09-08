function getTaskListID() {
    const config = getConfig();

    if (!config.taskListId) {
        throw new Error("TASK_LIST_ID is not configured");
    }

    return config.taskListId;
}

function getAllTasks(taskListId) {
    const tasks = [];
    let pageToken = null;

    do {
        const options = {
            maxResults: 100,
            showCompleted: true,
            showHidden: true,
        };

        if (pageToken) {
            options.pageToken = pageToken;
        }

        const result = Tasks.Tasks.list(taskListId, options);

        if (result.items) {
            tasks.push(...result.items);
        }

        pageToken = result.nextPageToken;
    } while (pageToken);

    return tasks;
}

function getCanvasMarker(uid) {
    return `[canvas-sync:${uid}]`;
}

function getCanvasUidFromGoogleTask(task) {
    const notes = task.notes || "";

    const match = notes.match(/\[canvas-sync:([^\]]+)\]/);

    return match ? match[1] : null;
}

function assignmentToTask(assignment) {
    const notes = [assignment.url, getCanvasMarker(assignment.uid)].join("\n");

    return {
        title: assignment.title,

        // Google Tasks API stores the date, but discards the time.
        due: `${assignment.dueDateKey}T00:00:00.000Z`,

        notes,
    };
}
