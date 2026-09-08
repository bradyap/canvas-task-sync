function sync() {
    const assignments = parseCanvasAssignments();
    const taskListId = getTaskListID();
    const googleTasks = getAllTasks(taskListId);
    const config = getConfig();

    const today = Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "yyyy-MM-dd",
    );

    // Canvas UID -> Google Task
    const existingByCanvasUid = new Map();

    for (const task of googleTasks) {
        const canvasUid = getCanvasUidFromGoogleTask(task);

        if (canvasUid) {
            existingByCanvasUid.set(canvasUid, task);
        }
    }

    let created = 0;
    let updated = 0;
    let unchanged = 0;
    let completed = 0;
    let skippedPastDue = 0;

    for (const assignment of assignments) {
        const existing = existingByCanvasUid.get(assignment.uid);

        // Don't import historical assignments by default.
        // If the task was already synced, continue managing it
        // even after its due date has passed.
        if (
            !existing &&
            !config.importPastDue &&
            assignment.dueDateKey < today
        ) {
            skippedPastDue++;
            continue;
        }

        const desired = assignmentToTask(assignment);

        // New Canvas assignment
        if (!existing) {
            const createdTask = Tasks.Tasks.insert(desired, taskListId);

            existingByCanvasUid.set(assignment.uid, createdTask);

            created++;

            console.log(`Created: ${desired.title}`);
            continue;
        }

        // If you manually completed it, leave it completed.
        if (existing.status === "completed") {
            completed++;
            continue;
        }

        const changed =
            existing.title !== desired.title ||
            existing.notes !== desired.notes;

        if (!changed) {
            unchanged++;
            continue;
        }

        Tasks.Tasks.patch(
            {
                title: desired.title,
                notes: desired.notes,
            },
            taskListId,
            existing.id,
        );

        updated++;

        console.log(`Updated: ${desired.title}`);
    }

    console.log("");
    console.log("Sync complete");
    console.log(`Created:          ${created}`);
    console.log(`Updated:          ${updated}`);
    console.log(`Unchanged:        ${unchanged}`);
    console.log(`Completed:        ${completed}`);
    console.log(`Past due skipped: ${skippedPastDue}`);
}
