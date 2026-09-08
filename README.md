# Canvas Task Sync

A google apps script that syncs canvas assignments to your google tasks list.

## Setup

1. Clone the repo and connect it to a google apps script project with `clasp`. Push the project with `clasp push `.

2. Enable the tasks API in the apps script project.

3. In `Project Settings -> Script Properties`, add:

   `CANVAS_ICAL_URL`  
   Your Canvas calendar feed URL.

   `GOOGLE_TASK_LIST_ID`  
   The ID of the google tasks list you want to sync into.

4. Optional: add `COURSE_NAME_MAP` as JSON to rename canvas courses (similar to the nickname feature on canvas) as shown:
   ```json
   {
     "MATH-101": "Calc 1",
     "CS-101": "Programming in Python"
   }
   ```

    and/or `IMPORT_PAST_DUE = true` if you want assignments due before the current date to be imported. Past-due assignments are skipped by default to avoid syncing a bunch of already-completed stuff into your tasks list.

5. Open the apps script project and run the `sync` function. Confirm everything works as expected. Create a time-driven trigger for `sync` to enable automatic syncing.

## Notes

This project uses canvas's calendar feed rather than their API because many schools restrict students from creating personal API keys. The tradeoff is that the calendar feed only gives us basic assignment/event info, so the project can't detect submissions or do any kind of two-way sync (e.g. you submit an assignment, it automatically is marked completed in your google tasks). 