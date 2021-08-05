

// Get all calendars
const getCalendars = async () => {
    // Get a list of all the calendars is user's Google Account
    const listResponse = await gapi.client.calendar.calendarList.list();
    const calendarList = listResponse.result.items;

    // Set Calendar Day range from the day before to day through the next week

    const startingDay = new Date();
    startingDay.setHours(0, 0, 0);
    startingDay.setDate(startingDay.getDate() - 1);
    const endingDay = new Date();
    endingDay.setHours(0, 0, 0);
    endingDay.setDate(startingDay.getDate() + 7);

    // Create an object to store events (and their calendars) as the value and the date as the key
    //console.log(`%c${calendar.summary}`, `color: ${calendar.backgroundColor}`);
    const calendarViewElement = document.querySelector('#calendarView');
    calendarViewElement.innerHTML = '<progress id="calendarProgress" class="progress is-large is-info" max="100">15%</progress>';
    Promise.all(
        calendarList.map(async calendar => {
            return filterEvents(calendar, startingDay, endingDay);
        })
    ).then((allCalendarTables) => {
        const fullCalendar = {}
        for (const individualTable of allCalendarTables) {
            for (const key in individualTable) {
                if (!fullCalendar.hasOwnProperty(key)) {
                    fullCalendar[key] = [];
                }
                fullCalendar[key] = fullCalendar[key].concat(individualTable[key]);
            }
        }
        renderCalendars(fullCalendar, startingDay, endingDay);
        document.querySelector("#calendarProgress").remove();
    });
};

// Render calendar to screen
const renderCalendars = (fullCalendarTable, startingDay, endingDay) => {
    var arrayOfWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    // Get dates between starting day and ending day (inclusive)
    const calendarViewDates = getDates(startingDay, endingDay);
    const calendarViewElement = document.querySelector('#calendarView');
    calendarViewDates.forEach(date => {
        // Get the events happening that day
        const eventCalendarPairs = fullCalendarTable[date] || [];

        // Build day element
        const calendarDayElement = document.createElement('div');
        calendarDayElement.classList.add('day');
        const dayElement = document.createElement('h3');
        dayElement.classList.add('dayTitle');
        dayElement.textContent = arrayOfWeekdays[date.getDay()];

        if (getTodayDate().toDateString() === date.toDateString()) {
            dayElement.textContent = "🔵 " + dayElement.textContent
        } else {
            console.log(getTodayDate(), date);
        }

        calendarDayElement.appendChild(dayElement);

        // For each event (and calendar) happening during the day, append it to the calendar
        eventCalendarPairs.forEach(([event, calendar]) => {
            const eventElement = document.createElement('h5');
            eventElement.classList.add("event");
            eventElement.textContent = event.summary;
            eventElement.style.color = calendar.foregroundColor;
            eventElement.style.backgroundColor = calendar.backgroundColor;
            calendarDayElement.appendChild(eventElement);
        });
        calendarViewElement.appendChild(calendarDayElement);
    });
    

};

// Populate JavaScript object with events based on day
const filterEvents = async (calendar, startingDay, endingDay) => {
    const calendarTable = {};
    const eventListResponse = await gapi.client.calendar.events.list(
        {
            calendarId: calendar.id,
            timeMin: startingDay.toISOString(),
            timeMax: endingDay.toISOString(),
            showDeleted: false,
            singleEvents: true,
        }
    )
    const eventList = eventListResponse.result.items;

    for (const eventItem of eventList) {
        const eventResponse = await gapi.client.calendar.events.get({ calendarId: calendar.id, eventId: eventItem.id })
        const event = eventResponse.result;
        if (event.status === "cancelled") {
            continue;
        }
        // Date.parse is not recommended, but is best option for parsing API datetime
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);

        const dateRange = getDates(eventStart, eventEnd);

        // TODO: Work on date comparison. Check timezone.
        for (const day of dateRange) {
            day.setHours(0, 0, 0);
            if (!calendarTable.hasOwnProperty(day)) {
                calendarTable[day] = []
            }
            calendarTable[day].push([event, calendar]);
        }
    }
    return calendarTable;


};

