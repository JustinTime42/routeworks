import { useNavigate } from "react-router-dom";

export const scrollCardIntoView = (custIndex) => {
    const card = document.getElementById(`card${custIndex}`)
    if (!card) return
    const bounding = card.getBoundingClientRect();
    if (
        bounding.top >= 0 && 
        bounding.left >= 0 && 
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth) && 
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        ) {
        return        
    } else {
        setTimeout(() => card.scrollIntoView(), 300)
    }
}

export const changeActiveProperty = (property, direction = '', routeCustomers) => {
    if (direction) {
        let currentPosition = routeCustomers.findIndex(i => i.id === property.id)
        let nextPosition
        let nextCustomer = {}
        const getNextPosition = (direction, current) => {
            nextPosition = (direction === 'next') ? current + 1 : current - 1
            currentPosition = nextPosition
        }
        let isNextCustomerActive = false
        do {
            getNextPosition(direction, currentPosition)
            if(routeCustomers[nextPosition].active) {
                nextCustomer = routeCustomers[nextPosition]
                isNextCustomerActive = true
            }
        }
        while ((isNextCustomerActive === false) && (nextPosition < routeCustomers.length))
        if (nextPosition >= 0 && nextPosition < routeCustomers.length) {           
            if ((nextPosition - 1) > 0) {
                document.getElementById(`card${nextPosition - 1}`).scrollIntoView(true)
            } else {
                document.getElementById(`card${nextPosition}`).scrollIntoView(true)
            }
            return routeCustomers[nextPosition].id
        }                 
    } else {
        console.log(routeCustomers)
        return property.id
    }
}

