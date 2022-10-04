import React, {useState, useEffect} from "react"
import { OverlayTrigger, Popover } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { hideModal, setActiveItem } from "../../actions"
import { SET_ACTIVE_PROPERTY, SET_ACTIVE_ROUTE } from "../../constants"
import { requestAllAddresses } from "../../reducers"


const RoutePopover = ({customer, route}) => {
    const [show, setShow] = useState(false)
    const customers = useSelector(state => state.requestAllAddresses.addresses)
    const routes = useSelector(state => state.requestRoutes.routes)
    const routeDetails = routes.find(i => i.id === route)
    const custDetails = routeDetails.customers.find(i => i.id === customer.id)
    const dispatch = useDispatch()

    useEffect(() => {
        console.log(custDetails)
    },[custDetails])

    const handleRouteClick = () => {
        dispatch(setActiveItem(routeDetails.name, routes, SET_ACTIVE_ROUTE))
        dispatch(hideModal('Customer'))
        dispatch(setActiveItem(customer, customers, SET_ACTIVE_PROPERTY))
    }

    const renderPopover =  (
            <Popover id="popover-basic">
                <Popover.Header onClick={handleRouteClick} as='h3'>{routeDetails.name}</Popover.Header>
                <Popover.Body>
                    <p>active: {custDetails.active?.toString()} </p>
                    <p>new: {custDetails.new?.toString()} </p>
                    <p>priority: {custDetails.priority?.toString()} </p>
                    <p>temp: {custDetails.temporary?.toString()} </p>
                    <p>service_level: {custDetails.service_level?.toString()} </p>
                    <p>status: {custDetails.status} </p>
                </Popover.Body>
            </Popover>
    )

    //download the route object, find the customer, display the results
    return (
        <OverlayTrigger 
            placement = 'right'
            trigger = 'click'
            overlay={renderPopover}
        >
            <span>{routeDetails.name}, </span>
        </OverlayTrigger>

    )
}

export default RoutePopover