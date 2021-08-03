// Returns an array of dates between the two dates https://gist.github.com/miguelmota/7905510
function getDates(startDate, endDate) {
    startDate.setHours(0, 0, 0);
    endDate.setHours(0, 0, 0);

    const dates = []
    let currentDate = startDate
    const addDays = function (days) {
        const date = new Date(this.valueOf())
        date.setDate(date.getDate() + days)
        // Sanitize date
        date.setHours(0, 0, 0)
        return date
    }
    while (currentDate <= endDate) {
        dates.push(currentDate)
        currentDate = addDays.call(currentDate, 1)
    }
    return dates
}

function getTodayDate() {
    const today = new Date();
    today.setHours(0, 0, 0);
    return today;
}