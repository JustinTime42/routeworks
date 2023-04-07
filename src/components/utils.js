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
        let currentPosition = routeCustomers[property.id].routePosition
        let nextPosition
        let nextCustomerId = ''
        const customerKeysArray = Object.keys(routeCustomers)
        const setNextCustomer = (direction, current) => {
            nextPosition = (direction === 'next') ? current + 1 : current - 1
            nextCustomerId = customerKeysArray.find(customerId => (
                routeCustomers[customerId].routePosition === nextPosition
            ))
            console.log(routeCustomers[nextCustomerId])
        }
        let isNextCustomerActive = false
        do {
            setNextCustomer(direction, currentPosition)
            if(routeCustomers[nextCustomerId].active) {
                //nextCustomer = routeCustomers[nextPosition]
                isNextCustomerActive = true
            }
        }
        while ((isNextCustomerActive === false) && (nextPosition < customerKeysArray.length))
        if (nextPosition >= 0 && nextPosition < customerKeysArray.length) {           
            if ((nextPosition - 1) > 0) {
                document.getElementById(`card${nextPosition - 1}`).scrollIntoView(true)
            } else {
                document.getElementById(`card${nextPosition}`).scrollIntoView(true)
            }
            return nextCustomerId
        }                 
    } else {
        return property.id
    }
}

