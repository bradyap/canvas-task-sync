function getCanvasCalFeed() {
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

function parseCanvasAssignments() {
    const ical = getCanvasCalFeed();

    // iCalendar allows long lines to be folded onto the following line.
    // A continuation line starts with a space or tab.
    const unfolded = ical.replace(/\r?\n[ \t]/g, "");

    const eventBlocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];

    const assignments = [];

    for (const block of eventBlocks) {
        const uid = getIcalProperty(block, "UID");

        // Ignore non-assignment Canvas calendar events.
        if (!uid || !uid.startsWith("event-assignment-")) {
            continue;
        }

        const rawSummary = decodeIcalText(
            getIcalProperty(block, "SUMMARY") || "Untitled assignment",
        );

        const summary = formatAssignmentTitle(rawSummary);

        const calendarUrl = getIcalProperty(block, "URL") || "";
        const url = getDirectAssignmentUrl(uid, calendarUrl);

        const dtstart = getIcalProperty(block, "DTSTART");

        if (!dtstart) {
            continue;
        }

        const due = parseIcalDate(dtstart);

        assignments.push({
            uid,
            title: summary,
            url,
            dueDate: due.date,
            dueDateKey: due.dateKey,
            dueText: due.display,
            isAllDay: due.isAllDay,
        });
    }

    assignments.sort((a, b) => a.dueDateKey.localeCompare(b.dueDateKey));

    return assignments;
}

function getIcalProperty(block, propertyName) {
    // Handles forms such as:
    // DTSTART:...
    // DTSTART;VALUE=DATE:...
    // URL;VALUE=URI:...
    const regex = new RegExp(`^${propertyName}(?:;[^:]*)?:(.*)$`, "m");

    const match = block.match(regex);

    return match ? match[1].trim() : null;
}

function decodeIcalText(value) {
    return value
        .replace(/\\\\/g, "\u0000")
        .replace(/\\n/gi, "\n")
        .replace(/\\,/g, ",")
        .replace(/\\;/g, ";")
        .replace(/\u0000/g, "\\");
}

function parseIcalDate(value) {
    const timezone = Session.getScriptTimeZone();

    // All-day date, e.g. 20260901
    if (/^\d{8}$/.test(value)) {
        const year = value.slice(0, 4);
        const month = value.slice(4, 6);
        const day = value.slice(6, 8);

        const dateKey = `${year}-${month}-${day}`;

        const displayDate = Utilities.parseDate(value, timezone, "yyyyMMdd");

        return {
            date: displayDate,
            dateKey,
            isAllDay: true,
            display: Utilities.formatDate(displayDate, timezone, "MMM d, yyyy"),
        };
    }

    // UTC date/time, e.g. 20260831T203000Z
    const utcMatch = value.match(
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    );

    let date;

    if (utcMatch) {
        date = new Date(
            Date.UTC(
                Number(utcMatch[1]),
                Number(utcMatch[2]) - 1,
                Number(utcMatch[3]),
                Number(utcMatch[4]),
                Number(utcMatch[5]),
                Number(utcMatch[6]),
            ),
        );
    } else {
        // Fallback for an iCal datetime without Z.
        date = Utilities.parseDate(value, timezone, "yyyyMMdd'T'HHmmss");
    }

    return {
        date,
        dateKey: Utilities.formatDate(date, timezone, "yyyy-MM-dd"),
        isAllDay: false,
        display: Utilities.formatDate(
            date,
            timezone,
            "MMM d, yyyy 'at' h:mm a",
        ),
    };
}

function formatAssignmentTitle(summary) {
    const match = summary.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);

    if (!match) {
        return summary;
    }

    const assignmentName = match[1].trim();
    const courseCode = match[2].trim();

    const config = getConfig();

    const courseName = config.courseNameMap[courseCode] || courseCode;

    return `${courseName} - ${assignmentName}`;
}

function getDirectAssignmentUrl(uid, calendarUrl) {
    const assignmentMatch = uid.match(/^event-assignment-(\d+)$/);
    const courseMatch = calendarUrl.match(/include_contexts=course_(\d+)/);

    if (!assignmentMatch || !courseMatch) {
        return calendarUrl;
    }

    const assignmentId = assignmentMatch[1];
    const courseId = courseMatch[1];

    return `https://canvas.gmu.edu/courses/${courseId}/assignments/${assignmentId}`;
}
