function testGoogleTasks() {
    const lists = Tasks.Tasklists.list();

    if (!lists.items || lists.items.length === 0) {
        console.log("No Google Task lists found");
        return;
    }

    for (const list of lists.items) {
        console.log(`${list.title}: ${list.id}`);
    }
}
