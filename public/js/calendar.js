

// Get all calendars
const getCalendars = async () => {
    const listResponse = await gapi.client.calendar.calendarList.list();
    const calendarList = listResponse.result.items;
    const startingDay = new Date();
    startingDay.setDate(startingDay.getDate() - 1);
    const endingDay = new Date();
    endingDay.setDate(startingDay.getDate() + 7);

    const fullCalendar = {}
    for (const calendar of calendarList) {
        console.log(`%c${calendar.summary}`, `color: ${calendar.backgroundColor}`);
        await filterEvents(calendar, startingDay, endingDay, fullCalendar);
    }
    renderCalendars(fullCalendar, startingDay, endingDay);
};

// Render calendar to screen
const renderCalendars = (calendarTable, startingDay, endingDay) => {
    var arrayOfWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    const calendarViewDates = getDates(startingDay, endingDay);
    const calendarViewElement = document.querySelector('#calendarView');
    calendarViewDates.forEach(date => {
    
        const eventCalendarPairs = calendarTable[date] || [];

        const calendarDayElement = document.createElement('div');
        calendarDayElement.classList.add('day');
        const dayElement = document.createElement('h3');
        dayElement.classList.add('dayTitle');
        dayElement.textContent = arrayOfWeekdays[date.getDay()];

        if (getTodayDate().toDateString() === date.toDateString()) {
            dayElement.textContent = "🔵" + dayElement.textContent
        } else {
            console.log(getTodayDate(), date);
        }

        calendarDayElement.appendChild(dayElement);

        eventCalendarPairs.forEach(([event, calendar]) => {
            const eventElement = document.createElement('h5');
            eventElement.textContent = event.summary;
            eventElement.style.color = calendar.foregroundColor;
            eventElement.style.backgroundColor = calendar.backgroundColor;
            calendarDayElement.appendChild(eventElement);
        });
        calendarViewElement.appendChild(calendarDayElement);
    });


};

// Populate JavaScript object with events based on day
const filterEvents = async (calendar, startingDay, endingDay, calendarTable) => {

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

};

